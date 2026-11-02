import mongoose from "mongoose";

const deliveryQuoteRequestSchema = new mongoose.Schema(
    {
        // Contact info
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true }, // 👈 now required

        // Request details
        whatDelivered: { type: String, required: true, trim: true },   // e.g. "Massey Ferguson 6270"
        weightDimensions: { type: String, trim: true, default: "" },   // optional
        collectionAddress: { type: String, required: true, trim: true },
        deliveryAddress: { type: String, required: true, trim: true },

        // Legacy fields — kept for backward compatibility with old records
        subject: { type: String, trim: true, default: "" },
        message: { type: String, trim: true, default: "" },

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

deliveryQuoteRequestSchema.index({ status: 1, createdAt: -1 });
deliveryQuoteRequestSchema.index({ auction: 1 });

export default mongoose.model("DeliveryQuoteRequest", deliveryQuoteRequestSchema);