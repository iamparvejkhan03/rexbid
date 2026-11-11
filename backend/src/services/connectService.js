import Stripe from "stripe";
import User from "../models/user.model.js";
import { regionForUser } from "../utils/region.js";

/**
 * Seller payouts go to Stripe Connect Express accounts (the same kind the team
 * has been creating by hand in the Stripe Dashboard). This links sellers to
 * their account, creates one when needed, and produces onboarding links.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || "https://rexbid.ie";

// Matches the settings of the accounts already created in the Dashboard.
const EXPRESS_CONTROLLER = {
    fees: { payer: "application" },
    losses: { payments: "application" },
    requirement_collection: "stripe",
    stripe_dashboard: { type: "express" },
};

export const dashboardFor = (user) => (user?.userType === "company" ? "company" : "seller");

export const payoutSetupUrl = (user) => `${FRONTEND_URL}/${dashboardFor(user)}/payout-methods?stripe=setup`;

export const statusFromAccount = (acct) => {
    const bank = acct?.external_accounts?.data?.find((b) => b.default_for_currency) || acct?.external_accounts?.data?.[0];
    const req = acct?.requirements || {};
    return {
        accountId: acct.id,
        payoutsEnabled: !!acct.payouts_enabled && acct.capabilities?.transfers === "active",
        detailsSubmitted: !!acct.details_submitted,
        requirementsDue: new Set([...(req.currently_due || []), ...(req.past_due || [])]).size,
        bankLast4: bank?.last4,
        bankName: bank?.bank_name,
        checkedAt: new Date(),
    };
};

/** "ready" | "incomplete" | "none" */
export const payoutState = (sc) => (!sc?.accountId ? "none" : sc.payoutsEnabled ? "ready" : "incomplete");

// All connected accounts by email, cached briefly (the API cannot search by email).
let accountCache = { at: 0, byEmail: new Map() };
const accountsByEmail = async () => {
    if (Date.now() - accountCache.at < 10 * 60 * 1000) return accountCache.byEmail;
    const byEmail = new Map();
    for await (const acct of stripe.accounts.list({ limit: 100 })) {
        const email = acct.email?.toLowerCase();
        if (!email) continue;
        // Prefer an account that can already receive payouts.
        const prev = byEmail.get(email);
        if (!prev || (!prev.payouts_enabled && acct.payouts_enabled)) byEmail.set(email, acct);
    }
    accountCache = { at: Date.now(), byEmail };
    return byEmail;
};

/**
 * Refreshes a seller's Connect status from Stripe. Sellers with no account on
 * file are matched to an existing connected account by email.
 */
export const refreshSellerConnect = async (userOrId) => {
    const user = typeof userOrId === "object" && userOrId?.save ? userOrId : await User.findById(userOrId?._id || userOrId);
    if (!user) return null;
    let acct = null;
    try {
        if (user.stripeConnect?.accountId) {
            acct = await stripe.accounts.retrieve(user.stripeConnect.accountId);
        } else if (user.email) {
            acct = (await accountsByEmail()).get(user.email.toLowerCase()) || null;
        }
    } catch (err) {
        console.error(`Stripe Connect lookup failed for user ${user._id}:`, err.message);
        return user.stripeConnect || null;
    }
    if (acct) {
        user.set("stripeConnect", statusFromAccount(acct));
    } else {
        user.set("stripeConnect.checkedAt", new Date());
    }
    await user.save({ validateBeforeSave: false });
    return user.stripeConnect;
};

/** Refreshes status only if it is older than maxAgeMs. */
export const ensureFreshConnect = async (user, maxAgeMs = 60 * 60 * 1000) => {
    const checked = user?.stripeConnect?.checkedAt ? new Date(user.stripeConnect.checkedAt).getTime() : 0;
    if (Date.now() - checked < maxAgeMs) return user.stripeConnect;
    return refreshSellerConnect(user);
};

/**
 * Pre-fills the seller's name so the account is recognisable in the Stripe
 * Dashboard straight away. The seller confirms or corrects it during setup.
 */
export const prefillFor = (user) => {
    const company = user.companyName?.trim();
    if (company) {
        return { business_type: "company", company: { name: company }, business_profile: { name: company } };
    }
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    if (first || last) {
        return {
            business_type: "individual",
            individual: { ...(first ? { first_name: first } : {}), ...(last ? { last_name: last } : {}), email: user.email },
            business_profile: { name: [first, last].filter(Boolean).join(" ") },
        };
    }
    return {};
};

/** Creates an Express account for the seller if they have none. */
export const ensureConnectAccount = async (user) => {
    await refreshSellerConnect(user);
    if (user.stripeConnect?.accountId) return user.stripeConnect.accountId;
    const region = regionForUser(user);
    const base = {
        country: region === "NI" || region === "GB" ? "GB" : "IE",
        email: user.email,
        controller: EXPRESS_CONTROLLER,
        capabilities: { transfers: { requested: true } },
        metadata: { userId: String(user._id), rexbidUsername: user.username || "" },
    };
    let acct;
    try {
        acct = await stripe.accounts.create({ ...base, ...prefillFor(user) }, { idempotencyKey: `connect-${user._id}-prefill` });
    } catch (err) {
        // Never block setup over the pre-filled name; the seller enters it anyway.
        if (err?.type !== "StripeInvalidRequestError") throw err;
        console.warn(`Stripe rejected pre-filled details for ${user._id} (${err.message}); creating without them`);
        acct = await stripe.accounts.create(base, { idempotencyKey: `connect-${user._id}-plain` });
    }
    user.set("stripeConnect", statusFromAccount(acct));
    await user.save({ validateBeforeSave: false });
    accountCache.at = 0;
    return acct.id;
};

/** One-time Stripe link where the seller enters their details and bank account. */
export const createOnboardingLink = async (user) => {
    const accountId = await ensureConnectAccount(user);
    const base = `${FRONTEND_URL}/${dashboardFor(user)}/payout-methods`;
    const link = await stripe.accountLinks.create({
        account: accountId,
        type: "account_onboarding",
        refresh_url: `${base}?stripe=setup`,
        return_url: `${base}?stripe=return`,
    });
    return link.url;
};

/** Link to the seller's own Stripe Express dashboard (to change bank details). */
export const createDashboardLink = async (user) => {
    if (!user.stripeConnect?.accountId) throw Object.assign(new Error("No payout account yet"), { status: 400 });
    const link = await stripe.accounts.createLoginLink(user.stripeConnect.accountId);
    return link.url;
};
