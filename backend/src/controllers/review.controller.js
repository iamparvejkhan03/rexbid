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
            // status is not set here — schema default "pending" applies
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully. It will be visible after admin approval.",
            data: review,
        });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reviews for a user (with average rating) — APPROVED ONLY
export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ reviewee: userId, status: "approved" })
            .populate("reviewer", "username companyName firstName lastName image")
            .populate("auction", "title")
            .sort({ createdAt: -1 });

        const stats = await Review.aggregate([
            { $match: { reviewee: new mongoose.Types.ObjectId(userId), status: "approved" } },
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
// NOTE: intentionally NOT filtered by status — the author should see their own pending review
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

// Get all reviews for a specific auction — APPROVED ONLY
export const getReviewsByAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const reviews = await Review.find({ auction: auctionId, status: "approved" })
            .populate("reviewer", "username companyName firstName lastName image")
            .populate("reviewee", "username companyName firstName lastName")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("Get reviews by auction error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===== ADMIN MODERATION =====

// Admin: Get all reviews with filters + pagination
export const getAdminReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = "pending", sortBy = "recent" } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (status !== "all") filter.status = status;

        let sortOptions = {};
        switch (sortBy) {
            case "recent": sortOptions = { createdAt: -1 }; break;
            case "oldest": sortOptions = { createdAt: 1 }; break;
            case "highestRating": sortOptions = { rating: -1, createdAt: -1 }; break;
            case "lowestRating": sortOptions = { rating: 1, createdAt: -1 }; break;
            default: sortOptions = { createdAt: -1 };
        }

        const reviews = await Review.find(filter)
            .populate("reviewer", "username companyName firstName lastName image email")
            .populate("reviewee", "username companyName firstName lastName email")
            .populate("auction", "title photos")
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalReviews = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalReviews / limit),
                    totalReviews,
                    reviewsPerPage: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error("Get admin reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Approve a review
export const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        review.status = "approved";
        await review.save();

        res.status(200).json({ success: true, message: "Review approved", data: review });
    } catch (error) {
        console.error("Approve review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Reject a review
export const rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        review.status = "rejected";
        await review.save();

        res.status(200).json({ success: true, message: "Review rejected", data: review });
    } catch (error) {
        console.error("Reject review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete a review
export const adminDeleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        await review.deleteOne();
        res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
        console.error("Admin delete review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Review statistics for the dashboard cards
export const getReviewStats = async (req, res) => {
    try {
        const totalReviews = await Review.countDocuments();
        const pendingReviews = await Review.countDocuments({ status: "pending" });
        const approvedReviews = await Review.countDocuments({ status: "approved" });
        const rejectedReviews = await Review.countDocuments({ status: "rejected" });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const reviewsThisWeek = await Review.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        res.status(200).json({
            success: true,
            data: { totalReviews, pendingReviews, approvedReviews, rejectedReviews, reviewsThisWeek },
        });
    } catch (error) {
        console.error("Get review stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};