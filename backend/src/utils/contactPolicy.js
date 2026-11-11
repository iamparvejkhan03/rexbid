// How buyers contact the seller of a lot.
//
//   "phone"     – the seller's phone number can be revealed to signed-in users
//   "questions" – buyers use the listing's public Questions & Answers instead
//
// Reserve lots whose reserve is at or above PHONE_CONTACT_MIN_RESERVE_EUR keep
// the phone number; every other lot uses Questions & Answers.
//
// The threshold is a private business setting, so it is NOT in this (public)
// repository and never shown on the website. Set it on Render:
//   PHONE_CONTACT_MIN_RESERVE_EUR   e.g. a whole number of euro
// If it is not set, no lot shows a phone number (Questions & Answers everywhere).
// SELLER_PHONE_CONTACT=off also turns phone numbers off everywhere.
// Sterling listings use the equivalent amount (utils/listingRules.js).

import { minimumIn } from "./listingRules.js";

/** The threshold in euro, or null when phone contact is not configured. */
export const phoneContactMinReserveEur = () => {
  const n = Number(process.env.PHONE_CONTACT_MIN_RESERVE_EUR);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * @param {object} auction raw auction (reservePrice in the listing's own currency)
 * @param {object} [rates] injectable exchange rates for tests
 * @returns {"phone"|"questions"}
 */
export const contactModeFor = (auction, rates) => {
  if (!auction) return "questions";
  if (String(process.env.SELLER_PHONE_CONTACT || "").toLowerCase() === "off") return "questions";
  const minEur = phoneContactMinReserveEur();
  if (!minEur) return "questions";
  if (auction.auctionType !== "reserve") return "questions";
  const reserve = Number(auction.reservePrice) || 0;
  const threshold = minimumIn(minEur, auction.baseCurrency || "EUR", rates);
  return reserve >= threshold ? "phone" : "questions";
};

export const sellerPhoneAllowed = (auction, rates) => contactModeFor(auction, rates) === "phone";
