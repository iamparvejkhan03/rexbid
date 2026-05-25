import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
    getCheckoutData,
    verifyCheckoutAccess,
} from "../controllers/checkout.controller.js";

const checkoutRouter = Router();

// All checkout routes require authentication
checkoutRouter.use(auth);

// Get checkout data for a won auction
checkoutRouter.get("/:auctionId", getCheckoutData);

// Verify checkout access (can be used as middleware for payment routes)
checkoutRouter.get("/:auctionId/verify", verifyCheckoutAccess, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Checkout access verified",
        data: {
            auctionId: req.checkoutAuction._id,
            title: req.checkoutAuction.title,
        },
    });
});

export default checkoutRouter;