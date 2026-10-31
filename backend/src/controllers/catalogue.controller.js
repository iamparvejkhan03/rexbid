import Catalogue from "../models/catalogue.model.js";
import Auction from "../models/auction.model.js";
import {
    uploadImageToCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { getCachedRates } from "../routes/currency.route.js";

// -------------------- helpers --------------------

const convertPrice = (auction, targetCurrency, priceField) => {
    const rates = getCachedRates();
    if (!rates) return auction[priceField];
    const base = auction.baseCurrency;
    const rate = rates[base]?.rates?.[targetCurrency];
    if (!rate) return auction[priceField];
    return auction[priceField] * rate;
};

// Parse "YYYY-MM-DD" (from <input type="date">) into a Date at local noon.
const parseDateLocalNoon = (str) => {
    if (!str) return null;
    const [y, m, d] = String(str).split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 12, 0, 0, 0);
};

// Given any Date, return the local-day [start, end] window.
const getLocalDayWindow = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// -------------------- CREATE --------------------

export const createCatalogue = async (req, res) => {
    try {
        const { title, closingDate } = req.body;

        if (!title || !closingDate) {
            return res.status(400).json({
                success: false,
                message: "Title and closing date are required",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Catalogue image is required",
            });
        }

        const parsedClosing = parseDateLocalNoon(closingDate);
        if (!parsedClosing) {
            return res.status(400).json({
                success: false,
                message: "Invalid closing date format",
            });
        }

        const upload = await uploadImageToCloudinary(
            req.file.buffer,
            "catalogue-images"
        );

        const catalogue = await Catalogue.create({
            title: title.trim(),
            closingDate: parsedClosing,
            image: {
                url: upload.secure_url,
                publicId: upload.public_id,
                filename: req.file.originalname,
            },
            createdBy: req.user?._id,
        });

        res.status(201).json({
            success: true,
            message: "Catalogue created successfully",
            data: { catalogue },
        });
    } catch (error) {
        console.error("Create catalogue error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while creating catalogue",
        });
    }
};

// -------------------- GET LIST --------------------
// status query: "upcoming" | "past" | undefined (all)

export const getCatalogues = async (req, res) => {
    try {
        const { status, search = "", page = 1, limit = 50 } = req.query;
        const now = new Date();

        const filter = {};
        if (status === "upcoming") filter.closingDate = { $gte: now };
        else if (status === "past") filter.closingDate = { $lt: now };

        if (search && search.trim()) {
            filter.title = { $regex: search.trim(), $options: "i" };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [catalogues, total] = await Promise.all([
            Catalogue.find(filter)
                .sort({ closingDate: status === "past" ? -1 : 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Catalogue.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                catalogues,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit) || 1,
                    totalCatalogues: total,
                    hasNextPage: skip + catalogues.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get catalogues error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching catalogues",
        });
    }
};

// -------------------- GET ONE --------------------

export const getCatalogue = async (req, res) => {
    try {
        const catalogue = await Catalogue.findById(req.params.id);
        if (!catalogue) {
            return res.status(404).json({
                success: false,
                message: "Catalogue not found",
            });
        }
        res.status(200).json({ success: true, data: { catalogue } });
    } catch (error) {
        console.error("Get catalogue error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching catalogue",
        });
    }
};

// -------------------- GET AUCTIONS IN A CATALOGUE --------------------
// Returns auctions whose endDate falls on the same local calendar day
// as the catalogue's closingDate. Response shape matches AuctionCard.

export const getCatalogueAuctions = async (req, res) => {
    try {
        const { id } = req.params;
        const { currency = "EUR", page = 1, limit = 12 } = req.query;

        const catalogue = await Catalogue.findById(id);
        if (!catalogue) {
            return res.status(404).json({
                success: false,
                message: "Catalogue not found",
            });
        }

        const { start, end } = getLocalDayWindow(catalogue.closingDate);

        const filter = {
            status: {
                $in: ["active", "approved", "ended", "sold", "reserve_not_met"],
            },
            endDate: { $gte: start, $lte: end },
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [auctions, total] = await Promise.all([
            Auction.find(filter)
                .populate("seller", "username companyName firstName lastName")
                .populate("currentBidder", "username companyName firstName")
                .sort({ endDate: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Auction.countDocuments(filter),
        ]);

        const auctionsWithConverted = auctions.map((auction) => {
            const auctionObj = auction.toObject();
            return {
                ...auctionObj,
                convertedStartPrice: convertPrice(auction, currency, "startPrice"),
                convertedCurrentPrice: convertPrice(
                    auction,
                    currency,
                    "currentPrice"
                ),
                convertedBidIncrement: convertPrice(
                    auction,
                    currency,
                    "bidIncrement"
                ),
                convertedBuyNowPrice: convertPrice(auction, currency, "buyNowPrice"),
                convertedReservePrice: convertPrice(
                    auction,
                    currency,
                    "reservePrice"
                ),
                convertedFinalPrice: convertPrice(auction, currency, "finalPrice"),
                displayCurrency: currency,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                catalogue,
                auctions: auctionsWithConverted,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit) || 1,
                    totalAuctions: total,
                    hasNextPage: skip + auctions.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get catalogue auctions error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching catalogue auctions",
        });
    }
};

// -------------------- DELETE --------------------

export const deleteCatalogue = async (req, res) => {
    try {
        const catalogue = await Catalogue.findById(req.params.id);
        if (!catalogue) {
            return res.status(404).json({
                success: false,
                message: "Catalogue not found",
            });
        }

        if (catalogue.image?.publicId) {
            await deleteFromCloudinary(catalogue.image.publicId);
        }

        await Catalogue.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Catalogue deleted successfully",
        });
    } catch (error) {
        console.error("Delete catalogue error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while deleting catalogue",
        });
    }
};