import { useLocation } from "react-router-dom";
import { useSeo, DEFAULT_TITLE, DEFAULT_DESCRIPTION, SITE_URL } from "../utils/seo";

// Titles/descriptions for fixed pages. Dynamic pages (/auction/:id,
// /catalogue/:id, /seller-reviews/:userId, /auctions) set their own tags.
const STATIC_PAGES = {
    "/": {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "@id": `${SITE_URL}/#org`,
                    name: "RexBid",
                    legalName: "REXBID Limited",
                    url: `${SITE_URL}/`,
                    logo: `${SITE_URL}/logo.png`,
                    email: "admin@rexbid.ie",
                    telephone: "+353-87-203-9257",
                    areaServed: ["IE", "GB-NIR"],
                    sameAs: [
                        "https://www.instagram.com/rexbid.ie",
                        "https://www.facebook.com/profile.php?id=61572573135077",
                    ],
                },
                {
                    "@type": "WebSite",
                    "@id": `${SITE_URL}/#website`,
                    url: `${SITE_URL}/`,
                    name: "RexBid",
                    inLanguage: "en-IE",
                    publisher: { "@id": `${SITE_URL}/#org` },
                },
            ],
        },
    },
    "/about": {
        title: "How RexBid Works – Online Machinery Auctions in Ireland",
        description: "How buying and selling machinery at auction works on RexBid: list your machine, set a reserve, bid online and pay securely through RexBid.",
    },
    "/sell": {
        title: "Sell Your Machinery Online in Ireland | RexBid",
        description: "Sell your tractor, digger, trailer or farm machinery at online auction. List it yourself or WhatsApp us the photos and we'll list it for you.",
    },
    "/catalogues": {
        title: "Upcoming Sale Dates – Machinery for Sale Ireland | RexBid",
        description: "Upcoming sale dates on RexBid. Browse tractors, trailers, diggers and farm equipment from sellers across Ireland, and see past results.",
    },
    "/faqs": {
        title: "RexBid FAQs – Bidding, Fees, Payment & Delivery",
        description: "Answers on bidding, buyer fees, payment, collection, delivery and selling machinery at online auction in Ireland and Northern Ireland.",
    },
    "/contact": {
        title: "Contact RexBid – Phone, WhatsApp & Email",
        description: "Talk to the RexBid team about buying or selling machinery at auction. Call or WhatsApp 087 203 9257 or email admin@rexbid.ie.",
    },
    "/reviews": {
        title: "RexBid Reviews – What Buyers & Sellers Say",
        description: "Read feedback from buyers and sellers of machinery on RexBid.",
    },
    "/delivery-partner-quote": {
        title: "Machinery Delivery Quote – Tractor & Plant Transport | RexBid",
        description: "Get a quote to deliver tractors, diggers, trailers and machinery in Ireland with RexBid's transport partner EVOLVE.",
    },
    "/privacy-policy": { title: "Privacy Statement | RexBid", description: "How RexBid collects, uses and protects your personal data." },
    "/terms-conditions": { title: "Terms & Conditions | RexBid", description: "The terms that apply to buying and selling on RexBid." },
    "/buyer-agreement": { title: "Buyer Agreement | RexBid", description: "The agreement that applies to bids and purchases on RexBid." },
    "/seller-agreement": { title: "Seller Agreement | RexBid", description: "The agreement that applies to listings and sales on RexBid." },
    "/buyer-terms": { title: "Bidder Terms | RexBid", description: "The terms that apply to every bid placed on RexBid." },
    "/payment-refund-policy": { title: "Payment & Refund Policy | RexBid", description: "How payments and refunds work on RexBid." },
};

// Utility / private pages: keep out of search results.
const NOINDEX_PAGES = {
    "/login": "Sign In | RexBid",
    "/register": "Create an Account | RexBid",
    "/reset-password": "Reset Password | RexBid",
    "/rate-us": "Leave a Review | RexBid",
};
const NOINDEX_PREFIXES = ["/admin", "/seller", "/bidder", "/broker", "/company", "/checkout/", "/unsubscribe/"];

// Pages that manage their own tags once their data loads.
const SELF_MANAGED_PREFIXES = ["/auction/", "/catalogue/", "/seller-reviews/"];
const SELF_MANAGED_EXACT = ["/auctions"];

const resolveRouteSeo = (pathname) => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

    if (SELF_MANAGED_EXACT.includes(path) || SELF_MANAGED_PREFIXES.some((p) => path.startsWith(p))) {
        return { skip: true };
    }
    if (STATIC_PAGES[path]) return { ...STATIC_PAGES[path], path };
    if (NOINDEX_PAGES[path]) return { title: NOINDEX_PAGES[path], noindex: true };
    // "/seller-agreement" and "/seller-reviews/..." are public; "/seller" and "/seller/..." are dashboards.
    if (NOINDEX_PREFIXES.some((p) => path === p.replace(/\/$/, "") || path.startsWith(p.endsWith("/") ? p : `${p}/`))) {
        return { title: "RexBid", noindex: true };
    }
    // Anything else is not a real page (see NotFound route).
    return { skip: true };
};

const RouteSeo = () => {
    const { pathname } = useLocation();
    useSeo(resolveRouteSeo(pathname));
    return null;
};

export default RouteSeo;
