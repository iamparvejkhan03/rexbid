import Commission from "../models/commission.model.js";
import { getCachedRates } from "../routes/currency.route.js";

// ─── Settings cache ─────────────────────────────────────────
let cachedCommission = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// utils/commissionCalculator.js
export async function getCommissionSettings() {
  if (cachedCommission && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedCommission;
  }

  let doc = await Commission.findOne();

  if (doc) {
    let needsSave = false;
    if (!doc.sellerTiers || doc.sellerTiers.length === 0) {
      doc.sellerTiers = [{ from: 0, to: null, value: doc.commissionValue || 5 }];
      needsSave = true;
    }
    if (!doc.bidderTiers || doc.bidderTiers.length === 0) {
      doc.bidderTiers = [{ from: 0, to: null, value: doc.commissionValue || 5 }];
      needsSave = true;
    }
    if (needsSave) await doc.save();
  }

  cachedCommission = doc;
  cacheTimestamp = Date.now();
  return doc;
}

export const clearCommissionCache = () => {
  cachedCommission = null;
  cacheTimestamp = null;
};

// ─── FX helper ─────────────────────────────────────────────
const convertCurrency = (amount, from, to) => {
  if (!amount || from === to) return amount;
  const rates = getCachedRates();
  if (!rates) return amount;
  const rate = rates[from]?.rates?.[to];
  if (!rate) return amount;
  return amount * rate;
};

// ─── Core progressive-tier calculation ─────────────────────
// Slices the amount through each tier. Tier `value` is a percentage (0–100).
// Returns { total, breakdown }.
export function computeTieredCommission(amount, tiers) {
  const numericAmount = Number(amount) || 0;
  if (!numericAmount || !Array.isArray(tiers) || tiers.length === 0) {
    return { total: 0, breakdown: [] };
  }

  const breakdown = [];
  let total = 0;

  for (const tier of tiers) {
    const from = Number(tier.from) || 0;
    const to =
      tier.to === null || tier.to === undefined
        ? Infinity
        : Number(tier.to);
    const value = Number(tier.value) || 0;

    if (numericAmount <= from) break;

    const slice = Math.min(numericAmount, to) - from;
    if (slice <= 0) continue;

    const portion = (slice * value) / 100;
    total += portion;

    breakdown.push({
      from,
      to: tier.to ?? null,
      value,
      slice: Math.round(slice * 100) / 100,
      portion: Math.round(portion * 100) / 100,
    });
  }

  return {
    total: Math.round(total * 100) / 100,
    breakdown,
  };
}

// ─── Main entry point used everywhere a sale is finalised ──
// Signature unchanged: (finalPrice, isFeatured, baseCurrency)
// Returns a superset of the old shape — all existing callers keep working.
export const calculateCommission = async (
  finalPrice,
  isFeatured = false,
  baseCurrency = "EUR"
) => {
  try {
    const settings = await getCommissionSettings();

    // Legacy fields still returned for compat
    const commissionType = settings?.sellerTiers?.length
      ? "tiered"
      : settings?.commissionType || null;
    const commissionValue = 0; // deprecated — no single value any more

    const featuredPremium = isFeatured ? finalPrice * 0.03 : 0;

    // Party toggles
    const sellerApplies =
      settings?.isEnabled &&
      settings?.appliesTo?.includes("seller") &&
      settings?.sellerTiers?.length > 0;
    const bidderApplies =
      settings?.isEnabled &&
      settings?.appliesTo?.includes("bidder") &&
      settings?.bidderTiers?.length > 0;

    // Progressive tier sums (base, before cap, before featured)
    const sellerBaseRaw = sellerApplies
      ? computeTieredCommission(finalPrice, settings.sellerTiers).total
      : 0;
    const bidderBaseRaw = bidderApplies
      ? computeTieredCommission(finalPrice, settings.bidderTiers).total
      : 0;

    // Cap (applied per-party, independently)
    const capAmount = settings?.maxCommissionAmount;
    const capCurrency = settings?.maxCommissionCurrency || "EUR";
    const capInBase =
      capAmount && capAmount > 0
        ? convertCurrency(capAmount, capCurrency, baseCurrency)
        : 0;

    let sellerBase = sellerBaseRaw;
    let bidderBase = bidderBaseRaw;
    let sellerCapped = false;
    let bidderCapped = false;

    if (capInBase > 0) {
      if (sellerBase > capInBase) {
        sellerBase = capInBase;
        sellerCapped = true;
      }
      if (bidderBase > capInBase) {
        bidderBase = capInBase;
        bidderCapped = true;
      }
    }

    // Featured premium is added on top of each party's capped base
    // (unchanged semantics — if both apply, both pay featured premium).
    const sellerCommissionAmount =
      Math.round((sellerBase + featuredPremium) * 100) / 100;
    const bidderCommissionAmount =
      Math.round((bidderBase + featuredPremium) * 100) / 100;

    // Legacy single total (used for display/back-compat)
    const commissionAmount =
      Math.round((sellerCommissionAmount + bidderCommissionAmount) * 100) / 100;

    return {
      // New — per-party
      sellerCommissionAmount,
      bidderCommissionAmount,
      sellerBaseCommission: Math.round(sellerBase * 100) / 100,
      bidderBaseCommission: Math.round(bidderBase * 100) / 100,
      sellerCapped,
      bidderCapped,
      sellerUncapped: Math.round(sellerBaseRaw * 100) / 100,
      bidderUncapped: Math.round(bidderBaseRaw * 100) / 100,

      // Featured
      featuredPremium: Math.round(featuredPremium * 100) / 100,

      // Legacy / display
      commissionAmount,
      commissionType,
      commissionValue,
    };
  } catch (error) {
    console.error("Error calculating commission:", error);
    return {
      sellerCommissionAmount: 0,
      bidderCommissionAmount: 0,
      sellerBaseCommission: 0,
      bidderBaseCommission: 0,
      sellerCapped: false,
      bidderCapped: false,
      sellerUncapped: 0,
      bidderUncapped: 0,
      featuredPremium: 0,
      commissionAmount: 0,
      commissionType: null,
      commissionValue: 0,
    };
  }
};