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
import { testRegister } from '../test-controller.js';
import { simpleRegister } from '../simple-register.js';
import { debugRegister } from '../debug-register.js';
import { testUserModel } from '../test-user-model.js';
import { manualHashRegister } from '../manual-hash-register.js';
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

// Debug routes (no database operations)
router.post('/test', testRegister);
router.post('/debug-register', debugRegister);

// Database test routes
router.post('/test-user-model', testUserModel);
router.post('/simple-register', simpleRegister);
router.post('/manual-hash-register', manualHashRegister);

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
