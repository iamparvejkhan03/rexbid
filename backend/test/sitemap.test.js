import { test, mock } from "node:test";
import assert from "node:assert/strict";
import Auction from "../src/models/auction.model.js";
import Catalogue from "../src/models/catalogue.model.js";
import { buildSitemapXml } from "../src/routes/sitemap.route.js";

const chain = (rows) => ({ select: () => ({ lean: async () => rows }) });

test("sitemap lists static pages, listings, catalogues and established sellers", async () => {
  const fNow = new Date("2026-11-09T10:00:00Z");
  mock.method(Auction, "find", () => chain([
    { _id: "a1", status: "active", updatedAt: fNow },
    { _id: "a2", status: "sold", updatedAt: fNow },
  ]));
  mock.method(Catalogue, "find", () => chain([{ _id: "c1", updatedAt: fNow }]));
  mock.method(Auction, "aggregate", async () => [{ _id: "s1", count: 5, lastmod: fNow }]);

  const xml = await buildSitemapXml();
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  for (const loc of ["https://rexbid.ie/", "https://rexbid.ie/auctions", "https://rexbid.ie/auction/a1", "https://rexbid.ie/auction/a2", "https://rexbid.ie/catalogue/c1", "https://rexbid.ie/seller-reviews/s1"]) {
    assert.ok(xml.includes(`<loc>${loc}</loc>`), loc);
  }
  assert.ok(xml.includes("<loc>https://rexbid.ie/auctions?status=sold</loc>"), "query string present");
  assert.ok(!xml.includes("/admin"), "no private routes");
  assert.equal((xml.match(/<url>/g) || []).length, 16 + 2 + 1 + 1); // 16 static pages incl. /buy-it-now
  mock.restoreAll();
});
