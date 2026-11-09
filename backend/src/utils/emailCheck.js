// Email address checks: spot common typos (gmail.vom, hotmial.com ...) and
// domains that can't receive email (no mail server).
import dns from "node:dns/promises";

// Popular mail domains for Irish / UK users. Typos close to one of these
// get a suggested fix.
export const COMMON_DOMAINS = [
    "gmail.com",
    "googlemail.com",
    "hotmail.com",
    "hotmail.co.uk",
    "hotmail.ie",
    "outlook.com",
    "outlook.ie",
    "live.com",
    "live.ie",
    "live.co.uk",
    "yahoo.com",
    "yahoo.co.uk",
    "yahoo.ie",
    "icloud.com",
    "me.com",
    "eircom.net",
    "aol.com",
    "msn.com",
];

// Edit distance (insert / delete / replace / swap neighbours).
const distance = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
            }
        }
    }
    return d[a.length][b.length];
};

export const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Corrected address if the domain looks like a typo of a common one, else null. */
export const suggestEmailFix = (email) => {
    if (!email || !EMAIL_FORMAT.test(email)) return null;
    const [local, rawDomain] = email.trim().toLowerCase().split("@");
    const domain = rawDomain.replace(/\.+$/, "");
    if (COMMON_DOMAINS.includes(domain)) return null;
    let best = null;
    let bestDist = Infinity;
    for (const c of COMMON_DOMAINS) {
        const dist = distance(domain, c);
        if (dist < bestDist) {
            best = c;
            bestDist = dist;
        }
    }
    // Close enough to be a typo (1-2 letters off), but not a different real domain.
    return bestDist > 0 && bestDist <= 2 ? `${local}@${best}` : null;
};

const mxCache = new Map(); // domain -> { ok, at }
const MX_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Can this domain receive email? true / false, or null if the lookup
 * failed for another reason (network) so the caller shouldn't block.
 */
export const domainAcceptsMail = async (domain, resolver = dns) => {
    const d = (domain || "").toLowerCase().replace(/\.+$/, "");
    if (!d) return false;
    const cached = mxCache.get(d);
    if (cached && Date.now() - cached.at < MX_TTL_MS) return cached.ok;
    let ok;
    try {
        const mx = await Promise.race([
            resolver.resolveMx(d),
            new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), 5000)),
        ]);
        ok = Array.isArray(mx) && mx.some((r) => r.exchange && r.exchange !== ".");
    } catch (err) {
        if (err.code === "ENOTFOUND" || err.code === "ENODATA" || err.code === "ENOTIMP") ok = false;
        else return null; // unknown: don't treat as bad
    }
    mxCache.set(d, { ok, at: Date.now() });
    return ok;
};

/**
 * { ok, problem, suggestion }
 *   problem: null | "format" | "typo" | "no_mail_server"
 */
export const checkEmail = async (email, resolver) => {
    if (!email || !EMAIL_FORMAT.test(email)) return { ok: false, problem: "format", suggestion: null };
    const domain = email.split("@")[1];
    const suggestion = suggestEmailFix(email);
    const accepts = await domainAcceptsMail(domain, resolver);
    if (accepts === false) return { ok: false, problem: suggestion ? "typo" : "no_mail_server", suggestion };
    if (suggestion) return { ok: true, problem: "typo", suggestion }; // valid domain, but looks like a typo
    return { ok: true, problem: null, suggestion: null };
};

export const __clearMxCache = () => mxCache.clear();
