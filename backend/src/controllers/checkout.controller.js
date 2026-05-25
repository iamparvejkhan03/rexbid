import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";

/**
 * Get checkout data for a won auction
 * Only accessible by the auction winner
 * Returns auction details, seller info, and bidder address
 */
export const getCheckoutData = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        // Find the auction and populate necessary fields
        const auction = await Auction.findById(auctionId)
            .populate(
                "seller",
                "firstName lastName username email phone address countryName countryCode payoutMethods",
            )
            .populate(
                "winner",
                "firstName lastName username email phone address countryName countryCode stripeCustomerId paymentMethodId cardLast4 cardBrand cardExpMonth cardExpYear isPaymentVerified",
            );

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found",
            });
        }

        // Check if the user is the winner
        if (
            !auction.winner ||
            auction.winner._id.toString() !== userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to checkout this auction",
            });
        }

        // Check if auction is sold
        if (auction.status !== "sold" && auction.status !== "sold_buy_now") {
            return res.status(400).json({
                success: false,
                message: "This auction is not in sold status",
            });
        }

        // Check if payment is still pending
        if (
            auction.paymentStatus === "completed" ||
            auction.paymentStatus === "processing"
        ) {
            return res.status(400).json({
                success: false,
                message: `Payment for this auction is already ${auction.paymentStatus}`,
            });
        }

        // Get seller data (already populated)
        const seller = auction.seller;

        // Get bidder/winner data (already populated)
        const bidder = auction.winner;

        const hasSavedCard = !!(
            bidder?.stripeCustomerId && bidder?.paymentMethodId
        );

        // Format seller address
        const sellerAddress = seller.address
            ? {
                name: `${seller.firstName} ${seller.lastName}`,
                company: seller.businessName || "",
                street1: seller.address.street || "",
                street2: seller.address.buildingNameNo || "",
                city: seller.address.city || "",
                state: seller.address.state || "",
                zip: seller.address.postCode || "",
                //   country: seller.address.country || "US",
                country: seller.countryCode || "US",
                phone: seller.phone || "",
                email: seller.email || "",
            }
            : null;

        // Format bidder address
        const bidderAddress = bidder.address
            ? {
                name: `${bidder.firstName} ${bidder.lastName}`,
                company: "",
                street1: bidder.address.street || "",
                street2: bidder.address.buildingNameNo || "",
                city: bidder.address.city || "",
                state: bidder.address.state || "",
                zip: bidder.address.postCode || "",
                //   country: bidder.address.country || "US",
                country: bidder.countryCode || "US",
                phone: bidder.phone || "",
                email: bidder.email || "",
            }
            : null;

        // Prepare auction data for response
        const auctionData = {
            _id: auction._id,
            title: auction.title,
            description: auction.description,
            finalPrice: auction.finalPrice || 0,
            commissionAmount: auction.commissionAmount || 0,
            auctionType: auction.auctionType,
            status: auction.status,
            paymentStatus: auction.paymentStatus,
            // Include basic info for display
            photos: auction.photos?.length > 0 ? [auction.photos[0]] : [],
            endDate: auction.endDate,
            createdAt: auction.createdAt,
        };

        // Get admin's bank details for bank transfer payments
        const adminUser = await User.findOne({ userType: "admin" }).select(
            "payoutMethods firstName lastName email",
        );

        // Prepare admin bank details if available
        const adminBankDetails = adminUser?.payoutMethods?.bankTransfer
            ? {
                accountHolderName:
                    adminUser.payoutMethods.bankTransfer.accountHolderName,
                bankName: adminUser.payoutMethods.bankTransfer.bankName,
                accountNumber: adminUser.payoutMethods.bankTransfer.accountNumber,
                routingNumber: adminUser.payoutMethods.bankTransfer.routingNumber,
                iban: adminUser.payoutMethods.bankTransfer.iban,
                swiftCode: adminUser.payoutMethods.bankTransfer.swiftCode,
                bankAddress: adminUser.payoutMethods.bankTransfer.bankAddress,
                currency: adminUser.payoutMethods.bankTransfer.currency || "USD",
            }
            : null;

        // Prepare seller data for response
        const sellerData = {
            _id: seller._id,
            firstName: seller.firstName,
            lastName: seller.lastName,
            username: seller.username,
            email: seller.email,
            phone: seller.phone,
            memberSince: seller.createdAt,
            // Include address
            address: sellerAddress,
            // Include bank transfer details if available
            payoutMethods: seller.payoutMethods
                ? {
                    bankTransfer: seller.payoutMethods.bankTransfer
                        ? {
                            accountHolderName:
                                seller.payoutMethods.bankTransfer.accountHolderName,
                            bankName: seller.payoutMethods.bankTransfer.bankName,
                            accountNumber:
                                seller.payoutMethods.bankTransfer.accountNumber,
                            routingNumber:
                                seller.payoutMethods.bankTransfer.routingNumber,
                            iban: seller.payoutMethods.bankTransfer.iban,
                            swiftCode: seller.payoutMethods.bankTransfer.swiftCode,
                            bankAddress: seller.payoutMethods.bankTransfer.bankAddress,
                            currency: seller.payoutMethods.bankTransfer.currency || "USD",
                        }
                        : null,
                }
                : null,
        };

        // Prepare bidder address data for response
        const bidderAddressData = bidderAddress;

        // Calculate total amount
        const totalAmount =
            (auction.finalPrice || 0) + (auction.commissionAmount || 0);

        return res.status(200).json({
            success: true,
            message: "Checkout data retrieved successfully",
            data: {
                auction: auctionData,
                seller: sellerData,
                bidderAddress: bidderAddressData,
                paymentInfo: {
                    hasSavedCard,
                    savedCard: hasSavedCard
                        ? {
                            last4: bidder?.cardLast4,
                            brand: bidder?.cardBrand,
                            expiryMonth: bidder?.cardExpMonth,
                            expiryYear: bidder?.cardExpYear,
                            isVerified: bidder?.isPaymentVerified,
                        }
                        : null,
                },
                totals: {
                    winningBid: auction.finalPrice || 0,
                    commission: auction.commissionAmount || 0,
                    subtotal: totalAmount,
                },
                // ✅ Add admin bank details for bank transfer payments
                adminBankDetails: adminBankDetails,
            },
        });
    } catch (error) {
        console.error("Get checkout data error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching checkout data",
            error: error.message,
        });
    }
};

/**
 * Verify checkout access before creating payment
 * This can be used as a middleware
 */
export const verifyCheckoutAccess = async (req, res, next) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found",
            });
        }

        // Check if user is winner
        if (!auction.winner || auction.winner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to checkout this auction",
            });
        }

        // Check auction status
        if (auction.status !== "sold" && auction.status !== "sold_buy_now") {
            return res.status(400).json({
                success: false,
                message: "This auction is not in sold status",
            });
        }

        // Check payment status
        if (auction.paymentStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Payment for this auction is already ${auction.paymentStatus}`,
            });
        }

        // Attach auction to request for next middleware
        req.checkoutAuction = auction;
        next();
    } catch (error) {
        console.error("Verify checkout access error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while verifying checkout access",
        });
    }
};