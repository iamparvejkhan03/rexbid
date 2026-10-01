import { Router } from "express";
import { submitDeliveryQuote } from "../controllers/deliveryQuote.controller.js";

const deliveryQuoteRouter = Router();

// Public route - submit delivery partner quote request
deliveryQuoteRouter.post("/submit", submitDeliveryQuote);

export default deliveryQuoteRouter;