# RexBid – project notes

A running record of changes, business rules and open work, so anyone working on
the site (owner, developer, or Claude in a new session) can pick up where things
were left. **This repository is public: never put passwords, API keys, personal
data or private business details in this file.**

_Last updated: 9 November 2026_

---

## 1. How the system fits together

| Part | Where | Notes |
|---|---|---|
| Website (React + Vite) | `frontend/` → Render static site → `rexbid.ie` | Client-rendered single-page app. |
| Backend API (Express + MongoDB) | `backend/` → Render web service → `rexbid-backend.onrender.com` | Also serves `/sitemap.xml` and `/share/*` (see below). |
| Images | `media.rexbid.ie` (Cloudflare R2) | |
| DNS, CDN, security | Cloudflare | |
| Payments | Stripe (card, under €1,000); bank transfer from €1,000 | |
| Email | Google Workspace, `admin@rexbid.ie` | Backend sends via `smtp.gmail.com` (Render env: `SMTP_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` = Google app password). |

### Render rewrite rules on the rexbid.ie static site (order matters)
| # | Source | Destination | Action |
|---|---|---|---|
| 1 | `/auction/*` | `https://rexbid-backend.onrender.com/share/auction/*` | Rewrite |
| 2 | `/catalogue/*` | `https://rexbid-backend.onrender.com/share/catalogue/*` | Rewrite |
| 3 | `/*` | `/index.html` | **Rewrite** (not Redirect) |

Rule 3 is what makes every page work. Never edit it into something else, and never set it to Redirect (this caused a ~10-minute outage on 9 Nov). Deleting rules 1 and 2 safely turns off server-side link previews.

### Email DNS (Cloudflare)
MX → `smtp.google.com` · SPF includes `_spf.google.com` (and `spf.reg365.net`, which can be removed once Register365 is fully retired) · DKIM `google._domainkey` (authenticating in Google Admin) · DMARC `_dmarc`: `v=DMARC1; p=none; rua=mailto:admin@rexbid.ie`.

---

## 2. Business rules (source of truth)

| Rule | Value | Where in code |
|---|---|---|
| Buyer fee | 6% on first €2,000, 3% above, **max €500** per item | Admin commission settings; wording in `frontend/src/utils/fees.js` |
| Seller fee | None on sales before **1 January 2027** (30 days' notice before any fee) | `fees.js` |
| Featured listing | **€30 / £24**, paid by card when listing, no VAT | Stated in policy. **Card payment at listing not yet built.** |
| Facebook & Instagram ad | **€10 / €20 / €40** (£8 / £16 / £32 at a fixed £8 = €10), paid by card when listing, no VAT (RexBid not VAT registered) | Choice saved as `metaBoostPackage` on the auction. **Card payment at listing not yet built.** Hidden within 48h of sale close. |
| Minimum reserve | **€500** (sterling equivalent for £ listings) | `backend/src/utils/listingRules.js`, `frontend/src/utils/listingRules.js` |
| Minimum no-reserve starting bid | **€400** (sterling equivalent) | same |
| Payment | Card under €1,000; bank transfer from €1,000; within 48 hours | `backend/src/utils/manualPayment.js` (threshold) |
| Collection | Within 5 working days of payment confirmation | Policy |
| Seller payout | 0–3 working days after collection | Policy |
| Not as described | Report within 24 hours of collection/delivery | Policy |
| VAT on items | Set per listing by the seller | Listing field `vatIncluded` |
| Company | REXBID Limited, Corfeehone, Co. Cavan · CRO 819231 | Policy page |

If a fee or rule changes, update `fees.js` / `listingRules.js` **and** the admin commission settings **and** the legal pages listed in section 4.

---

## 3. Changes made (November 2026)

| PR | What | Status |
|---|---|---|
| #2 | Public API stopped returning reserve prices, rival proxy-bid maximums, offers, payment data and seller email/phone (`utils/publicAuction.js`) | Live |
| #3 | SEO step 1: per-page titles/descriptions/canonicals, Product & Organization schema, `robots.txt`, `/sitemap.xml`, not-found page, `/terms-of-use` redirect | Live |
| #4 | SEO step 2: server-rendered link previews for listings/catalogues via `/share/*` + Render rewrites | Live |
| #5 | `/index.html` → homepage redirect (safety after the 301 incident) | Open: merge when convenient |
| #6 | New Payment, Fees & Refund Policy; fee wording on FAQ, Sell, listing, agreements, footer; €500/€400 minimums enforced | Live |
| #7 | Share-page template cache 5 min → 30 s, so listing pages pick up new deploys quickly | Live |

Email (9 Nov, outside the code): sending moved from Register365 to Google; DKIM enabled; DMARC added. Outlook/Hotmail had been rejecting RexBid email ("lacks SPF/DKIM/DMARC").

Backend tests: `cd backend && npm test` (node:test; 14 tests).

---

## 4. Open to-do list (most important first)

1. **Cookie consent.** GA4 and the Meta Pixel load before consent (GDPR/ePrivacy). Needs a consent banner + Google Consent Mode v2. _In progress._
2. **Terms & Conditions clause 15** still says buyer fee 3% capped at €200 and seller fee 3%. Needs updating (solicitor) to match section 2.
3. **€30 featured fee** is stated but not charged. Decide and implement in payout calculation.
4. **DMARC showed FAIL** on a test on 9 Nov while SPF and DKIM passed. Re-test now the record is fixed.
5. **Conversion tracking:** sign-up, bid, listing submitted, contact/WhatsApp leads, delivery quote, purchase (GA4 + Meta).
6. **Account-type check:** `requireSeller` is disabled in `auth.middleware.js`, so any logged-in account can create listings (ownership checks on edit/delete are fine).
7. **Forms:** labels/`required`/`autocomplete`, and `method="post"` on login/register/contact/delivery/rate-us forms.
8. **Two-step registration** (currently 15 fields before a first bid).
9. **Reviews:** `/reviews` is empty. Post-sale review request, Google Business Profile.
10. **Performance:** code-split admin/dashboard routes, load Stripe only at checkout, resize oversized images, Cloudflare edge-cache for `media.rexbid.ie`.
11. **Owner admin (non-code):** confirm ownership of every account (GitHub, Render, Cloudflare, MongoDB, Stripe, domain, Google), get a written list of environment secrets, and get a written IP assignment for the code. Remove leftover "speedways" references (`backend/package.json`).

The full SEO audit (15 page changelogs) was delivered separately as `RexBid-SEO-Report.pdf`.
