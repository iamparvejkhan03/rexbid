import Stripe from "stripe";
import Sale from "../models/sale.model.js";
import User from "../models/user.model.js";
import Payout from "../models/payout.model.js";
import { refreshSellerConnect, payoutState } from "./connectService.js";
import { issueSellerStatement } from "./saleLifecycleService.js";

/**
 * Collection and seller payouts.
 *
 *   paid ──(buyer ✓ + seller ✓, or admin "release early")──▶ payout_due
 *   payout_due ──(admin "Pay sellers": Stripe transfer)──▶ paid_out
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const fail = (message, status = 400) => Object.assign(new Error(message), { status });

export const netPayout = (sale) => round2((sale.itemPrice || 0) + (sale.vat?.amount || 0) - (sale.sellerFee || 0));

const OPEN_FOR_PAYOUT = ["paid", "collected", "payout_due"];

// ─── Collection ────────────────────────────────────────────

/** Buyer or seller confirms the item has been collected. */
export const confirmCollection = async (saleId, user) => {
    const sale = await Sale.findById(saleId);
    if (!sale) throw fail("Sale not found", 404);
    const uid = String(user._id);
    const role = String(sale.buyer?.user) === uid ? "buyer" : String(sale.seller?.user) === uid ? "seller" : null;
    if (!role) throw fail("Sale not found", 404);
    if (!["paid", "collected"].includes(sale.status)) {
        if (["payout_due", "paid_out"].includes(sale.status)) return { sale, role, alreadyDone: true };
        throw fail("Collection can be confirmed once payment has been received");
    }
    const field = role === "buyer" ? "collection.buyerConfirmedAt" : "collection.sellerConfirmedAt";
    if (!sale.get(field)) {
        sale.set(field, new Date());
        sale.notes.push({ text: `${role === "buyer" ? "Buyer" : "Seller"} confirmed collection`, by: user._id });
    }
    if (sale.collection?.buyerConfirmedAt && sale.collection?.sellerConfirmedAt) {
        sale.status = "payout_due";
        sale.notes.push({ text: "Both sides confirmed collection: payout due" });
    } else {
        sale.status = "collected";
    }
    await sale.save();
    return { sale, role };
};

/** Admin moves a paid sale to payout due without both ticks (both parties agreed). */
export const releasePayoutEarly = async (saleId, note, admin) => {
    if (!note?.trim()) throw fail("Add a note, e.g. who agreed and when");
    const sale = await Sale.findById(saleId);
    if (!sale) throw fail("Sale not found", 404);
    if (!["paid", "collected"].includes(sale.status)) throw fail("Only paid sales awaiting collection can be released");
    sale.set("collection.releasedEarly", { note: note.trim(), by: admin._id, at: new Date() });
    sale.status = "payout_due";
    sale.notes.push({ text: `Payout released early: ${note.trim()}`, by: admin._id });
    await sale.save();
    return sale;
};

// ─── Paying sellers ────────────────────────────────────────

/**
 * The Stripe charge the buyer paid with. Transfers made against it are
 * allowed even before the funds become available in the balance.
 */
const sourceChargeFor = async (sale) => {
    const piId = [sale.payment?.transactionId, sale.stripe?.paymentIntentId].find((id) => String(id || "").startsWith("pi_"));
    if (!piId) return null;
    try {
        const pi = await stripe.paymentIntents.retrieve(piId);
        if (pi.status !== "succeeded" || pi.currency !== sale.currency.toLowerCase()) return null;
        return typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id || null;
    } catch {
        return null;
    }
};

const availableBalance = async (currency) => {
    const bal = await stripe.balance.retrieve();
    return (bal.available || []).filter((b) => b.currency === currency).reduce((n, b) => n + b.amount, 0);
};

const recordPayout = async (sale, { transferId, accountId, amount, paidAt, admin, matched = false, seller }) => {
    sale.status = "paid_out";
    sale.set("payout", { paidAt, amount, reference: transferId, method: "stripe_connect", accountId, matched });
    if (!(await Payout.exists({ transactionId: transferId }))) {
        await Payout.create({
            seller: sale.seller.user,
            auction: sale.auction,
            totalAmount: round2(sale.itemPrice + (sale.vat?.amount || 0)),
            commissionAmount: sale.sellerFee || 0,
            sellerAmount: amount,
            payoutMethod: "stripeConnect",
            payoutDetails: { stripeAccountId: accountId, transferId, bankLast4: seller?.stripeConnect?.bankLast4 },
            status: "completed",
            transactionId: transferId,
            initiatedBy: admin._id,
            processedAt: paidAt,
            completedAt: paidAt,
            adminNotes: matched ? "Matched to an earlier Stripe transfer" : `Paid from Sales (${sale.reference})`,
        });
    }
};

/** Transfers the seller's net amount to their Stripe connected account. */
export const paySeller = async (saleId, admin, { balanceCache } = {}) => {
    const sale = await Sale.findById(saleId);
    if (!sale) throw fail("Sale not found", 404);
    if (sale.status !== "payout_due") throw fail("Only sales marked payout due can be paid");
    if (sale.payout?.reference) throw fail(`Already paid (${sale.payout.reference})`);

    const seller = await User.findById(sale.seller.user);
    const sc = await refreshSellerConnect(seller);
    if (payoutState(sc) !== "ready") {
        throw fail(
            payoutState(sc) === "none"
                ? "Seller has no Stripe payout account yet; send them the setup link"
                : "Seller's Stripe payout account isn't finished yet; send them the setup link",
        );
    }

    const amount = netPayout(sale);
    if (!(amount > 0)) throw fail("Nothing to pay");
    const cents = Math.round(amount * 100);
    const currency = sale.currency.toLowerCase();

    const sourceCharge = await sourceChargeFor(sale);
    if (!sourceCharge) {
        const cache = balanceCache || {};
        if (cache[currency] === undefined) cache[currency] = await availableBalance(currency);
        if (cache[currency] < cents) {
            throw fail(`Not enough available balance in Stripe (${(cache[currency] / 100).toFixed(2)} ${sale.currency} available)`);
        }
        cache[currency] -= cents;
    }

    const transfer = await stripe.transfers.create(
        {
            amount: cents,
            currency,
            destination: sc.accountId,
            transfer_group: sale.reference,
            description: `${sale.reference} ${sale.title}`.slice(0, 200),
            ...(sourceCharge ? { source_transaction: sourceCharge } : {}),
            metadata: { saleId: String(sale._id), auctionId: String(sale.auction), reference: sale.reference },
        },
        { idempotencyKey: `payout-${sale._id}-${cents}` },
    );

    await recordPayout(sale, { transferId: transfer.id, accountId: sc.accountId, amount, paidAt: new Date(), admin, seller });
    sale.notes.push({ text: `Paid ${amount} ${sale.currency} to ${sc.accountId} (${transfer.id})`, by: admin._id });
    await sale.save();

    // "You've been paid" with the updated statement.
    let emailed = false;
    try {
        ({ emailed } = await issueSellerStatement(sale._id, admin, { context: "paid_out" }));
    } catch (err) {
        console.error(`Payout statement for ${sale.reference} failed:`, err.message);
    }
    return { sale, transferId: transfer.id, amount, emailed };
};

// ─── Matching earlier Stripe transfers ─────────────────────

/**
 * Marks paid sales as paid out where a transfer made in the Stripe Dashboard
 * matches: same seller account, same amount, on or after the sale date.
 * No emails are sent. Returns what matched and what didn't.
 */
export const matchPastTransfers = async (admin) => {
    const candidates = await Sale.find({ status: { $in: OPEN_FOR_PAYOUT }, "payout.reference": { $in: [null, ""] } });
    const sellerIds = [...new Set(candidates.map((c) => String(c.seller.user)))];
    const sellers = new Map();
    for (const id of sellerIds) {
        const u = await User.findById(id);
        if (u) {
            await refreshSellerConnect(u);
            sellers.set(id, u);
        }
    }

    const used = new Set([
        ...(await Sale.distinct("payout.reference", { "payout.reference": { $ne: null } })),
        ...(await Payout.distinct("transactionId", { transactionId: { $ne: null } })),
    ]);
    const transfers = [];
    for await (const t of stripe.transfers.list({ limit: 100 })) {
        if (!t.reversed && !used.has(t.id) && !t.metadata?.saleId) transfers.push(t);
    }
    transfers.sort((a, b) => a.created - b.created);

    const matched = [];
    const unmatchedSales = [];
    // Oldest sales first, each taking the earliest suitable transfer.
    candidates.sort((a, b) => new Date(a.saleDate) - new Date(b.saleDate));
    for (const sale of candidates) {
        const seller = sellers.get(String(sale.seller.user));
        const acct = seller?.stripeConnect?.accountId;
        const cents = Math.round(netPayout(sale) * 100);
        const after = new Date(sale.saleDate).getTime() / 1000 - 86400;
        const idx = acct
            ? transfers.findIndex((t) => t.destination === acct && t.amount === cents && t.currency === sale.currency.toLowerCase() && t.created >= after)
            : -1;
        if (idx === -1) {
            unmatchedSales.push({
                reference: sale.reference,
                title: sale.title,
                seller: sale.seller.companyName || sale.seller.name,
                amount: netPayout(sale),
                reason: acct ? "No transfer of this amount to the seller's account" : "Seller has no Stripe payout account",
            });
            continue;
        }
        const [t] = transfers.splice(idx, 1);
        await recordPayout(sale, { transferId: t.id, accountId: acct, amount: t.amount / 100, paidAt: new Date(t.created * 1000), admin, matched: true, seller });
        sale.notes.push({ text: `Matched to Stripe transfer ${t.id} made ${new Date(t.created * 1000).toDateString()}`, by: admin._id });
        await sale.save();
        matched.push({ reference: sale.reference, title: sale.title, transferId: t.id, amount: t.amount / 100 });
    }

    const emailByAcct = new Map([...sellers.values()].filter((u) => u.stripeConnect?.accountId).map((u) => [u.stripeConnect.accountId, u.email]));
    const unmatchedTransfers = transfers.map((t) => ({
        transferId: t.id,
        amount: t.amount / 100,
        currency: t.currency.toUpperCase(),
        date: new Date(t.created * 1000),
        destination: t.destination,
        seller: emailByAcct.get(t.destination) || null,
    }));
    return { matched, unmatchedSales, unmatchedTransfers };
};
