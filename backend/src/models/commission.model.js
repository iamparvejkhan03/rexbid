import { Schema, model } from 'mongoose';

const tierSchema = new Schema(
    {
        from: { type: Number, required: true, min: 0 },
        to: { type: Number, default: null }, // null = open-ended (last tier only)
        value: { type: Number, required: true, min: 0, max: 100 }, // percentage
    },
    { _id: false }
);

const commissionSchema = new Schema(
    {
        // Tiered commissions — independent lists for each party
        sellerTiers: { type: [tierSchema], default: [] },
        bidderTiers: { type: [tierSchema], default: [] },

        isEnabled: { type: Boolean, default: true },
        appliesTo: {
            type: [String],
            enum: ['seller', 'bidder'],
            default: ['seller'],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: 'Commission must apply to at least one party',
            },
        },

        // Optional overall cap on tier-sum (per party, base commission only).
        // Featured premium (3%) is always added on top, uncapped.
        maxCommissionAmount: { type: Number, default: null, min: 0 },
        maxCommissionCurrency: {
            type: String,
            enum: ['EUR', 'GBP'],
            default: 'EUR',
        },

        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

        // ── Legacy (deprecated) — used only for migration ──
        commissionType: {
            type: String,
            enum: ['fixed', 'percentage', null],
            default: null,
        },
        commissionValue: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Ensure only one commission document exists
commissionSchema.pre('save', async function (next) {
    const count = await this.constructor.countDocuments();
    if (count > 0 && this.isNew) {
        throw new Error('Only one commission setting can exist');
    }
    next();
});

const Commission = model('Commission', commissionSchema);
export default Commission;