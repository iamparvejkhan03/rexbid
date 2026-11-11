# RexBid – project notes

A running record of changes, business rules and open work, so anyone working on
the site (owner, developer, or Claude in a new session) can pick up where things
were left. **This repository is public: never put passwords, API keys, personal
data or private business details in this file.**

_Last updated: 11 November 2026_

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
| VAT on items | Only when the listing is "VAT Applicable". ROI 23%, NI 20%, on the item price only (never on the buyer fee: RexBid is not VAT registered). Cross-border or unclear-location sales are held for admin review; admin can zero-rate with a note. | `backend/src/utils/vat.js`, `backend/src/utils/region.js` |
| Collection | Within 3 working days of payment confirmation; storage fines after that | Policy, Buyer Agreement, FAQs, receipt |
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

Backend tests: `cd backend && npm test` (node:test).

The backend needs **Node 20.9 or newer** (`engines` in `backend/package.json`; required by nodemailer 10). Security audit 11 Nov 2026: backend 0 known vulnerabilities; frontend 4 low/moderate left (build-time `@tailwindcss/typography`, and `quill` in the listing editor) where npm's only suggested fix is a downgrade.

---

## 3a. After-sale process (sale records)

Every lot sold on or after `SALES_TRACKING_START` (default 10 Nov 2026) gets a **Sale** record (`backend/src/models/sale.model.js`) within 15 minutes (Agenda job `sync sales`, also run when the admin Sales page loads). It snapshots buyer, seller, price, buyer fee, VAT and total.

Stages: `sold` → `request_sent` → `paid` → `collected` → `payout_due` → `paid_out`.

- **Admin → Sales** (`/admin/sales`): tick sales, press *Send payment requests*. For each one the site creates a Stripe bank-transfer PaymentIntent (`customer_balance`, EU IBAN from Stripe Ireland; GB sort code for £ sales), so the buyer gets their own IBAN; renders the PDF; emails it; and saves it under the buyer's **Documents** (`/bidder/documents`).
- PDFs are not stored as files. Each document keeps a snapshot of what was printed and is re-rendered on download, behind login.
- When Stripe reports the payment (`payment_intent.succeeded` webhook), the sale and the auction are marked paid.
- Stripe webhook: `POST /api/v1/payments/webhook`, registered in `server.js` before the JSON parser. Needs `STRIPE_WEBHOOK_SECRET` on Render.

- **Receipts and seller statements** (Paid tab, tick and send): the buyer receipt shows the seller's name and phone, the collect-by date (3 working days after payment, weekends skipped, public holidays not; `COLLECTION_WORKING_DAYS`) and the storage-fines warning. The seller statement shows price + VAT collected − seller commission = amount due, and the seller's payout account (masked). The seller fee is read from the auction (`sellerCommissionAmount`, set from Admin → Commissions when the lot sold), so seller fees appear automatically once they are switched on.
- Every payment request, receipt and statement is BCC'd to `EMAIL_USER` (change with `PAYMENT_REQUEST_BCC`, or `none`).
- **Failed sales**: the red cross on an unpaid sale asks for a reason, cancels any open Stripe request and sets the auction's payment status to failed. *Reopen* puts it back in Ready to send.
- **Earlier sales**: *Import earlier sales* records lots sold before `SALES_TRACKING_START` with `historical: true`; status from the auction's payment status and any completed Payout. No emails, no Stripe calls. They live in the *Earlier sales* tab.
- Documents pages: `/bidder/documents`, `/seller/documents`, `/company/documents`.

- **Receipts are sent automatically** when a sale is paid (Stripe bank transfer, card checkout, or admin marking it paid). For any auction with a sale record, the old generic "Payment Confirmed" buyer email is skipped so the buyer gets one email.
- **Seller payouts use Stripe Connect Express accounts** (`user.stripeConnect`). Existing accounts made in the Stripe Dashboard are matched to sellers by email. Sellers set up or finish their account from Payout Methods (`/api/v1/stripe-connect/onboarding-link`); the "Item sold" email includes a setup button when the seller isn't ready, and admins can send a setup link from the Sales page. Status is refreshed at most hourly for sellers with open sales.

- **Emails per sale.** Buyer: auction won → payment request → receipt (automatic on payment) → reminders only if needed. Seller: item sold (+ payout setup if needed) → "buyer has paid" with statement and buyer contact (automatic on payment) → "you've been paid" with updated statement. The old generic "Payment Received"/"Payment Confirmed" emails are skipped for sales with a sale record.
- **Collection.** Buyer and seller each confirm on their Documents page; both → *Payout due*. Admin can *Release payout early* with a note.
- **Payouts.** *Payout due* tab → tick → *Pay sellers*: Stripe transfer of price + VAT − seller fee to the seller's Connect account (linked to the buyer's charge when possible, otherwise checked against available balance), recorded on the sale and as a `Payout` (method `stripeConnect`), then the "you've been paid" email. The old admin Payouts page is not used for these.
- **Manual payouts** (bank icon on a *Payout due* sale): for high-value sales paid from RexBid's own bank (BOI) to avoid Stripe fees. Shows the seller's saved bank details (Payout Methods) with copy buttons; admin enters amount (defaults to the amount due; a different amount needs a note), date and bank reference. Records the payout (`method: bank_transfer`, Payout record `manual-<saleId>`), makes no Stripe transfer, and emails the seller their statement.
- **Matching past payouts.** *Match past Stripe payouts* marks paid sales as paid out where a Dashboard transfer to that seller's account has exactly the seller's amount on or after the sale date. No emails.
- **Reminders** (`send sale reminders`, every 30 min, 08:00–20:00 Irish time, each once): payment due in 24h, payment overdue (+ office alert), collection due in 24h, collection overdue (+ office alert). Office alerts go to `ADMIN_ALERT_EMAIL` or `EMAIL_USER`.

Still to build: sales ledger export matching the finance tracker.


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
