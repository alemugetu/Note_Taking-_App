import express from 'express';
import { protect } from '../middleware/auth.js';
import { getNotifications, markRead, markReadBulk, deleteBulk } from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/notifications - get current user's notifications
router.get('/', protect, getNotifications);

// PUT /api/notifications/:id/read - mark a notification read
router.put('/:id/read', protect, markRead);

// POST /api/notifications/mark-read - body: { ids: [..] }
router.post('/mark-read', protect, markReadBulk);

// DELETE /api/notifications - body: { ids: [..] }
router.delete('/', protect, deleteBulk);

export default router;
