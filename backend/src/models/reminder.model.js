import { Schema, model } from 'mongoose';
import crypto from 'crypto';

const reminderSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [1, 'Name must be at least 1 character'],
            maxlength: [100, 'Name must be at most 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        auction: {
            type: Schema.Types.ObjectId,
            ref: 'Auction',
            required: true,
        },

        // ── Notification state (per reminder) ──
        sent: { type: Boolean, default: false },
        sentAt: { type: Date, default: null },

        // ── Opt-out state ──
        unsubscribed: { type: Boolean, default: false },
        unsubscribedAt: { type: Date, default: null },
        unsubscribeToken: {
            type: String,
            unique: true,
            required: true,
            default: () => crypto.randomBytes(32).toString('hex'),
        },

        // ── Light audit trail (useful for spotting bot/spam signups) ──
        ipAddress: { type: String, default: null },
        userAgent: { type: String, default: null },
    },
    { timestamps: true }
);

// Prevent duplicate (email, auction) pairs
reminderSchema.index({ email: 1, auction: 1 }, { unique: true });

// For the 2-hour ending notification sweep
reminderSchema.index({ auction: 1, sent: 1, unsubscribed: 1 });

// For admin grouped view (sort by most recent per email)
reminderSchema.index({ email: 1, createdAt: -1 });

// For admin text search on name/email
reminderSchema.index({ name: 'text', email: 'text' });

const Reminder = model('Reminder', reminderSchema);

export default Reminder;