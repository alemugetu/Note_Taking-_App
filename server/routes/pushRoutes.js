import express from 'express';
import { protect } from '../middleware/auth.js';
import { saveSubscription, deleteSubscription, getVapidKey } from '../controllers/pushController.js';

import { getSubscription } from '../controllers/pushController.js';

const router = express.Router();

// POST /api/push - save subscription
router.post('/', protect, saveSubscription);

// DELETE /api/push - remove subscription(s) for user
router.delete('/', protect, deleteSubscription);

// GET /api/push/vapid - get VAPID public key
router.get('/vapid', getVapidKey);

// GET /api/push/subscription - get current user's saved subscription
router.get('/subscription', protect, getSubscription);

export default router;

