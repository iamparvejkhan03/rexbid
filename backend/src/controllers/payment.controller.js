import Stripe from "stripe";
import Auction from "../models/auction.model.js";
import BidPayment from "../models/bidPayment.model.js";
import User from "../models/user.model.js";
import Commission from "../models/commission.model.js";
import {
    paymentCompletedEmail,
} from "../utils/nodemailer.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createWonAuctionPayment = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const userId = req.user.id;

        // Find the auction
        const auction = await Auction.findById(auctionId)
            .populate("seller", "email username firstName lastName")
            .populate(
                "winner",
                "email username firstName lastName stripeCustomerId paymentMethodId",
            );

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found",
            });
        }

        // Verify user is the winner
        if (auction.winner?._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not the winner of this auction",
            });
        }

        // Check if already paid
        if (auction.paymentStatus === "completed") {
            return res.status(400).json({
                success: false,
                message: "This auction has already been paid for",
            });
        }

        // Get user's stripe info
        const user = await User.findById(userId);
        if (!user.stripeCustomerId || !user.paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: "No payment method found. Please add a card to your account.",
            });
        }

        // Calculate total amount (finalPrice + commission)
        const bidAmount = auction.finalPrice || auction.currentPrice;
        const commissionAmount = auction.commissionAmount || 0;
        const totalAmount = bidAmount + commissionAmount;

        // Check if payment record already exists
        let bidPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: userId,
        });

        try {
            // Create Stripe payment intent for immediate charge
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Convert to cents
                currency: "usd",
                customer: user.stripeCustomerId,
                payment_method: user.paymentMethodId,
                description: `Payment for auction: ${auction.title}`,
                confirm: true, // Confirm immediately to charge
                off_session: true,
                metadata: {
                    auctionId: auctionId,
                    userId: userId,
                    type: "won_auction_payment",
                },
            });

            // Update or create bid payment record
            if (bidPayment) {
                bidPayment.paymentIntentId = paymentIntent.id;
                bidPayment.clientSecret = paymentIntent.client_secret;
                bidPayment.status = paymentIntent.status;
                bidPayment.bidAmount = bidAmount;
                bidPayment.commissionAmount = commissionAmount;
                bidPayment.totalAmount = totalAmount;
                bidPayment.chargeAttempted = true;
                bidPayment.chargeSucceeded = paymentIntent.status === "succeeded";
                await bidPayment.save();
            } else {
                bidPayment = await BidPayment.create({
                    auction: auctionId,
                    bidder: userId,
                    bidAmount: bidAmount,
                    commissionAmount: commissionAmount,
                    totalAmount: totalAmount,
                    paymentIntentId: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                    status: paymentIntent.status,
                    chargeAttempted: true,
                    chargeSucceeded: paymentIntent.status === "succeeded",
                    type: "final_commission",
                });
            }

            // If payment succeeded immediately, update auction
            if (paymentIntent.status === "succeeded") {
                auction.paymentStatus = "completed";
                auction.paymentMethod = "credit_card";
                auction.paymentDate = new Date();
                auction.transactionId = paymentIntent.id;
                await auction.save();
            }

            if (user.preferences?.emailUpdates) {
                paymentCompletedEmail(user, auction).catch(console.error);
            }

            return res.status(200).json({
                success: true,
                data: {
                    paymentIntent: {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        clientSecret: paymentIntent.client_secret,
                    },
                    bidPayment: bidPayment,
                    auction: {
                        id: auction._id,
                        paymentStatus: auction.paymentStatus,
                    },
                },
            });
        } catch (stripeError) {
            console.error("Stripe payment error:", stripeError);

            // Update bid payment with failed status if it exists
            if (bidPayment) {
                bidPayment.status = "processing_failed";
                bidPayment.chargeAttempted = true;
                await bidPayment.save();
            }

            // Update auction payment status to failed
            auction.paymentStatus = "failed";
            await auction.save();

            return res.status(400).json({
                success: false,
                message: stripeError.message || "Payment processing failed",
                error: stripeError.code,
            });
        }
    } catch (error) {
        console.error("Create won auction payment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;
        case "payment_intent.payment_failed":
            const failedPaymentIntent = event.data.object;
            await handlePaymentFailure(failedPaymentIntent);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

// Webhook handler for Stripe events
async function handlePaymentSuccess(paymentIntent) {
    try {
        const { auctionId } = paymentIntent.metadata;

        // Find the bid payment
        const bidPayment = await BidPayment.findOne({
            paymentIntentId: paymentIntent.id,
        });

        if (!bidPayment) {
            console.error(
                "BidPayment not found for payment intent:",
                paymentIntent.id,
            );
            return;
        }

        // Update auction
        const auction = await Auction.findByIdAndUpdate(
            auctionId,
            {
                paymentStatus: "completed",
                paymentMethod: "credit_card",
                paymentDate: new Date(),
                transactionId: paymentIntent.id,
            },
            { new: true },
        );

        // Update bid payment
        await BidPayment.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            {
                status: "succeeded",
                chargeSucceeded: true,
            },
        );

        console.log(`Payment succeeded for auction ${auctionId}`);
    } catch (error) {
        console.error("Error handling payment success:", error);
    }
}

async function handlePaymentFailure(paymentIntent) {
    try {
        const { auctionId } = paymentIntent.metadata;

        // Update auction
        await Auction.findByIdAndUpdate(auctionId, {
            paymentStatus: "failed",
        });

        // Update bid payment
        await BidPayment.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            {
                status: "processing_failed",
                chargeSucceeded: false,
            },
        );

        console.log(`Payment failed for auction ${auctionId}`);
    } catch (error) {
        console.error("Error handling payment failure:", error);
    }
}

// Get payment status for an auction
export const getAuctionPaymentStatus = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;

        const auction = await Auction.findById(auctionId).select(
            "paymentStatus paymentMethod paymentDate transactionId finalPrice commissionAmount",
        );

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found",
            });
        }

        const bidPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: userId,
        }).select("status paymentIntentId createdAt");

        return res.status(200).json({
            success: true,
            data: {
                auction: {
                    paymentStatus: auction.paymentStatus,
                    paymentMethod: auction.paymentMethod,
                    paymentDate: auction.paymentDate,
                    transactionId: auction.transactionId,
                    finalPrice: auction.finalPrice,
                    commissionAmount: auction.commissionAmount,
                    totalAmount:
                        (auction.finalPrice || 0) + (auction.commissionAmount || 0),
                },
                bidPayment: bidPayment,
            },
        });
    } catch (error) {
        console.error("Get payment status error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const createCheckoutPayment = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const userId = req.user.id;

        // 1. Find auction and verify winner
        const auction = await Auction.findById(auctionId)
            .populate("seller", "email username firstName lastName")
            .populate(
                "winner",
                "email username firstName lastName stripeCustomerId paymentMethodId cardLast4 cardBrand",
            );

        if (!auction) {
            return res
                .status(404)
                .json({ success: false, message: "Auction not found" });
        }

        if (auction.winner?._id.toString() !== userId) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }

        if (auction.paymentStatus === "completed") {
            return res.status(400).json({ success: false, message: "Already paid" });
        }

        // 2. Get user's saved card
        const user = await User.findById(userId);
        if (!user.stripeCustomerId || !user.paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: "No saved card found. Please add a card to your account.",
            });
        }

        // 3. Calculate total (winning bid + commission)
        const bidAmount = auction.finalPrice || auction.currentPrice;
        const commissionAmount = auction.commissionAmount || 0;
        const totalAmount = bidAmount + commissionAmount;

        // 4. Create and confirm payment immediately
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: "usd",
            customer: user.stripeCustomerId,
            payment_method: user.paymentMethodId,
            description: `Payment for auction: ${auction.title}`,
            confirm: true,
            off_session: true,
            metadata: {
                auctionId: auctionId,
                userId: userId,
            },
        });

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                success: false,
                message: `Payment failed: ${paymentIntent.status}`,
            });
        }

        // 5. Update auction payment status
        auction.paymentStatus = "completed";
        auction.paymentMethod = "credit_card";
        auction.paymentDate = new Date();
        auction.transactionId = paymentIntent.id;
        await auction.save();

        // 6. Store payment record
        const bidPayment = await BidPayment.create({
            auction: auctionId,
            bidder: userId,
            bidAmount,
            commissionAmount,
            totalAmount,
            paymentIntentId: paymentIntent.id,
            status: "succeeded",
            chargeSucceeded: true,
            type: "checkout_payment",
        });

        // 8. Send email to buyer (optional)
        if (user.preferences?.emailUpdates) {
            paymentCompletedEmail(user, auction).catch(console.error);
        }

        return res.status(200).json({
            success: true,
            message: "Payment successful! Details will be emailed to seller.",
            data: {
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                },
                auction: {
                    id: auction._id,
                    paymentStatus: auction.paymentStatus,
                },
            },
        });
    } catch (error) {
        console.error("Checkout payment error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Payment processing failed",
        });
    }
};

export const createBankTransferPayment = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const userId = req.user.id;

        // Find the auction and verify winner
        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res
                .status(404)
                .json({ success: false, message: "Auction not found" });
        }

        if (auction.winner?._id.toString() !== userId) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }

        if (
            auction.paymentStatus === "completed" ||
            auction.paymentStatus === "processing"
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Payment already processed" });
        }

        // Calculate total
        const bidAmount = auction.finalPrice || auction.currentPrice;
        const commissionAmount = auction.commissionAmount || 0;
        const totalAmount = bidAmount + commissionAmount;

        // Update auction status to pending (bank transfer)
        auction.paymentStatus = "processing";
        auction.paymentMethod = "bank_transfer";
        await auction.save();

        // Create bid payment record
        await BidPayment.create({
            auction: auctionId,
            bidder: userId,
            bidAmount,
            commissionAmount,
            totalAmount,
            status: "pending",
            type: "bank_transfer_payment",
            paymentMethod: "bank_transfer",
        });

        // ✅ Fetch admin's bank details from database
        const adminUser = await User.findOne({ userType: "admin" }).select(
            "payoutMethods firstName lastName email",
        );

        // Prepare admin bank details
        let bankDetails = null;
        if (adminUser?.payoutMethods?.bankTransfer) {
            bankDetails = {
                accountHolderName:
                    adminUser.payoutMethods.bankTransfer.accountHolderName,
                bankName: adminUser.payoutMethods.bankTransfer.bankName,
                accountNumber: adminUser.payoutMethods.bankTransfer.accountNumber,
                routingNumber: adminUser.payoutMethods.bankTransfer.routingNumber,
                iban: adminUser.payoutMethods.bankTransfer.iban,
                swiftCode: adminUser.payoutMethods.bankTransfer.swiftCode,
                bankAddress: adminUser.payoutMethods.bankTransfer.bankAddress,
                currency: adminUser.payoutMethods.bankTransfer.currency || "USD",
            };
        }

        // If no bank details found, return a generic message
        if (!bankDetails) {
            return res.status(400).json({
                success: false,
                message: "Admin bank details not configured. Please contact support.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bank transfer selected. Please complete the transfer.",
            data: {
                bankDetails,
                auction: {
                    id: auction._id,
                    totalAmount,
                    title: auction.title,
                },
            },
        });
    } catch (error) {
        console.error("Bank transfer error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to process bank transfer",
        });
    }
};

/**
 * Confirm checkout payment (for saved card or new card)
 */
export const confirmCheckoutPayment = async (req, res) => {
    try {
        const { paymentIntentId, auctionId } = req.body;
        const userId = req.user.id;

        // Find the bid payment
        const bidPayment = await BidPayment.findOne({
            paymentIntentId,
            bidder: userId,
        });

        if (!bidPayment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found",
            });
        }

        // Confirm the payment intent
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
            // Update auction
            const auction = await Auction.findById(auctionId);
            auction.paymentStatus = "completed";
            auction.paymentMethod = "credit_card";
            auction.paymentDate = new Date();
            auction.transactionId = paymentIntent.id;
            await auction.save();

            // Update bid payment
            bidPayment.status = "succeeded";
            bidPayment.chargeSucceeded = true;
            await bidPayment.save();

            return res.status(200).json({
                success: true,
                message: "Payment successful!",
                data: {
                    paymentIntent: {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                    },
                    auction: {
                        id: auction._id,
                        paymentStatus: auction.paymentStatus,
                    },
                },
            });
        } else {
            return res.status(400).json({
                success: false,
                message: `Payment status: ${paymentIntent.status}`,
            });
        }
    } catch (error) {
        console.error("Confirm payment error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Payment confirmation failed",
        });
    }
};