// Single source of truth for fee and minimum-price wording on the website.
// Keep in sync with the commission settings in the admin panel and
// backend/src/utils/listingRules.js.

export const BUYER_FEE = {
    firstBandRate: 6,      // % on the first €2,000
    firstBandLimit: 2000,  // €
    secondBandRate: 3,     // % on the amount above €2,000
    cap: 500,              // € maximum buyer fee per item
};

export const SELLER_FEES_FREE_UNTIL = "1 January 2027";
export const FEATURED_FEE_EUR = 30;
export const MIN_RESERVE_EUR = 500;
export const MIN_NO_RESERVE_START_EUR = 400;

export const buyerFeeShort = "6% up to €2,000, then 3%, max €500";
export const buyerFeeSentence =
    "a buyer fee of 6% on the first €2,000 of the winning price and 3% on any amount above €2,000, up to a maximum of €500 per item";

/** Buyer fee in the listing's currency units, using the same bands (cap converted by the server for £ listings). */
export const calcBuyerFee = (price) => {
    const p = Number(price) || 0;
    const fee =
        (Math.min(p, BUYER_FEE.firstBandLimit) * BUYER_FEE.firstBandRate) / 100 +
        (Math.max(0, p - BUYER_FEE.firstBandLimit) * BUYER_FEE.secondBandRate) / 100;
    return Math.min(BUYER_FEE.cap, Math.round(fee * 100) / 100);
};
