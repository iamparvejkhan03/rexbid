// Lightweight per-page SEO head management (no extra dependency).
//
// The site is a client-rendered SPA, so every URL is served the same
// index.html. Google renders JavaScript and reads the final <head>, so we
// update the title, description, canonical, robots and Open Graph tags here
// whenever a page mounts or its data changes.

import { useEffect } from "react";

export const SITE_URL = "https://rexbid.ie";
export const SITE_NAME = "RexBid";
export const DEFAULT_TITLE = "Machinery Auctions Ireland | Tractors, Plant & Vans | RexBid";
export const DEFAULT_DESCRIPTION =
    "Buy and sell tractors, plant machinery and commercial vehicles at online auction in Ireland. Set your reserve, let buyers compete.";
export const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

const upsertMeta = (attr, key, content) => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (content === undefined || content === null || content === "") {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
};

const upsertCanonical = (href) => {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!href) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
};

const JSON_LD_ID = "page-jsonld";
const upsertJsonLd = (data) => {
    // The server may have pre-filled structured data for shared links; the
    // client copy replaces it so the page never carries two versions.
    document.getElementById("share-jsonld")?.remove();
    let el = document.getElementById(JSON_LD_ID);
    if (!data) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement("script");
        el.type = "application/ld+json";
        el.id = JSON_LD_ID;
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
};

/** Strip HTML and collapse whitespace; cut to `max` chars on a word boundary. */
export const toPlainText = (html = "", max = 155) => {
    const text = String(html)
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    return cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : cut.length) + "…";
};

export const absoluteUrl = (path = "/") =>
    path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/**
 * Apply SEO tags for the current page.
 *
 * @param {object} opts
 * @param {string} [opts.title]        full <title>
 * @param {string} [opts.description]  meta description
 * @param {string} [opts.path]         canonical path, e.g. "/auctions"; omit to skip canonical
 * @param {boolean} [opts.noindex]     add robots noindex,follow
 * @param {string} [opts.image]        absolute image URL for social previews
 * @param {string} [opts.type]         og:type (website | product | article)
 * @param {object} [opts.jsonLd]       structured data object
 * @param {boolean} [opts.skip]        do nothing (e.g. data still loading)
 */
export const applySeo = ({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    path,
    noindex = false,
    image = DEFAULT_IMAGE,
    type = "website",
    jsonLd = null,
} = {}) => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, follow" : null);
    const canonical = !noindex && path ? absoluteUrl(path) : null;
    upsertCanonical(canonical);

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_IE");
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical || absoluteUrl(window.location.pathname));
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:card", "summary_large_image");
    if (type !== "product") {
        document.head.querySelectorAll('meta[property^="product:"]').forEach((el) => el.remove());
    }

    upsertJsonLd(jsonLd);
};

/** React hook wrapper around applySeo. Re-applies when any option changes. */
export const useSeo = (opts) => {
    const key = JSON.stringify(opts || {});
    useEffect(() => {
        if (opts?.skip) return;
        applySeo(opts);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
};

// ---------------------------------------------------------------------------
// Page-specific builders
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOL = { EUR: "€", GBP: "£" };
const money = (amount, currency = "EUR") =>
    amount || amount === 0
        ? `${CURRENCY_SYMBOL[currency] || ""}${Math.round(Number(amount)).toLocaleString("en-IE")}`
        : "";

const cap = (s = "", max = 60) => (s.length <= max ? s : `${s.slice(0, max - 1).trim()}…`);

const SOLD_STATUSES = ["sold", "sold_buy_now"];
const ENDED_STATUSES = ["ended", "reserve_not_met", "cancelled"];

/** SEO for /auction/:id. Pass `notFound` when the API returned nothing. */
export const buildAuctionSeo = (auction, { notFound = false } = {}) => {
    if (notFound) return { title: "Auction not found | RexBid", noindex: true };
    if (!auction) return { skip: true };

    const path = `/auction/${auction._id}`;
    const currency = auction.baseCurrency || "EUR";
    const name = (auction.title || "Machinery").trim();
    const county = (auction.location || "").trim();
    const isSold = SOLD_STATUSES.includes(auction.status);
    const isEnded = ENDED_STATUSES.includes(auction.status);
    const price = isSold ? auction.finalPrice || auction.currentPrice : auction.currentPrice || auction.startPrice;

    const title = isSold
        ? `${cap(name, 40)} – Sold for ${money(price, currency)} | RexBid`
        : `${cap(name, 38)} for Auction${county ? ` – ${cap(county, 18)}` : ""} | RexBid`;

    const lead = toPlainText(auction.description, 90);
    const bits = [];
    if (isSold) bits.push(`Sold for ${money(price, currency)} on RexBid.`);
    else if (!isEnded && price) bits.push(`${auction.bidCount > 0 ? "Current bid" : "Starting bid"} ${money(price, currency)}.`);
    if (!isSold && !isEnded && auction.endDate) {
        bits.push(`Ends ${new Date(auction.endDate).toLocaleString("en-IE", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}.`);
    }
    if (county) bits.push(`Located in ${county}.`);
    const description = toPlainText(`${lead}${lead && !/[.…]$/.test(lead) ? "." : ""} ${bits.join(" ")}`, 158);

    const photos = (auction.photos || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p) => p.url).filter(Boolean);
    const specs = auction.specifications || {};
    const brand = specs.brand || specs.Brand || specs.make || specs.Make;
    const model = specs.model || specs.Model;
    const condition = String(specs.condition || specs.Condition || "").toLowerCase();

    const product = {
        "@type": "Product",
        name,
        description: toPlainText(auction.description, 500) || name,
        url: absoluteUrl(path),
        ...(photos.length ? { image: photos.slice(0, 5) } : {}),
        ...(brand ? { brand: { "@type": "Brand", name: String(brand).trim() } } : {}),
        ...(model ? { model: String(model).trim() } : {}),
        itemCondition: condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
        offers: {
            "@type": "Offer",
            url: absoluteUrl(path),
            priceCurrency: currency,
            price: Number(price || 0).toFixed(2),
            availability: isSold
                ? "https://schema.org/SoldOut"
                : isEnded
                    ? "https://schema.org/Discontinued"
                    : "https://schema.org/InStock",
            ...(auction.endDate && !isSold && !isEnded ? { priceValidUntil: new Date(auction.endDate).toISOString().slice(0, 10) } : {}),
            ...(county ? { availableAtOrFrom: { "@type": "Place", address: { "@type": "PostalAddress", addressRegion: county, addressCountry: "IE" } } } : {}),
            seller: { "@type": "Organization", name: auction.seller?.companyName || auction.seller?.username || "RexBid seller" },
        },
    };

    return {
        title,
        description,
        path,
        type: "product",
        image: photos[0] || DEFAULT_IMAGE,
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                product,
                {
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                        { "@type": "ListItem", position: 2, name: "Auctions", item: `${SITE_URL}/auctions` },
                        { "@type": "ListItem", position: 3, name, item: absoluteUrl(path) },
                    ],
                },
            ],
        },
    };
};

/** SEO for /auctions, driven by the query string. */
export const buildAuctionsListSeo = (search = "") => {
    const params = new URLSearchParams(search);
    const status = params.get("status");
    const category = params.get("category");
    const page = parseInt(params.get("page") || "1", 10);

    // Searches and narrow filter combinations are not indexed.
    const NOINDEX_PARAMS = ["search", "subcategory", "auctionType", "allowOffers", "isFeaturedOffers", "isFeatured", "minPrice", "maxPrice", "location"];
    const noindex = NOINDEX_PARAMS.some((k) => params.get(k));

    let title = "Machinery Auctions Ireland – Live Listings | RexBid";
    let description = "Browse live machinery auctions across Ireland: tractors, trailers, diggers and farm equipment from Irish sellers. Bid online or make an offer.";
    if (status === "sold") {
        title = "Sold Machinery Prices Ireland – Past Auctions | RexBid";
        description = "See what tractors, trailers and plant machinery sold for at auction in Ireland. Real sold prices from RexBid auctions.";
    } else if (status === "approved") {
        title = "Upcoming Machinery Auctions Ireland | RexBid";
        description = "Machinery auctions starting soon on RexBid: tractors, trailers, diggers and farm equipment from sellers across Ireland.";
    } else if (category === "farming") {
        title = "Farm Machinery Auctions Ireland | RexBid";
        description = "Bid on used tractors, trailers and farm machinery from sellers across Ireland at online auction on RexBid.";
    } else if (category === "plant-machinery") {
        title = "Plant Machinery Auctions Ireland | RexBid";
        description = "Bid on diggers, dumpers and plant machinery from sellers across Ireland at online auction on RexBid.";
    }
    if (page > 1) title = title.replace(" | RexBid", ` – Page ${page} | RexBid`);

    // Canonical keeps only the parameters that define an indexable page (drops sort etc.).
    const keep = new URLSearchParams();
    for (const k of ["status", "category", "page"]) {
        const v = params.get(k);
        if (v && !(k === "page" && v === "1")) keep.set(k, v);
    }
    const qs = keep.toString();
    return { title, description, path: `/auctions${qs ? `?${qs}` : ""}`, noindex };
};

/** SEO for /catalogue/:id. */
export const buildCatalogueSeo = (catalogue, total, { notFound = false } = {}) => {
    if (notFound) return { title: "Catalogue not found | RexBid", noindex: true };
    if (!catalogue) return { skip: true };
    const date = catalogue.closingDate ? new Date(catalogue.closingDate) : null;
    const dateText = date ? date.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
    const past = date && date < new Date();
    const lots = total ? ` – ${total} Lots` : "";
    return {
        title: past ? `Machinery Auction Results ${dateText}${lots} | RexBid` : `Machinery Auction ${dateText}${lots} | RexBid`,
        description: past
            ? `Results from the RexBid machinery auction that closed ${dateText}.${total ? ` ${total} lots` : ""} of tractors, plant and farm equipment.`
            : `${total ? `${total} lots` : "Lots"} of tractors, plant and farm machinery closing ${dateText}. Bid online at RexBid.`,
        path: `/catalogue/${catalogue._id}`,
        image: catalogue.image?.url || catalogue.imageUrl || DEFAULT_IMAGE,
    };
};

/** SEO for /seller-reviews/:userId. Thin profiles are kept out of the index. */
export const buildSellerSeo = (stats, userId, { notFound = false } = {}) => {
    if (notFound) return { title: "Seller not found | RexBid", noindex: true };
    if (!stats) return { skip: true };
    const name = stats.companyName || stats.username || "RexBid seller";
    const thin = (stats.itemsAdded || 0) < 3 && (stats.totalReviews || 0) === 0;
    return {
        title: `${cap(name, 40)} – Machinery for Sale & Reviews | RexBid`,
        description: `${name}: ${stats.itemsAdded || 0} listings and ${stats.itemsSold || 0} sold on RexBid${stats.totalReviews ? `, rated ${stats.averageRating}/5 from ${stats.totalReviews} reviews` : ""}.`,
        path: `/seller-reviews/${userId}`,
        noindex: thin,
    };
};
