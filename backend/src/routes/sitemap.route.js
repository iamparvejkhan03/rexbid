// GET /sitemap.xml — XML sitemap of every public, indexable URL on rexbid.ie.
//
// The website itself is a static single-page app, so it cannot generate a
// sitemap from the database. The backend builds it instead; robots.txt on
// rexbid.ie points to this URL (cross-host sitemaps referenced from robots.txt
// are accepted by Google and Bing).

import express from "express";
import Auction from "../models/auction.model.js";
import Catalogue from "../models/catalogue.model.js";

const SITE = "https://rexbid.ie";
const CACHE_MS = 60 * 60 * 1000; // 1 hour
const RECENT_UNSOLD_DAYS = 90;
const MIN_SELLER_LISTINGS = 3;

const STATIC_PAGES = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/auctions", changefreq: "hourly", priority: "0.9" },
    { path: "/auctions?status=sold", changefreq: "daily", priority: "0.7" },
    { path: "/auctions?status=approved", changefreq: "daily", priority: "0.6" },
    { path: "/catalogues", changefreq: "daily", priority: "0.7" },
    { path: "/sell", changefreq: "monthly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.6" },
    { path: "/faqs", changefreq: "monthly", priority: "0.6" },
    { path: "/contact", changefreq: "yearly", priority: "0.5" },
    { path: "/delivery-partner-quote", changefreq: "yearly", priority: "0.4" },
    { path: "/reviews", changefreq: "weekly", priority: "0.4" },
    { path: "/terms-conditions", changefreq: "yearly", priority: "0.2" },
    { path: "/privacy-policy", changefreq: "yearly", priority: "0.2" },
    { path: "/buyer-agreement", changefreq: "yearly", priority: "0.2" },
    { path: "/seller-agreement", changefreq: "yearly", priority: "0.2" },
];

const xmlEscape = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const urlEntry = ({ loc, lastmod, changefreq, priority }) =>
    [
        "  <url>",
        `    <loc>${xmlEscape(loc)}</loc>`,
        lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        "  </url>",
    ]
        .filter(Boolean)
        .join("\n");

export const buildSitemapXml = async () => {
    const recentCutoff = new Date(Date.now() - RECENT_UNSOLD_DAYS * 24 * 60 * 60 * 1000);

    const [auctions, catalogues, sellers] = await Promise.all([
        Auction.find({
            $or: [
                { status: { $in: ["active", "approved", "sold", "sold_buy_now"] } },
                { status: { $in: ["ended", "reserve_not_met"] }, endDate: { $gte: recentCutoff } },
            ],
        })
            .select("_id status updatedAt")
            .lean(),
        Catalogue.find({}).select("_id updatedAt").lean(),
        Auction.aggregate([
            { $match: { status: { $in: ["active", "approved", "sold", "sold_buy_now", "ended", "reserve_not_met"] } } },
            { $group: { _id: "$seller", count: { $sum: 1 }, lastmod: { $max: "$updatedAt" } } },
            { $match: { count: { $gte: MIN_SELLER_LISTINGS } } },
        ]),
    ]);

    const entries = [
        ...STATIC_PAGES.map((p) => urlEntry({ loc: `${SITE}${p.path}`, changefreq: p.changefreq, priority: p.priority })),
        ...auctions.map((a) =>
            urlEntry({
                loc: `${SITE}/auction/${a._id}`,
                lastmod: a.updatedAt,
                changefreq: a.status === "active" ? "hourly" : "weekly",
                priority: a.status === "active" ? "0.8" : "0.5",
            })
        ),
        ...catalogues.map((c) => urlEntry({ loc: `${SITE}/catalogue/${c._id}`, lastmod: c.updatedAt, changefreq: "daily", priority: "0.6" })),
        ...sellers
            .filter((s) => s._id)
            .map((s) => urlEntry({ loc: `${SITE}/seller-reviews/${s._id}`, lastmod: s.lastmod, changefreq: "weekly", priority: "0.4" })),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
};

let cache = { xml: null, at: 0 };

const sitemapRouter = express.Router();

sitemapRouter.get("/sitemap.xml", async (req, res) => {
    try {
        if (!cache.xml || Date.now() - cache.at > CACHE_MS) {
            cache = { xml: await buildSitemapXml(), at: Date.now() };
        }
        res.set("Content-Type", "application/xml; charset=utf-8");
        res.set("Cache-Control", "public, max-age=3600");
        res.send(cache.xml);
    } catch (error) {
        console.error("Sitemap error:", error);
        res.status(500).type("text/plain").send("Sitemap temporarily unavailable");
    }
});

export default sitemapRouter;
