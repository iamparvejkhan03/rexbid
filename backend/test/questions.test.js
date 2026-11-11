// Listing Questions & Answers, seller contact rule and public names.
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { checkForContactDetails } from "../src/utils/contactFilter.js";
import { publicName } from "../src/utils/displayName.js";
import { contactModeFor } from "../src/utils/contactPolicy.js";
import { toE164, validTwilioSignature, twiml } from "../src/utils/sms.js";
import { sanitizeAuctionForViewer } from "../src/utils/publicAuction.js";

const RATES = { EUR: { rates: { GBP: 0.85 } } };

test("contact filter blocks phone numbers, emails and off-site requests", () => {
  for (const s of [
    "Ring me on 087 123 4567",
    "+353 87 123 4567",
    "0871234567",
    "my email is joe.bloggs@gmail.com",
    "joe at hotmail dot com",
    "whatsapp me",
    "text me and we'll sort it",
    "can we do a deal privately if it doesn't sell",
    "zero eight seven one two three four five six seven",
    "what's your number?",
  ]) {
    assert.equal(checkForContactDetails(s).ok, false, s);
  }
});

test("contact filter allows normal machinery questions", () => {
  for (const s of [
    "How many hours are on it?",
    "It has 5,400 hours, 2019 model, 6.8 litre engine",
    "Tyres are 480/70R34 and 380/70R24, about 60% left",
    "Is it available for viewing on Saturday?",
    "Has the clutch been replaced? Any leaks from the front axle?",
    "Price was 12500 last year",
  ]) {
    assert.equal(checkForContactDetails(s).ok, true, s);
  }
});

test("public name: first name only, company names in full", () => {
  assert.equal(publicName({ firstName: "Seán", lastName: "Murphy" }), "Seán");
  assert.equal(publicName({ firstName: "Mary Kate", lastName: "Byrne" }), "Mary");
  assert.equal(publicName({ firstName: "Pat", lastName: "Reilly", companyName: "Reilly Plant Hire Ltd" }), "Reilly Plant Hire Ltd");
  assert.equal(publicName({ username: "john.smith" }), "john");
  assert.equal(publicName(null), "RexBid seller");
});

// Test threshold only; the real value is a Render setting.
const withThreshold = (value, fn) => {
  const before = process.env.PHONE_CONTACT_MIN_RESERVE_EUR;
  if (value === undefined) delete process.env.PHONE_CONTACT_MIN_RESERVE_EUR;
  else process.env.PHONE_CONTACT_MIN_RESERVE_EUR = String(value);
  try { fn(); } finally {
    if (before === undefined) delete process.env.PHONE_CONTACT_MIN_RESERVE_EUR;
    else process.env.PHONE_CONTACT_MIN_RESERVE_EUR = before;
  }
};

test("contact mode: phone only for reserve lots at or above the threshold", () => {
  withThreshold(2000, () => {
    assert.equal(contactModeFor({ auctionType: "reserve", reservePrice: 2000, baseCurrency: "EUR" }, RATES), "phone");
    assert.equal(contactModeFor({ auctionType: "reserve", reservePrice: 1999, baseCurrency: "EUR" }, RATES), "questions");
    assert.equal(contactModeFor({ auctionType: "standard", reservePrice: 0, startPrice: 20000 }, RATES), "questions");
    // £1,700 is the sterling equivalent at 0.85.
    assert.equal(contactModeFor({ auctionType: "reserve", reservePrice: 1700, baseCurrency: "GBP" }, RATES), "phone");
    assert.equal(contactModeFor({ auctionType: "reserve", reservePrice: 1600, baseCurrency: "GBP" }, RATES), "questions");
  });
});

test("contact mode: no phone numbers when the threshold isn't set", () => {
  withThreshold(undefined, () => {
    assert.equal(contactModeFor({ auctionType: "reserve", reservePrice: 1e6 }, RATES), "questions");
  });
});

test("contact mode can be switched off everywhere", () => {
  process.env.SELLER_PHONE_CONTACT = "off";
  try {
    withThreshold(2000, () => assert.equal(contactModeFor({ auctionType: "reserve", reservePrice: 50000 }, RATES), "questions"));
  } finally {
    delete process.env.SELLER_PHONE_CONTACT;
  }
});

test("public auction shows seller first name, hides surname and username", () => {
  const out = sanitizeAuctionForViewer({
    auctionType: "reserve",
    reservePrice: 4000,
    startPrice: 1000,
    currentPrice: 1000,
    sellerUsername: "seanmurphy87",
    seller: { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", firstName: "Seán", lastName: "Murphy", username: "seanmurphy87", phone: "+353" },
  }, null);
  assert.equal(out.sellerUsername, "Seán");
  assert.equal(out.seller.displayName, "Seán");
  assert.equal(out.seller.lastName, undefined);
  assert.equal(out.seller.username, undefined);
  assert.equal(out.seller.phone, undefined);
  assert.equal(out.contactMode, "questions");
});

test("phone numbers are normalised to E.164", () => {
  assert.equal(toE164("087 123 4567", "IE"), "+353871234567");
  assert.equal(toE164("+353 (0)87 123 4567"), "+353871234567");
  assert.equal(toE164("00353871234567"), "+353871234567");
  assert.equal(toE164("07700 900123", "GB"), "+447700900123");
  assert.equal(toE164("abc"), null);
});

test("Twilio webhook signature check", () => {
  const url = "https://example.com/api/v1/sms/inbound";
  const params = { From: "+353871234567", Body: "Yes, it starts first time" };
  const data = url + "Body" + params.Body + "From" + params.From;
  const sig = crypto.createHmac("sha1", "token123").update(data).digest("base64");
  assert.equal(validTwilioSignature(sig, url, params, "token123"), true);
  assert.equal(validTwilioSignature(sig, url, { ...params, Body: "changed" }, "token123"), false);
  assert.equal(validTwilioSignature(undefined, url, params, "token123"), false);
  assert.match(twiml("a < b"), /<Message>a &lt; b<\/Message>/);
});

test("public auction leaves the seller name alone when the seller isn't populated", () => {
  const out = sanitizeAuctionForViewer({ auctionType: "standard", startPrice: 500, currentPrice: 500, sellerUsername: "Pat", seller: "aaaaaaaaaaaaaaaaaaaaaaaa" }, null);
  assert.equal(out.sellerUsername, "Pat");
  assert.equal(out.sellerDisplayName, undefined);
});
