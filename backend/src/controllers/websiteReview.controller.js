import WebsiteReview from "../models/websiteReview.modal.js";
import {
    websiteReviewAdminEmail,
    websiteReviewUserEmail,
} from "../utils/nodemailer.js";

// ============================================================
// Submit a review (public)
// ============================================================
export const submitWebsiteReview = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            location,
            rating,
            feedback,
            userType,
        } = req.body;

        if (!name || !email || !location || !feedback) {
            return res.status(400).json({
                success: false,
                message: "Name, email, location, and feedback are required.",
            });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5 stars.",
            });
        }

        const review = await WebsiteReview.create({
            name,
            email,
            phone: phone || "",
            location,
            rating: numericRating,
            feedback,
            userType: userType || "buyer",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        });

        // Fire emails in background
        websiteReviewAdminEmail(review).catch((err) =>
            console.error("Admin website review email error:", err)
        );
        websiteReviewUserEmail({ name, email }).catch((err) =>
            console.error("User website review email error:", err)
        );

        return res.status(201).json({
            success: true,
            message:
                "Thank you for your review! It will appear on our site once approved.",
            data: { reviewId: review._id },
        });
    } catch (error) {
        console.error("Submit website review error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while submitting your review.",
        });
    }
};

// ============================================================
// Get all reviews (admin — with filters/pagination)
// ============================================================
export const getWebsiteReviews = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status && status !== "all") query.status = status;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { feedback: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            WebsiteReview.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            WebsiteReview.countDocuments(query),
        ]);

        return res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error("Get website reviews error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch website reviews.",
        });
    }
};

// ============================================================
// Get approved reviews (public — for "What Our Clients Say")
// ============================================================
export const getApprovedWebsiteReviews = async (req, res) => {
    try {
        const { page = 1, limit = 12, rating } = req.query;

        const query = { status: "approved" };
        if (rating) query.rating = Number(rating);

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            WebsiteReview.find(query)
                .sort({ approvedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .select("-email -phone -ipAddress -userAgent -adminNotes"),
            WebsiteReview.countDocuments(query),
        ]);

        // Aggregate: overall average + count
        const stats = await WebsiteReview.aggregate([
            { $match: { status: "approved" } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    total: { $sum: 1 },
                },
            },
        ]);

        const summary = stats[0] || { avgRating: 0, total: 0 };

        return res.json({
            success: true,
            data: {
                reviews,
                summary: {
                    average: Number(summary.avgRating.toFixed(1)),
                    total: summary.total,
                },
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error("Get approved reviews error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews.",
        });
    }
};

// ============================================================
// Get single review (admin)
// ============================================================
export const getWebsiteReviewById = async (req, res) => {
    try {
        const review = await WebsiteReview.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found.",
            });
        }
        return res.json({ success: true, data: review });
    } catch (error) {
        console.error("Get review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch review.",
        });
    }
};

// ============================================================
// Update status / notes (admin)
// ============================================================
export const updateWebsiteReviewStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        const validStatuses = ["pending", "approved", "rejected"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value.",
            });
        }

        const updates = {};
        if (status) {
            updates.status = status;
            updates.approvedAt = status === "approved" ? new Date() : null;
        }
        if (adminNotes !== undefined) updates.adminNotes = adminNotes;

        const review = await WebsiteReview.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found.",
            });
        }

        return res.json({
            success: true,
            message: "Review updated successfully.",
            data: review,
        });
    } catch (error) {
        console.error("Update review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update review.",
        });
    }
};

// ============================================================
// Delete (admin)
// ============================================================
export const deleteWebsiteReview = async (req, res) => {
    try {
        const review = await WebsiteReview.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found.",
            });
        }
        return res.json({
            success: true,
            message: "Review deleted successfully.",
        });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete review.",
        });
    }
};

// ============================================================
// Stats (admin dashboard)
// ============================================================
export const getWebsiteReviewStats = async (req, res) => {
    try {
        const stats = await WebsiteReview.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const formatted = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0,
        };
        stats.forEach((s) => {
            formatted[s._id] = s.count;
            formatted.total += s.count;
        });

        const ratingAgg = await WebsiteReview.aggregate([
            { $match: { status: "approved" } },
            { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]);
        formatted.averageRating = ratingAgg[0]
            ? Number(ratingAgg[0].avg.toFixed(1))
            : 0;

        return res.json({ success: true, data: formatted });
    } catch (error) {
        console.error("Get review stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stats.",
        });
    }
};