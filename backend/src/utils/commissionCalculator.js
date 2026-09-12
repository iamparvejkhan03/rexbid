import Commission from "../models/commission.model.js";
import { getCachedRates } from "../routes/currency.route.js";

// Cache for commission settings
let cachedCommission = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCommissionSettings() {
  if (cachedCommission && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return cachedCommission;
  }
  cachedCommission = await Commission.findOne();
  cacheTimestamp = Date.now();
  return cachedCommission;
}

/**
 * Convert `amount` from one currency to another using the cached FX rates.
 * Falls back to the original amount if rates are unavailable.
 */
const convertCurrency = (amount, from, to) => {
  if (!amount || from === to) return amount;
  const rates = getCachedRates();
  if (!rates) return amount;
  const rate = rates[from]?.rates?.[to];
  if (!rate) return amount;
  return amount * rate;
};

/**
 * Calculate commission for seller based on global commission settings + featured premium
 * @param {number} finalPrice - The final sale price
 * @param {boolean} isFeatured - Whether the auction is marked as featured (adds 3% premium)
 * @returns {Promise<Object>} Commission details including featured premium
 */
export const calculateCommission = async (
  finalPrice,
  isFeatured = false,
  baseCurrency = "EUR",
) => {
  try {
    const settings = await getCommissionSettings();

    // 1. Base commission (in baseCurrency)
    let baseCommission = 0;
    if (settings && settings.isEnabled && settings.commissionValue !== 0) {
      baseCommission =
        settings.commissionType === "fixed"
          ? settings.commissionValue
          : (finalPrice * settings.commissionValue) / 100;
    }

    // 2. Featured premium (3% of final price, in baseCurrency) — untouched by the cap
    const featuredPremium = isFeatured ? finalPrice * 0.03 : 0;

    // 3. Cap the base commission only
    const capAmount = settings?.maxCommissionAmount ?? 500;
    const capCurrency = settings?.maxCommissionCurrency ?? "EUR";
    const capInBaseCurrency =
      capAmount > 0 ? convertCurrency(capAmount, capCurrency, baseCurrency) : 0;

    const uncappedBaseCommission = baseCommission;
    let capped = false;

    if (capInBaseCurrency > 0 && baseCommission > capInBaseCurrency) {
      capped = true;
      baseCommission = capInBaseCurrency;
    }

    // 4. Total = capped base + full featured
    const commissionAmount = baseCommission + featuredPremium;

    return {
      commissionType: settings?.commissionType || null,
      commissionValue: settings?.commissionValue || 0,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      featuredPremium: Math.round(featuredPremium * 100) / 100,
      // NEW informative fields
      capped,
      uncappedAmount: Math.round(
        (uncappedBaseCommission + featuredPremium) * 100,
      ) / 100,
      uncappedBaseCommission:
        Math.round(uncappedBaseCommission * 100) / 100,
      cappedBaseCommission: Math.round(baseCommission * 100) / 100,
    };
  } catch (error) {
    console.error("Error calculating commission:", error);
    return {
      commissionType: null,
      commissionValue: 0,
      commissionAmount: 0,
      featuredPremium: 0,
      capped: false,
      uncappedAmount: 0,
      uncappedBaseCommission: 0,
      cappedBaseCommission: 0,
    };
  }
};

export const clearCommissionCache = () => {
  cachedCommission = null;
  cacheTimestamp = null;
};