// Public display names.
//
// Sellers (and people asking questions) are shown to the public by first name
// only. A company name, when the account has one, is shown in full.
// Full names are still used where the other party needs them after a sale
// (receipts, statements, the winner's "Won auctions" page).

const firstWord = (s) => String(s || "").trim().split(/\s+/)[0] || "";

/**
 * @param {object|null} user  a user document or plain object
 * @param {string} fallback   shown when nothing usable is on the account
 */
export const publicName = (user, fallback = "RexBid seller") => {
  if (!user || typeof user !== "object") return fallback;
  const company = String(user.companyName || "").trim();
  if (company) return company;
  const first = firstWord(user.firstName);
  if (first) return first;
  // Old accounts without a first name: first part of the username only.
  const fromUsername = String(user.username || "").trim().split(/[\s._-]+/)[0];
  return fromUsername || fallback;
};
