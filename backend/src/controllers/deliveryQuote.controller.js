import DeliveryQuoteRequest from "../models/deliveryQuoteRequest.model.js";
import {
    deliveryQuoteAdminEmail,
    deliveryQuoteUserEmail,
} from "../utils/nodemailer.js";

// ============================================================
// Submit delivery quote request (public)
// ============================================================
export const submitDeliveryQuote = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            subject,
            message,
            auctionId,
            auctionTitle,
        } = req.body;

        // Validate
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and delivery details are required.",
            });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const finalSubject =
            subject?.trim() || `New Delivery Quote Request - ${name}`;

        // Save to DB
        const quoteRequest = await DeliveryQuoteRequest.create({
            name,
            email,
            phone: phone || "",
            subject: finalSubject,
            message,
            auction: auctionId || null,
            auctionTitle: auctionTitle || "",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        });

        // Fire emails in background (don't block response)
        deliveryQuoteAdminEmail({
            name,
            email,
            phone: phone || "",
            subject: finalSubject,
            message,
            auctionTitle: auctionTitle || "",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        }).catch((err) =>
            console.error("Admin delivery quote email error:", err)
        );

        deliveryQuoteUserEmail({ name, email }).catch((err) =>
            console.error("User confirmation email error:", err)
        );

        return res.status(201).json({
            success: true,
            message:
                "Your delivery quote request has been sent successfully. Our partner team will get back to you within 24 hours.",
            data: {
                requestId: quoteRequest._id,
                request: quoteRequest,
            },
        });
    } catch (error) {
        console.error("Submit delivery quote error:", error);
        return res.status(500).json({
            success: false,
            message:
                "Internal server error while submitting your quote request.",
        });
    }
};

// ============================================================
// Get all delivery quote requests (admin)
// ============================================================
export const getDeliveryQuotes = async (req, res) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 20,
            auctionId,
        } = req.query;

        const query = {};
        if (status) query.status = status;
        if (auctionId) query.auction = auctionId;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { auctionTitle: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [quotes, total] = await Promise.all([
            DeliveryQuoteRequest.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("auction", "title photos auctionType"),
            DeliveryQuoteRequest.countDocuments(query),
        ]);

        return res.json({
            success: true,
            data: {
                quotes,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error("Get delivery quotes error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch delivery quote requests.",
        });
    }
};

// ============================================================
// Get single delivery quote request (admin)
// ============================================================
export const getDeliveryQuoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await DeliveryQuoteRequest.findById(id).populate(
            "auction",
            "title photos auctionType seller"
        );

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote request not found.",
            });
        }

        return res.json({ success: true, data: quote });
    } catch (error) {
        console.error("Get delivery quote error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch quote request.",
        });
    }
};

// ============================================================
// Update status / admin notes (admin)
// ============================================================
export const updateDeliveryQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const validStatuses = [
            "pending",
            "contacted",
            "quoted",
            "completed",
            "cancelled",
        ];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value.",
            });
        }

        const updates = {};
        if (status) updates.status = status;
        if (adminNotes !== undefined) updates.adminNotes = adminNotes;

        const quote = await DeliveryQuoteRequest.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote request not found.",
            });
        }

        return res.json({
            success: true,
            message: "Quote request updated successfully.",
            data: quote,
        });
    } catch (error) {
        console.error("Update delivery quote error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update quote request.",
        });
    }
};

// ============================================================
// Delete a delivery quote request (admin)
// ============================================================
export const deleteDeliveryQuote = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await DeliveryQuoteRequest.findByIdAndDelete(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote request not found.",
            });
        }

        return res.json({
            success: true,
            message: "Quote request deleted successfully.",
        });
    } catch (error) {
        console.error("Delete delivery quote error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete quote request.",
        });
    }
};

// ============================================================
// Stats (admin dashboard)
// ============================================================
export const getDeliveryQuoteStats = async (req, res) => {
    try {
        const stats = await DeliveryQuoteRequest.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const formatted = {
            pending: 0,
            contacted: 0,
            quoted: 0,
            completed: 0,
            cancelled: 0,
            total: 0,
        };

        stats.forEach((s) => {
            formatted[s._id] = s.count;
            formatted.total += s.count;
        });

        // Last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        formatted.recent7Days = await DeliveryQuoteRequest.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
        });

        return res.json({ success: true, data: formatted });
    } catch (error) {
        console.error("Get delivery quote stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stats.",
        });
    }
};