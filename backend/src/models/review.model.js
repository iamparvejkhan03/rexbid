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
    },
    { timestamps: true }
);

// Ensure one review per auction per reviewer
reviewSchema.index({ auction: 1, reviewer: 1 }, { unique: true });

const Review = model("Review", reviewSchema);
export default Review;