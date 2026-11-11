// Stops phone numbers, email addresses and "take it off the site" requests
// being posted in listing Questions & Answers (questions and seller answers).
//
// This is a deterrent, not a guarantee: it catches the common ways people
// share contact details. Anything that slips through can be reported and is
// moderated from Admin → Comments.

const EMAIL = /[A-Z0-9._%+-]+\s*(?:@|\(at\)|\[at\])\s*[A-Z0-9-]+(?:\s*(?:\.|\(dot\)|\[dot\]|\bdot\b)\s*[A-Z]{2,})+/i;
const EMAIL_PROVIDER = /\b(?:gmail|hotmail|outlook|yahoo|icloud|eircom|live\.ie|protonmail)\b/i;
const MESSAGING_APPS = /\b(?:whats\s*app|whatsapp|whatsap|watsapp|viber|telegram|signal\s+me|snapchat|messenger)\b/i;
const OFF_PLATFORM = new RegExp(
  [
    String.raw`\b(?:ring|call|phone|text|txt|contact|message|msg|dm|pm)\s+(?:me|us|him|her|the\s+seller)\b`,
    String.raw`\bmy\s+(?:number|no\.?|mobile|phone|email|e-mail)\b`,
    String.raw`\b(?:your|ur)\s+(?:number|mobile|phone\s+number|email|e-mail)\b`,
    String.raw`\b(?:off|outside)\s+(?:the\s+)?(?:site|platform|rexbid|auction)\b`,
    String.raw`\b(?:sell|buy|deal|do\s+a\s+deal)\s+(?:it\s+)?privately\b`,
    String.raw`\bprivate\s+(?:sale|deal)\b`,
    String.raw`\bdone\s*deal\b`,
  ].join("|"),
  "i"
);

// Runs of digits with optional spaces, dots, dashes or brackets between them.
const DIGIT_RUN = /\+?\(?\d[\d\s().\-\/]{5,}\d/g;
const SPELLED_DIGITS = /\b(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)(?:[\s,.-]+(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)){6,}\b/i;

const looksLikePhone = (text) => {
  const runs = String(text).match(DIGIT_RUN) || [];
  for (const run of runs) {
    const digits = run.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) continue;
    // Irish/UK numbers: 08x mobiles, 0x landlines, +353 / 00353 / +44.
    if (/^(?:0|353|00353|44|0044)/.test(digits) || run.trim().startsWith("+")) return true;
    // Long digit runs written with phone-style spacing ("871 234 567").
    if (/\d{2,4}[\s.-]\d{3}[\s.-]?\d{3,4}/.test(run)) return true;
  }
  return SPELLED_DIGITS.test(text);
};

/**
 * @param {string} text
 * @returns {{ ok: boolean, reason: string|null }}
 */
export const checkForContactDetails = (text) => {
  const t = String(text || "");
  if (looksLikePhone(t)) return { ok: false, reason: "phone" };
  if (EMAIL.test(t) || EMAIL_PROVIDER.test(t)) return { ok: false, reason: "email" };
  if (MESSAGING_APPS.test(t)) return { ok: false, reason: "messaging_app" };
  if (OFF_PLATFORM.test(t)) return { ok: false, reason: "off_platform" };
  return { ok: true, reason: null };
};

export const CONTACT_BLOCKED_MESSAGE =
  "Please don't include phone numbers, email addresses or requests to talk off RexBid. " +
  "Questions and answers stay on the listing so every bidder sees the same information, and buying through RexBid keeps your payment protected.";
