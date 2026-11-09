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
