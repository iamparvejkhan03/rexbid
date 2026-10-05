import mongoose from "mongoose";

const deliveryQuoteRequestSchema = new mongoose.Schema(
    {
        // Contact info
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true, default: "" },

        // Request details
        subject: { type: String, trim: true, default: "" },
        message: { type: String, required: true, trim: true },

        // Auction context (optional — set when submitted from an auction page)
        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auction",
            default: null,
        },
        auctionTitle: { type: String, default: "" },

        // Workflow (for admin / partner management)
        status: {
            type: String,
            enum: ["pending", "contacted", "quoted", "completed", "cancelled"],
            default: "pending",
        },
        adminNotes: { type: String, default: "" },

        // Tracking
        ipAddress: { type: String },
        userAgent: { type: String },
    },
    { timestamps: true }
);

// Indexes for admin filtering
deliveryQuoteRequestSchema.index({ status: 1, createdAt: -1 });
deliveryQuoteRequestSchema.index({ auction: 1 });

export default mongoose.model("DeliveryQuoteRequest", deliveryQuoteRequestSchema);