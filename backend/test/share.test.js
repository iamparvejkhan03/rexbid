import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import express from "express";
import Auction from "../src/models/auction.model.js";
import Catalogue from "../src/models/catalogue.model.js";
import { injectHead, buildAuctionMeta, notFoundMeta } from "../src/utils/shareHtml.js";
import shareRouter, { getTemplate, __resetTemplateCache } from "../src/routes/share.route.js";

const TEMPLATE = readFileSync(new URL("./fixture-index.html", import.meta.url), "utf8");
const count = (html, re) => (html.match(re) || []).length;

const listing = {
  _id: "6aedfe6ab8c17082c4586aa8",
  title: 'Kubota <script>alert(1)</script> "K008"',
  description: "<p>2180 hrs, new tracks</p>",
  location: "Longford",
  status: "active",
  currentPrice: 4150,
  startPrice: 4000,
  baseCurrency: "EUR",
  bidCount: 3,
  endDate: "2026-11-10T19:58:00Z",
  photos: [{ url: "https://media.rexbid.ie/a.webp", order: 0 }],
  specifications: { brand: "Kubota" },
};

test("injectHead replaces generic tags with exactly one set of listing tags", () => {
  const html = injectHead(TEMPLATE, buildAuctionMeta(listing));
  assert.equal(count(html, /<title>/g), 1);
  assert.equal(count(html, /name="description"/g), 1);
  assert.equal(count(html, /property="og:title"/g), 1);
  assert.equal(count(html, /property="og:image"/g), 1);
  assert.ok(html.includes('content="https://media.rexbid.ie/a.webp"'));
  assert.ok(html.includes('<link rel="canonical" href="https://rexbid.ie/auction/6aedfe6ab8c17082c4586aa8" />'));
  assert.ok(html.includes("Current bid €4,150"));
  assert.ok(html.includes('property="product:price:amount" content="4150.00"'));
  assert.ok(!html.includes("<script>alert(1)</script>"), "title must be escaped");
  assert.ok(html.includes('id="root"'), "app root kept");
  assert.ok(/<script type="module"[^>]*src="\/assets\//.test(html), "app bundle kept");
});

test("not-found meta is noindex with no social tags", () => {
  const html = injectHead(TEMPLATE, notFoundMeta("Auction"));
  assert.ok(html.includes('name="robots" content="noindex, follow"'));
  assert.equal(count(html, /property="og:/g), 0);
});

test("sold listing title shows the sold price", () => {
  const meta = buildAuctionMeta({ ...listing, title: "Claas Liner 2800", status: "sold", finalPrice: 10000 });
  assert.equal(meta.title, "Claas Liner 2800 – Sold for €10,000 | RexBid");
});

test("route serves listing HTML, 404s unknown ids, and keeps the page working on DB errors", async () => {
  __resetTemplateCache();
  const fakeFetch = mock.method(globalThis, "fetch", async () => ({ ok: true, text: async () => TEMPLATE }));
  await getTemplate(); // cached for the rest of the test
  fakeFetch.mock.restore(); // real fetch to call the test server

  const app = express().use(shareRouter);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    mock.method(Auction, "findById", () => ({ select: () => ({ lean: async () => ({ ...listing, title: "Kubota K008-3" }) }) }));
    let r = await fetch(`${base}/share/auction/6aedfe6ab8c17082c4586aa8`);
    let body = await r.text();
    assert.equal(r.status, 200);
    assert.ok(body.includes("<title>Kubota K008-3 for Auction – Longford | RexBid</title>"));

    r = await fetch(`${base}/share/auction/not-an-id`);
    assert.equal(r.status, 404);

    mock.method(Auction, "findById", () => ({ select: () => ({ lean: async () => null }) }));
    r = await fetch(`${base}/share/auction/000000000000000000000000`);
    body = await r.text();
    assert.equal(r.status, 404);
    assert.ok(body.includes("noindex"));

    mock.method(Auction, "findById", () => ({ select: () => ({ lean: async () => { throw new Error("db down"); } }) }));
    r = await fetch(`${base}/share/auction/6aedfe6ab8c17082c4586aa8`);
    assert.equal(r.status, 200, "falls back to the generic page");

    mock.method(Catalogue, "findById", () => ({ lean: async () => ({ _id: "c1c1c1c1c1c1c1c1c1c1c1c1", closingDate: "2026-11-10T00:00:00Z" }) }));
    mock.method(Auction, "countDocuments", async () => 58);
    r = await fetch(`${base}/share/catalogue/c1c1c1c1c1c1c1c1c1c1c1c1`);
    body = await r.text();
    assert.equal(r.status, 200);
    assert.ok(body.includes("58 Lots"));
  } finally {
    server.close();
    mock.restoreAll();
  }
});
