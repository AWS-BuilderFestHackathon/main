import Doubt from '../models/Doubt.js';
import User from '../models/User.js';
import { solveDoubt } from '../services/geminiService.js';
import { asyncHandler } from '../utils/helpers.js';

// POST /api/doubts — start new doubt session
export const createDoubt = asyncHandler(async (req, res) => {
  const { message, subject = 'General' } = req.body;
  const userId = req.user._id;

  // Build conversation history for Gemini (empty for first message)
  const aiResponse = await solveDoubt(message, subject, []);

  const doubt = await Doubt.create({
    user: userId,
    title: message.slice(0, 80),
    subject,
    messages: [
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse },
    ],
  });

  await User.findByIdAndUpdate(userId, { $inc: { totalDoubts: 1 } });

  res.status(201).json({ success: true, doubt, aiResponse });
});

// GET /api/doubts
export const getDoubts = asyncHandler(async (req, res) => {
  const doubts = await Doubt.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title subject isResolved createdAt updatedAt');

  res.json({ success: true, doubts });
});

// GET /api/doubts/:id
export const getDoubtById = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findOne({ _id: req.params.id, user: req.user._id });
  if (!doubt) return res.status(404).json({ success: false, message: 'Doubt session not found' });
  res.json({ success: true, doubt });
});

// POST /api/doubts/:id/message — continue conversation
export const addMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const doubt = await Doubt.findOne({ _id: req.params.id, user: req.user._id });

  if (!doubt) return res.status(404).json({ success: false, message: 'Doubt session not found' });

  // Build Gemini history from existing messages
  const history = doubt.messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const aiResponse = await solveDoubt(message, doubt.subject, history);

  doubt.messages.push({ role: 'user', content: message });
  doubt.messages.push({ role: 'assistant', content: aiResponse });
  await doubt.save();

  res.json({ success: true, doubt, aiResponse });
});

// PUT /api/doubts/:id/resolve
export const resolveDoubt = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isResolved: true },
    { new: true }
  );
  if (!doubt) return res.status(404).json({ success: false, message: 'Doubt session not found' });
  res.json({ success: true, doubt });
});
