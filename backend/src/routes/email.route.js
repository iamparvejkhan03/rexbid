import express from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendCampaignNow,
    cancelScheduledCampaign,
    previewRecipients,
} from "../controllers/emailCampaign.controller.js";

const emailRouter = express.Router();

// All routes require authentication + admin + manage_email permission
emailRouter.use(auth, authAdmin);

// Preview (must come before /campaigns/:id route)
emailRouter.post("/campaigns/preview-recipients", previewRecipients);

// Campaigns
emailRouter.post("/campaigns", createCampaign);
emailRouter.get("/campaigns", getCampaigns);
emailRouter.get("/campaigns/:id", getCampaignById);
emailRouter.put("/campaigns/:id", updateCampaign);
emailRouter.delete("/campaigns/:id", deleteCampaign);
emailRouter.post("/campaigns/:id/send", sendCampaignNow);
emailRouter.post("/campaigns/:id/cancel", cancelScheduledCampaign);

export default emailRouter;