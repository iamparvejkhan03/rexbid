import Commission from "../models/commission.model.js";

/**
 * Calculate commission based on global commission settings
 * @param {number} finalPrice - The final sale price
 * @returns {Promise<Object>} Commission details
 */

export const calculateCommission = async (finalPrice) => {
  try {
    // Get global commission settings
    const commission = await Commission.findOne();

    if (!commission) {
      // Default to 5% if no commission set
      return {
        commissionType: "percentage",
        commissionValue: 5,
        commissionAmount: (finalPrice * 5) / 100,
      };
    }

    let commissionAmount = 0;

    if (commission.commissionType === "fixed") {
      commissionAmount = commission.commissionValue;
    } else {
      // Percentage
      commissionAmount = (finalPrice * commission.commissionValue) / 100;
    }

    return {
      commissionType: commission.commissionType,
      commissionValue: commission.commissionValue,
      commissionAmount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimals
    };
  } catch (error) {
    console.error("Error calculating commission:", error);
    // Fallback to 5% if error
    return {
      commissionType: "percentage",
      commissionValue: 5,
      commissionAmount: (finalPrice * 5) / 100,
    };
  }
};
