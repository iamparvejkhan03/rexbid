import Sale from "../models/sale.model.js";
import { saleReminderEmail, adminSaleAlertEmail } from "../utils/nodemailer.js";

/**
 * Automatic reminders. Each one is sent at most once per sale, only between
 * 08:00 and 20:00 Irish time, and only after the matching document has gone
 * out (no payment reminder without a payment request, no collection reminder
 * without a receipt). Earlier (imported) sales are never reminded.
 *
 *   Payment:    24 hours before the due time, and once when overdue (+ admin alert)
 *   Collection: 24 hours before the collect-by date, and once when overdue (+ admin alert)
 */

const HOUR = 3600 * 1000;

export const withinSendingHours = (now = new Date()) => {
    const hour = Number(new Intl.DateTimeFormat("en-IE", { hour: "numeric", hour12: false, timeZone: "Europe/Dublin" }).format(now));
    return hour >= 8 && hour < 20;
};

const hasCurrent = (sale, type) => sale.documents?.some((d) => d.type === type && !d.supersededAt);

/** Which reminder, if any, is due for this sale right now. */
export const dueReminder = (sale, now = new Date()) => {
    if (sale.historical) return null;
    const r = sale.reminders || {};
    if (sale.status === "request_sent" && hasCurrent(sale, "payment_request") && sale.payment?.dueAt) {
        const due = new Date(sale.payment.dueAt).getTime();
        if (now >= due && !r.paymentOverdueAt) return "payment_overdue";
        if (now >= due - 24 * HOUR && now < due && !r.paymentDueSoonAt) return "payment_due_soon";
    }
    const collected = sale.collection?.buyerConfirmedAt || sale.collection?.sellerConfirmedAt;
    if (["paid", "collected"].includes(sale.status) && !collected && hasCurrent(sale, "buyer_receipt") && sale.collection?.dueBy) {
        const due = new Date(sale.collection.dueBy).getTime();
        if (now >= due && !r.collectionOverdueAt) return "collection_overdue";
        if (now >= due - 24 * HOUR && now < due && !r.collectionDueSoonAt) return "collection_due_soon";
    }
    return null;
};

const FIELD = {
    payment_due_soon: "reminders.paymentDueSoonAt",
    payment_overdue: "reminders.paymentOverdueAt",
    collection_due_soon: "reminders.collectionDueSoonAt",
    collection_overdue: "reminders.collectionOverdueAt",
};

export const runReminders = async (now = new Date()) => {
    if (!withinSendingHours(now)) return { sent: 0, skipped: "outside sending hours" };
    const sales = await Sale.find(
        { historical: { $ne: true }, status: { $in: ["request_sent", "paid", "collected"] } },
        "-documents.snapshot",
    );
    let sent = 0;
    for (const sale of sales) {
        const kind = dueReminder(sale, now);
        if (!kind) continue;
        // Record first, so a crash mid-send can never cause a repeat.
        const claimed = await Sale.updateOne({ _id: sale._id, [FIELD[kind]]: null }, { $set: { [FIELD[kind]]: now } });
        if (!claimed.modifiedCount) continue;
        const ok = await saleReminderEmail(sale, kind);
        if (kind.endsWith("overdue")) await adminSaleAlertEmail(sale, kind);
        await Sale.updateOne(
            { _id: sale._id },
            { $push: { notes: { text: `Reminder sent (${kind.replace(/_/g, " ")})${ok ? "" : " — email failed"}`, at: now } } },
        );
        if (ok) sent += 1;
    }
    return { sent };
};
