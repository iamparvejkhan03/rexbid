import axios from "axios";
import Auction from "../models/auction.model.js";

const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const API_SECRET = process.env.GA4_API_SECRET;

const ENDPOINT = "https://www.google-analytics.com/mp/collect";

/**
 * Send one or more events to GA4 via the Measurement Protocol.
 * Fails silently — analytics must never break business logic.
 */
export async function sendGA4Event({ clientId, userId, events }) {
    if (!MEASUREMENT_ID || !API_SECRET) {
        console.warn("[GA4] Measurement ID or API secret missing — skipping");
        return;
    }
    if (!clientId) {
        console.warn("[GA4] No client_id — skipping event");
        return;
    }

    const payload = {
        client_id: clientId,
        ...(userId && { user_id: String(userId) }),
        events: events.map((e) => ({
            name: e.name,
            params: {
                ...e.params,
                engagement_time_msec: 100,
                // Optional but recommended: tag events coming from the server
                source: "server_mp",
            },
        })),
    };

    try {
        await axios.post(`${ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, payload, {
            timeout: 5000,
        });
    } catch (err) {
        // MP returns 204 on success, 400 on bad payload — don't throw
        console.error("[GA4] Measurement Protocol error:", err?.message);
    }
}

/**
 * Fire auction_won in GA4.
 * Called after an auction transitions to "sold" with a winner.
 */
export async function trackAuctionWon(auctionId) {
    try {
        const auction = await Auction.findById(auctionId)
            .populate("winner", "gaClientId")
            .lean();

        if (!auction || !auction.winner) return;

        let clientId = auction.winner.gaClientId;

        // Fallback: users who predate the client_id capture.
        // Generate a stable per-user placeholder so events are still grouped.
        if (!clientId) {
            const { default: User } = await import("../models/user.model.js");
            const crypto = await import("crypto");
            clientId = `server.${crypto.randomUUID()}`;
            await User.updateOne(
                { _id: auction.winner._id },
                { $set: { gaClientId: clientId } }
            );
        }

        await sendGA4Event({
            clientId,
            userId: auction.winner._id,
            events: [
                {
                    name: "auction_won",
                    params: {
                        listing_id: String(auction._id),
                        item_name: auction.title,
                        category:
                            auction.categories?.[1] || auction.categories?.[0] || "",
                        value: auction.finalPrice || auction.currentPrice || 0,
                        currency: auction.baseCurrency || "EUR",
                        auction_type: auction.auctionType,
                        bid_number: auction.bidCount || 1,
                        payment_status: auction.paymentStatus || "pending",
                    },
                },
            ],
        });
    } catch (err) {
        console.error("[GA4] trackAuctionWon error:", err?.message);
    }
}

/**
 * Fire purchase in GA4.
 * Called when an auction's paymentStatus transitions to "completed".
 */
export async function trackPurchase(auctionId) {
    try {
        const auction = await Auction.findById(auctionId)
            .populate("winner", "gaClientId")
            .lean();

        if (!auction || !auction.winner) return;

        let clientId = auction.winner.gaClientId;

        if (!clientId) {
            const { default: User } = await import("../models/user.model.js");
            const crypto = await import("crypto");
            clientId = `server.${crypto.randomUUID()}`;
            await User.updateOne(
                { _id: auction.winner._id },
                { $set: { gaClientId: clientId } }
            );
        }

        // The amount the buyer actually paid.
        // Adjust this if you later track commission separately.
        const purchaseValue =
            Number(auction.finalPrice || auction.currentPrice || 0) + Number(auction.commissionAmount || 0);

        const currency = auction.baseCurrency || "EUR";

        await sendGA4Event({
            clientId,
            userId: auction.winner._id,
            events: [
                {
                    name: "purchase",
                    params: {
                        // GA4 required e-commerce fields
                        transaction_id:
                            auction.transactionId || String(auction._id),
                        value: purchaseValue,
                        currency,
                        items: [
                            {
                                item_id: String(auction._id),
                                item_name: auction.title,
                                item_category:
                                    auction.categories?.[0] || "",
                                item_category2:
                                    auction.categories?.[1] || "",
                                price: purchaseValue,
                                quantity: 1,
                            },
                        ],
                        // Optional extras for reporting
                        listing_id: String(auction._id),
                        auction_type: auction.auctionType,
                        payment_method: auction.paymentMethod || "unknown",
                    },
                },
            ],
        });
    } catch (err) {
        console.error("[GA4] trackPurchase error:", err?.message);
    }
}