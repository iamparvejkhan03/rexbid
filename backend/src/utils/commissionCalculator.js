import Commission from "../models/commission.model.js";

// Cache for commission settings
let cachedCommission = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get commission settings with caching
 */
async function getCommissionSettings() {
  if (cachedCommission && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return cachedCommission;
  }

  cachedCommission = await Commission.findOne();
  cacheTimestamp = Date.now();
  return cachedCommission;
}

/**
 * Calculate commission for seller based on global commission settings
 * @param {number} finalPrice - The final sale price
 * @returns {Promise<Object>} Commission details
 */
export const calculateCommission = async (finalPrice) => {
  try {
    // Get commission settings (from cache or DB)
    const settings = await getCommissionSettings();

    // No commission settings exist OR commission is disabled OR doesn't apply to seller
    if (!settings || !settings.isEnabled || !settings.appliesTo?.includes('seller')) {
      return {
        commissionAmount: 0,
        commissionType: settings?.commissionType || null,
        commissionValue: settings?.commissionValue || 0,
      };
    }

    // Commission value is zero
    if (settings.commissionValue === 0) {
      return {
        commissionAmount: 0,
        commissionType: settings.commissionType,
        commissionValue: settings.commissionValue,
      };
    }

    // Calculate commission
    let commissionAmount = 0;
    if (settings.commissionType === "fixed") {
      commissionAmount = settings.commissionValue;
    } else {
      // Percentage
      commissionAmount = (finalPrice * settings.commissionValue) / 100;
    }

    return {
      commissionType: settings.commissionType,
      commissionValue: settings.commissionValue,
      commissionAmount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimals
    };
  } catch (error) {
    console.error("Error calculating commission:", error);
    // Fallback - no commission on error
    return {
      commissionType: null,
      commissionValue: 0,
      commissionAmount: 0,
    };
  }
};

/**
 * Clear commission cache (call when commission settings are updated)
 */
export const clearCommissionCache = () => {
  cachedCommission = null;
  cacheTimestamp = null;
};