// Meta Conversions API (server-side copy of Meta Pixel events).
//
// The browser fires each Meta event with an eventID and, only when the
// visitor has accepted advertising cookies, also posts it to
// POST /api/v1/meta-events. That endpoint passes it on to Meta from the
// server with the signed-in user's hashed email/phone, so events still count
// when ad blockers or browser privacy features drop the Pixel. Meta removes
// the duplicate using the shared event_id.
//
// Off unless both META_PIXEL_ID and META_CAPI_TOKEN are set on Render.
// META_TEST_EVENT_CODE (optional) sends events to Events Manager > Test events.

import axios from "axios";
import crypto from "crypto";

const GRAPH_VERSION = "v21.0";

// Only these events are accepted from the browser.
export const ALLOWED_META_EVENTS = new Set([
    "CompleteRegistration",
    "SellerSignUp",
    "Lead", // listing submitted
    "ListingStart",
    "PlaceBid",
    "ViewContent",
]);

const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");

export const normaliseEmail = (email) =>
    typeof email === "string" && email.includes("@") ? email.trim().toLowerCase() : null;

// Meta wants digits only, with country code. Irish numbers typed as 08x...
// become 3538x..., UK 07x... become 447x...
export const normalisePhone = (phone) => {
    if (typeof phone !== "string" && typeof phone !== "number") return null;
    let d = String(phone).replace(/[^\d+]/g, "");
    if (!d) return null;
    if (d.startsWith("+")) d = d.slice(1);
    else if (d.startsWith("00")) d = d.slice(2);
    else if (d.startsWith("08")) d = "353" + d.slice(1);
    else if (d.startsWith("07")) d = "44" + d.slice(1);
    d = d.replace(/\D/g, "");
    return d.length >= 8 ? d : null;
};

const cleanString = (v, max = 500) =>
    typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined;

// Keep only simple, expected custom_data fields from the browser.
export const cleanCustomData = (data) => {
    if (!data || typeof data !== "object") return undefined;
    const out = {};
    if (Number.isFinite(Number(data.value)) && data.value !== "" && data.value !== null) {
        out.value = Number(data.value);
    }
    if (["EUR", "GBP"].includes(data.currency)) out.currency = data.currency;
    const name = cleanString(data.content_name, 200);
    if (name) out.content_name = name;
    const cat = cleanString(data.content_category, 100);
    if (cat) out.content_category = cat;
    if (Array.isArray(data.content_ids)) {
        out.content_ids = data.content_ids.filter((x) => typeof x === "string").slice(0, 5);
        out.content_type = "product";
    }
    return Object.keys(out).length ? out : undefined;
};

/**
 * Build the Conversions API event. Pure, so it can be tested.
 */
export function buildMetaEvent({
    eventName,
    eventId,
    eventSourceUrl,
    fbp,
    fbc,
    ip,
    userAgent,
    user,
    customData,
    eventTime = Math.floor(Date.now() / 1000),
}) {
    const userData = {};
    const em = normaliseEmail(user?.email);
    if (em) userData.em = [sha256(em)];
    const ph = normalisePhone(user?.phone || user?.phoneNumber);
    if (ph) userData.ph = [sha256(ph)];
    if (user?._id) userData.external_id = [sha256(String(user._id))];
    if (cleanString(fbp, 200)) userData.fbp = fbp;
    if (cleanString(fbc, 300)) userData.fbc = fbc;
    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = String(userAgent).slice(0, 500);

    const event = {
        event_name: eventName,
        event_time: eventTime,
        action_source: "website",
        user_data: userData,
    };
    if (cleanString(eventId, 100)) event.event_id = eventId;
    const url = cleanString(eventSourceUrl, 1000);
    if (url && /^https:\/\/(www\.)?rexbid\.ie(\/|$)/.test(url)) event.event_source_url = url;
    const cd = cleanCustomData(customData);
    if (cd) event.custom_data = cd;
    return event;
}

/**
 * Send one event to Meta. Never throws: tracking must not break the site.
 */
export async function sendMetaEvent(args) {
    const pixelId = process.env.META_PIXEL_ID;
    const token = process.env.META_CAPI_TOKEN;
    if (!pixelId || !token) return { skipped: true };
    if (!ALLOWED_META_EVENTS.has(args?.eventName)) return { skipped: true };

    const body = { data: [buildMetaEvent(args)] };
    if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

    try {
        await axios.post(
            `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`,
            body,
            { params: { access_token: token }, timeout: 5000 }
        );
        return { sent: true };
    } catch (err) {
        console.error("[Meta CAPI] error:", err?.response?.data?.error?.message || err?.message);
        return { error: true };
    }
}
