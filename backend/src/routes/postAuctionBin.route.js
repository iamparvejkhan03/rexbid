import { Router } from "express";
import { adminInvitePreview, adminInviteSend, adminInviteTest, adminUnsold, buy, cancel, listLive, lotStatus, lowerPrice, setup } from "../controllers/postAuctionBin.controller.js";
import { auth, authAdmin, optionalAuth } from "../middlewares/auth.middleware.js";

// Buy It Now after the auction – mounted at /api/v1/buy-it-now
const postAuctionBinRouter = Router();
postAuctionBinRouter.get("/", listLive);
postAuctionBinRouter.get("/lot/:id", optionalAuth, lotStatus);
postAuctionBinRouter.post("/lot/:id/setup", auth, setup);
postAuctionBinRouter.delete("/lot/:id/setup", auth, cancel);
postAuctionBinRouter.patch("/lot/:id/price", auth, lowerPrice);
postAuctionBinRouter.post("/lot/:id/buy", auth, buy);

// Admin → Buy It Now: invite sellers of unsold reserve lots
postAuctionBinRouter.get("/admin/unsold", authAdmin, adminUnsold);
postAuctionBinRouter.post("/admin/invite/preview", authAdmin, adminInvitePreview);
postAuctionBinRouter.post("/admin/invite/test", authAdmin, adminInviteTest);
postAuctionBinRouter.post("/admin/invite/send", authAdmin, adminInviteSend);

export default postAuctionBinRouter;
