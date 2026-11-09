import { test } from "node:test";
import assert from "node:assert/strict";
import { minimumPriceError, minimumIn } from "../src/utils/listingRules.js";

const rates = { EUR: { rates: { GBP: 0.86 } } };

test("reserve auctions need a reserve of at least €500", () => {
  assert.match(minimumPriceError({ auctionType: "reserve", startPrice: 100, reservePrice: 499 }, rates), /minimum reserve price is €500/);
  assert.equal(minimumPriceError({ auctionType: "reserve", startPrice: 100, reservePrice: 500 }, rates), null);
});

test("no-reserve auctions need a starting bid of at least €400", () => {
  assert.match(minimumPriceError({ auctionType: "standard", startPrice: 399 }, rates), /minimum starting bid .* €400/);
  assert.equal(minimumPriceError({ auctionType: "standard", startPrice: 400 }, rates), null);
});

test("sterling listings use the converted minimum rounded up to £10", () => {
  assert.equal(minimumIn(500, "GBP", rates), 430);
  assert.equal(minimumIn(400, "GBP", rates), 350);
  assert.match(minimumPriceError({ auctionType: "reserve", reservePrice: 420, currency: "GBP" }, rates), /£430/);
});

test("buy-now and giveaway listings are not affected", () => {
  assert.equal(minimumPriceError({ auctionType: "buy_now", startPrice: 10 }, rates), null);
  assert.equal(minimumPriceError({ auctionType: "giveaway", startPrice: 0 }, rates), null);
});
