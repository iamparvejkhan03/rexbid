import { Router } from 'express';
import {
    setReminder,
    unsubscribeReminder,
    getReminderStatus,
    getGroupedReminders,
    getFlatReminders,
    deleteRemindersByEmail,
    deleteReminder,
} from '../controllers/reminder.controller.js';
import { authAdmin } from '../middlewares/auth.middleware.js';

const reminderRouter = Router();


// ============================================================
// PUBLIC (no auth) — for unregistered visitors
// ============================================================
reminderRouter.post('/', setReminder);
reminderRouter.get('/unsubscribe/:token', unsubscribeReminder);
reminderRouter.get('/status/:auctionId', getReminderStatus);

// ============================================================
// ADMIN
// ============================================================
reminderRouter.get('/admin/grouped', authAdmin, getGroupedReminders);
reminderRouter.get('/admin/flat', authAdmin, getFlatReminders);
reminderRouter.delete(
    '/admin/email/:email',
    authAdmin,
    deleteRemindersByEmail
);
reminderRouter.delete('/admin/:id', authAdmin, deleteReminder);

export default reminderRouter;