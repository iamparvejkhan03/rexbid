/**
 * VAT on the item price for a sale.
 *
 * RexBid is not VAT registered, so VAT is never charged on the buyer fee.
 * VAT on the item belongs to the seller; RexBid collects it on their behalf
 * when the listing is marked "VAT Applicable".
 *
 * Rates (set by the business):
 *   ROI 23%, NI 20%. GB is treated like NI at 20% but always reviewed.
 *
 * Any sale where buyer and item are in different regions is flagged for admin
 * review, because a cross-border sale between VAT-registered businesses may be
 * zero-rated. VAT stays at the standard rate until an admin zero-rates it.
 */

export const VAT_RATES = { ROI: 23, NI: 20, GB: 20 };

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 * @param {object} p
 * @param {boolean} p.vatApplicable  listing's "VAT Applicable" switch
 * @param {number}  p.itemPrice      hammer price
 * @param {string|null} p.itemRegion
 * @param {string|null} p.buyerRegion
 * @param {string}  [p.buyerVatNumber]
 * @param {object}  [p.override]     admin decision: { treatment: 'zero_rated'|'standard', rate? }
 * @returns {{rate:number, amount:number, treatment:string, reviewRequired:boolean, reviewReasons:string[]}}
 */
export const calculateVat = ({
    vatApplicable,
    itemPrice,
    itemRegion,
    buyerRegion,
    buyerVatNumber,
    override,
}) => {
    const reviewReasons = [];

    if (!vatApplicable) {
        return { rate: 0, amount: 0, treatment: "not_applicable", reviewRequired: false, reviewReasons };
    }

    const standardRate = VAT_RATES[itemRegion];

    if (standardRate === undefined) {
        reviewReasons.push(
            itemRegion
                ? `Item is in a region with no VAT rule (${itemRegion})`
                : "Could not work out where the item is located",
        );
    }
    if (itemRegion === "GB") {
        reviewReasons.push("Item is in Great Britain");
    }
    if (!buyerRegion) {
        reviewReasons.push("Could not work out where the buyer is based");
    } else if (itemRegion && buyerRegion !== itemRegion) {
        reviewReasons.push(
            `Cross-border sale: item in ${itemRegion}, buyer in ${buyerRegion}` +
                (buyerVatNumber ? ` (buyer VAT no. ${buyerVatNumber})` : " (buyer has no VAT number on file)"),
        );
    }

    if (override?.treatment === "zero_rated") {
        return { rate: 0, amount: 0, treatment: "zero_rated", reviewRequired: false, reviewReasons };
    }

    const rate = override?.treatment === "standard" && Number.isFinite(override.rate)
        ? override.rate
        : standardRate ?? 0;

    return {
        rate,
        amount: round2((Number(itemPrice) || 0) * rate / 100),
        treatment: "standard",
        // An admin decision clears the review flag.
        reviewRequired: !override && reviewReasons.length > 0,
        reviewReasons,
    };
};
