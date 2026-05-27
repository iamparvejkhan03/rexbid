import { Schema, model } from 'mongoose';

const bidPaymentSchema = new Schema({
    auction: {
        type: Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    bidder: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    commissionAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentIntentId: {
        type: String,
        required: false  // CHANGED: false for bank transfers
    },
    clientSecret: {
        type: String,
        required: false  // CHANGED: false for bank transfers
    },
    status: {
        type: String,
        enum: ['created', 'succeeded', 'requires_capture', 'canceled', 'processing_failed', 'pending', 'processing'],  // ADDED: 'pending', 'processing'
        default: 'created'
    },
    chargeAttempted: {
        type: Boolean,
        default: false
    },
    chargeSucceeded: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['bid_authorization', 'final_commission', 'seller_commission_payment', 'bid_deposit', 'checkout_payment', 'bank_transfer_payment'], 
        default: 'bid_authorization'
    },
    commissionRate: {
        type: Number,
        required: false
    },
    commissionType: {
        type: String,
        enum: ['5%_capped', '3%_uncapped'],
        required: false
    },
    paymentMethod: {  // ADDED: new field to track payment method
        type: String,
        enum: ['credit_card', 'bank_transfer', null],
        default: null
    }
}, {
    timestamps: true
});

bidPaymentSchema.index({ auction: 1, bidder: 1 });
bidPaymentSchema.index({ paymentIntentId: 1 });
bidPaymentSchema.index({ status: 1 });

const BidPayment = model('BidPayment', bidPaymentSchema);

export default BidPayment;