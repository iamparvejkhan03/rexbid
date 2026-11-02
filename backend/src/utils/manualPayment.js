import { getCachedRates } from "../routes/currency.route.js";

/**
 * Sales at or above this amount (converted to EUR) require
 * manual admin-handled payment instead of self-service checkout.
 */
export const MANUAL_PAYMENT_THRESHOLD_EUR = 1000;

/**
 * Returns the auction's final price converted to EUR.
 * - 0 when no price exists
 * - number (EUR) when conversion succeeds
 * - null when conversion fails (caller must treat as fail-safe)
 */
export const getFinalPriceInEUR = (listing) => {
    const finalPrice = listing?.finalPrice ?? listing?.currentPrice ?? 0;
    if (!finalPrice) return 0;

    const baseCurrency = listing?.baseCurrency || "EUR";
    if (baseCurrency === "EUR") return Number(finalPrice);

    try {
        const rates = getCachedRates();
        const rate = rates?.[baseCurrency]?.rates?.EUR;
        if (!rate || typeof rate !== "number") return null;
        return parseFloat((Number(finalPrice) * rate).toFixed(2));
    } catch {
        return null;
    }
};

/**
 * Fail-safe: if the EUR conversion fails, we treat the sale as
 * requiring manual payment — admin will always be in the loop.
 */
export const isManualPaymentRequired = (listing) => {
    const finalPriceEUR = getFinalPriceInEUR(listing);
    if (finalPriceEUR === null) return true;
    return finalPriceEUR >= MANUAL_PAYMENT_THRESHOLD_EUR;
};

/**
 * Convenience payload for API responses.
 */
export const getManualPaymentFlags = (listing) => {
    const finalPriceEUR = getFinalPriceInEUR(listing);
    return {
        finalPriceInEUR: finalPriceEUR,
        isManualPaymentRequired: isManualPaymentRequired(listing),
        manualPaymentThresholdEUR: MANUAL_PAYMENT_THRESHOLD_EUR,
    };
};