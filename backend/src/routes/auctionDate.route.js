import { Router } from "express";
import {
    createAuctionDate,
    getAuctionDates,
    getActiveAuctionDates,
    updateAuctionDate,
    toggleAuctionDateStatus,
    deleteAuctionDate,
} from "../controllers/auctionDate.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const auctionDateRouter = Router();

// ── Public (sellers need this when creating/editing) ──
auctionDateRouter.get("/active", getActiveAuctionDates);

// ── Admin only ─────────────────────────────────────────
auctionDateRouter.post("/", authAdmin, createAuctionDate);
auctionDateRouter.get("/", authAdmin, getAuctionDates);
auctionDateRouter.put("/:id", authAdmin, updateAuctionDate);
auctionDateRouter.patch("/:id/toggle", authAdmin, toggleAuctionDateStatus);
auctionDateRouter.delete("/:id", authAdmin, deleteAuctionDate);

export default auctionDateRouter;