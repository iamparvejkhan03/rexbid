import { Schema, model } from "mongoose";

/**
 * One record per sold lot, from the hammer to the seller payout.
 *
 * Buyer, seller and money figures are snapshotted when the record is created,
 * so documents issued from it do not change if someone later edits their
 * profile or the listing.
 *
 * Stages:  sold → request_sent → paid → collected → payout_due → paid_out
 * (plus cancelled). Collection and payout stages are filled in by later work.
 */

const partySchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        name: String,
        username: String,
        companyName: String,
        email: String,
        phone: String,
        addressLines: [String],
        vatNumber: String,
        region: { type: String, enum: ["ROI", "NI", "GB", "EU", "OTHER", null], default: null },
    },
    { _id: false },
);

const documentSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["payment_request", "buyer_receipt", "seller_statement"],
            required: true,
        },
        number: { type: String, required: true },
        // Totals as printed on the document, so a re-issue is easy to spot.
        total: Number,
        currency: String,
        issuedAt: { type: Date, default: Date.now },
        issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
        emailedTo: String,
        emailedAt: Date,
        emailError: String,
        // Superseded documents stay on file but are no longer the current one.
        supersededAt: Date,
        // Snapshot of what was printed. PDFs are re-rendered from this on
        // download, so no file needs to be stored anywhere public.
        snapshot: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: false },
);

const saleSchema = new Schema(
    {
        auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true, unique: true },
        reference: { type: String, required: true, unique: true },
        title: String,
        saleDate: Date,
        currency: { type: String, enum: ["EUR", "GBP"], default: "EUR" },

        buyer: partySchema,
        seller: partySchema,

        itemPrice: { type: Number, required: true },
        buyerFee: { type: Number, default: 0 },
        buyerFeeDescription: String,
        sellerFee: { type: Number, default: 0 },

        vat: {
            applicable: { type: Boolean, default: false },
            itemRegion: { type: String, default: null },
            rate: { type: Number, default: 0 },
            amount: { type: Number, default: 0 },
            treatment: {
                type: String,
                enum: ["not_applicable", "standard", "zero_rated"],
                default: "not_applicable",
            },
            reviewRequired: { type: Boolean, default: false },
            reviewReasons: [String],
            // Admin decision, kept for the audit trail.
            override: {
                treatment: { type: String, enum: ["standard", "zero_rated", null], default: null },
                rate: Number,
                note: String,
                by: { type: Schema.Types.ObjectId, ref: "User" },
                at: Date,
            },
        },

        total: { type: Number, required: true },

        status: {
            type: String,
            enum: ["sold", "request_sent", "paid", "collected", "payout_due", "paid_out", "cancelled"],
            default: "sold",
            index: true,
        },

        stripe: {
            customerId: String,
            paymentIntentId: String,
            paymentIntentAmount: Number,
            bankTransfer: {
                type: { type: String },
                iban: String,
                bic: String,
                sortCode: String,
                accountNumber: String,
                accountHolderName: String,
                country: String,
                reference: String,
            },
            amountReceived: { type: Number, default: 0 },
        },

        payment: {
            dueAt: Date,
            paidAt: Date,
            method: String,
            amount: Number,
        },

        documents: [documentSchema],

        notes: [
            {
                text: String,
                by: { type: Schema.Types.ObjectId, ref: "User" },
                at: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true },
);

saleSchema.index({ "buyer.user": 1 });
saleSchema.index({ "seller.user": 1 });
saleSchema.index({ "stripe.paymentIntentId": 1 });
saleSchema.index({ saleDate: -1 });

saleSchema.methods.currentDocument = function (type) {
    return [...this.documents].reverse().find((d) => d.type === type && !d.supersededAt) || null;
};

const Sale = model("Sale", saleSchema);
export default Sale;
