import express from 'express';
import { body } from 'express-validator';
import {
  generateQuiz, getQuizzes, getQuizById, submitQuiz, deleteQuiz,
} from '../controllers/quizController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();
router.use(protect);

router.post('/generate',
  body('noteId').notEmpty().withMessage('Note ID is required'),
  body('questionCount').optional().isInt({ min: 1, max: 20 }),
  validate,
  generateQuiz
);
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit',
  body('answers').isArray().withMessage('Answers must be an array'),
  validate,
  submitQuiz
);
router.delete('/:id', deleteQuiz);

export default router;
