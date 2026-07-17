import Review from "../models/review.model.js";
import Auction from "../models/auction.model.js";
import mongoose from "mongoose";

// Create a review (winner rates seller OR seller rates winner)
export const createReview = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { rating, comment, revieweeId } = req.body; // revieweeId is the user being rated
        const reviewerId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ success: false, message: "Auction not found" });
        }

        // Only allow review if auction is completed (sold)
        if (auction.status !== "sold") {
            return res.status(400).json({ success: false, message: "You can only review completed auctions" });
        }

        // Check if user is either seller or winner
        const isSeller = auction.seller.toString() === reviewerId.toString();
        const isWinner = auction.winner && auction.winner.toString() === reviewerId.toString();

        if (!isSeller && !isWinner) {
            return res.status(403).json({ success: false, message: "Only the seller or winner can leave a review" });
        }

        // Determine the reviewee (the other party)
        let expectedReviewee = null;
        if (isSeller) {
            expectedReviewee = auction.winner;
        } else if (isWinner) {
            expectedReviewee = auction.seller;
        }

        if (!expectedReviewee || expectedReviewee.toString() !== revieweeId) {
            return res.status(400).json({ success: false, message: "Invalid reviewee" });
        }

        // Check if user already reviewed this auction
        const existingReview = await Review.findOne({ auction: auctionId, reviewer: reviewerId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this auction" });
        }

        const review = await Review.create({
            auction: auctionId,
            reviewer: reviewerId,
            reviewee: revieweeId,
            rating,
            comment,
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reviews for a user (with average rating)
export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ reviewee: userId })
            .populate("reviewer", "username companyName firstName lastName image")
            .populate("auction", "title")
            .sort({ createdAt: -1 });

        const stats = await Review.aggregate([
            { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                averageRating: stats[0]?.avgRating || 0,
                totalReviews: stats[0]?.total || 0,
            },
        });
    } catch (error) {
        console.error("Get user reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get review for a specific auction by the current user (to check if already reviewed)
export const getMyReviewForAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({ auction: auctionId, reviewer: userId });
        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a review (only if owner)
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        if (review.reviewer.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        await review.save();

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete review (owner or admin)
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.userType === "admin";

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        if (!isAdmin && review.reviewer.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await review.deleteOne();
        res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reviews for a specific auction
export const getReviewsByAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const reviews = await Review.find({ auction: auctionId })
            .populate("reviewer", "username companyName firstName lastName image")
            .populate("reviewee", "username companyName firstName lastName")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("Get reviews by auction error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};