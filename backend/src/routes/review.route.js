import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
    createReview,
    getUserReviews,
    getMyReviewForAuction,
    updateReview,
    deleteReview,
    getReviewsByAuction,
} from "../controllers/review.controller.js";

const reviewRouter = Router();

reviewRouter.post("/auction/:auctionId", auth, createReview);
reviewRouter.get("/user/:userId", getUserReviews);
reviewRouter.get("/my-review/auction/:auctionId", auth, getMyReviewForAuction);
reviewRouter.put("/:reviewId", auth, updateReview);
reviewRouter.delete("/:reviewId", auth, deleteReview);
reviewRouter.get("/auction/:auctionId", getReviewsByAuction);

export default reviewRouter;