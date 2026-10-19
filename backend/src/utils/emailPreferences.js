import User from "../models/user.model.js";

/**
 * Emails that must ALWAYS be sent regardless of user preferences.
 * These are account-critical (security, payments, invoices, legal,
 * contract/negotiation outcomes, seller-facing listing status).
 */
export const TRANSACTIONAL_EMAILS = new Set([
    // Account / security
    "welcome",
    "resetPassword",
    "accountApproved",
    "newUserRegistration",     // to admin
    "contact",                 // to admin
    "contactConfirmation",     // to the user (acknowledgement)

    // Payments / payouts / invoices
    "paymentCompleted",
    "paymentSuccess",
    "paymentCompletedSeller",
    "payoutInitiated",
    "payoutCompleted",
    "payoutFailed",
    "sendAuctionWon",          // invoice to winner

    // Offer / negotiation outcomes
    "offerAccepted",
    "offerRejected",
    "offerCanceled",
    "offerCountered",
    "buyerCountered",
    "counterOfferRejected",

    // Listing lifecycle (to seller about their own listing)
    "auctionSubmittedForApproval",
    "auctionApproved",
    "auctionListed",
    "sendAuctionEndedSeller",

    // Admin / system
    "auctionWonAdmin",
    "auctionEndedAdmin",
    "flaggedCommentAdmin",
    "deliveryQuoteAdmin",
    "deliveryQuoteUser",

    // Giveaway win (must notify winner to claim)
    "giveawayWinner",
]);

/**
 * Sync check — call when you already have a user object in hand.
 * Returns true if the email should be sent.
 */
export const canEmailUser = (user, emailType = "notification") => {
    if (!user) return false;

    // Transactional / security — always send
    if (TRANSACTIONAL_EMAILS.has(emailType)) return true;

    // Admins always get system emails
    if (user.userType === "admin") return true;

    // Master switch — default true if field is missing
    return user.preferences?.emailUpdates !== false;
};

/**
 * Async check — call when you only have an email string.
 * Looks up the user; if the recipient is the system/admin address,
 * we treat it as a system recipient and always send.
 */
export const canSendEmail = async (email, emailType = "notification") => {
    if (!email) return false;

    // System / admin recipient — always send
    const systemEmail = process.env.EMAIL_USER?.toLowerCase();
    if (systemEmail && email.toLowerCase() === systemEmail) return true;

    // Transactional — always send
    if (TRANSACTIONAL_EMAILS.has(emailType)) return true;

    const user = await User.findOne({ email: email.toLowerCase() })
        .select("preferences userType")
        .lean();

    if (!user) return false;
    if (user.userType === "admin") return true;

    return user.preferences?.emailUpdates !== false;
};