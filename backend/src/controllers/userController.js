import User from '../models/User.js';
import Note from '../models/Note.js';
import Quiz from '../models/Quiz.js';
import Doubt from '../models/Doubt.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { asyncHandler } from '../utils/helpers.js';

// GET /api/user/profile
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/user/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, theme, defaultDifficulty, notificationsEnabled, preferredStudyTimes } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio, theme, defaultDifficulty, notificationsEnabled, preferredStudyTimes },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user });
});

// POST /api/user/profile/picture
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const url = await uploadToCloudinary(req.file.buffer, {
    folder: 'ai-study-planner/avatars',
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: url },
    { new: true }
  );

  res.json({ success: true, profilePictureUrl: url, user });
});

// GET /api/user/stats
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [user, recentNotes, recentQuizzes, recentDoubts] = await Promise.all([
    User.findById(userId),
    Note.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select('title subject createdAt'),
    Quiz.find({ user: userId, isTaken: true }).sort({ completedAt: -1 }).limit(5).select('title score completedAt'),
    Doubt.find({ user: userId }).sort({ updatedAt: -1 }).limit(5).select('title subject isResolved'),
  ]);

  res.json({
    success: true,
    stats: {
      totalNotes: user.totalNotes,
      totalQuizzes: user.totalQuizzes,
      totalDoubts: user.totalDoubts,
      studyStreak: user.studyStreak,
      lastActiveDate: user.lastActiveDate,
    },
    recentActivity: {
      notes: recentNotes,
      quizzes: recentQuizzes,
      doubts: recentDoubts,
    },
  });
});
