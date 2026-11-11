import { Router } from "express";
import {
  answerQuestion,
  askQuestion,
  deleteQuestion,
  getQuestions,
  inboundSms,
  toggleHelpful,
} from "../controllers/question.controller.js";
import { auth, optionalAuth } from "../middlewares/auth.middleware.js";

// Listing Questions & Answers – mounted at /api/v1/questions
export const questionRouter = Router();
questionRouter.get("/auction/:auctionId", optionalAuth, getQuestions);
questionRouter.post("/auction/:auctionId", auth, askQuestion);
questionRouter.post("/:questionId/answers", auth, answerQuestion);
questionRouter.post("/:questionId/helpful", auth, toggleHelpful);
questionRouter.delete("/:questionId", auth, deleteQuestion);

// Twilio "A message comes in" webhook – mounted at /api/v1/sms
export const smsRouter = Router();
smsRouter.post("/inbound", inboundSms);
