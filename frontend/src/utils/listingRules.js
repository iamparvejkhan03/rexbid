// RexBid listing minimums (mirrors backend/src/utils/listingRules.js).
// Sterling listings are checked by the server at the current exchange rate.
export const MIN_RESERVE_EUR = 500;
export const MIN_NO_RESERVE_START_EUR = 400;

/** react-hook-form validator for the start price. */
export const validateMinStart = (value, auctionType, currency) => {
    if (auctionType !== "standard" || currency === "GBP") return true;
    return parseFloat(value) >= MIN_NO_RESERVE_START_EUR || `The minimum starting bid for a no-reserve auction is €${MIN_NO_RESERVE_START_EUR}`;
};

/** react-hook-form validator for the reserve price. */
export const validateMinReserve = (value, currency) => {
    if (currency === "GBP") return true;
    return parseFloat(value) >= MIN_RESERVE_EUR || `The minimum reserve price is €${MIN_RESERVE_EUR}`;
};

export const minimumsHint = (currency) =>
    currency === "GBP"
        ? "Minimums: €500 reserve, or €400 starting bid for no-reserve auctions (sterling equivalent)."
        : "Minimums: €500 reserve, or €400 starting bid for no-reserve auctions.";

/**
 * Suggested bid increment for a listing, based on the price it's expected
 * to reach (reserve if set, otherwise the starting bid). The seller decides;
 * this is only a suggestion.
 *   under 5,000: 100 · 5,000 to 20,000: 250 · above 20,000: 500
 */
export const suggestedIncrement = (expectedPrice) => {
    const p = Number(expectedPrice) || 0;
    if (p <= 0) return null;
    if (p < 5000) return 100;
    if (p <= 20000) return 250;
    return 500;
};
