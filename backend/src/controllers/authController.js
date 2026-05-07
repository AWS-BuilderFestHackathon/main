import passport from 'passport';
import User from '../models/User.js';
import { generateToken } from '../middlewares/auth.js';
import { generateOTP, otpExpiry } from '../utils/helpers.js';
import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService.js';
import { asyncHandler } from '../utils/helpers.js';

// ── Google OAuth ──────────────────────────────────────────────
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=oauth_failed`);
    }
    const token = generateToken(user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  })(req, res, next);
};

// ── Email OTP Flow ────────────────────────────────────────────
export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const expiry = otpExpiry(10);

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: email.split('@')[0],
      email,
      otp,
      otpExpiry: expiry,
    });
  } else {
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();
  }

  await sendOTPEmail({ to: email, otp, name: user.name });

  res.json({ success: true, message: 'OTP sent to your email' });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
  }

  // Clear OTP
  user.otp = null;
  user.otpExpiry = null;
  user.lastActiveDate = new Date();
  await user.save();

  const isNew = user.createdAt.getTime() === user.updatedAt.getTime();
  if (isNew) await sendWelcomeEmail({ to: email, name: user.name });

  const token = generateToken(user._id);
  res.json({ success: true, token, user });
});

// ── Traditional Auth ──────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });
  await sendWelcomeEmail({ to: email, name });
  const token = generateToken(user._id);

  res.status(201).json({ success: true, token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  user.lastActiveDate = new Date();
  await user.save();

  const token = generateToken(user._id);
  res.json({ success: true, token, user });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
