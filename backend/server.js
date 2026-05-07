import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './src/config/database.js';
import { configurePassport } from './src/config/passport.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import logger from './src/utils/logger.js';

// Routes
import authRoutes from './src/routes/auth.js';
import noteRoutes from './src/routes/notes.js';
import quizRoutes from './src/routes/quiz.js';
import doubtRoutes from './src/routes/doubts.js';
import plannerRoutes from './src/routes/planner.js';
import userRoutes from './src/routes/user.js';
import backgroundRoutes from './src/routes/background.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// AI endpoints get stricter limiting (Gemini quota protection)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'AI request limit reached. Please wait a moment.' },
});
app.use('/api/notes/summarize', aiLimiter);
app.use('/api/quiz/generate', aiLimiter);
app.use('/api/doubts', aiLimiter);
app.use('/api/planner/generate', aiLimiter);
app.use('/api/background/generate', aiLimiter);

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Session (Passport) ────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// ── Passport ──────────────────────────────────────────────────
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/background', backgroundRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
