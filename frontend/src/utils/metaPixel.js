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
                fbc: readCookie('_fbc'),
                custom_data: params,
            }),
        }).catch(() => {});
    } catch {
        // Tracking must never break the page.
    }
}

// New account. Sellers and companies also get SellerSignUp, so seller
// campaigns can optimise for real sellers rather than any sign-up.
export function trackMetaRegistration(userType) {
    trackMeta('CompleteRegistration', { content_category: userType || 'bidder' });
    if (userType === 'seller' || userType === 'company') {
        trackMeta('SellerSignUp', { content_category: userType });
    }
}
