import mongoose from "mongoose";

const websiteReviewSchema = new mongoose.Schema(
    {
        // Contact info
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true, default: "" },
        location: { type: String, required: true, trim: true },

        // Review content
        rating: { type: Number, required: true, min: 1, max: 5 },
        feedback: { type: String, required: true, trim: true },

        // Optional — wire to Cloudinary later
        profileImage: { type: String, default: "" },

        // Who is reviewing
        userType: {
            type: String,
            enum: ["bidder", "seller", "company", "other"],
            default: "bidder",
        },

        // Moderation workflow
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminNotes: { type: String, default: "" },
        approvedAt: { type: Date, default: null },

        // Tracking
        ipAddress: { type: String },
        userAgent: { type: String },
    },
    { timestamps: true }
);

websiteReviewSchema.index({ status: 1, createdAt: -1 });
websiteReviewSchema.index({ rating: 1 });

export default mongoose.model("WebsiteReview", websiteReviewSchema);