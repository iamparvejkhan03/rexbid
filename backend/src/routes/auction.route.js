import express, { Router } from 'express';
import {
    createAuction,
    getAuctions,
    getAuction,
    updateAuction,
    deleteAuction,
    placeBid,
    getUserAuctions,
    getBiddingStats,
    getWonAuctions,
    getSoldAuctions,
    getTopLiveAuctions,
    lowerReservePrice,
    getAuctionCommission
} from '../controllers/auction.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { auth, authBidder, authSeller } from '../middlewares/auth.middleware.js';

const auctionRouter = Router();

// Protected routes
auctionRouter.post('/create', authSeller, upload.fields([
    { name: 'photos' },
    { name: 'documents' },
    { name: 'serviceRecords' },
]), createAuction);

auctionRouter.put('/update/:id', authSeller, upload.fields([
    { name: 'photos' },
    { name: 'documents' },
    { name: 'serviceRecords' },
]), updateAuction);
auctionRouter.delete('/delete/:id', authSeller, deleteAuction);
auctionRouter.post('/bid/:id', authBidder, placeBid);
auctionRouter.get('/user/my-auctions', authSeller, getUserAuctions);
auctionRouter.get('/stats', auth, getBiddingStats);
auctionRouter.get('/won-auctions', auth, getWonAuctions);
auctionRouter.get('/sold-auctions', authSeller, getSoldAuctions);
auctionRouter.get('/top', getTopLiveAuctions);
auctionRouter.patch('/:id/lower-reserve', authSeller, lowerReservePrice);

// Public routes
auctionRouter.get('/', getAuctions);
auctionRouter.get('/:id', getAuction);
auctionRouter.get('/:id/commission', auth, getAuctionCommission);

export default auctionRouter;