import Note from '../models/Note.js';
import User from '../models/User.js';
import { summarizeNotes, generateQuizQuestions } from '../services/geminiService.js';
import { asyncHandler } from '../utils/helpers.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import Quiz from '../models/Quiz.js';

// POST /api/notes/summarize
export const summarizeNote = asyncHandler(async (req, res) => {
  const { text, title, subject, tags } = req.body;
  const userId = req.user._id;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least 50 characters of text to summarize',
    });
  }

  const aiResponse = await summarizeNotes(text);

  const note = await Note.create({
    user: userId,
    originalText: text,
    title: title || `Note — ${new Date().toLocaleDateString()}`,
    subject: subject || 'General',
    summary: aiResponse.summary,
    keyPoints: aiResponse.keyPoints || [],
    difficulty: aiResponse.difficulty || 'intermediate',
    estimatedReadTime: aiResponse.estimatedReadTime || '5 minutes',
    tags: tags || [],
  });

  await User.findByIdAndUpdate(userId, { $inc: { totalNotes: 1 } });

  res.status(201).json({ success: true, ...aiResponse, noteId: note._id, note });
});

// POST /api/notes/save — save note without AI summarization
export const saveNote = asyncHandler(async (req, res) => {
  const { text, title, subject, tags } = req.body;
  const userId = req.user._id;

  if (!text || text.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least 10 characters of text to save',
    });
  }

  const note = await Note.create({
    user: userId,
    originalText: text,
    title: title || `Note — ${new Date().toLocaleDateString()}`,
    subject: subject || 'General',
    summary: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
    tags: tags || [],
  });

  await User.findByIdAndUpdate(userId, { $inc: { totalNotes: 1 } });

  res.status(201).json({ success: true, noteId: note._id, note });
});

// GET /api/notes
export const getNotes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, subject, search } = req.query;
  const filter = { user: req.user._id };

  if (subject && subject !== 'All') filter.subject = subject;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { summary: { $regex: search, $options: 'i' } },
  ];

  const notes = await Note.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .select('-originalText');

  const total = await Note.countDocuments(filter);

  res.json({
    success: true,
    notes,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
    },
  });
});

// GET /api/notes/:id
export const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  res.json({ success: true, note });
});

// PUT /api/notes/:id
export const updateNote = asyncHandler(async (req, res) => {
  const { title, subject, tags } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { title, subject, tags },
    { new: true, runValidators: true }
  );
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  res.json({ success: true, note });
});

// DELETE /api/notes/:id
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalNotes: -1 } });
  res.json({ success: true, message: 'Note deleted' });
});
