import { Router } from "express";
import {
    submitDeliveryQuote,
    getDeliveryQuotes,
    getDeliveryQuoteById,
    updateDeliveryQuoteStatus,
    deleteDeliveryQuote,
    getDeliveryQuoteStats,
} from "../controllers/deliveryQuote.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const deliveryQuoteRouter = Router();

// Public route - submit delivery partner quote request
deliveryQuoteRouter.post("/submit", submitDeliveryQuote);

// ---------- Admin ----------
deliveryQuoteRouter.get("/", authAdmin, getDeliveryQuotes);
deliveryQuoteRouter.get("/stats", authAdmin, getDeliveryQuoteStats);
deliveryQuoteRouter.get("/:id", authAdmin, getDeliveryQuoteById);
deliveryQuoteRouter.patch("/:id/status", authAdmin, updateDeliveryQuoteStatus);
deliveryQuoteRouter.delete("/:id", authAdmin, deleteDeliveryQuote);

export default deliveryQuoteRouter;