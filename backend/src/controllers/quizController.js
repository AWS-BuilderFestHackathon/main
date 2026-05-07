import Quiz from '../models/Quiz.js';
import Note from '../models/Note.js';
import User from '../models/User.js';
import { generateQuizQuestions } from '../services/geminiService.js';
import { asyncHandler } from '../utils/helpers.js';

// POST /api/quiz/generate
export const generateQuiz = asyncHandler(async (req, res) => {
  const { noteId, difficulty = 'medium', questionCount = 5 } = req.body;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: noteId, user: userId });
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  const questions = await generateQuizQuestions(note.originalText, difficulty, questionCount);

  const quiz = await Quiz.create({
    user: userId,
    note: noteId,
    title: `Quiz: ${note.title}`,
    difficulty,
    questions,
  });

  res.status(201).json({
    success: true,
    quiz: { id: quiz._id, title: quiz.title, questions, totalQuestions: questions.length },
  });
});

// GET /api/quiz
export const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id })
    .populate('note', 'title subject')
    .sort({ createdAt: -1 })
    .select('-questions');

  res.json({ success: true, quizzes });
});

// GET /api/quiz/:id
export const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  res.json({ success: true, quiz });
});

// POST /api/quiz/:id/submit
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });

  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

  let correct = 0;
  const results = quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) correct++;
    return {
      question: q.question,
      userAnswer: answers[i],
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      options: q.options,
    };
  });

  const score = Math.round((correct / quiz.questions.length) * 100);

  quiz.isTaken = true;
  quiz.score = score;
  quiz.answers = answers;
  quiz.completedAt = new Date();
  quiz.timeTaken = timeTaken || 0;
  await quiz.save();

  await User.findByIdAndUpdate(req.user._id, { $inc: { totalQuizzes: 1 } });

  res.json({ success: true, score, correct, total: quiz.questions.length, results });
});

// DELETE /api/quiz/:id
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  res.json({ success: true, message: 'Quiz deleted' });
});
