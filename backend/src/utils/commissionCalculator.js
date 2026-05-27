import Commission from "../models/commission.model.js";

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
 * Calculate commission for seller based on global commission settings + featured premium
 * @param {number} finalPrice - The final sale price
 * @param {boolean} isFeatured - Whether the auction is marked as featured (adds 3% premium)
 * @returns {Promise<Object>} Commission details including featured premium
 */
export const calculateCommission = async (finalPrice, isFeatured = false) => {
  try {
    const settings = await getCommissionSettings();

    // Base commission (could be 0 if disabled or not applicable)
    let baseCommission = 0;
    if (settings && settings.isEnabled && settings.appliesTo?.includes('seller')) {
      if (settings.commissionValue !== 0) {
        if (settings.commissionType === "fixed") {
          baseCommission = settings.commissionValue;
        } else {
          // Percentage
          baseCommission = (finalPrice * settings.commissionValue) / 100;
        }
      }
    }

    // Featured premium: 3% of final price if auction is featured
    let featuredPremium = 0;
    if (isFeatured) {
      featuredPremium = finalPrice * 0.03; // 3% premium
    }

    const totalCommission = baseCommission + featuredPremium;

    return {
      commissionType: settings?.commissionType || null,
      commissionValue: settings?.commissionValue || 0,
      commissionAmount: Math.round(totalCommission * 100) / 100,
      featuredPremium: Math.round(featuredPremium * 100) / 100,
    };
  } catch (error) {
    console.error("Error calculating commission:", error);
    return {
      commissionType: null,
      commissionValue: 0,
      commissionAmount: 0,
      featuredPremium: 0,
    };
  }
};

export const clearCommissionCache = () => {
  cachedCommission = null;
  cacheTimestamp = null;
};