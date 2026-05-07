import express from 'express';
import { body } from 'express-validator';
import {
  googleAuth, googleCallback,
  sendOTP, verifyOTP,
  register, login,
  getMe, logout,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// OTP Flow
router.post('/send-otp',
  body('email').isEmail().withMessage('Valid email required'),
  validate,
  sendOTP
);
router.post('/verify-otp',
  body('email').isEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validate,
  verifyOTP
);

// Traditional Auth
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  register
);
router.post('/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  login
);

// Protected
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
