import { Router } from 'express';
import {
    addComment,
    getComments,
    toggleLike,
    updateComment,
    deleteComment,
    flagComment,
    getFlaggedComments,
    getCommentStats,
    adminDeleteComment,
    restoreComment,
    clearFlags
} from '../controllers/comment.controller.js';
import { auth, authAdmin } from '../middlewares/auth.middleware.js';

const commentRouter = Router();

// All routes require authentication
// commentRouter.use(auth);

// Comment CRUD operations
commentRouter.post('/auction/:auctionId', auth, addComment);
commentRouter.get('/auction/:auctionId', getComments);
commentRouter.post('/:commentId/like', auth, toggleLike);
commentRouter.put('/:commentId', auth, updateComment);
// Owner (within 15 minutes) or admin; admins are routed to adminDeleteComment.
commentRouter.delete('/:commentId', auth, deleteComment);
commentRouter.post('/:commentId/flag', auth, flagComment);

// Comment moderation routes
commentRouter.get('/flagged', authAdmin, getFlaggedComments);
commentRouter.get('/stats', authAdmin, getCommentStats);
commentRouter.patch('/:commentId/restore', authAdmin, restoreComment);
commentRouter.patch('/:commentId/clear-flags', authAdmin, clearFlags);

export default commentRouter;