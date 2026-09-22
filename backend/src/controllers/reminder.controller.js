import mongoose from 'mongoose';
import Reminder from '../models/reminder.model.js';
import Auction from '../models/auction.model.js';

// ── helpers ─────────────────────────────────────────────
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// ============================================================
// PUBLIC — Set (or re-activate) a reminder
// POST /api/v1/reminders
// body: { name, email, auctionId }
// ============================================================
export const setReminder = async (req, res) => {
    try {
        const { name, email, auctionId } = req.body;

        if (!name?.trim() || !email?.trim() || !auctionId) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and auctionId are required',
            });
        }

        const normalizedEmail = normalizeEmail(email);

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
        }

        // Auction must exist and be open
        const auction = await Auction.findById(auctionId).select(
            'title endDate status auctionType'
        );

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found',
            });
        }

        if (!['active', 'approved'].includes(auction.status)) {
            return res.status(400).json({
                success: false,
                message: 'This auction is not open for reminders',
            });
        }

        if (new Date() >= new Date(auction.endDate)) {
            return res.status(400).json({
                success: false,
                message: 'This auction has already ended',
            });
        }

        // Upsert — one doc per (email, auction). Re-activate if it existed.
        const reminder = await Reminder.findOneAndUpdate(
            { email: normalizedEmail, auction: auctionId },
            {
                $set: {
                    name: name.trim().substring(0, 100),
                    unsubscribed: false,
                    unsubscribedAt: null,
                    ipAddress: req.ip || null,
                    userAgent: req.get('user-agent') || null,
                },
                $setOnInsert: {
                    email: normalizedEmail,
                    auction: auctionId,
                    sent: false,
                    sentAt: null,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        // Optional: send a confirmation email here later.
        // We intentionally do NOT reveal whether the email was already in the DB
        // — the response is identical for new and existing reminders.

        return res.status(200).json({
            success: true,
            message:
                "Reminder set. We'll email you before this auction ends.",
            data: {
                reminder: {
                    id: reminder._id,
                    name: reminder.name,
                    email: reminder.email,
                    auction: auction.title,
                    endsAt: auction.endDate,
                },
            },
        });
    } catch (error) {
        console.error('Set reminder error:', error);

        // Race-condition duplicate: treat as success
        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                message:
                    "Reminder set. We'll email you before this auction ends.",
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to set reminder. Please try again.',
        });
    }
};

// ============================================================
// PUBLIC — Unsubscribe via token
// GET /api/v1/reminders/unsubscribe/:token
// ============================================================
export const unsubscribeReminder = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res
                .status(400)
                .json({ success: false, message: 'Token is required' });
        }

        const reminder = await Reminder.findOne({ unsubscribeToken: token });
        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired unsubscribe link',
            });
        }

        reminder.unsubscribed = true;
        reminder.unsubscribedAt = new Date();
        await reminder.save();

        return res.status(200).json({
            success: true,
            message: "You've been unsubscribed from this reminder.",
        });
    } catch (error) {
        console.error('Unsubscribe reminder error:', error);
        return res
            .status(500)
            .json({ success: false, message: 'Failed to unsubscribe' });
    }
};

// ============================================================
// PUBLIC — Check if an email already has a reminder on this auction
// GET /api/v1/reminders/status/:auctionId?email=...
// Used to render the "already set" state on the button.
// ============================================================
export const getReminderStatus = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { email } = req.query;

        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: 'Email is required' });
        }

        const reminder = await Reminder.findOne({
            email: normalizeEmail(email),
            auction: auctionId,
            unsubscribed: false,
        }).select('_id');

        return res.status(200).json({
            success: true,
            data: { hasReminder: !!reminder },
        });
    } catch (error) {
        console.error('Get reminder status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check reminder status',
        });
    }
};

// ============================================================
// ADMIN — Grouped by email (one row per unique email)
// GET /api/v1/reminders/admin/grouped?page=1&limit=10&search=&auctionId=&status=
// ============================================================
export const getGroupedReminders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            auctionId = '',
            status = '',
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * pageLimit;

        // ── Build $match from query params ──
        const matchFilter = {};

        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            matchFilter.$or = [{ name: regex }, { email: regex }];
        }
        if (auctionId) {
            matchFilter.auction = new mongoose.Types.ObjectId(auctionId);
        }
        if (status === 'sent') {
            matchFilter.sent = true;
        } else if (status === 'pending') {
            matchFilter.sent = false;
            matchFilter.unsubscribed = false;
        } else if (status === 'unsubscribed') {
            matchFilter.unsubscribed = true;
        }

        const pipeline = [
            ...(Object.keys(matchFilter).length ? [{ $match: matchFilter }] : []),
            // Newest first so $first picks the most recent name
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$email',
                    name: { $first: '$name' },
                    latestAt: { $first: '$createdAt' },
                    remindersCount: { $sum: 1 },
                    auctions: {
                        $push: {
                            reminderId: '$_id',
                            auction: '$auction',
                            sent: '$sent',
                            unsubscribed: '$unsubscribed',
                            createdAt: '$createdAt',
                        },
                    },
                },
            },
            { $sort: { latestAt: -1 } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: pageLimit }],
                    totalCount: [{ $count: 'count' }],
                },
            },
        ];

        const results = await Reminder.aggregate(pipeline);
        const grouped = results[0]?.data || [];
        const totalItems = results[0]?.totalCount?.[0]?.count || 0;
        const totalPages = Math.ceil(totalItems / pageLimit);

        // ── One query to hydrate all auction references on this page ──
        const allAuctionIds = grouped.flatMap((g) =>
            g.auctions.map((a) => a.auction)
        );

        const auctions = allAuctionIds.length
            ? await Auction.find(
                { _id: { $in: allAuctionIds } },
                'title endDate status photos'
            )
            : [];

        const auctionMap = new Map(
            auctions.map((a) => [a._id.toString(), a])
        );

        // Cap auctions per user so a bot with 500 reminders doesn't blow up the payload
        const MAX_AUCTIONS_PER_USER = 10;

        const users = grouped.map((g) => {
            const sliced = g.auctions.slice(0, MAX_AUCTIONS_PER_USER);
            return {
                email: g._id,
                name: g.name,
                remindersCount: g.remindersCount,
                latestAt: g.latestAt,
                hasMoreAuctions: g.auctions.length > MAX_AUCTIONS_PER_USER,
                auctions: sliced.map((a) => {
                    const doc = auctionMap.get(a.auction.toString());
                    return {
                        reminderId: a.reminderId,
                        auctionId: a.auction,
                        title: doc?.title || 'Deleted auction',
                        endDate: doc?.endDate || null,
                        status: doc?.status || 'unknown',
                        sent: a.sent,
                        unsubscribed: a.unsubscribed,
                        remindedAt: a.createdAt,
                    };
                }),
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems,
                    itemsPerPage: pageLimit,
                },
            },
        });
    } catch (error) {
        console.error('Get grouped reminders error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reminders',
        });
    }
};

// ============================================================
// ADMIN — Flat list (one row per reminder, useful for export/debug)
// GET /api/v1/reminders/admin/flat
// ============================================================
export const getFlatReminders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            auctionId = '',
            status = '',
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const pageLimit = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * pageLimit;

        const filter = {};
        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ name: regex }, { email: regex }];
        }
        if (auctionId) filter.auction = auctionId;
        if (status === 'sent') filter.sent = true;
        else if (status === 'pending') {
            filter.sent = false;
            filter.unsubscribed = false;
        } else if (status === 'unsubscribed') filter.unsubscribed = true;

        const [reminders, total] = await Promise.all([
            Reminder.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit)
                .populate('auction', 'title endDate status'),
            Reminder.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                reminders,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / pageLimit),
                    totalItems: total,
                    itemsPerPage: pageLimit,
                },
            },
        });
    } catch (error) {
        console.error('Get flat reminders error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reminders',
        });
    }
};

// ============================================================
// ADMIN — Delete every reminder for an email (GDPR / spam cleanup)
// DELETE /api/v1/reminders/admin/email/:email
// ============================================================
export const deleteRemindersByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: 'Email is required' });
        }

        const normalizedEmail = normalizeEmail(email);
        const result = await Reminder.deleteMany({ email: normalizedEmail });

        return res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} reminder(s) for ${normalizedEmail}`,
            data: { deletedCount: result.deletedCount },
        });
    } catch (error) {
        console.error('Delete reminders by email error:', error);
        return res
            .status(500)
            .json({ success: false, message: 'Failed to delete reminders' });
    }
};

// ============================================================
// ADMIN — Delete a single reminder
// DELETE /api/v1/reminders/admin/:id
// ============================================================
export const deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Reminder.findByIdAndDelete(id);
        if (!deleted) {
            return res
                .status(404)
                .json({ success: false, message: 'Reminder not found' });
        }
        return res
            .status(200)
            .json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        console.error('Delete reminder error:', error);
        return res
            .status(500)
            .json({ success: false, message: 'Failed to delete reminder' });
    }
};