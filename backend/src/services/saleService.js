import Stripe from "stripe";
import Sale from "../models/sale.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import { regionForItem, regionForUser } from "../utils/region.js";
import { calculateVat } from "../utils/vat.js";
import { renderPaymentRequestPdf } from "../utils/documents/pdf.js";
import { isManualPaymentRequired } from "../utils/manualPayment.js";
import {
    paymentRequestEmail,
    paymentCompletedEmail,
    paymentCompletedSellerEmail,
} from "../utils/nodemailer.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Sale records are created for lots sold on or after this date. Older sales
// live in the finance spreadsheet and are imported separately.
export const SALES_TRACKING_START = new Date(process.env.SALES_TRACKING_START || "2026-11-10T00:00:00Z");

export const PAYMENT_DUE_HOURS = 48;

const FRONTEND_URL = process.env.FRONTEND_URL || "https://rexbid.ie";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const USER_FIELDS =
    "firstName lastName username companyName companyVATNumber email phone address countryName countryCode currency stripeCustomerId region";

// ─── Building a sale from an auction ───────────────────────

const personName = (u) =>
    [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() || u?.companyName || u?.username || "";

const addressLines = (a = {}) =>
    [
        a.line1,
        a.line2,
        [a.county, a.postCode].filter(Boolean).join(", "),
        [a.state, a.country].filter(Boolean).join(", "),
    ]
        .map((l) => (l || "").trim())
        .filter(Boolean);

export const partyFromUser = (u) => ({
    user: u?._id,
    name: personName(u),
    username: u?.username,
    companyName: u?.companyName || undefined,
    email: u?.email,
    phone: u?.phone,
    addressLines: addressLines(u?.address),
    vatNumber: u?.companyVATNumber || undefined,
    region: regionForUser(u),
});

/** Short payment reference, e.g. "JCB-1EDE06". */
export const makeReference = (title, auctionId) => {
    const prefix = (String(title || "").match(/[A-Za-z0-9]/g) || []).join("").slice(0, 3).toUpperCase() || "RB";
    return `${prefix}-${String(auctionId).slice(-6).toUpperCase()}`;
};

/** Applies the VAT rules to a sale and recalculates the total. */
export const applyVat = (sale) => {
    const v = calculateVat({
        vatApplicable: sale.vat.applicable,
        itemPrice: sale.itemPrice,
        itemRegion: sale.vat.itemRegion,
        buyerRegion: sale.buyer?.region,
        buyerVatNumber: sale.buyer?.vatNumber,
        override: sale.vat.override?.treatment ? sale.vat.override : null,
    });
    sale.vat.rate = v.rate;
    sale.vat.amount = v.amount;
    sale.vat.treatment = v.treatment;
    sale.vat.reviewRequired = v.reviewRequired;
    sale.vat.reviewReasons = v.reviewReasons;
    sale.total = round2(sale.itemPrice + sale.vat.amount + (sale.buyerFee || 0));
    return sale;
};

/**
 * Lots under the manual-payment threshold (€1,000) can also be paid by card
 * through the existing checkout page; larger ones are bank transfer only.
 */
export const isCardCheckoutAvailable = (itemPrice, currency) =>
    !isManualPaymentRequired({ finalPrice: itemPrice, baseCurrency: currency });

export const cardCheckoutUrl = (auctionId) => `${FRONTEND_URL}/checkout/${auctionId}`;

const methodLabel = (m) =>
    ({ credit_card: "card", bank_transfer: "bank transfer", paypal: "PayPal" })[m] || m || "other";

export const buildSale = (auction, buyer, seller) => {
    const itemPrice = Number(auction.finalPrice ?? auction.currentPrice ?? 0);
    const currency = auction.baseCurrency === "GBP" ? "GBP" : "EUR";
    const paid = auction.paymentStatus === "completed";
    const sale = {
        auction: auction._id,
        reference: makeReference(auction.title, auction._id),
        title: auction.title,
        saleDate: auction.endDate || auction.updatedAt || new Date(),
        currency,
        buyer: partyFromUser(buyer),
        seller: partyFromUser(seller),
        itemPrice,
        buyerFee: round2(auction.bidderCommissionAmount || 0),
        buyerFeeDescription: "Buyer commission",
        sellerFee: round2(auction.sellerCommissionAmount || 0),
        vat: {
            applicable: !!auction.vatIncluded,
            itemRegion: regionForItem(auction, seller),
        },
        status: paid ? "paid" : "sold",
        payment: {
            cardCheckoutAvailable: isCardCheckoutAvailable(itemPrice, currency),
            ...(paid
                ? { paidAt: auction.paymentDate || new Date(), method: auction.paymentMethod || "other", transactionId: auction.transactionId }
                : {}),
        },
    };
    applyVat(sale);
    if (paid) sale.payment.amount = sale.total;
    return sale;
};

const createSaleFromAuction = async (auction) => {
    const data = buildSale(auction, auction.winner, auction.seller);
    // Two lots can share a title prefix and id tail; keep references unique.
    if (await Sale.exists({ reference: data.reference })) {
        data.reference = `${data.reference}-${String(auction._id).slice(-9, -6).toUpperCase()}`;
    }
    return Sale.create(data);
};

/** Creates the sale record for one auction straight after it sells. */
export const syncSaleForAuction = async (auctionId) => {
    if (await Sale.exists({ auction: auctionId })) return null;
    const auction = await Auction.findById(auctionId).populate("winner", USER_FIELDS).populate("seller", USER_FIELDS);
    if (!auction?.winner || !auction?.seller) return null;
    if (!["sold", "sold_buy_now"].includes(auction.status)) return null;
    if (auction.endDate && auction.endDate < SALES_TRACKING_START) return null;
    try {
        const sale = await createSaleFromAuction(auction);
        // Get the buyer's IBAN now so it is ready on the Sales page.
        if (sale.status === "sold") await ensureBuyerIban(sale);
        return sale;
    } catch (err) {
        if (err?.code !== 11000) console.error(`Could not create sale for auction ${auctionId}:`, err.message);
        return null;
    }
};

/**
 * Marks the sale paid when its auction is paid some other way: card checkout,
 * or an admin marking it paid. If a bank-transfer request was already sent and
 * nothing has arrived on it, that request is cancelled in Stripe so the buyer
 * cannot pay twice.
 */
export const markSalePaidFromAuction = async (auction) => {
    const sale = await Sale.findOne({ auction: auction._id });
    if (!sale || !["sold", "request_sent"].includes(sale.status)) return sale;

    const method = auction.paymentMethod || "other";
    sale.status = "paid";
    sale.set("payment.paidAt", auction.paymentDate || new Date());
    sale.set("payment.method", method);
    sale.set("payment.amount", sale.total);
    if (auction.transactionId) sale.set("payment.transactionId", auction.transactionId);
    sale.notes.push({ text: `Paid by ${methodLabel(method)}${auction.transactionId ? ` (${auction.transactionId})` : ""}` });

    const piId = sale.stripe?.paymentIntentId;
    if (piId && piId !== auction.transactionId) {
        try {
            const pi = await stripe.paymentIntents.retrieve(piId);
            if (["requires_action", "requires_payment_method"].includes(pi.status) && !(pi.amount_received > 0)) {
                await stripe.paymentIntents.cancel(piId);
                sale.notes.push({ text: `Bank-transfer request ${piId} cancelled in Stripe because the buyer paid by ${methodLabel(method)}` });
            } else if (pi.amount_received > 0 && pi.status !== "succeeded") {
                sale.notes.push({ text: `Check Stripe: ${pi.amount_received / 100} ${sale.currency} also arrived by bank transfer on ${piId}` });
            }
        } catch (err) {
            sale.notes.push({ text: `Could not cancel bank-transfer request ${piId}: ${err.message}` });
        }
    }
    await sale.save();
    return sale;
};

/**
 * Creates sale records for sold lots that do not have one yet, marks paid
 * any whose auction has been paid, and fills in missing IBANs.
 * Safe to run repeatedly; it is called on a schedule and from the admin page.
 */
export const syncSales = async ({ since = SALES_TRACKING_START, ibanLimit = 25 } = {}) => {
    const existing = await Sale.find({}, "auction status").lean();
    const have = new Set(existing.map((s) => String(s.auction)));

    const auctions = await Auction.find({
        status: { $in: ["sold", "sold_buy_now"] },
        winner: { $ne: null },
        endDate: { $gte: since },
    })
        .populate("winner", USER_FIELDS)
        .populate("seller", USER_FIELDS);

    let created = 0;
    for (const auction of auctions) {
        if (have.has(String(auction._id))) continue;
        if (!auction.winner || !auction.seller) continue;
        try {
            await createSaleFromAuction(auction);
            created += 1;
        } catch (err) {
            if (err?.code !== 11000) console.error(`Could not create sale for auction ${auction._id}:`, err.message);
        }
    }

    // Safety net for payments the auction hook missed.
    const unpaid = existing.filter((e) => ["sold", "request_sent"].includes(e.status)).map((e) => e.auction);
    const paidAuctions = await Auction.find(
        { _id: { $in: unpaid }, paymentStatus: "completed" },
        "_id paymentDate paymentMethod transactionId",
    ).lean();
    let markedPaid = 0;
    for (const a of paidAuctions) {
        const sale = await markSalePaidFromAuction(a);
        if (sale?.status === "paid") markedPaid += 1;
    }

    // Records made before card eligibility was tracked.
    const untagged = await Sale.find({ "payment.cardCheckoutAvailable": { $exists: false } }, "itemPrice currency");
    for (const s of untagged) {
        s.set("payment.cardCheckoutAvailable", isCardCheckoutAvailable(s.itemPrice, s.currency));
        await s.save();
    }

    const { ibansAdded } = await fillMissingIbans({ limit: ibanLimit });
    return { created, markedPaid, ibansAdded };
};

// ─── VAT decisions ─────────────────────────────────────────

export const setVatDecision = async (sale, { treatment, rate, note, itemRegion, buyerRegion }, admin) => {
    if (["paid", "collected", "payout_due", "paid_out"].includes(sale.status)) {
        throw Object.assign(new Error("VAT cannot be changed after payment has been received"), { status: 400 });
    }
    if (itemRegion !== undefined) sale.vat.itemRegion = itemRegion || null;
    if (buyerRegion !== undefined) sale.buyer.region = buyerRegion || null;
    if (treatment === "clear") {
        sale.vat.override = { treatment: null };
    } else if (treatment) {
        if (!note?.trim()) {
            throw Object.assign(new Error("Add a note explaining the VAT decision"), { status: 400 });
        }
        sale.vat.override = {
            treatment,
            rate: treatment === "standard" && rate !== undefined && rate !== "" ? Number(rate) : undefined,
            note: note.trim(),
            by: admin._id,
            at: new Date(),
        };
    }
    applyVat(sale);
    sale.notes.push({
        text: `VAT: ${sale.vat.treatment}${sale.vat.treatment === "standard" ? ` ${sale.vat.rate}%` : ""}${note ? ` — ${note.trim()}` : ""}`,
        by: admin._id,
    });
    sale.markModified("vat");
    await sale.save();
    return sale;
};

// ─── Stripe bank transfer ──────────────────────────────────

const bankTransferOptions = (currency) =>
    currency === "GBP"
        ? { type: "gb_bank_transfer" }
        : { type: "eu_bank_transfer", eu_bank_transfer: { country: "IE" } };

const fromFinancialAddresses = (addresses = [], type, reference) => {
    const iban = addresses.find((f) => f.type === "iban")?.iban;
    const sort = addresses.find((f) => f.type === "sort_code")?.sort_code;
    if (!iban && !sort) return null;
    return {
        type,
        iban: iban?.iban,
        bic: iban?.bic,
        country: iban?.country,
        sortCode: sort?.sort_code,
        accountNumber: sort?.account_number,
        accountHolderName: iban?.account_holder_name || sort?.account_holder_name,
        reference,
    };
};

export const instructionsFromPaymentIntent = (pi) => {
    const ins = pi?.next_action?.display_bank_transfer_instructions;
    if (!ins) return null;
    return fromFinancialAddresses(ins.financial_addresses, ins.type, ins.reference);
};

export const instructionsFromFunding = (fi) =>
    fromFinancialAddresses(fi?.bank_transfer?.financial_addresses, fi?.bank_transfer?.type, undefined);

const hasBankDetails = (sale) => !!(sale.stripe?.bankTransfer?.iban || sale.stripe?.bankTransfer?.accountNumber);

/**
 * Switches on bank transfer for the buyer in Stripe (the same as "Enable bank
 * transfer" on the customer in the Stripe Dashboard) and stores their unique
 * IBAN on the sale, so it shows in admin before anything is sent.
 */
export const ensureBuyerIban = async (sale) => {
    if (hasBankDetails(sale)) return sale;
    try {
        const customerId = sale.stripe?.customerId || (await ensureStripeCustomer(sale));
        const fi = await stripe.customers.createFundingInstructions(customerId, {
            currency: sale.currency.toLowerCase(),
            funding_type: "bank_transfer",
            bank_transfer: bankTransferOptions(sale.currency),
        });
        const details = instructionsFromFunding(fi);
        if (!details) throw new Error("Stripe returned no bank details");
        sale.set("stripe.customerId", customerId);
        sale.set("stripe.bankTransfer", details);
        sale.set("stripe.ibanAddedAt", new Date());
        sale.set("stripe.ibanError", undefined);
        sale.notes.push({ text: `Bank transfer enabled in Stripe for ${customerId}` });
    } catch (err) {
        console.error(`Could not get IBAN for sale ${sale.reference}:`, err.message);
        sale.set("stripe.ibanError", err.message);
    }
    await sale.save();
    return sale;
};

/** Fetches IBANs for unsent sales that do not have one yet. */
export const fillMissingIbans = async ({ limit = 25 } = {}) => {
    const sales = await Sale.find({
        status: { $in: ["sold", "request_sent"] },
        "stripe.bankTransfer.iban": { $in: [null, ""] },
        "stripe.bankTransfer.accountNumber": { $in: [null, ""] },
    })
        .sort({ saleDate: -1 })
        .limit(limit);
    let added = 0;
    for (const sale of sales) {
        await ensureBuyerIban(sale);
        if (hasBankDetails(sale)) added += 1;
    }
    return { ibansAdded: added, ibansMissing: sales.length - added };
};

const ensureStripeCustomer = async (sale) => {
    const buyer = await User.findById(sale.buyer.user).select(USER_FIELDS);
    if (!buyer) throw new Error("Buyer account no longer exists");
    if (buyer.stripeCustomerId) return buyer.stripeCustomerId;
    const customer = await stripe.customers.create({
        email: buyer.email,
        name: personName(buyer),
        metadata: { userId: String(buyer._id) },
    });
    buyer.stripeCustomerId = customer.id;
    await buyer.save({ validateBeforeSave: false });
    return customer.id;
};

/**
 * Makes sure the sale has an open Stripe bank-transfer PaymentIntent for the
 * current total, and copies the buyer's unique IBAN and reference onto it.
 */
export const ensureBankTransferIntent = async (sale) => {
    const amount = Math.round(sale.total * 100);
    const customerId = sale.stripe?.customerId || (await ensureStripeCustomer(sale));

    if (sale.stripe?.paymentIntentId) {
        const existing = await stripe.paymentIntents.retrieve(sale.stripe.paymentIntentId);
        if (existing.status === "succeeded") return existing;
        if (existing.amount === amount && existing.status === "requires_action") {
            sale.set("stripe.customerId", customerId);
            sale.set("stripe.bankTransfer", instructionsFromPaymentIntent(existing));
            return existing;
        }
        // Total changed (e.g. VAT decision) – replace the old request.
        if (existing.status !== "canceled" && (existing.amount_received || 0) === 0) {
            await stripe.paymentIntents.cancel(existing.id);
        } else if ((existing.amount_received || 0) > 0) {
            throw Object.assign(
                new Error("The buyer has already paid part of this request in Stripe; resolve it in Stripe first"),
                { status: 409 },
            );
        }
    }

    const pi = await stripe.paymentIntents.create(
        {
            amount,
            currency: sale.currency.toLowerCase(),
            customer: customerId,
            payment_method_types: ["customer_balance"],
            payment_method_data: { type: "customer_balance" },
            payment_method_options: {
                customer_balance: {
                    funding_type: "bank_transfer",
                    bank_transfer: bankTransferOptions(sale.currency),
                },
            },
            confirm: true,
            description: `${sale.reference} ${sale.title}`.slice(0, 200),
            metadata: {
                source: "sale_payment_request",
                saleId: String(sale._id),
                auctionId: String(sale.auction),
                reference: sale.reference,
            },
        },
        { idempotencyKey: `sale-${sale._id}-${amount}-${sale.documents.length}` },
    );

    sale.set("stripe.customerId", customerId);
    sale.set("stripe.paymentIntentId", pi.id);
    sale.set("stripe.paymentIntentAmount", amount);
    sale.set("stripe.bankTransfer", instructionsFromPaymentIntent(pi));
    return pi;
};

// ─── Payment requests ──────────────────────────────────────

export const paymentRequestSnapshot = (sale, issueDate = new Date()) => ({
    reference: sale.reference,
    issueDate,
    dueDate: new Date(issueDate.getTime() + PAYMENT_DUE_HOURS * 3600 * 1000),
    saleDate: sale.saleDate,
    title: sale.title,
    currency: sale.currency,
    buyer: {
        name: sale.buyer.name,
        companyName: sale.buyer.companyName,
        addressLines: sale.buyer.addressLines,
        email: sale.buyer.email,
        phone: sale.buyer.phone,
        vatNumber: sale.buyer.vatNumber,
    },
    seller: {
        displayName: sale.seller.companyName || sale.seller.name || sale.seller.username,
        vatNumber: sale.seller.vatNumber,
    },
    itemPrice: sale.itemPrice,
    vat: {
        rate: sale.vat.rate,
        amount: sale.vat.amount,
        treatment: sale.vat.treatment,
        note: sale.vat.treatment === "zero_rated" ? "Zero-rated cross-border supply between VAT-registered businesses." : undefined,
    },
    buyerFee: sale.buyerFee,
    buyerFeeDescription: sale.buyerFeeDescription,
    total: sale.total,
    cardPayUrl: sale.payment?.cardCheckoutAvailable ? cardCheckoutUrl(sale.auction) : undefined,
    bank: sale.stripe?.bankTransfer
        ? {
            accountHolderName: sale.stripe.bankTransfer.accountHolderName,
            iban: sale.stripe.bankTransfer.iban,
            bic: sale.stripe.bankTransfer.bic,
            sortCode: sale.stripe.bankTransfer.sortCode,
            accountNumber: sale.stripe.bankTransfer.accountNumber,
            reference: sale.stripe.bankTransfer.reference,
        }
        : null,
});

/**
 * Issues (or re-issues) the payment request for one sale: Stripe IBAN,
 * PDF, email to the buyer, and a record in the buyer's and admin's documents.
 */
export const issuePaymentRequest = async (saleId, admin, { sendEmail = true } = {}) => {
    const sale = await Sale.findById(saleId);
    if (!sale) throw Object.assign(new Error("Sale not found"), { status: 404 });
    if (!["sold", "request_sent"].includes(sale.status)) {
        throw Object.assign(new Error(`Sale is already ${sale.status.replace("_", " ")}`), { status: 400 });
    }
    if (sale.vat.reviewRequired) {
        throw Object.assign(new Error("VAT needs reviewing before this request can be sent"), { status: 400 });
    }
    if (!sale.buyer?.email) {
        throw Object.assign(new Error("Buyer has no email address"), { status: 400 });
    }

    const pi = await ensureBankTransferIntent(sale);
    if (pi.status === "succeeded") {
        await sale.save();
        await recordPayment(pi);
        throw Object.assign(new Error("Stripe shows this sale as already paid"), { status: 409 });
    }
    if (!sale.stripe?.bankTransfer?.iban && !sale.stripe?.bankTransfer?.accountNumber) {
        throw new Error("Stripe did not return bank details for this buyer");
    }

    const issueDate = new Date();
    const snapshot = paymentRequestSnapshot(sale, issueDate);
    const pdf = await renderPaymentRequestPdf(snapshot);

    // Previous requests stay on file but are marked as replaced.
    for (const d of sale.documents) {
        if (d.type === "payment_request" && !d.supersededAt) d.supersededAt = issueDate;
    }
    const version = sale.documents.filter((d) => d.type === "payment_request").length + 1;
    const doc = {
        type: "payment_request",
        number: version > 1 ? `${sale.reference}-PR${version}` : `${sale.reference}-PR`,
        total: sale.total,
        currency: sale.currency,
        issuedAt: issueDate,
        issuedBy: admin?._id,
        snapshot,
    };

    if (sendEmail) {
        const ok = await paymentRequestEmail(sale, snapshot, pdf, `${doc.number}.pdf`);
        if (ok) {
            doc.emailedTo = sale.buyer.email;
            doc.emailedAt = new Date();
        } else {
            doc.emailError = "Email failed to send";
        }
    }

    sale.documents.push(doc);
    sale.status = "request_sent";
    sale.set("payment.dueAt", snapshot.dueDate);
    sale.notes.push({ text: `Payment request ${doc.number} issued${doc.emailedAt ? ` and emailed to ${doc.emailedTo}` : ""}`, by: admin?._id });
    await sale.save();

    return { sale, emailed: !!doc.emailedAt };
};

// ─── Payments received (Stripe webhook) ────────────────────

export const recordPartialFunding = async (pi) => {
    const sale = await Sale.findOne({ "stripe.paymentIntentId": pi.id });
    if (!sale) return null;
    const remaining = pi.next_action?.display_bank_transfer_instructions?.amount_remaining;
    if (remaining !== undefined) sale.set("stripe.amountReceived", (pi.amount - remaining) / 100);
    sale.notes.push({ text: `Part payment received in Stripe: ${sale.stripe.amountReceived} ${sale.currency} of ${sale.total}` });
    await sale.save();
    return sale;
};

/** Marks a sale paid when its Stripe PaymentIntent succeeds. Idempotent. */
export const recordPayment = async (pi) => {
    const sale =
        (await Sale.findOne({ "stripe.paymentIntentId": pi.id })) ||
        (pi.metadata?.saleId ? await Sale.findById(pi.metadata.saleId) : null);
    if (!sale) return null;
    if (!["sold", "request_sent"].includes(sale.status)) return sale;

    sale.status = "paid";
    const received = (pi.amount_received || pi.amount) / 100;
    sale.set("stripe.amountReceived", received);
    sale.set("payment.paidAt", new Date());
    sale.set("payment.method", "bank_transfer");
    sale.set("payment.amount", received);
    sale.notes.push({ text: `Payment of ${sale.payment.amount} ${sale.currency} received via Stripe (${pi.id})` });
    await sale.save();

    // Keep the auction's own payment fields in step (save() fires the GA4 hook).
    const auction = await Auction.findById(sale.auction).populate("seller").populate("winner");
    if (auction && auction.paymentStatus !== "completed") {
        const paid = { paymentStatus: "completed", paymentMethod: "bank_transfer", paymentDate: new Date(), transactionId: pi.id };
        try {
            Object.assign(auction, paid);
            await auction.save();
        } catch (e) {
            // Never lose a payment because an old listing fails validation.
            console.error(`Auction ${auction._id} save failed after payment, updating directly:`, e.message);
            await Auction.updateOne({ _id: auction._id }, { $set: paid });
        }
        try {
            if (auction.winner) await paymentCompletedEmail(auction.winner, auction);
            if (auction.seller) await paymentCompletedSellerEmail(auction.seller, auction, auction.winner);
        } catch (e) {
            console.error("Payment confirmation emails failed:", e.message);
        }
    }
    return sale;
};
