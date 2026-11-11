// Text messages to sellers (Twilio), used by listing Questions & Answers.
//
// Off until these environment variables are set on Render:
//   TWILIO_ACCOUNT_SID      Twilio account SID (starts with AC)
//   TWILIO_AUTH_TOKEN       Twilio auth token (also used to check inbound requests)
//   TWILIO_FROM_NUMBER      the SMS-capable RexBid number texts come from, e.g. +353...
//                           (needed for sellers to reply by text)
//   SMS_INBOUND_URL         the exact public URL set as the number's "A message comes in"
//                           webhook, e.g. https://rexbid-backend.onrender.com/api/v1/sms/inbound
// Optional:
//   SMS_ENABLED=false       turn texts off without removing the keys
//
// Every send is a paid Twilio message, so texts only go to sellers about
// questions on their own listings.

import axios from "axios";
import crypto from "crypto";

export const smsConfigured = () =>
  String(process.env.SMS_ENABLED || "true").toLowerCase() !== "false" &&
  !!process.env.TWILIO_ACCOUNT_SID &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !!process.env.TWILIO_FROM_NUMBER;

const DIAL_CODES = { IE: "353", GB: "44", UK: "44", NI: "44" };

/**
 * Best-effort conversion of a stored phone number to E.164 (+3538...).
 * Returns null when the number can't be understood.
 */
export const toE164 = (phone, countryCode = "IE") => {
  if (!phone) return null;
  let p = String(phone).trim().replace(/[\s().-]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (p.startsWith("+")) {
    // "+3530871234567" – drop the trunk 0 some people type after the code.
    p = p.replace(/^\+(353|44)0/, "+$1");
    return /^\+\d{8,15}$/.test(p) ? p : null;
  }
  const code = DIAL_CODES[String(countryCode || "IE").toUpperCase()] || "353";
  if (p.startsWith(code) && p.length > code.length + 7) return `+${p}`;
  if (p.startsWith("0")) p = p.slice(1);
  const out = `+${code}${p}`;
  return /^\+\d{8,15}$/.test(out) ? out : null;
};

/** Sends a text. Resolves to the Twilio message SID, or null if not sent. */
export const sendSms = async (to, body) => {
  if (!smsConfigured() || !to || !body) return null;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  try {
    const params = new URLSearchParams({ To: to, From: process.env.TWILIO_FROM_NUMBER, Body: body });
    const { data } = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      params.toString(),
      {
        auth: { username: sid, password: process.env.TWILIO_AUTH_TOKEN },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );
    return data?.sid || null;
  } catch (error) {
    console.error("SMS send failed:", error?.response?.data?.message || error.message);
    return null;
  }
};

/**
 * Checks the X-Twilio-Signature header on an inbound webhook.
 * Twilio signs the full URL followed by every POST parameter (sorted by name,
 * name immediately followed by value) with HMAC-SHA1 using the auth token.
 */
export const validTwilioSignature = (signature, url, params, authToken = process.env.TWILIO_AUTH_TOKEN) => {
  if (!signature || !url || !authToken) return false;
  const data = Object.keys(params || {})
    .sort()
    .reduce((acc, key) => acc + key + (params[key] ?? ""), url);
  const expected = crypto.createHmac("sha1", authToken).update(Buffer.from(data, "utf-8")).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const clip = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/** The text a seller receives for a new question. Kept to ~2–3 SMS segments. */
export const newQuestionSmsBody = ({ listingTitle, question, link }) =>
  `RexBid: New question on your ${clip(listingTitle, 40)}:\n"${clip(question, 160)}"\n` +
  `Reply to this text to answer (your reply is shown on the listing). Or answer here: ${link}`;

/** TwiML response for an inbound text (an empty Response sends no reply). */
export const twiml = (message) => {
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${esc(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
};
