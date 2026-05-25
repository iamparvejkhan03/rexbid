import { Schema, model } from "mongoose";

const payoutSchema = new Schema(
    {
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        auction: {
            type: Schema.Types.ObjectId,
            ref: "Auction",
            required: true,
            index: true,
        },
        // Financial details
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        commissionAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        sellerAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        // Payout details
        payoutMethod: {
            type: String,
            enum: ["paypal", "payoneer", "bankTransfer"],
            required: true,
        },
        payoutDetails: {
            type: Schema.Types.Mixed, // Stores the method details used at time of payout
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed", "cancelled"],
            default: "pending",
            index: true,
        },
        // Transaction references
        transactionId: {
            type: String,
            sparse: true,
            unique: true,
        },
        adminNotes: {
            type: String,
            trim: true,
        },
        sellerNotes: {
            type: String,
            trim: true,
        },
        // Tracking
        initiatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        processedAt: Date,
        completedAt: Date,
        failedAt: Date,
        failureReason: String,
        // Receipt/Proof
        receipt: {
            url: String,
            publicId: String,
            filename: String,
            uploadedAt: Date,
        },
    },
    {
        timestamps: true,
    },
);

// Indexes for better performance
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ seller: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

// Virtual for formatted amounts
payoutSchema.virtual("formattedSellerAmount").get(function () {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(this.sellerAmount);
});

payoutSchema.virtual("formattedCommissionAmount").get(function () {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(this.commissionAmount);
});

payoutSchema.virtual("formattedTotalAmount").get(function () {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(this.totalAmount);
});

const Payout = model("Payout", payoutSchema);
export default Payout;