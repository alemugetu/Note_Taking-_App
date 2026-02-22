import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { testRegister } from '../test-controller.js';
import { simpleRegister } from '../simple-register.js';
import { debugRegister } from '../debug-register.js';
import { testUserModel } from '../test-user-model.js';
import { manualHashRegister } from '../manual-hash-register.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

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

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
