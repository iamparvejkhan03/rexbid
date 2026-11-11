import Sale from "../models/sale.model.js";
import {
    syncSales,
    setVatDecision,
    issuePaymentRequest,
    paymentRequestSnapshot,
} from "../services/saleService.js";
import { renderDocumentPdf, renderPaymentRequestPdf } from "../utils/documents/pdf.js";
import { REGIONS } from "../utils/region.js";

const LIST_FIELDS = "-documents.snapshot -notes";

const fail = (res, err) => {
    const status = err.status || 500;
    if (status >= 500) console.error("Sale error:", err);
    return res.status(status).json({ success: false, message: err.message || "Something went wrong" });
};

// ─── Admin ─────────────────────────────────────────────────

export const listSales = async (req, res) => {
    try {
        // Pick up any lots sold since the last scheduled sync.
        await syncSales();
        const { status, search, review } = req.query;
        const q = {};
        if (status && status !== "all") q.status = status;
        if (review === "true") q["vat.reviewRequired"] = true;
        if (search?.trim()) {
            const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            q.$or = [{ reference: rx }, { title: rx }, { "buyer.name": rx }, { "buyer.email": rx }, { "seller.name": rx }, { "seller.companyName": rx }];
        }
        const sales = await Sale.find(q, LIST_FIELDS).sort({ saleDate: -1 }).limit(500).lean();
        const counts = await Sale.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
        const needsReview = await Sale.countDocuments({ "vat.reviewRequired": true, status: { $in: ["sold", "request_sent"] } });
        res.json({
            success: true,
            data: {
                sales,
                counts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
                needsReview,
            },
        });
    } catch (err) {
        fail(res, err);
    }
};

export const runSync = async (req, res) => {
    try {
        res.json({ success: true, data: await syncSales() });
    } catch (err) {
        fail(res, err);
    }
};

export const getSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.saleId, "-documents.snapshot")
            .populate("notes.by", "firstName lastName username")
            .lean();
        if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
        res.json({ success: true, data: sale });
    } catch (err) {
        fail(res, err);
    }
};

export const updateVat = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.saleId);
        if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
        const { treatment, rate, note, itemRegion, buyerRegion } = req.body || {};
        if (treatment && !["standard", "zero_rated", "clear"].includes(treatment)) {
            return res.status(400).json({ success: false, message: "Unknown VAT treatment" });
        }
        for (const r of [itemRegion, buyerRegion]) {
            if (r && !REGIONS.includes(r)) return res.status(400).json({ success: false, message: `Unknown region ${r}` });
        }
        if (rate !== undefined && rate !== "" && !(Number(rate) >= 0 && Number(rate) <= 30)) {
            return res.status(400).json({ success: false, message: "VAT rate must be between 0 and 30" });
        }
        await setVatDecision(sale, { treatment, rate, note, itemRegion, buyerRegion }, req.user);
        const out = sale.toObject();
        out.documents?.forEach((d) => delete d.snapshot);
        res.json({ success: true, data: out });
    } catch (err) {
        fail(res, err);
    }
};

export const issuePaymentRequests = async (req, res) => {
    const { saleIds, sendEmail = true } = req.body || {};
    if (!Array.isArray(saleIds) || saleIds.length === 0) {
        return res.status(400).json({ success: false, message: "Select at least one sale" });
    }
    if (saleIds.length > 50) {
        return res.status(400).json({ success: false, message: "Send at most 50 at a time" });
    }
    const results = [];
    // One at a time: each call talks to Stripe and the mail server.
    for (const id of saleIds) {
        try {
            const { sale, emailed } = await issuePaymentRequest(id, req.user, { sendEmail: sendEmail !== false });
            results.push({ saleId: id, reference: sale.reference, ok: true, emailed });
        } catch (err) {
            if (!err.status || err.status >= 500) console.error(`Payment request for sale ${id} failed:`, err);
            results.push({ saleId: id, ok: false, message: err.message });
        }
    }
    const sent = results.filter((r) => r.ok).length;
    res.json({ success: true, data: { sent, failed: results.length - sent, results } });
};

/** Draft PDF of the payment request with current figures (no IBAN until issued). */
export const previewPaymentRequest = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.saleId);
        if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
        const snapshot = paymentRequestSnapshot(sale);
        if (!snapshot.bank) snapshot.bank = { iban: "Assigned by Stripe when sent", reference: sale.reference };
        const pdf = await renderPaymentRequestPdf(snapshot);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${sale.reference}-PR-draft.pdf"`);
        res.send(pdf);
    } catch (err) {
        fail(res, err);
    }
};

// ─── Buyers and sellers ────────────────────────────────────

// Which documents each party may see.
const BUYER_DOCS = ["payment_request", "buyer_receipt"];
const SELLER_DOCS = ["seller_statement"];

const visibleDocs = (sale, userId) => {
    const id = String(userId);
    const asBuyer = String(sale.buyer?.user) === id;
    const asSeller = String(sale.seller?.user) === id;
    return (sale.documents || []).filter(
        (d) => (asBuyer && BUYER_DOCS.includes(d.type)) || (asSeller && SELLER_DOCS.includes(d.type)),
    );
};

export const myDocuments = async (req, res) => {
    try {
        const uid = req.user._id;
        const sales = await Sale.find({ $or: [{ "buyer.user": uid }, { "seller.user": uid }] }, "-notes -documents.snapshot")
            .sort({ saleDate: -1 })
            .lean();
        const items = [];
        for (const s of sales) {
            for (const d of visibleDocs(s, uid)) {
                items.push({
                    saleId: s._id,
                    documentId: d._id,
                    type: d.type,
                    number: d.number,
                    title: s.title,
                    reference: s.reference,
                    total: d.total,
                    currency: d.currency,
                    issuedAt: d.issuedAt,
                    current: !d.supersededAt,
                    role: String(s.buyer?.user) === String(uid) ? "buyer" : "seller",
                    saleStatus: s.status,
                });
            }
        }
        items.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
        res.json({ success: true, data: items });
    } catch (err) {
        fail(res, err);
    }
};

/** PDF download. Admins see every document; buyers and sellers only their own. */
export const downloadDocument = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.saleId).lean();
        if (!sale) return res.status(404).json({ success: false, message: "Document not found" });
        const isAdmin = req.user.userType === "admin";
        const docs = isAdmin ? sale.documents : visibleDocs(sale, req.user._id);
        const doc = docs.find((d) => String(d._id) === req.params.documentId);
        if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
        const pdf = await renderDocumentPdf(doc.type, doc.snapshot);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${doc.number}.pdf"`);
        res.setHeader("Cache-Control", "private, no-store");
        res.send(pdf);
    } catch (err) {
        fail(res, err);
    }
};
