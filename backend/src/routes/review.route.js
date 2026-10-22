import { Router } from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";
import {
    createReview,
    getUserReviews,
    getMyReviewForAuction,
    updateReview,
    deleteReview,
    getReviewsByAuction,
    // Admin
    getAdminReviews,
    getReviewStats,
    approveReview,
    rejectReview,
    adminDeleteReview,
} from "../controllers/review.controller.js";

const reviewRouter = Router();

// ---- ADMIN (must come before generic /:reviewId) ----
reviewRouter.get("/admin/stats", authAdmin, getReviewStats);
reviewRouter.get("/admin", authAdmin, getAdminReviews);
reviewRouter.patch("/admin/:reviewId/approve", authAdmin, approveReview);
reviewRouter.patch("/admin/:reviewId/reject", authAdmin, rejectReview);
reviewRouter.delete("/admin/:reviewId", authAdmin, adminDeleteReview);

// ---- USER ----
reviewRouter.post("/auction/:auctionId", auth, createReview);
reviewRouter.get("/user/:userId", getUserReviews);
reviewRouter.get("/my-review/auction/:auctionId", auth, getMyReviewForAuction);
reviewRouter.put("/:reviewId", auth, updateReview);
reviewRouter.delete("/:reviewId", auth, deleteReview);
reviewRouter.get("/auction/:auctionId", getReviewsByAuction);

export default reviewRouter;