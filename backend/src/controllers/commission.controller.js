import Commission from "../models/commission.model.js";
import { clearCommissionCache } from "../utils/commissionCalculator.js";

// ─── Tier validation ───────────────────────────────────────
const validateTiers = (tiers, label) => {
    if (!Array.isArray(tiers) || tiers.length === 0) {
        return `${label} tiers must have at least one tier`;
    }

    if (Number(tiers[0].from) !== 0) {
        return `${label} tiers must start at 0`;
    }

    for (let i = 0; i < tiers.length; i++) {
        const t = tiers[i];
        const from = Number(t.from);
        const value = Number(t.value);

        if (Number.isNaN(from) || from < 0) {
            return `${label} tier ${i + 1}: "from" must be a non-negative number`;
        }
        if (Number.isNaN(value) || value < 0 || value > 100) {
            return `${label} tier ${i + 1}: "value" must be between 0 and 100`;
        }

        const hasTo = t.to !== null && t.to !== undefined;
        if (hasTo) {
            const to = Number(t.to);
            if (Number.isNaN(to) || to <= from) {
                return `${label} tier ${i + 1}: "to" must be greater than "from"`;
            }
        }

        // Only the last tier can be open-ended
        if (i < tiers.length - 1 && !hasTo) {
            return `${label} tier ${i + 1}: only the last tier can be open-ended`;
        }

        // Contiguity check
        if (i < tiers.length - 1) {
            const nextFrom = Number(tiers[i + 1].from);
            if (Number(t.to) !== nextFrom) {
                return `${label} tiers must be contiguous — gap or overlap between tier ${i + 1} and ${i + 2}`;
            }
        }
    }

    return null;
};

const sanitiseTiers = (tiers) =>
    (tiers || []).map((t) => ({
        from: Number(t.from),
        to: t.to === null || t.to === undefined || t.to === "" ? null : Number(t.to),
        value: Number(t.value),
    }));

// ─── Get commission settings ───────────────────────────────
export const getCommissions = async (req, res) => {
    try {
        let commission = await Commission.findOne();

        // Seed if missing
        if (!commission) {
            commission = await Commission.create({
                isEnabled: true,
                appliesTo: ["seller"],
                sellerTiers: [{ from: 0, to: null, value: 5 }],
                bidderTiers: [{ from: 0, to: null, value: 5 }],
                maxCommissionAmount: null,
                maxCommissionCurrency: "EUR",
                updatedBy: req.user?._id,
            });
        } else {
            // Legacy → tiered migration (one-time, on read)
            let needsSave = false;

            if (!commission.sellerTiers || commission.sellerTiers.length === 0) {
                const legacyValue = commission.commissionValue || 5;
                commission.sellerTiers = [{ from: 0, to: null, value: legacyValue }];
                needsSave = true;
            }
            if (!commission.bidderTiers || commission.bidderTiers.length === 0) {
                const legacyValue = commission.commissionValue || 5;
                commission.bidderTiers = [{ from: 0, to: null, value: legacyValue }];
                needsSave = true;
            }

            if (needsSave) await commission.save();
        }

        res.status(200).json({
            success: true,
            data: { commission },
        });
    } catch (error) {
        console.error("Get commission error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching commission settings",
        });
    }
};

// ─── Update commission settings ────────────────────────────
export const updateCommission = async (req, res) => {
    try {
        const {
            sellerTiers,
            bidderTiers,
            isEnabled,
            appliesTo,
            maxCommissionAmount,
            maxCommissionCurrency,
        } = req.body;

        // appliesTo
        if (!Array.isArray(appliesTo) || appliesTo.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Commission must apply to at least one party (seller or bidder)",
            });
        }
        if (!appliesTo.every((p) => ["seller", "bidder"].includes(p))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid party in appliesTo. Must be "seller" or "bidder"',
            });
        }

        // Tiers
        const cleanSellerTiers = sanitiseTiers(sellerTiers);
        const cleanBidderTiers = sanitiseTiers(bidderTiers);

        const sellerErr = validateTiers(cleanSellerTiers, "Seller");
        if (sellerErr) {
            return res.status(400).json({ success: false, message: sellerErr });
        }
        const bidderErr = validateTiers(cleanBidderTiers, "Bidder");
        if (bidderErr) {
            return res.status(400).json({ success: false, message: bidderErr });
        }

        // Cap
        if (
            maxCommissionAmount !== undefined &&
            maxCommissionAmount !== null &&
            maxCommissionAmount !== ""
        ) {
            const cap = Number(maxCommissionAmount);
            if (Number.isNaN(cap) || cap < 0) {
                return res.status(400).json({
                    success: false,
                    message: "maxCommissionAmount must be a non-negative number or empty for no cap",
                });
            }
        }

        if (
            maxCommissionCurrency !== undefined &&
            !["EUR", "GBP"].includes(maxCommissionCurrency)
        ) {
            return res.status(400).json({
                success: false,
                message: 'maxCommissionCurrency must be either "EUR" or "GBP"',
            });
        }

        // Apply
        let commission = await Commission.findOne();

        const payload = {
            sellerTiers: cleanSellerTiers,
            bidderTiers: cleanBidderTiers,
            isEnabled: isEnabled !== undefined ? isEnabled : true,
            appliesTo,
            maxCommissionAmount:
                maxCommissionAmount === "" || maxCommissionAmount === undefined
                    ? null
                    : maxCommissionAmount === null
                        ? null
                        : Number(maxCommissionAmount),
            maxCommissionCurrency: maxCommissionCurrency || "EUR",
            updatedBy: req.user._id,
        };

        if (commission) {
            Object.assign(commission, payload);
            await commission.save();
        } else {
            commission = await Commission.create(payload);
        }

        clearCommissionCache();

        res.status(200).json({
            success: true,
            message: "Commission settings updated successfully",
            data: { commission },
        });
    } catch (error) {
        console.error("Update commission error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating commission settings",
        });
    }
};