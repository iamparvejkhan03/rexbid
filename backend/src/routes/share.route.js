// Serves the website's index.html for listing and catalogue URLs with the
// page-specific <head> tags already filled in (see utils/shareHtml.js).
//
// Wiring: on the Render static site for rexbid.ie, add rewrite rules ABOVE the
// existing "/* -> /index.html" rule:
//   /auction/*    -> https://<backend>/share/auction/*
//   /catalogue/*  -> https://<backend>/share/catalogue/*
// Visitors still see rexbid.ie in the address bar; JS/CSS assets keep loading
// from rexbid.ie because index.html uses absolute /assets/ paths.

import express from "express";
import mongoose from "mongoose";
import Auction from "../models/auction.model.js";
import Catalogue from "../models/catalogue.model.js";
import { sanitizeAuctionForViewer } from "../utils/publicAuction.js";
import { buildAuctionMeta, buildCatalogueMeta, injectHead, notFoundMeta } from "../utils/shareHtml.js";

// Where to fetch the built index.html from. Must NOT be a URL that is itself
// rewritten to this route ("/" is safe).
const FRONTEND_ORIGIN = (process.env.FRONTEND_ORIGIN || "https://rexbid.ie").replace(/\/+$/, "");
const TEMPLATE_TTL_MS = 5 * 60 * 1000;

let template = { html: null, at: 0 };

export const getTemplate = async (fetchImpl = fetch) => {
    if (template.html && Date.now() - template.at < TEMPLATE_TTL_MS) return template.html;
    try {
        const res = await fetchImpl(`${FRONTEND_ORIGIN}/`, { headers: { "User-Agent": "RexBid-share-renderer" } });
        if (!res.ok) throw new Error(`template HTTP ${res.status}`);
        const html = await res.text();
        if (!html.includes('id="root"')) throw new Error("template missing app root");
        template = { html, at: Date.now() };
    } catch (err) {
        console.error("Share template fetch failed:", err.message);
        if (!template.html) throw err; // nothing cached to fall back to
    }
    return template.html;
};

// Test hook.
export const __resetTemplateCache = () => {
    template = { html: null, at: 0 };
};

const send = (res, status, html) => {
    res.status(status);
    res.set("Content-Type", "text/html; charset=utf-8");
    // Short cache: prices and bid counts change during an auction.
    res.set("Cache-Control", status === 200 ? "public, max-age=60" : "no-store");
    res.send(html);
};

const shareRouter = express.Router();

shareRouter.get("/share/auction/:id", async (req, res) => {
    let html;
    try {
        html = await getTemplate();
    } catch {
        return res.status(503).type("text/plain").send("Temporarily unavailable, please refresh.");
    }

    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return send(res, 404, injectHead(html, notFoundMeta("Auction")));

        const auction = await Auction.findById(id)
            .select("title description location status currentPrice startPrice finalPrice baseCurrency bidCount endDate photos specifications seller reservePrice")
            .lean();
        if (!auction || auction.status === "draft") return send(res, 404, injectHead(html, notFoundMeta("Auction")));

        const publicAuction = sanitizeAuctionForViewer(auction, null);
        return send(res, 200, injectHead(html, buildAuctionMeta(publicAuction)));
    } catch (err) {
        // Never break the page: fall back to the generic template.
        console.error("Share auction error:", err);
        return send(res, 200, html);
    }
});

shareRouter.get("/share/catalogue/:id", async (req, res) => {
    let html;
    try {
        html = await getTemplate();
    } catch {
        return res.status(503).type("text/plain").send("Temporarily unavailable, please refresh.");
    }

    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return send(res, 404, injectHead(html, notFoundMeta("Catalogue")));

        const catalogue = await Catalogue.findById(id).lean();
        if (!catalogue) return send(res, 404, injectHead(html, notFoundMeta("Catalogue")));

        let total = 0;
        if (catalogue.closingDate) {
            const key = new Date(catalogue.closingDate).toISOString().slice(0, 10);
            total = await Auction.countDocuments({
                status: { $in: ["active", "approved", "ended", "sold", "reserve_not_met"] },
                endDate: { $gte: new Date(`${key}T00:00:00.000Z`), $lte: new Date(`${key}T23:59:59.999Z`) },
            });
        }
        return send(res, 200, injectHead(html, buildCatalogueMeta(catalogue, total)));
    } catch (err) {
        console.error("Share catalogue error:", err);
        return send(res, 200, html);
    }
});

export default shareRouter;
