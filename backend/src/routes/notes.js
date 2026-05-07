import express from 'express';
import { body } from 'express-validator';
import {
  summarizeNote, getNotes, getNoteById, updateNote, deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();
router.use(protect);

router.post('/summarize',
  body('text').trim().isLength({ min: 50 }).withMessage('Text must be at least 50 characters'),
  validate,
  summarizeNote
);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
