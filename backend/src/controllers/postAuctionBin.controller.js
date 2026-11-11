// Buy It Now after the auction – API (mounted at /api/v1/buy-it-now).
// Rules: utils/postAuctionBin.js. Starting/buying/ending: services/postAuctionBinService.js.

import mongoose from "mongoose";
import Auction from "../models/auction.model.js";
import { getCachedRates } from "../routes/currency.route.js";
import { publicName } from "../utils/displayName.js";
import { BIN_HOURS, START_WINDOW_HOURS, binIsLive, binPriceError, binStartState, maxBinPrice, topBidOf } from "../utils/postAuctionBin.js";
import { buyBin, startBin } from "../services/postAuctionBinService.js";
import { broadcastAuctionChange } from "../services/realtimeService.js";

const STAFF = new Set(["admin", "staff"]);
const idStr = (v) => (v && typeof v === "object" ? v._id ?? v : v)?.toString?.();
const round2 = (n) => Math.round(n * 100) / 100;

// rates[FROM].rates[TO]
const rateBetween = (from, to) => {
  if (!from || !to || from === to) return 1;
  return getCachedRates()?.[from]?.rates?.[to] || null;
};
const toDisplay = (amount, base, currency) => {
  const r = rateBetween(base, currency);
  return r ? round2(amount * r) : amount;
};
const toBase = (amount, currency, base) => {
  const r = rateBetween(currency || base, base);
  if (!r) throw Object.assign(new Error("Currency conversion isn't available right now. Please try again shortly."), { status: 503 });
  return round2(Number(amount) * r);
};
const displayCurrencyFor = (req, auction) =>
  ["EUR", "GBP"].includes(req.query.currency || req.body?.currency) ? (req.query.currency || req.body?.currency) : auction.baseCurrency || "EUR";

const fail = (res, error, fallback) =>
  res.status(error.status || 500).json({ success: false, message: error.status ? error.message : fallback });

const loadLot = async (id) => (mongoose.isValidObjectId(id) ? Auction.findById(id) : null);
const canManage = (user, auction) => !!user && (idStr(auction.seller) === idStr(user._id) || STAFF.has(user.userType));

// GET /api/v1/buy-it-now?currency=EUR   – everything live on Buy It Now
export const listLive = async (req, res) => {
  try {
    const now = new Date();
    const lots = await Auction.find({
      status: "reserve_not_met",
      winner: null,
      "postAuctionBin.status": "live",
      "postAuctionBin.endsAt": { $gt: now },
    })
      .select("title subTitle photos location categories baseCurrency currentPrice bidCount postAuctionBin seller vatIncluded")
      .populate("seller", "firstName companyName username")
      .sort({ "postAuctionBin.endsAt": 1 })
      .limit(200)
      .lean();

    const currency = ["EUR", "GBP"].includes(req.query.currency) ? req.query.currency : null;
    const data = lots.map((a) => {
      const display = currency || a.baseCurrency || "EUR";
      const photo = (a.photos || []).slice().sort((x, y) => (x.order || 0) - (y.order || 0))[0];
      return {
        _id: a._id,
        title: a.title,
        subTitle: a.subTitle,
        location: a.location,
        categories: a.categories,
        photo: photo ? { url: photo.url, thumbUrl: photo.thumbUrl } : null,
        sellerName: publicName(a.seller),
        vatIncluded: a.vatIncluded,
        baseCurrency: a.baseCurrency,
        displayCurrency: display,
        price: toDisplay(a.postAuctionBin.price, a.baseCurrency, display),
        topBid: a.bidCount > 0 ? toDisplay(a.currentPrice, a.baseCurrency, display) : null,
        bidCount: a.bidCount || 0,
        endsAt: a.postAuctionBin.endsAt,
        startedAt: a.postAuctionBin.startedAt,
      };
    });
    res.json({ success: true, data: { lots: data, hours: BIN_HOURS } });
  } catch (error) {
    console.error("List Buy It Now error:", error);
    res.status(500).json({ success: false, message: "Could not load Buy It Now" });
  }
};

// GET /api/v1/buy-it-now/lot/:id?currency=EUR   – listing panel and seller setup
export const lotStatus = async (req, res) => {
  try {
    const auction = await loadLot(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });
    const display = displayCurrencyFor(req, auction);
    const bin = auction.postAuctionBin || {};
    const live = binIsLive(auction);

    const out = {
      live,
      status: bin.status || null,
      displayCurrency: display,
      price: live || bin.status === "sold" ? toDisplay(bin.price, auction.baseCurrency, display) : null,
      priceInBase: live ? bin.price : null,
      endsAt: live ? bin.endsAt : null,
      hours: BIN_HOURS,
    };

    if (canManage(req.user, auction)) {
      const state = binStartState(auction);
      const max = maxBinPrice(auction.reservePrice);
      const top = topBidOf(auction);
      out.manage = {
        canSetup: state.allowed,
        mode: state.mode, // "schedule" (before the end) or "start" (after the end)
        reason: state.reason || null,
        maxPrice: max ? toDisplay(max, auction.baseCurrency, display) : null,
        topBid: top ? toDisplay(top, auction.baseCurrency, display) : null,
        scheduledPrice: bin.status === "scheduled" ? toDisplay(bin.price, auction.baseCurrency, display) : null,
        livePrice: live ? toDisplay(bin.price, auction.baseCurrency, display) : null,
        note: bin.note || null,
        startWindowHours: START_WINDOW_HOURS,
        // Top bid already within 10% of the reserve: Buy It Now can't work.
        blockedByTopBid: auction.status === "reserve_not_met" && top > 0 && max <= top,
      };
    }
    res.json({ success: true, data: out });
  } catch (error) {
    console.error("Buy It Now status error:", error);
    res.status(500).json({ success: false, message: "Could not load Buy It Now" });
  }
};

// POST /api/v1/buy-it-now/lot/:id/setup   { price, currency }
// Before the end: saves the price (starts automatically if the reserve isn't met).
// After the end (reserve not met): starts the 48 hours now.
export const setup = async (req, res) => {
  try {
    const auction = await loadLot(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });
    if (!canManage(req.user, auction)) return res.status(403).json({ success: false, message: "Only the seller can set up Buy It Now." });

    const state = binStartState(auction);
    if (!state.allowed) return res.status(400).json({ success: false, message: state.reason });

    const price = toBase(req.body?.price, displayCurrencyFor(req, auction), auction.baseCurrency);

    if (state.mode === "schedule") {
      const error = binPriceError(auction, price, { atEnd: false });
      if (error) return res.status(400).json({ success: false, message: error });
      auction.postAuctionBin = { price, status: "scheduled", note: undefined };
      await auction.save();
      return res.json({ success: true, message: "Saved. If the reserve isn't met, the lot goes on Buy It Now for 48 hours at this price.", data: { status: "scheduled" } });
    }

    await startBin(auction, price, { startedBy: STAFF.has(req.user.userType) ? "admin" : "seller" });
    res.json({ success: true, message: "Your lot is now on Buy It Now for 48 hours.", data: { status: "live", endsAt: auction.postAuctionBin.endsAt } });
  } catch (error) {
    console.error("Buy It Now setup error:", error);
    fail(res, error, "Could not set up Buy It Now");
  }
};

// PATCH /api/v1/buy-it-now/lot/:id/price   { price, currency }  – lower a live price
export const lowerPrice = async (req, res) => {
  try {
    const auction = await loadLot(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });
    if (!canManage(req.user, auction)) return res.status(403).json({ success: false, message: "Only the seller can change the price." });
    if (!binIsLive(auction)) return res.status(400).json({ success: false, message: "This lot isn't on Buy It Now." });

    const price = toBase(req.body?.price, displayCurrencyFor(req, auction), auction.baseCurrency);
    if (!(price < auction.postAuctionBin.price)) {
      return res.status(400).json({ success: false, message: "The price can only be lowered while the lot is on Buy It Now." });
    }
    const error = binPriceError(auction, price, { atEnd: true });
    if (error) return res.status(400).json({ success: false, message: error });

    const updated = await Auction.findOneAndUpdate(
      { _id: auction._id, "postAuctionBin.status": "live" },
      { $set: { "postAuctionBin.price": price } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ success: false, message: "This lot has just been sold." });
    broadcastAuctionChange(auction._id);
    res.json({ success: true, message: "Price lowered." });
  } catch (error) {
    console.error("Buy It Now lower price error:", error);
    fail(res, error, "Could not change the price");
  }
};

// DELETE /api/v1/buy-it-now/lot/:id/setup
// Seller: remove a price set in advance. Staff: also take a live lot off Buy It Now.
export const cancel = async (req, res) => {
  try {
    const auction = await loadLot(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });
    if (!canManage(req.user, auction)) return res.status(403).json({ success: false, message: "Not allowed." });
    const status = auction.postAuctionBin?.status;

    if (status === "scheduled") {
      auction.postAuctionBin = { status: null };
      await auction.save();
      return res.json({ success: true, message: "Buy It Now price removed." });
    }
    if (status === "live" && STAFF.has(req.user.userType)) {
      const updated = await Auction.findOneAndUpdate(
        { _id: auction._id, "postAuctionBin.status": "live" },
        { $set: { "postAuctionBin.status": "cancelled", "postAuctionBin.endedAt": new Date(), "postAuctionBin.note": `Taken off by RexBid${req.body?.reason ? `: ${req.body.reason}` : ""}` } },
        { new: true }
      );
      if (!updated) return res.status(409).json({ success: false, message: "This lot has just been sold." });
      broadcastAuctionChange(auction._id);
      return res.json({ success: true, message: "Taken off Buy It Now." });
    }
    if (status === "live") {
      return res.status(400).json({ success: false, message: "Once a lot is on Buy It Now it stays for the full 48 hours. Contact RexBid if something has changed." });
    }
    res.status(400).json({ success: false, message: "There's nothing to cancel." });
  } catch (error) {
    console.error("Buy It Now cancel error:", error);
    fail(res, error, "Could not cancel");
  }
};

// POST /api/v1/buy-it-now/lot/:id/buy   { expectedPrice, currency }
export const buy = async (req, res) => {
  try {
    const buyer = req.user;
    if (!buyer?.isActive) return res.status(400).json({ success: false, message: "Your account is inactive." });
    if (!buyer?.isVerified) {
      return res.status(400).json({ success: false, message: "Please wait until your account has been verified before buying." });
    }
    if (req.body?.agreed !== true) {
      return res.status(400).json({ success: false, message: "Please confirm you agree to buy at this price." });
    }
    const auction = await loadLot(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });

    const expected = req.body?.expectedPriceInBase != null ? Number(req.body.expectedPriceInBase) : null;
    await buyBin(auction._id, buyer, expected);
    res.json({ success: true, message: "Congratulations, it's yours! We've emailed you the next steps for payment and collection." });
  } catch (error) {
    console.error("Buy It Now purchase error:", error);
    fail(res, error, "Could not complete the purchase");
  }
};
