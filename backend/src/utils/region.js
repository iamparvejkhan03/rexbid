/**
 * Works out which VAT region a person or item is in.
 *
 *   ROI   Republic of Ireland
 *   NI    Northern Ireland (BT postcodes)
 *   GB    England, Scotland, Wales
 *   EU    another EU member state
 *   OTHER anywhere else
 *   null  not enough information; the sale is flagged for admin review
 *
 * Addresses on the site are free text, so this is a best guess from the
 * postcode, country and (for listings) the location string. Admins can
 * override the result on the sale record.
 */

export const REGIONS = ["ROI", "NI", "GB", "EU", "OTHER"];

const EU_COUNTRIES = [
    "austria", "belgium", "bulgaria", "croatia", "cyprus", "czechia", "czech republic",
    "denmark", "estonia", "finland", "france", "germany", "greece", "hungary", "italy",
    "latvia", "lithuania", "luxembourg", "malta", "netherlands", "poland", "portugal",
    "romania", "slovakia", "slovenia", "spain", "sweden",
];

// Eircode routing keys: a letter + two digits (or D6W), then four characters.
const EIRCODE = /\b([AC-FHKNPRTV-Y]\d{2}|D6W)\s?[0-9AC-FHKNPRTV-Y]{4}\b/i;
// Northern Ireland postcodes all start with BT.
const BT_POSTCODE = /\bBT\d{1,2}\s?\d[A-Z]{2}\b/i;
// Any other UK postcode.
const UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i;

const NI_COUNTIES = ["antrim", "armagh", "down", "fermanagh", "londonderry", "derry", "tyrone"];
const ROI_COUNTIES = [
    "carlow", "cavan", "clare", "cork", "donegal", "dublin", "galway", "kerry", "kildare",
    "kilkenny", "laois", "leitrim", "limerick", "longford", "louth", "mayo", "meath",
    "monaghan", "offaly", "roscommon", "sligo", "tipperary", "waterford", "westmeath",
    "wexford", "wicklow",
];

const norm = (v) => String(v || "").trim().toLowerCase();

const regionFromCountry = (country) => {
    const c = norm(country);
    if (!c) return null;
    if (["northern ireland", "ni", "gb-nir", "xi"].includes(c)) return "NI";
    if (["ireland", "republic of ireland", "roi", "ie", "eire", "éire"].includes(c)) return "ROI";
    if (["united kingdom", "uk", "gb", "great britain", "england", "scotland", "wales"].includes(c)) return "GB";
    if (EU_COUNTRIES.includes(c)) return "EU";
    return "OTHER";
};

const regionFromText = (text) => {
    const t = String(text || "");
    if (!t.trim()) return null;
    if (BT_POSTCODE.test(t)) return "NI";
    if (EIRCODE.test(t)) return "ROI";
    const lower = t.toLowerCase();
    if (/northern ireland/.test(lower)) return "NI";
    // "Co. Down", "County Tyrone", or a bare county name
    if (NI_COUNTIES.some((c) => new RegExp(`\\b${c}\\b`).test(lower))) {
        // Several NI county names are also common words; only trust them
        // when there is no ROI county alongside.
        if (!ROI_COUNTIES.some((c) => new RegExp(`\\b${c}\\b`).test(lower))) return "NI";
    }
    if (ROI_COUNTIES.some((c) => new RegExp(`\\b${c}\\b`).test(lower))) return "ROI";
    if (/\bireland\b/.test(lower)) return "ROI";
    if (UK_POSTCODE.test(t) || /united kingdom|\bengland\b|\bscotland\b|\bwales\b/.test(lower)) return "GB";
    return null;
};

/**
 * Region for a user, from their saved address.
 * The postcode wins over the country field because many NI users pick
 * "United Kingdom" or "Ireland" as their country.
 */
export const regionForUser = (user) => {
    if (!user) return null;
    if (REGIONS.includes(user.region)) return user.region;
    const a = user.address || {};
    const postcodeRegion = regionFromText(a.postCode);
    if (postcodeRegion) return postcodeRegion;
    const fromText = regionFromText([a.line1, a.line2, a.county, a.state].filter(Boolean).join(", "));
    const fromCountry = regionFromCountry(a.country || user.countryName || user.countryCode);
    // A county name is more specific than "Ireland"/"United Kingdom".
    if (fromText === "NI" || (fromText && !fromCountry)) return fromText;
    return fromCountry || fromText;
};

/**
 * Region for the item: where it is located (place of supply for goods).
 * Uses the listing's location text first, then the seller's address.
 */
export const regionForItem = (auction, seller) => {
    if (REGIONS.includes(auction?.itemRegion)) return auction.itemRegion;
    return regionFromText(auction?.location) || regionForUser(seller);
};

export const _internal = { regionFromCountry, regionFromText };
