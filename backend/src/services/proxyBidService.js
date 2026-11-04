import Auction from "../models/auction.model.js";
import { placeBidDirect } from "../controllers/auction.controller.js";

/**
 * Cascade all active proxy bids for an auction.
 * ALL amounts here are in auction.baseCurrency — no currency conversion.
 */
export const processProxyBids = async (auctionId) => {
    const visited = new Set();
    await runProxyBidPass(auctionId, visited);
};

const runProxyBidPass = async (auctionId, visited) => {
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "active") return;

    const activeProxies = auction.proxyBids
        .filter((pb) => pb.isActive)
        .sort((a, b) => b.maxAmount - a.maxAmount);

    if (activeProxies.length === 0) return;

    let highestBidder = auction.currentBidder?.toString() || null;
    let highestBid = auction.currentPrice;   // BASE
    let placedAny = false;

    for (const proxy of activeProxies) {
        const bidderId = proxy.bidder.toString();
        if (highestBidder === bidderId) continue;

        const nextBid = highestBid + auction.bidIncrement;   // BASE
        if (proxy.maxAmount < nextBid) continue;

        await placeBidDirect(
            auctionId,
            proxy.bidder,
            proxy.bidderUsername,
            nextBid,
            proxy._id
        );

        highestBidder = bidderId;
        highestBid = nextBid;
        placedAny = true;
    }

    // Cascade: any new highest bidder may still be out-bid by another proxy
    if (placedAny) await runProxyBidPass(auctionId, visited);
};