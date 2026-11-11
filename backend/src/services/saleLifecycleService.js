import Stripe from "stripe";
import Sale from "../models/sale.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import Payout from "../models/payout.model.js";
import { renderBuyerReceiptPdf, renderSellerStatementPdf } from "../utils/documents/pdf.js";
import { buyerReceiptEmail, sellerStatementEmail } from "../utils/nodemailer.js";
import { buildSale, SALES_TRACKING_START } from "./saleService.js";
import { addWorkingDays, COLLECTION_WORKING_DAYS } from "../utils/workingDays.js";

export { addWorkingDays, COLLECTION_WORKING_DAYS };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const fail = (message, status = 400) => Object.assign(new Error(message), { status });


const sellerDisplayName = (sale) => sale.seller.companyName || sale.seller.name || sale.seller.username;

const maskIban = (iban) => {
    const clean = String(iban || "").replace(/\s+/g, "");
    return clean.length > 8 ? `${clean.slice(0, 4)} •••• ${clean.slice(-4)}` : clean;
};

const describePayoutAccount = (user) => {
    const pm = user?.payoutMethods || {};
    const bank = pm.bankTransfer;
    if (bank?.iban || bank?.accountNumber) {
        const acct = bank.iban ? `IBAN ${maskIban(bank.iban)}` : `account ending ${String(bank.accountNumber).slice(-4)}`;
        return [bank.accountHolderName, acct].filter(Boolean).join(", ");
    }
    if (pm.paypal?.email) return `PayPal ${pm.paypal.email}`;
    return null;
};

/** Refreshes the seller's contact details from their account. */
const refreshSeller = async (sale) => {
    const seller = await User.findById(sale.seller.user).select("phone email companyName payoutMethods userType");
    if (seller) {
        if (seller.phone) sale.set("seller.phone", seller.phone);
        if (seller.email) sale.set("seller.email", seller.email);
    }
    return seller;
};

const supersede = (sale, type, at) => {
    for (const d of sale.documents) if (d.type === type && !d.supersededAt) d.supersededAt = at;
    return sale.documents.filter((d) => d.type === type).length + 1;
};

const PAID_STATES = ["paid", "collected", "payout_due", "paid_out"];

// ─── Buyer receipt ─────────────────────────────────────────

export const receiptSnapshot = (sale, issueDate = new Date()) => {
    const paidDate = sale.payment?.paidAt || issueDate;
    return {
        reference: sale.reference,
        issueDate,
        paidDate,
        saleDate: sale.saleDate,
        title: sale.title,
        currency: sale.currency,
        itemLocation: sale.itemLocation,
        buyer: {
            name: sale.buyer.name,
            companyName: sale.buyer.companyName,
            addressLines: sale.buyer.addressLines,
            email: sale.buyer.email,
        },
        seller: { displayName: sellerDisplayName(sale), phone: sale.seller.phone },
        itemPrice: sale.itemPrice,
        vat: { rate: sale.vat.rate, amount: sale.vat.amount, treatment: sale.vat.treatment },
        buyerFee: sale.buyerFee,
        buyerFeeDescription: sale.buyerFeeDescription,
        total: sale.total,
        amountPaid: sale.payment?.amount ?? sale.total,
        method: sale.payment?.method,
        transactionId: sale.payment?.transactionId || sale.stripe?.paymentIntentId,
        collectionDays: COLLECTION_WORKING_DAYS,
        collectBy: sale.collection?.dueBy || addWorkingDays(paidDate, COLLECTION_WORKING_DAYS),
    };
};

export const issueBuyerReceipt = async (saleId, admin, { sendEmail = true } = {}) => {
    const sale = await Sale.findById(saleId);
    if (!sale) throw fail("Sale not found", 404);
    if (!PAID_STATES.includes(sale.status)) throw fail("A receipt can only be issued once the sale is paid");
    if (!sale.buyer?.email && sendEmail) throw fail("Buyer has no email address");

    await refreshSeller(sale);
    if (!sale.collection?.dueBy) {
        sale.set("collection.dueBy", addWorkingDays(sale.payment?.paidAt || new Date(), COLLECTION_WORKING_DAYS));
    }

    const issueDate = new Date();
    const snapshot = receiptSnapshot(sale, issueDate);
    const pdf = await renderBuyerReceiptPdf(snapshot);
    const version = supersede(sale, "buyer_receipt", issueDate);
    const doc = {
        type: "buyer_receipt",
        number: version > 1 ? `${sale.reference}-RC${version}` : `${sale.reference}-RC`,
        total: snapshot.amountPaid,
        currency: sale.currency,
        issuedAt: issueDate,
        issuedBy: admin?._id,
        snapshot,
    };
    if (sendEmail) {
        const ok = await buyerReceiptEmail(sale, snapshot, pdf, `${doc.number}.pdf`);
        if (ok) Object.assign(doc, { emailedTo: sale.buyer.email, emailedAt: new Date() });
        else doc.emailError = "Email failed to send";
    }
    sale.documents.push(doc);
    sale.notes.push({ text: `Receipt ${doc.number} issued${doc.emailedAt ? ` and emailed to ${doc.emailedTo}` : ""}`, by: admin?._id });
    await sale.save();
    return { sale, emailed: !!doc.emailedAt };
};

// ─── Seller statement ──────────────────────────────────────

export const statementSnapshot = (sale, { issueDate = new Date(), payoutAccount = null } = {}) => {
    const grossForSeller = round2(sale.itemPrice + (sale.vat?.amount || 0));
    const sellerFee = round2(sale.sellerFee || 0);
    return {
        reference: sale.reference,
        issueDate,
        saleDate: sale.saleDate,
        title: sale.title,
        currency: sale.currency,
        seller: {
            name: sale.seller.name,
            companyName: sale.seller.companyName,
            addressLines: sale.seller.addressLines,
            email: sale.seller.email,
            vatNumber: sale.seller.vatNumber,
        },
        buyer: {
            name: sale.buyer.name,
            companyName: sale.buyer.companyName,
            addressLines: sale.buyer.addressLines,
            vatNumber: sale.buyer.vatNumber,
        },
        itemPrice: sale.itemPrice,
        vat: { rate: sale.vat.rate, amount: sale.vat.amount, treatment: sale.vat.treatment },
        grossForSeller,
        sellerFee,
        sellerFeeDescription: sellerFee > 0 ? "RexBid seller commission" : "RexBid seller commission (none charged on this sale)",
        netPayout: round2(grossForSeller - sellerFee),
        buyerPaidDate: sale.payment?.paidAt,
        payoutPaidDate: sale.payout?.paidAt,
        payoutAccount,
    };
};

/**
 * Seller statement. The seller fee comes from the auction, where it was
 * calculated from Admin → Commissions when the lot sold, so seller fees are
 * picked up automatically once they are switched on there.
 */
export const issueSellerStatement = async (saleId, admin, { sendEmail = true } = {}) => {
    const sale = await Sale.findById(saleId);
    if (!sale) throw fail("Sale not found", 404);
    if (!PAID_STATES.includes(sale.status)) throw fail("A seller statement can only be issued once the buyer has paid");

    const auction = await Auction.findById(sale.auction).select("sellerCommissionAmount");
    if (auction && Number.isFinite(auction.sellerCommissionAmount) && round2(auction.sellerCommissionAmount) !== sale.sellerFee) {
        sale.notes.push({ text: `Seller fee updated from the auction: ${sale.sellerFee} → ${round2(auction.sellerCommissionAmount)}`, by: admin?._id });
        sale.sellerFee = round2(auction.sellerCommissionAmount);
    }
    const seller = await refreshSeller(sale);
    if (sendEmail && !sale.seller?.email) throw fail("Seller has no email address");

    const issueDate = new Date();
    const snapshot = statementSnapshot(sale, { issueDate, payoutAccount: describePayoutAccount(seller) });
    const pdf = await renderSellerStatementPdf(snapshot);
    const version = supersede(sale, "seller_statement", issueDate);
    const doc = {
        type: "seller_statement",
        number: version > 1 ? `${sale.reference}-SS${version}` : `${sale.reference}-SS`,
        total: snapshot.netPayout,
        currency: sale.currency,
        issuedAt: issueDate,
        issuedBy: admin?._id,
        snapshot,
    };
    if (sendEmail) {
        const dashboard = seller?.userType === "company" ? "company" : "seller";
        const ok = await sellerStatementEmail(sale, snapshot, pdf, `${doc.number}.pdf`, dashboard);
        if (ok) Object.assign(doc, { emailedTo: sale.seller.email, emailedAt: new Date() });
        else doc.emailError = "Email failed to send";
    }
    sale.documents.push(doc);
    sale.notes.push({ text: `Seller statement ${doc.number} issued${doc.emailedAt ? ` and emailed to ${doc.emailedTo}` : ""}`, by: admin?._id });
    await sale.save();
    return { sale, emailed: !!doc.emailedAt };
};

// ─── Failed sales ──────────────────────────────────────────

/** Marks an unpaid sale as failed and withdraws any open Stripe request. */
export const markSaleFailed = async (saleId, reason, admin) => {
    if (!reason?.trim()) throw fail("Add a reason");
    const sale = await Sale.findById(saleId);
    if (!sale) throw fail("Sale not found", 404);
    if (!["sold", "request_sent"].includes(sale.status)) throw fail(`A ${sale.status.replace("_", " ")} sale cannot be marked failed`);

    const piId = sale.stripe?.paymentIntentId;
    if (piId) {
        const pi = await stripe.paymentIntents.retrieve(piId);
        if (pi.amount_received > 0 || pi.status === "succeeded") {
            throw fail("Money has already arrived for this sale in Stripe; check Stripe before marking it failed", 409);
        }
        if (!["canceled", "succeeded"].includes(pi.status)) {
            await stripe.paymentIntents.cancel(piId);
            sale.notes.push({ text: `Bank-transfer request ${piId} cancelled in Stripe`, by: admin._id });
        }
    }

    sale.set("failure", { reason: reason.trim(), previousStatus: sale.status, by: admin._id, at: new Date() });
    sale.status = "failed";
    sale.notes.push({ text: `Marked failed: ${reason.trim()}`, by: admin._id });
    await sale.save();
    await Auction.updateOne({ _id: sale.auction, paymentStatus: { $ne: "completed" } }, { $set: { paymentStatus: "failed" } });
    return sale;
};

/** Puts a failed sale back in "Ready to send". */
export const reopenSale = async (saleId, admin) => {
    const sale = await Sale.findById(saleId);
    if (!sale) throw fail("Sale not found", 404);
    if (sale.status !== "failed") throw fail("Only failed sales can be reopened");
    sale.status = "sold";
    sale.set("stripe.paymentIntentId", undefined);
    sale.set("stripe.paymentIntentAmount", undefined);
    sale.notes.push({ text: "Reopened after being marked failed", by: admin._id });
    await sale.save();
    await Auction.updateOne({ _id: sale.auction, paymentStatus: "failed" }, { $set: { paymentStatus: "pending" } });
    return sale;
};

// ─── Earlier sales ─────────────────────────────────────────

const USER_FIELDS =
    "firstName lastName username companyName companyVATNumber email phone address countryName countryCode currency stripeCustomerId region";

/**
 * Records lots sold before sale records began. No emails are sent and nothing
 * is created in Stripe. Status comes from the auction's payment status and
 * any completed payout.
 */
export const importHistoricalSales = async ({ before = SALES_TRACKING_START } = {}) => {
    const have = new Set((await Sale.find({}, "auction").lean()).map((s) => String(s.auction)));
    const auctions = await Auction.find({
        status: { $in: ["sold", "sold_buy_now"] },
        winner: { $ne: null },
        $or: [{ endDate: { $lt: before } }, { endDate: null }],
    })
        .populate("winner", USER_FIELDS)
        .populate("seller", USER_FIELDS);

    const payouts = await Payout.find({ auction: { $in: auctions.map((a) => a._id) }, status: "completed" }).lean();
    const payoutByAuction = new Map(payouts.map((p) => [String(p.auction), p]));

    const result = { imported: 0, paid: 0, paidOut: 0, unpaid: 0, failed: 0, skipped: 0 };
    for (const auction of auctions) {
        if (have.has(String(auction._id))) continue;
        if (!auction.winner || !auction.seller) {
            result.skipped += 1;
            continue;
        }
        const data = buildSale(auction, auction.winner, auction.seller);
        data.historical = true;
        if (auction.paymentStatus === "failed") {
            data.status = "failed";
            data.failure = { reason: "Payment failed (before sale records began)", previousStatus: "sold", at: auction.updatedAt };
        }
        const payout = payoutByAuction.get(String(auction._id));
        if (payout && data.status === "paid") {
            data.status = "paid_out";
            data.payout = {
                paidAt: payout.completedAt || payout.processedAt || payout.updatedAt,
                amount: payout.sellerAmount,
                reference: payout.transactionId,
            };
        }
        data.notes = [{ text: "Imported from the auction record (sold before sale records began)", at: new Date() }];
        if (await Sale.exists({ reference: data.reference })) {
            data.reference = `${data.reference}-${String(auction._id).slice(-9, -6).toUpperCase()}`;
        }
        try {
            await Sale.create(data);
            result.imported += 1;
            if (data.status === "paid") result.paid += 1;
            else if (data.status === "paid_out") result.paidOut += 1;
            else if (data.status === "failed") result.failed += 1;
            else result.unpaid += 1;
        } catch (err) {
            if (err?.code !== 11000) {
                console.error(`Could not import sale for auction ${auction._id}:`, err.message);
                result.skipped += 1;
            }
        }
    }
    return result;
};
