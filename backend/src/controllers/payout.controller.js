import User from "../models/user.model.js";
import Payout from "../models/payout.model.js";
import Auction from "../models/auction.model.js";
import Commission from "../models/commission.model.js";
import {
    payoutInitiatedEmail,
    payoutCompletedEmail,
    payoutFailedEmail,
} from "../utils/nodemailer.js";
import {
    uploadDocumentToCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Get seller payout methods
export const getPayoutMethods = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select(
            "payoutMethods defaultPayoutMethod userType",
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if user is seller
        if (user.userType !== "seller" && user.userType !== "bidder" && user.userType !== "broker" && user.userType !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only sellers, bidders, admin, and brokers can access payout methods",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                payoutMethods: user.payoutMethods || {},
                defaultPayoutMethod: user.defaultPayoutMethod,
            },
        });
    } catch (error) {
        console.error("Get payout methods error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching payout methods",
        });
    }
};

// Update PayPal method
export const updatePayPalMethod = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user.id;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "PayPal email is required",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Initialize payoutMethods if it doesn't exist
        if (!user.payoutMethods) {
            user.payoutMethods = {};
        }

        // Update PayPal details
        user.payoutMethods.paypal = {
            email: email.toLowerCase().trim(),
            isVerified: false, // Will be verified by admin later
            addedAt: user.payoutMethods.paypal?.addedAt || new Date(),
            updatedAt: new Date(),
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "PayPal details updated successfully",
            data: {
                paypal: user.payoutMethods.paypal,
            },
        });
    } catch (error) {
        console.error("Update PayPal method error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating PayPal details",
        });
    }
};

// Update Payoneer method
export const updatePayoneerMethod = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user.id;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Payoneer email is required",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Initialize payoutMethods if it doesn't exist
        if (!user.payoutMethods) {
            user.payoutMethods = {};
        }

        // Update Payoneer details
        user.payoutMethods.payoneer = {
            email: email.toLowerCase().trim(),
            isVerified: false, // Will be verified by admin later
            addedAt: user.payoutMethods.payoneer?.addedAt || new Date(),
            updatedAt: new Date(),
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "Payoneer details updated successfully",
            data: {
                payoneer: user.payoutMethods.payoneer,
            },
        });
    } catch (error) {
        console.error("Update Payoneer method error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating Payoneer details",
        });
    }
};

// Update Bank Transfer method
export const updateBankMethod = async (req, res) => {
    try {
        const {
            accountHolderName,
            bankName,
            accountNumber,
            routingNumber,
            iban,
            swiftCode,
            currency,
            bankAddress,
        } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!accountHolderName || !bankName || !accountNumber) {
            return res.status(400).json({
                success: false,
                message:
                    "Account holder name, bank name, and account number are required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Initialize payoutMethods if it doesn't exist
        if (!user.payoutMethods) {
            user.payoutMethods = {};
        }

        // Update bank details
        user.payoutMethods.bankTransfer = {
            accountHolderName: accountHolderName.trim(),
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            routingNumber: routingNumber?.trim(),
            iban: iban?.trim(),
            swiftCode: swiftCode?.trim(),
            currency: currency || "USD",
            bankAddress: bankAddress?.trim(),
            isVerified: false, // Will be verified by admin later
            addedAt: user.payoutMethods.bankTransfer?.addedAt || new Date(),
            updatedAt: new Date(),
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "Bank details updated successfully",
            data: {
                bankTransfer: user.payoutMethods.bankTransfer,
            },
        });
    } catch (error) {
        console.error("Update bank method error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating bank details",
        });
    }
};

// Set default payout method
export const setDefaultPayoutMethod = async (req, res) => {
    try {
        const { method } = req.body;
        const userId = req.user.id;

        if (!method || !["paypal", "payoneer", "bankTransfer"].includes(method)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid payout method",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the selected method exists
        if (!user.payoutMethods || !user.payoutMethods[method]) {
            return res.status(400).json({
                success: false,
                message: `Please add your ${method} details first`,
            });
        }

        user.defaultPayoutMethod = method;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Default payout method set to ${method}`,
            data: {
                defaultPayoutMethod: user.defaultPayoutMethod,
            },
        });
    } catch (error) {
        console.error("Set default payout method error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while setting default payout method",
        });
    }
};

// Remove a payout method
export const removePayoutMethod = async (req, res) => {
    try {
        const { method } = req.params;
        const userId = req.user.id;

        if (!method || !["paypal", "payoneer", "bankTransfer"].includes(method)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payout method",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if method exists
        if (!user.payoutMethods || !user.payoutMethods[method]) {
            return res.status(400).json({
                success: false,
                message: `${method} method not found`,
            });
        }

        // Remove the method
        user.payoutMethods[method] = undefined;

        // If this was the default method, reset default
        if (user.defaultPayoutMethod === method) {
            user.defaultPayoutMethod = null;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: `${method} method removed successfully`,
        });
    } catch (error) {
        console.error("Remove payout method error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while removing payout method",
        });
    }
};

// Get all payouts with filters for admin
export const getAdminPayouts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            status,
            search,
            sortBy = "recent",
        } = req.query;

        // Build filter
        const filter = {};

        if (status && status !== "all") {
            filter.status = status;
        }

        // Search filter
        if (search) {
            filter.$or = [
                { "auction.title": { $regex: search, $options: "i" } },
                { "seller.firstName": { $regex: search, $options: "i" } },
                { "seller.lastName": { $regex: search, $options: "i" } },
                { "seller.email": { $regex: search, $options: "i" } },
                { transactionId: { $regex: search, $options: "i" } },
            ];
        }

        // Get payouts with populated data
        const payouts = await Payout.find(filter)
            .populate(
                "seller",
                "firstName lastName email username phone payoutMethods",
            )
            .populate(
                "auction",
                "title finalPrice currentPrice commissionAmount endDate",
            )
            .populate("initiatedBy", "firstName lastName email username")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Transform data for frontend
        const transformedPayouts = payouts.map((payout) => {
            const seller = payout.seller || {};
            const auction = payout.auction || {};

            // Get payout method details
            let payoutMethodDisplay = {};
            if (payout.payoutMethod && payout.payoutDetails) {
                payoutMethodDisplay = {
                    method: payout.payoutMethod,
                    details: payout.payoutDetails,
                };
            } else if (
                seller.payoutMethods &&
                seller.payoutMethods[payout.payoutMethod]
            ) {
                payoutMethodDisplay = {
                    method: payout.payoutMethod,
                    details: seller.payoutMethods[payout.payoutMethod],
                };
            }

            return {
                id: payout._id,
                seller: {
                    id: seller._id,
                    name: seller.firstName
                        ? `${seller.firstName} ${seller.lastName || ""}`.trim()
                        : seller.username || "Unknown",
                    email: seller.email,
                    phone: seller.phone,
                },
                auction: {
                    id: auction._id,
                    title: auction.title || "Unknown Auction",
                    finalPrice: auction.finalPrice || auction.currentPrice || 0,
                },
                totalAmount: payout.totalAmount,
                commissionAmount: payout.commissionAmount,
                sellerAmount: payout.sellerAmount,
                payoutMethod: payoutMethodDisplay,
                status: payout.status,
                transactionId: payout.transactionId,
                adminNotes: payout.adminNotes,
                sellerNotes: payout.sellerNotes,
                receipt: payout.receipt,
                initiatedBy: payout.initiatedBy
                    ? `${payout.initiatedBy.firstName || ""} ${payout.initiatedBy.lastName || ""}`.trim()
                    : "System",
                createdAt: payout.createdAt,
                processedAt: payout.processedAt,
                completedAt: payout.completedAt,
                failureReason: payout.failureReason,
            };
        });

        // Get statistics
        const totalPayouts = await Payout.countDocuments(filter);

        const stats = await Payout.aggregate([
            {
                $group: {
                    _id: null,
                    totalPending: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "pending"] }, "$sellerAmount", 0],
                        },
                    },
                    totalCompleted: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, "$sellerAmount", 0],
                        },
                    },
                    totalCommission: { $sum: "$commissionAmount" },
                    countPending: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                    },
                    countCompleted: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                    },
                },
            },
        ]);

        const statistics = stats[0] || {
            totalPending: 0,
            totalCompleted: 0,
            totalCommission: 0,
            countPending: 0,
            countCompleted: 0,
        };

        res.status(200).json({
            success: true,
            data: {
                payouts: transformedPayouts,
                statistics,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPayouts / limit),
                    totalPayouts,
                },
            },
        });
    } catch (error) {
        console.error("Get admin payouts error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching payouts",
        });
    }
};

// Get pending payouts for admin
export const getPendingPayouts = async (req, res) => {
    try {
        // Find all sold auctions that don't have a payout yet
        const soldAuctions = await Auction.find({
            status: { $in: ["sold", "sold_buy_now"] },
            paymentStatus: "completed",
            winner: { $ne: null },
            finalPrice: { $gt: 0 },
        })
            .populate(
                "seller",
                "firstName lastName email username phone payoutMethods defaultPayoutMethod",
            )
            .populate("winner", "firstName lastName email username")
            .sort({ endDate: -1 });

        // Get existing payouts to filter out already processed
        const existingPayouts = await Payout.find({
            auction: { $in: soldAuctions.map((a) => a._id) },
        }).select("auction");

        const processedAuctionIds = new Set(
            existingPayouts.map((p) => p.auction.toString()),
        );

        // Filter auctions that need payout
        const pendingPayouts = soldAuctions
            .filter((auction) => !processedAuctionIds.has(auction._id.toString()))
            .map((auction) => {
                const totalAmount = auction.finalPrice || auction.currentPrice || 0;
                const commissionAmount = auction.commissionAmount || 0;
                const sellerAmount = totalAmount - commissionAmount;

                // Get seller's default payout method
                const seller = auction.seller || {};
                let defaultPayoutMethod = seller.defaultPayoutMethod || null;
                let payoutDetails = null;

                if (
                    defaultPayoutMethod &&
                    seller.payoutMethods &&
                    seller.payoutMethods[defaultPayoutMethod]
                ) {
                    payoutDetails = seller.payoutMethods[defaultPayoutMethod];
                }

                return {
                    id: auction._id,
                    auction: {
                        id: auction._id,
                        title: auction.title,
                        endDate: auction.endDate,
                    },
                    seller: {
                        id: seller._id,
                        name: seller.firstName
                            ? `${seller.firstName} ${seller.lastName || ""}`.trim()
                            : seller.username || "Unknown",
                        email: seller.email,
                        phone: seller.phone,
                        hasPayoutMethod: !!(defaultPayoutMethod && payoutDetails),
                    },
                    winner: auction.winner
                        ? {
                            name: auction.winner.firstName
                                ? `${auction.winner.firstName} ${auction.winner.lastName || ""}`.trim()
                                : auction.winner.username || "Unknown",
                            email: auction.winner.email,
                        }
                        : null,
                    financials: {
                        totalAmount,
                        commissionAmount,
                        sellerAmount,
                        formattedTotal: new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(totalAmount),
                        formattedCommission: new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(commissionAmount),
                        formattedSeller: new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(sellerAmount),
                    },
                    defaultPayoutMethod,
                    payoutDetails,
                    paymentDate: auction.paymentDate,
                };
            });

        res.status(200).json({
            success: true,
            data: pendingPayouts,
        });
    } catch (error) {
        console.error("Get pending payouts error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching pending payouts",
        });
    }
};

// Initiate a payout (admin action)
export const initiatePayout = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { payoutMethod, adminNotes } = req.body;
        const adminId = req.user.id;

        // Find auction
        const auction = await Auction.findById(auctionId).populate(
            "seller",
            "firstName lastName email username phone payoutMethods",
        );

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found",
            });
        }

        // Verify auction is sold and paid
        if (!["sold", "sold_buy_now"].includes(auction.status)) {
            return res.status(400).json({
                success: false,
                message: "Auction is not sold",
            });
        }

        if (auction.paymentStatus !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Buyer payment is not completed yet",
            });
        }

        // Check if payout already exists
        const existingPayout = await Payout.findOne({ auction: auctionId });
        if (existingPayout) {
            return res.status(400).json({
                success: false,
                message: `Payout already exists with status: ${existingPayout.status}`,
            });
        }

        // Get seller
        const seller = auction.seller;
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        // Verify seller has payout method
        if (!seller.payoutMethods || !seller.payoutMethods[payoutMethod]) {
            return res.status(400).json({
                success: false,
                message: `Seller has not added ${payoutMethod} payout method`,
            });
        }

        // Calculate amounts
        const totalAmount = auction.finalPrice || auction.currentPrice || 0;
        const commissionAmount = auction.commissionAmount || 0;
        const sellerAmount = totalAmount - commissionAmount;

        // Create payout record
        const payout = await Payout.create({
            seller: seller._id,
            auction: auction._id,
            totalAmount,
            commissionAmount,
            sellerAmount,
            payoutMethod,
            payoutDetails: seller.payoutMethods[payoutMethod],
            status: "pending",
            adminNotes: adminNotes || null,
            initiatedBy: adminId,
        });

        // Send email notification to seller
        await payoutInitiatedEmail(seller, auction, payout);

        res.status(201).json({
            success: true,
            message: "Payout initiated successfully",
            data: payout,
        });
    } catch (error) {
        console.error("Initiate payout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while initiating payout",
        });
    }
};

// Mark payout as completed (manual payment)
export const completePayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { transactionId, adminNotes } = req.body;
        const adminId = req.user.id;

        const payout = await Payout.findById(payoutId)
            .populate("seller", "firstName lastName email username")
            .populate("auction", "title");

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: "Payout not found",
            });
        }

        if (payout.status !== "pending" && payout.status !== "processing") {
            return res.status(400).json({
                success: false,
                message: `Payout cannot be completed. Current status: ${payout.status}`,
            });
        }

        // Handle receipt upload if provided
        let receiptData = null;
        if (req.file) {
            try {
                const result = await uploadDocumentToCloudinary(
                    req.file.buffer,
                    req.file.originalname,
                    "payout-receipts",
                );
                receiptData = {
                    url: result.secure_url,
                    publicId: result.public_id,
                    filename: req.file.originalname,
                    uploadedAt: new Date(),
                };
            } catch (uploadError) {
                console.error("Receipt upload error:", uploadError);
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload receipt",
                });
            }
        }

        // Update payout
        payout.status = "completed";
        payout.transactionId = transactionId || payout.transactionId;
        payout.completedAt = new Date();
        payout.processedAt = new Date();
        if (adminNotes) payout.adminNotes = adminNotes;
        if (receiptData) payout.receipt = receiptData;

        await payout.save();

        // Send email notification to seller
        await payoutCompletedEmail(payout.seller, payout.auction, payout);

        res.status(200).json({
            success: true,
            message: "Payout marked as completed",
            data: payout,
        });
    } catch (error) {
        console.error("Complete payout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while completing payout",
        });
    }
};

// Mark payout as failed
export const failPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { failureReason, adminNotes } = req.body;

        const payout = await Payout.findById(payoutId).populate(
            "seller",
            "firstName lastName email username",
        );

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: "Payout not found",
            });
        }

        if (payout.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Completed payouts cannot be marked as failed",
            });
        }

        // Update payout
        payout.status = "failed";
        payout.failedAt = new Date();
        payout.failureReason = failureReason || "Unknown reason";
        if (adminNotes) payout.adminNotes = adminNotes;

        await payout.save();

        // Send email notification to seller
        await payoutFailedEmail(payout.seller, payout);

        res.status(200).json({
            success: true,
            message: "Payout marked as failed",
            data: payout,
        });
    } catch (error) {
        console.error("Fail payout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while failing payout",
        });
    }
};

// Get seller payout methods for a specific auction
export const getAuctionPayoutInfo = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId).populate(
            "seller",
            "firstName lastName email username payoutMethods defaultPayoutMethod",
        );

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found",
            });
        }

        const seller = auction.seller;
        const totalAmount = auction.finalPrice || auction.currentPrice || 0;
        const commissionAmount = auction.commissionAmount || 0;
        const sellerAmount = totalAmount - commissionAmount;

        // Check existing payout
        const existingPayout = await Payout.findOne({ auction: auctionId });

        res.status(200).json({
            success: true,
            data: {
                auction: {
                    id: auction._id,
                    title: auction.title,
                    status: auction.status,
                    paymentStatus: auction.paymentStatus,
                },
                seller: {
                    id: seller._id,
                    name: seller.firstName
                        ? `${seller.firstName} ${seller.lastName || ""}`.trim()
                        : seller.username,
                    email: seller.email,
                    hasPayoutMethods: !!(
                        seller.payoutMethods && Object.keys(seller.payoutMethods).length > 0
                    ),
                    payoutMethods: seller.payoutMethods || {},
                    defaultPayoutMethod: seller.defaultPayoutMethod,
                },
                financials: {
                    totalAmount,
                    commissionAmount,
                    sellerAmount,
                    formattedTotal: new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(totalAmount),
                    formattedCommission: new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(commissionAmount),
                    formattedSeller: new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(sellerAmount),
                },
                existingPayout,
            },
        });
    } catch (error) {
        console.error("Get auction payout info error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get payout details by ID
export const getPayoutById = async (req, res) => {
    try {
        const { payoutId } = req.params;

        const payout = await Payout.findById(payoutId)
            .populate(
                "seller",
                "firstName lastName email username phone payoutMethods",
            )
            .populate(
                "auction",
                "title finalPrice currentPrice commissionAmount endDate",
            )
            .populate("initiatedBy", "firstName lastName email username");

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: "Payout not found",
            });
        }

        res.status(200).json({
            success: true,
            data: payout,
        });
    } catch (error) {
        console.error("Get payout by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getSellerPayouts = async (req, res) => {
    try {
        const sellerId = req.user.id; // From auth middleware

        // Find all payouts for this seller
        const payouts = await Payout.find({ seller: sellerId })
            .populate({
                path: "auction",
                select: "title finalPrice currentPrice commissionAmount endDate photos"
            })
            .sort({ createdAt: -1 });

        // Calculate statistics
        const stats = {
            totalPaid: 0,
            totalPending: 0,
            totalCommission: 0,
            countCompleted: 0,
            countPending: 0
        };

        payouts.forEach(payout => {
            if (payout.status === "completed") {
                stats.totalPaid += payout.sellerAmount;
                stats.countCompleted++;
            } else if (payout.status === "pending" || payout.status === "processing") {
                stats.totalPending += payout.sellerAmount;
                stats.countPending++;
            }
            stats.totalCommission += payout.commissionAmount;
        });

        // Format the response data
        const formattedPayouts = payouts.map(payout => ({
            _id: payout._id,
            auction: {
                _id: payout.auction?._id,
                title: payout.auction?.title || "Unknown Auction",
                finalPrice: payout.auction?.finalPrice || payout.auction?.currentPrice,
                endDate: payout.auction?.endDate
            },
            totalAmount: payout.totalAmount,
            commissionAmount: payout.commissionAmount,
            sellerAmount: payout.sellerAmount,
            status: payout.status,
            transactionId: payout.transactionId,
            failureReason: payout.failureReason,
            createdAt: payout.createdAt,
            completedAt: payout.completedAt,
            formattedSellerAmount: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(payout.sellerAmount),
            formattedCommissionAmount: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(payout.commissionAmount)
        }));

        res.status(200).json({
            success: true,
            data: {
                payouts: formattedPayouts,
                statistics: {
                    totalPaid: stats.totalPaid,
                    totalPending: stats.totalPending,
                    totalCommission: stats.totalCommission,
                    countCompleted: stats.countCompleted,
                    countPending: stats.countPending,
                    formattedTotalPaid: new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(stats.totalPaid),
                    formattedTotalPending: new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(stats.totalPending)
                }
            }
        });

    } catch (error) {
        console.error("Get seller payouts error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching your payouts"
        });
    }
};

// Get single payout details for seller
export const getSellerPayoutById = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const sellerId = req.user.id;

        const payout = await Payout.findOne({
            _id: payoutId,
            seller: sellerId // Ensure seller owns this payout
        })
            .populate({
                path: "auction",
                select: "title description finalPrice currentPrice commissionAmount endDate photos"
            });

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: "Payout not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: payout._id,
                auction: payout.auction,
                totalAmount: payout.totalAmount,
                commissionAmount: payout.commissionAmount,
                sellerAmount: payout.sellerAmount,
                status: payout.status,
                transactionId: payout.transactionId,
                failureReason: payout.failureReason,
                createdAt: payout.createdAt,
                completedAt: payout.completedAt,
                invoice: payout?.receipt,
                formattedSellerAmount: new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(payout.sellerAmount)
            }
        });

    } catch (error) {
        console.error("Get seller payout by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};