import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
    // Reference to the auction
    auction: {
        type: Schema.Types.ObjectId,
        ref: 'Auction',
        required: true,
        index: true
    },

    // Reference to the user who commented
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // User info for quick access (denormalized)
    userName: {
        type: String,
        required: true
    },
    userAvatar: {
        type: String,
        default: ''
    },

    // Comment content
    content: {
        type: String,
        required: true,
        trim: true
    },
    contentHtml: {
        type: String, // For rich text formatting
        required: true
    },
    // Add to commentSchema
    adminDeleteReason: {
        type: String
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // Parent comment for replies (null for top-level comments)
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },

    // Questions & Answers (Nov 2026). Top-level comments are questions and
    // replies are answers. Only the seller (or RexBid) can answer.
    authorRole: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer'
    },
    // Public name shown on the listing (first name, or company name in full).
    displayName: {
        type: String,
        default: ''
    },
    // Where an answer came from: the website or a text-message reply.
    answerSource: {
        type: String,
        enum: ['web', 'sms', null],
        default: null
    },
    // Set on a question once the seller has been texted about it, so a text
    // reply from that number can be matched back to this question.
    sms: {
        notifiedTo: { type: String },
        notifiedAt: { type: Date },
        messageSid: { type: String }
    },
    // Set on a question once it has at least one answer.
    answeredAt: {
        type: Date,
        default: null
    },

    // Likes system (shown as "Helpful" on questions)
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Comment status
    status: {
        type: String,
        enum: ['active', 'deleted', 'flagged'],
        default: 'active'
    },

    // Flags for moderation
    flags: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        flaggedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
commentSchema.index({ auction: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ 'likes.user': 1 });
commentSchema.index({ 'sms.notifiedTo': 1, 'sms.notifiedAt': -1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});

// Method to check if user liked the comment
commentSchema.methods.isLikedByUser = function (userId) {
    return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to add a like
commentSchema.methods.addLike = function (userId) {
    if (!this.isLikedByUser(userId)) {
        this.likes.push({ user: userId });
        return true;
    }
    return false;
};

// Method to remove a like
commentSchema.methods.removeLike = function (userId) {
    const initialLength = this.likes.length;
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    return this.likes.length !== initialLength;
};

// Static method to get comments for an auction with pagination
commentSchema.statics.getCommentsForAuction = function (auctionId, page = 1, limit = 10, parentCommentId = null) {
    const skip = (page - 1) * limit;

    return this.find({
        auction: auctionId,
        parentComment: parentCommentId,
        status: 'active'
    })
        .populate('user', 'username companyName firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

const Comment = model('Comment', commentSchema);

export default Comment;