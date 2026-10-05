export function convertAuctionPrices(auction, userCurrency) {
    if (!auction) return auction;

    const base = auction.baseCurrency;
    const rates = auction.rates || null;
    const rate = (rates && rates[base]?.rates?.[userCurrency]) || 1;

    const convert = (v) =>
        v !== null && v !== undefined ? parseFloat((v * rate).toFixed(0)) : null;

    const convertedBids = (auction.bids || []).map((bid) => ({
        ...bid,
        convertedAmount: convert(bid.amount),
        originalAmount: bid.amount,
    }));

    const convertedOffers = (auction.offers || []).map((offer) => ({
        ...offer,
        convertedAmount: convert(offer.amount),
        originalAmount: offer.amount,
        convertedCounterAmount: offer.counterOffer?.amount
            ? convert(offer.counterOffer.amount)
            : null,
    }));

    return {
        ...auction,
        bids: convertedBids,
        offers: convertedOffers,
        convertedStartPrice: convert(auction.startPrice),
        convertedCurrentPrice: convert(auction.currentPrice),
        convertedBidIncrement: convert(auction.bidIncrement),
        convertedBuyNowPrice: convert(auction.buyNowPrice),
        convertedReservePrice: convert(auction.reservePrice),
        convertedFinalPrice: convert(auction.finalPrice),
        displayCurrency: userCurrency,
    };
}