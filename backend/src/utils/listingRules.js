// Minimum prices for auction listings (set by RexBid, Nov 2026).
//   Reserve auctions:     reserve price must be at least €500
//   No-reserve auctions:  starting bid must be at least €400
// Sterling listings use the equivalent amount at the current exchange rate,
// rounded up to the nearest £10 so the rule is easy to state.

import { getCachedRates } from "../routes/currency.route.js";

export const MIN_RESERVE_EUR = 500;
export const MIN_NO_RESERVE_START_EUR = 400;

const SYMBOL = { EUR: "€", GBP: "£" };

/** Minimum amount in the listing's currency. `rates` is injectable for tests. */
export const minimumIn = (amountEur, currency = "EUR", rates = getCachedRates()) => {
    if (!currency || currency === "EUR") return amountEur;
    const rate = rates?.EUR?.rates?.[currency];
    if (!rate || typeof rate !== "number") return amountEur; // fail safe: same number
    return Math.ceil((amountEur * rate) / 10) * 10;
};

/**
 * Returns an error message if the listing's prices are below the minimums,
 * otherwise null. Only applies to timed auctions (standard / reserve).
 */
export const minimumPriceError = ({ auctionType, startPrice, reservePrice, currency = "EUR" }, rates) => {
    const sym = SYMBOL[currency] || "";
    if (auctionType === "reserve") {
        const min = minimumIn(MIN_RESERVE_EUR, currency, rates);
        if (!(parseFloat(reservePrice) >= min)) {
            return `The minimum reserve price is ${sym}${min.toLocaleString("en-IE")}.`;
        }
    }
    if (auctionType === "standard") {
        const min = minimumIn(MIN_NO_RESERVE_START_EUR, currency, rates);
        if (!(parseFloat(startPrice) >= min)) {
            return `The minimum starting bid for a no-reserve auction is ${sym}${min.toLocaleString("en-IE")}.`;
        }
    }
    return null;
};
