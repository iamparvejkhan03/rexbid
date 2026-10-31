import { Router } from "express";
import {
    createCatalogue,
    getCatalogues,
    getCatalogue,
    getCatalogueAuctions,
    deleteCatalogue,
} from "../controllers/catalogue.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const catalogueRouter = Router();

// Public
catalogueRouter.get("/", getCatalogues);
catalogueRouter.get("/:id", getCatalogue);
catalogueRouter.get("/:id/auctions", getCatalogueAuctions);

// Admin
catalogueRouter.post(
    "/create",
    authAdmin,
    upload.single("image"),
    createCatalogue
);
catalogueRouter.delete("/delete/:id", authAdmin, deleteCatalogue);

export default catalogueRouter;