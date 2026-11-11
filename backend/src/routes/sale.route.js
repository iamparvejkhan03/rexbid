import { Router } from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";
import {
    listSales,
    runSync,
    getSale,
    updateVat,
    issuePaymentRequests,
    previewPaymentRequest,
    myDocuments,
    downloadDocument,
} from "../controllers/sale.controller.js";

// Mounted at /api/v1/admin/sales
export const adminSaleRouter = Router();
adminSaleRouter.get("/", authAdmin, listSales);
adminSaleRouter.post("/sync", authAdmin, runSync);
adminSaleRouter.post("/issue-payment-requests", authAdmin, issuePaymentRequests);
adminSaleRouter.get("/:saleId", authAdmin, getSale);
adminSaleRouter.patch("/:saleId/vat", authAdmin, updateVat);
adminSaleRouter.get("/:saleId/payment-request/preview", authAdmin, previewPaymentRequest);
adminSaleRouter.get("/:saleId/documents/:documentId", authAdmin, downloadDocument);

// Mounted at /api/v1/sales (buyers and sellers)
export const saleRouter = Router();
saleRouter.get("/documents", auth, myDocuments);
saleRouter.get("/:saleId/documents/:documentId", auth, downloadDocument);
