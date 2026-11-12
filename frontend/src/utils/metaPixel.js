// Meta Pixel + Conversions API events.
//
// Sends nothing unless the visitor accepted "Advertisement" cookies
// (index.html sets window.__rexbidMetaConsent from CookieYes).
// Each event goes to the browser Pixel and to our server
// (POST /api/v1/meta-events), which forwards it to Meta's Conversions API.
// Both copies share one eventID so Meta counts the event once.
//
// Standard events Meta can optimise for directly:
//   CompleteRegistration  any new account (content_category = user type)
//   Lead                  a listing was submitted
//   ViewContent           a listing page was viewed
// Custom events (use as Custom Conversions in Events Manager):
//   SellerSignUp          new seller or company account
//   ListingStart          a seller started the listing form
//   PlaceBid              a bid was accepted

const STANDARD = new Set(['CompleteRegistration', 'Lead', 'ViewContent']);
const PIXEL_ID = '1342628734664826';

// Dialling codes for turning local numbers (087..., 07...) into
// international format, which Meta needs for matching.
const DIAL_CODES = { IE: '353', GB: '44' };

// Meta click ID from an ad click (?fbclid=...). Kept in memory only (never
// stored on the device) and only sent once the visitor accepts advertising
// cookies, so a click is still credited if they register or bid later in
// the same visit.
let landingFbc;
try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) landingFbc = `fb.1.${Date.now()}.${fbclid}`;
} catch {
    // ignore
}

const readCookie = (name) => {
    const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : undefined;
};

const newEventId = () =>
    (window.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function hasMetaConsent() {
    return typeof window !== 'undefined' && window.__rexbidMetaConsent === true;
}

export function trackMeta(eventName, params = {}) {
    try {
        if (!hasMetaConsent()) return;
        const eventID = newEventId();

        if (typeof window.fbq === 'function') {
            window.fbq(STANDARD.has(eventName) ? 'track' : 'trackCustom', eventName, params, { eventID });
        }

        const base = import.meta.env.VITE_DOMAIN_URL || '';
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('accessToken');
        if (token) headers.Authorization = `Bearer ${token}`;

        fetch(`${base}/api/v1/meta-events`, {
            method: 'POST',
            headers,
            keepalive: true,
            body: JSON.stringify({
                event_name: eventName,
                event_id: eventID,
                event_source_url: window.location.href,
                fbp: readCookie('_fbp'),
                fbc: readCookie('_fbc') || landingFbc,
                custom_data: params,
            }),
        }).catch(() => {});
    } catch {
        // Tracking must never break the page.
    }
}

// New account. Sellers and companies also get SellerSignUp, so seller
// campaigns can optimise for real sellers rather than any sign-up.
// Meta asks for value + currency on CompleteRegistration (Events Manager
// diagnostics); a sign-up has no money value, so value is 0.
export function trackMetaRegistration(userType, currency) {
    const cur = currency === 'GBP' ? 'GBP' : 'EUR';
    trackMeta('CompleteRegistration', { content_category: userType || 'bidder', value: 0, currency: cur });
    if (userType === 'seller' || userType === 'company') {
        trackMeta('SellerSignUp', { content_category: userType, value: 0, currency: cur });
    }
}

// ---- Advanced matching (signed-in visitors) ------------------------------
// Gives the Pixel the signed-in visitor's details so Meta can match their
// events to a Meta account. The Pixel hashes these in the browser before
// sending; the account ID is hashed here so it matches the server copy.

const letters = (v) =>
    typeof v === 'string'
        ? v.normalize('NFKC').toLowerCase().replace(/[^\p{L}]/gu, '') || undefined
        : undefined;

export function normaliseMetaPhone(phone, countryCode) {
    if (typeof phone !== 'string' && typeof phone !== 'number') return undefined;
    let d = String(phone).trim();
    if (!d) return undefined;
    const intl = d.startsWith('+') || d.startsWith('00');
    d = d.replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    else if (!intl && d.startsWith('0')) {
        const dial = DIAL_CODES[String(countryCode || 'IE').toUpperCase()];
        if (!dial) return undefined;
        d = dial + d.slice(1);
    }
    return d.length >= 8 ? d : undefined;
}

const sha256Hex = async (text) => {
    if (!window.crypto?.subtle) return undefined;
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export async function buildMetaMatchData(user) {
    if (!user) return {};
    const data = {};
    const em = typeof user.email === 'string' && user.email.includes('@') ? user.email.trim().toLowerCase() : undefined;
    if (em) data.em = em;
    const ph = normaliseMetaPhone(user.phone || user.phoneNumber, user.countryCode);
    if (ph) data.ph = ph;
    const fn = letters(user.firstName);
    if (fn) data.fn = fn;
    const ln = letters(user.lastName);
    if (ln) data.ln = ln;
    if (typeof user.countryCode === 'string' && /^[a-z]{2}$/i.test(user.countryCode)) {
        data.country = user.countryCode.toLowerCase();
    }
    if (user._id) {
        const id = await sha256Hex(String(user._id));
        if (id) data.external_id = id;
    }
    return data;
}

// Called by AuthContext whenever the signed-in user changes. index.html
// reads window.__rexbidMetaUser when it starts the Pixel after consent; if
// the Pixel is already running, it is re-initialised with the details.
export async function syncMetaUser(user) {
    try {
        const data = await buildMetaMatchData(user);
        window.__rexbidMetaUser = data;
        if (hasMetaConsent() && typeof window.fbq === 'function' && Object.keys(data).length) {
            window.fbq('init', PIXEL_ID, data);
        }
    } catch {
        // Tracking must never break the page.
    }
}
