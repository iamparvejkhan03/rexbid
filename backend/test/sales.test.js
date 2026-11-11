import { test } from "node:test";
import assert from "node:assert/strict";
import { regionForUser, regionForItem } from "../src/utils/region.js";
import { calculateVat } from "../src/utils/vat.js";
import { renderPaymentRequestPdf } from "../src/utils/documents/pdf.js";
import {
    buildSale,
    makeReference,
    applyVat,
    paymentRequestSnapshot,
    instructionsFromPaymentIntent,
} from "../src/services/saleService.js";

// ─── Regions ───────────────────────────────────────────────

test("region: Eircode means ROI", () => {
    assert.equal(regionForUser({ address: { line1: "Rathcormick", postCode: "C15 Y684", country: "Ireland" } }), "ROI");
});

test("region: BT postcode means NI even when country says United Kingdom or Ireland", () => {
    assert.equal(regionForUser({ address: { postCode: "BT71 4AB", country: "United Kingdom" } }), "NI");
    assert.equal(regionForUser({ address: { postCode: "BT1 1AA", country: "Ireland" } }), "NI");
});

test("region: NI county beats a vague country", () => {
    assert.equal(regionForUser({ address: { county: "Co. Tyrone", country: "United Kingdom" } }), "NI");
});

test("region: GB postcode", () => {
    assert.equal(regionForUser({ address: { postCode: "SW1A 1AA", country: "United Kingdom" } }), "GB");
});

test("region: unknown when there is nothing to go on", () => {
    assert.equal(regionForUser({ address: {} }), null);
});

test("region: item uses listing location, then seller address", () => {
    assert.equal(regionForItem({ location: "Cork, Ireland" }, null), "ROI");
    assert.equal(regionForItem({ location: "Dungannon, Co. Tyrone" }, null), "NI");
    assert.equal(regionForItem({ location: "" }, { address: { postCode: "BT60 1AA" } }), "NI");
});

// ─── VAT ───────────────────────────────────────────────────

test("vat: not applicable when listing is not VAT applicable", () => {
    const v = calculateVat({ vatApplicable: false, itemPrice: 10000, itemRegion: "ROI", buyerRegion: "NI" });
    assert.equal(v.amount, 0);
    assert.equal(v.treatment, "not_applicable");
    assert.equal(v.reviewRequired, false);
});

test("vat: ROI 23%, NI 20%", () => {
    assert.equal(calculateVat({ vatApplicable: true, itemPrice: 15000, itemRegion: "ROI", buyerRegion: "ROI" }).amount, 3450);
    assert.equal(calculateVat({ vatApplicable: true, itemPrice: 10000, itemRegion: "NI", buyerRegion: "NI" }).amount, 2000);
});

test("vat: cross-border sale is flagged but still charged until an admin decides", () => {
    const v = calculateVat({ vatApplicable: true, itemPrice: 10000, itemRegion: "ROI", buyerRegion: "NI", buyerVatNumber: "XI123" });
    assert.equal(v.reviewRequired, true);
    assert.equal(v.amount, 2300);
    assert.match(v.reviewReasons[0], /Cross-border/);
});

test("vat: admin zero-rating removes VAT and clears the flag", () => {
    const v = calculateVat({
        vatApplicable: true, itemPrice: 10000, itemRegion: "ROI", buyerRegion: "NI",
        override: { treatment: "zero_rated" },
    });
    assert.equal(v.amount, 0);
    assert.equal(v.treatment, "zero_rated");
    assert.equal(v.reviewRequired, false);
});

test("vat: unknown item location is flagged", () => {
    const v = calculateVat({ vatApplicable: true, itemPrice: 1000, itemRegion: null, buyerRegion: "ROI" });
    assert.equal(v.reviewRequired, true);
});

// ─── Sale records ──────────────────────────────────────────

const AUCTION = {
    _id: "6a64b8a710e65a25f01ede06",
    title: "JCB Fastrac 1125",
    finalPrice: 15000,
    bidderCommissionAmount: 500,
    sellerCommissionAmount: 0,
    baseCurrency: "EUR",
    vatIncluded: false,
    location: "Co. Meath",
    endDate: new Date("2026-11-06T20:00:00Z"),
    paymentStatus: "pending",
};
const BUYER = {
    _id: "bbbbbbbbbbbbbbbbbbbbbbbb", firstName: "Test", lastName: "Buyer", email: "buyer@example.com",
    address: { line1: "1 Main St", county: "Co. Meath", postCode: "C15 Y684", country: "Ireland" },
};
const SELLER = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", companyName: "Example Transport", address: { country: "Ireland" } };

test("sale: total is item + VAT + buyer fee; no VAT on the fee", () => {
    const s = buildSale({ ...AUCTION, vatIncluded: true }, BUYER, SELLER);
    assert.equal(s.vat.amount, 3450);
    assert.equal(s.total, 15000 + 3450 + 500);
    assert.equal(s.status, "sold");
    assert.deepEqual(s.buyer.addressLines, ["1 Main St", "Co. Meath, C15 Y684", "Ireland"]);
});

test("sale: already-paid auctions start as paid", () => {
    assert.equal(buildSale({ ...AUCTION, paymentStatus: "completed" }, BUYER, SELLER).status, "paid");
});

test("sale: zero-rating recalculates the total", () => {
    const s = buildSale({ ...AUCTION, vatIncluded: true, location: "Newry, Co. Down" }, BUYER, SELLER);
    assert.equal(s.vat.reviewRequired, true);
    s.vat.override = { treatment: "zero_rated" };
    applyVat(s);
    assert.equal(s.total, 15500);
});

test("sale: reference is short and readable", () => {
    assert.equal(makeReference("JCB Fastrac 1125", "6a64b8a710e65a25f01ede06"), "JCB-1EDE06");
    assert.equal(makeReference("", "6a64b8a710e65a25f01ede06"), "RB-1EDE06");
});

// ─── Stripe and PDF ────────────────────────────────────────

test("stripe: bank details are read from the PaymentIntent", () => {
    const b = instructionsFromPaymentIntent({
        next_action: {
            display_bank_transfer_instructions: {
                type: "eu_bank_transfer",
                reference: "ABCD1234",
                financial_addresses: [{ type: "iban", iban: { iban: "IE00TEST", bic: "TESTIE2X", country: "IE", account_holder_name: "RexBid" } }],
            },
        },
    });
    assert.deepEqual(
        { iban: b.iban, bic: b.bic, ref: b.reference, holder: b.accountHolderName },
        { iban: "IE00TEST", bic: "TESTIE2X", ref: "ABCD1234", holder: "RexBid" },
    );
});

test("pdf: payment request renders", async () => {
    const s = buildSale({ ...AUCTION, vatIncluded: true }, BUYER, SELLER);
    s.stripe = { bankTransfer: { iban: "IE00TEST", bic: "TESTIE2X", accountHolderName: "RexBid", reference: "ABCD1234" } };
    const pdf = await renderPaymentRequestPdf(paymentRequestSnapshot(s, new Date("2026-11-09T10:00:00Z")));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.ok(pdf.length > 2000);
});
