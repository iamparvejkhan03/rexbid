import express from 'express';
import { buyNow, checkBuyNowAvailability } from '../controllers/auction.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const buyNowRouter = express.Router();

// Buy Now routes
buyNowRouter.post('/:id', auth, buyNow);
buyNowRouter.get('/:id/check', auth, checkBuyNowAvailability);

export default buyNowRouter;