import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for forgot-password (max 5 requests per 15 minutes per IP)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many password reset requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Original routes
router.post('/register', register);
router.post('/login', login);

// Password reset routes (public)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
