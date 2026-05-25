import { Router } from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";
import {
    getPayoutMethods,
    updatePayPalMethod,
    updatePayoneerMethod,
    updateBankMethod,
    setDefaultPayoutMethod,
    removePayoutMethod,
    getAdminPayouts,
    getPendingPayouts,
    getAuctionPayoutInfo,
    getPayoutById,
    initiatePayout,
    completePayout,
    failPayout,
    getSellerPayouts,
    getSellerPayoutById,
} from "../controllers/payout.controller.js";
import upload from "../middlewares/multer.middleware.js";

const payoutRouter = Router();

// All routes require authentication
payoutRouter.use(auth);

// Get all payout methods
payoutRouter.get("/methods", getPayoutMethods);

// Update specific methods
payoutRouter.put("/paypal", updatePayPalMethod);
payoutRouter.put("/payoneer", updatePayoneerMethod);
payoutRouter.put("/bank", updateBankMethod);

// Set default method
payoutRouter.put("/default", setDefaultPayoutMethod);

// Remove a method
payoutRouter.delete("/:method", removePayoutMethod);

// Seller payout routes
payoutRouter.get("/seller", getSellerPayouts);
payoutRouter.get("/seller/:payoutId", getSellerPayoutById);

// All routes require admin authentication
payoutRouter.use(authAdmin);

// Get all payouts with filters
payoutRouter.get("/", getAdminPayouts);

// Get pending payouts (sold auctions without payout)
payoutRouter.get("/pending", getPendingPayouts);

// Get payout info for a specific auction
payoutRouter.get("/auction/:auctionId", getAuctionPayoutInfo);

// Get payout by ID
payoutRouter.get("/:payoutId", getPayoutById);

// Initiate payout for an auction
payoutRouter.post("/initiate/:auctionId", initiatePayout);

// Complete payout (mark as paid)
payoutRouter.put("/:payoutId/complete", upload.single("receipt"), completePayout);

// Mark payout as failed
payoutRouter.put("/:payoutId/fail", failPayout);

export default payoutRouter;