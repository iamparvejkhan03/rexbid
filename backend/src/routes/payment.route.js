import { Router } from "express";
import express from "express";
import {
    confirmCheckoutPayment,
    createBankTransferPayment,
    createCheckoutPayment,
    createWonAuctionPayment,
    getAuctionPaymentStatus,
    handleStripeWebhook,
    paySellerCommission,
} from "../controllers/payment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

// Protected routes
paymentRouter.use(auth);
paymentRouter.post("/create-won-auction-payment", createWonAuctionPayment);
paymentRouter.get("/auction/:auctionId/status", getAuctionPaymentStatus);

// Add these new routes
paymentRouter.post("/create-checkout-payment", createCheckoutPayment);
paymentRouter.post("/confirm-checkout-payment", confirmCheckoutPayment);
paymentRouter.post("/create-bank-transfer-payment", createBankTransferPayment);
paymentRouter.post("/pay-commission", paySellerCommission);

// Webhook route (no auth)
paymentRouter.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook,
);

export default paymentRouter;