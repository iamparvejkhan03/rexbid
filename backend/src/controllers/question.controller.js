// Listing Questions & Answers.
//
// Buyers ask questions on a listing; only the seller (or RexBid staff) can
// answer. Everything is public on the listing so every bidder sees the same
// information. Phone numbers, emails and "let's deal privately" messages are
// blocked (utils/contactFilter.js).
//
// Questions are stored in the existing Comment collection (top-level comment =
// question, reply = answer) so Admin → Comments moderation keeps working.

import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import { publicName } from "../utils/displayName.js";
import { contactModeFor } from "../utils/contactPolicy.js";
import { checkForContactDetails, CONTACT_BLOCKED_MESSAGE } from "../utils/contactFilter.js";
import { newQuestionSellerEmail, questionAnsweredEmail } from "../utils/nodemailer.js";
import { newQuestionSmsBody, sendSms, smsConfigured, toE164, twiml, validTwilioSignature } from "../utils/sms.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://rexbid.ie";
const STAFF_TYPES = new Set(["admin", "staff"]);
const QUESTION_MIN = 5;
const QUESTION_MAX = 600;
const ANSWER_MAX = 1500;
const QUESTIONS_PER_USER_PER_DAY = 5;
// Questions can be asked while a lot is upcoming or live.
const OPEN_STATUSES = new Set(["draft", "approved", "active"]);
// A seller's text reply is matched to a question texted within this window.
const SMS_REPLY_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const idStr = (v) => (v && typeof v === "object" ? v._id ?? v : v)?.toString?.();
const isStaff = (user) => !!user && STAFF_TYPES.has(user.userType);
const plainToHtml = (t) =>
  String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

const questionLink = (auctionId, questionId) =>
  `${FRONTEND_URL}/auction/${auctionId}?tab=questions#q-${questionId}`;

const nameFor = (doc, fallback) => doc.displayName || publicName(doc.user, fallback);

// Shape sent to the browser: no surnames, usernames, emails or phone numbers.
const toPublicQuestion = (q, answers, viewerId) => ({
  _id: q._id,
  content: q.content,
  askedBy: nameFor(q, "Bidder"),
  isMine: !!viewerId && idStr(q.user) === viewerId,
  createdAt: q.createdAt,
  answeredAt: q.answeredAt || answers[0]?.createdAt || null,
  helpfulCount: q.likes?.length || 0,
  markedHelpful: !!viewerId && (q.likes || []).some((l) => idStr(l.user) === viewerId),
  answers: answers.map((a) => ({
    _id: a._id,
    content: a.content,
    by: a.authorRole === "admin" ? "RexBid" : nameFor(a, "Seller"),
    role: a.authorRole || "seller",
    createdAt: a.createdAt,
  })),
});

// GET /api/v1/questions/auction/:auctionId
export const getQuestions = async (req, res) => {
  try {
    const { auctionId } = req.params;
    if (!mongoose.isValidObjectId(auctionId)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    const auction = await Auction.findById(auctionId).select("seller status auctionType reservePrice baseCurrency").lean();
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });

    const viewerId = req.user?._id?.toString();
    const viewerIsSeller = !!viewerId && idStr(auction.seller) === viewerId;

    const docs = await Comment.find({ auction: auctionId, status: "active" })
      .populate("user", "firstName companyName username")
      .sort({ createdAt: 1 })
      .limit(500)
      .lean();

    const questions = docs.filter((d) => !d.parentComment);
    const answersByQuestion = new Map();
    for (const d of docs) {
      if (!d.parentComment) continue;
      const key = d.parentComment.toString();
      if (!answersByQuestion.has(key)) answersByQuestion.set(key, []);
      answersByQuestion.get(key).push(d);
    }

    // Older comments were replies by anyone. Only count the seller's/staff's as answers.
    const sellerId = idStr(auction.seller);
    const isAnswerDoc = (a) =>
      a.authorRole === "seller" || a.authorRole === "admin" || idStr(a.user) === sellerId;

    const list = questions
      .map((q) => toPublicQuestion(q, (answersByQuestion.get(q._id.toString()) || []).filter(isAnswerDoc), viewerId))
      // Newest first; the browser groups answered / awaiting.
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const answered = list.filter((q) => q.answers.length > 0);
    const hours = answered
      .map((q) => (new Date(q.answers[0].createdAt) - new Date(q.createdAt)) / 36e5)
      .filter((h) => h >= 0)
      .sort((a, b) => a - b);
    const typicalAnswerHours = hours.length >= 3 ? Math.max(1, Math.round(hours[Math.floor(hours.length / 2)])) : null;

    res.json({
      success: true,
      data: {
        questions: list,
        stats: { total: list.length, answered: answered.length, typicalAnswerHours },
        viewerIsSeller,
        viewerIsStaff: isStaff(req.user),
        canAsk: OPEN_STATUSES.has(auction.status),
        contactMode: contactModeFor(auction),
      },
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ success: false, message: "Could not load questions" });
  }
};

const notifySellerOfQuestion = async (auction, question, askerName) => {
  const seller = await User.findById(auction.seller).select("email firstName companyName username phone countryCode").lean();
  if (!seller) return;

  newQuestionSellerEmail(seller, auction, question, askerName).catch((e) =>
    console.error("New question email failed:", e)
  );

  if (!smsConfigured()) return;
  const to = toE164(seller.phone, seller.countryCode);
  if (!to) return;
  const sid = await sendSms(
    to,
    newQuestionSmsBody({ listingTitle: auction.title, question: question.content, link: questionLink(auction._id, question._id) })
  );
  if (sid) {
    await Comment.updateOne(
      { _id: question._id },
      { $set: { "sms.notifiedTo": to, "sms.notifiedAt": new Date(), "sms.messageSid": sid } }
    );
  }
};

// POST /api/v1/questions/auction/:auctionId   { content }
export const askQuestion = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const content = String(req.body?.content || "").trim();
    if (!mongoose.isValidObjectId(auctionId)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    const auction = await Auction.findById(auctionId).select("title seller status").lean();
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });

    if (idStr(auction.seller) === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't ask a question on your own listing. You can answer buyers' questions below." });
    }
    if (!OPEN_STATUSES.has(auction.status)) {
      return res.status(400).json({ success: false, message: "Questions are closed because this auction has ended." });
    }
    if (content.length < QUESTION_MIN) {
      return res.status(400).json({ success: false, message: "Please type your question." });
    }
    if (content.length > QUESTION_MAX) {
      return res.status(400).json({ success: false, message: `Please keep your question under ${QUESTION_MAX} characters.` });
    }
    const check = checkForContactDetails(content);
    if (!check.ok) {
      return res.status(422).json({ success: false, code: "contact_details", reason: check.reason, message: CONTACT_BLOCKED_MESSAGE });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await Comment.countDocuments({
      auction: auctionId,
      user: req.user._id,
      parentComment: null,
      createdAt: { $gte: since },
    });
    if (recent >= QUESTIONS_PER_USER_PER_DAY) {
      return res.status(429).json({ success: false, message: "You've asked several questions on this lot today. Please wait for the seller to answer." });
    }

    const askedBy = publicName(req.user, "Bidder");
    const question = await Comment.create({
      auction: auctionId,
      user: req.user._id,
      userName: req.user.username || askedBy,
      displayName: askedBy,
      authorRole: "buyer",
      content,
      contentHtml: plainToHtml(content),
      parentComment: null,
    });

    res.status(201).json({
      success: true,
      message: "Question sent to the seller",
      data: { question: toPublicQuestion(question.toObject(), [], req.user._id.toString()) },
    });

    notifySellerOfQuestion(auction, question, askedBy).catch((e) => console.error("Notify seller of question failed:", e));
  } catch (error) {
    console.error("Ask question error:", error);
    res.status(500).json({ success: false, message: "Could not send your question" });
  }
};

/**
 * Saves an answer and tells the asker (and others who asked on the lot).
 * Shared by the website and text-message replies.
 */
const saveAnswer = async ({ question, auction, answerer, role, content, source }) => {
  const by = role === "admin" ? "RexBid" : publicName(answerer, "Seller");
  const answer = await Comment.create({
    auction: auction._id,
    user: answerer._id,
    userName: answerer.username || by,
    displayName: by,
    authorRole: role,
    answerSource: source,
    content,
    contentHtml: plainToHtml(content),
    parentComment: question._id,
  });
  if (!question.answeredAt) {
    await Comment.updateOne({ _id: question._id }, { $set: { answeredAt: answer.createdAt } });
  }

  // Email the asker, plus anyone else who has asked on this lot.
  (async () => {
    const askerIds = await Comment.find({ auction: auction._id, parentComment: null, status: "active" }).distinct("user");
    const people = await User.find({ _id: { $in: askerIds } }).select("email firstName").lean();
    const askerId = idStr(question.user);
    for (const p of people) {
      if (idStr(p._id) === idStr(answerer._id)) continue;
      questionAnsweredEmail(p, auction, question, answer, by, idStr(p._id) === askerId).catch((e) =>
        console.error("Question answered email failed:", e)
      );
    }
  })().catch((e) => console.error("Answer notifications failed:", e));

  return answer;
};

// POST /api/v1/questions/:questionId/answers   { content }
export const answerQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const content = String(req.body?.content || "").trim();
    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    const question = await Comment.findOne({ _id: questionId, parentComment: null, status: "active" });
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const auction = await Auction.findById(question.auction).select("title seller").lean();
    if (!auction) return res.status(404).json({ success: false, message: "Listing not found" });

    const isSeller = idStr(auction.seller) === req.user._id.toString();
    const staff = isStaff(req.user);
    if (!isSeller && !staff) {
      return res.status(403).json({ success: false, message: "Only the seller can answer questions on this listing." });
    }
    if (!content) return res.status(400).json({ success: false, message: "Please type your answer." });
    if (content.length > ANSWER_MAX) {
      return res.status(400).json({ success: false, message: `Please keep your answer under ${ANSWER_MAX} characters.` });
    }
    // Staff answers are trusted; sellers' answers are checked for contact details.
    if (!staff) {
      const check = checkForContactDetails(content);
      if (!check.ok) {
        return res.status(422).json({ success: false, code: "contact_details", reason: check.reason, message: CONTACT_BLOCKED_MESSAGE });
      }
    }

    const answer = await saveAnswer({
      question,
      auction,
      answerer: req.user,
      role: isSeller ? "seller" : "admin",
      content,
      source: "web",
    });

    res.status(201).json({
      success: true,
      message: "Answer posted",
      data: {
        answer: {
          _id: answer._id,
          content: answer.content,
          by: answer.displayName,
          role: answer.authorRole,
          createdAt: answer.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Answer question error:", error);
    res.status(500).json({ success: false, message: "Could not post your answer" });
  }
};

// POST /api/v1/questions/:questionId/helpful  (toggle)
export const toggleHelpful = async (req, res) => {
  try {
    const { questionId } = req.params;
    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    const question = await Comment.findOne({ _id: questionId, parentComment: null, status: "active" });
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const marked = question.isLikedByUser(req.user._id);
    if (marked) question.removeLike(req.user._id);
    else question.addLike(req.user._id);
    await question.save();

    res.json({ success: true, data: { markedHelpful: !marked, helpfulCount: question.likes.length } });
  } catch (error) {
    console.error("Toggle helpful error:", error);
    res.status(500).json({ success: false, message: "Could not update" });
  }
};

// DELETE /api/v1/questions/:questionId
// The asker can withdraw an unanswered question; staff can remove anything.
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    if (!mongoose.isValidObjectId(questionId)) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    const doc = await Comment.findOne({ _id: questionId, status: "active" });
    if (!doc) return res.status(404).json({ success: false, message: "Question not found" });

    const staff = isStaff(req.user);
    const own = idStr(doc.user) === req.user._id.toString();
    if (!staff) {
      if (!own) return res.status(403).json({ success: false, message: "You can only remove your own questions." });
      if (doc.answeredAt) {
        return res.status(400).json({ success: false, message: "Questions can't be removed once the seller has answered." });
      }
    }

    doc.status = "deleted";
    doc.deletedAt = new Date();
    doc.deletedBy = req.user._id;
    if (staff && req.body?.deleteReason) doc.adminDeleteReason = req.body.deleteReason;
    await doc.save();

    res.json({ success: true, message: "Removed", data: { questionId } });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ success: false, message: "Could not remove" });
  }
};

// POST /api/v1/sms/inbound  (Twilio webhook: a seller replied to a question text)
export const inboundSms = async (req, res) => {
  const reply = (message) => res.type("text/xml").send(twiml(message));
  try {
    const url = process.env.SMS_INBOUND_URL;
    if (!url || !validTwilioSignature(req.header("X-Twilio-Signature"), url, req.body || {})) {
      return res.status(403).send("Forbidden");
    }

    const from = String(req.body?.From || "").trim();
    const body = String(req.body?.Body || "").trim();
    if (!from || !body) return reply(null);
    // STOP / START / HELP are handled by Twilio's opt-out handling.
    if (/^(stop|stopall|unsubscribe|cancel|end|quit|start|unstop|help|info)$/i.test(body)) return reply(null);

    const since = new Date(Date.now() - SMS_REPLY_WINDOW_MS);
    const candidates = await Comment.find({
      "sms.notifiedTo": from,
      "sms.notifiedAt": { $gte: since },
      parentComment: null,
      status: "active",
    })
      .sort({ "sms.notifiedAt": -1 })
      .limit(10);

    // The most recent question texted to this number that has no answer yet,
    // otherwise the most recent one.
    const question = candidates.find((q) => !q.answeredAt) || candidates[0];
    if (!question) {
      return reply("RexBid: we couldn't match your reply to a question. Please answer on the listing at rexbid.ie.");
    }

    const auction = await Auction.findById(question.auction).select("title seller status").lean();
    const seller = auction && (await User.findById(auction.seller).select("firstName companyName username phone countryCode").lean());
    // Only the listing's seller can answer by text.
    if (!seller || toE164(seller.phone, seller.countryCode) !== from) {
      return reply("RexBid: we couldn't match your reply to a question. Please answer on the listing at rexbid.ie.");
    }

    if (body.length > ANSWER_MAX) {
      return reply(`RexBid: your reply is too long. Please keep it under ${ANSWER_MAX} characters, or answer on the listing.`);
    }
    const check = checkForContactDetails(body);
    if (!check.ok) {
      return reply(
        "RexBid: your answer wasn't posted because it includes contact details or asks to deal off RexBid. Please reply again without them."
      );
    }

    await saveAnswer({ question, auction, answerer: seller, role: "seller", content: body, source: "sms" });
    return reply(`RexBid: thanks, your answer is now on the listing "${String(auction.title || "").slice(0, 40)}".`);
  } catch (error) {
    console.error("Inbound SMS error:", error);
    return reply(null);
  }
};
