import { Router } from "express";
import {
    submitWebsiteReview,
    getWebsiteReviews,
    getApprovedWebsiteReviews,
    getWebsiteReviewById,
    updateWebsiteReviewStatus,
    deleteWebsiteReview,
    getWebsiteReviewStats,
} from "../controllers/websiteReview.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const websiteReviewRouter = Router();

// ----- Public -----
websiteReviewRouter.post("/submit", submitWebsiteReview);
websiteReviewRouter.get("/approved", getApprovedWebsiteReviews);

// ----- Admin -----
websiteReviewRouter.get("/stats", authAdmin, getWebsiteReviewStats);
websiteReviewRouter.get("/", authAdmin, getWebsiteReviews);
websiteReviewRouter.get("/:id", authAdmin, getWebsiteReviewById);
websiteReviewRouter.patch("/:id/status", authAdmin, updateWebsiteReviewStatus);
websiteReviewRouter.delete("/:id", authAdmin, deleteWebsiteReview);

export default websiteReviewRouter;