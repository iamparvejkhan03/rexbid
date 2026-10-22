import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
    {
        auction: {
            type: Schema.Types.ObjectId,
            ref: "Auction",
            required: true,
        },
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reviewee: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        // NEW: moderation status — every new review starts as pending
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Ensure one review per auction per reviewer
reviewSchema.index({ auction: 1, reviewer: 1 }, { unique: true });

// Helpful for the upcoming admin queue (list pending first, newest first)
reviewSchema.index({ status: 1, createdAt: -1 });

const Review = model("Review", reviewSchema);
export default Review;