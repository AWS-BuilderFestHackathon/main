import express from 'express';
import { body } from 'express-validator';
import {
  createDoubt, getDoubts, getDoubtById, addMessage, resolveDoubt,
} from '../controllers/doubtController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();
router.use(protect);

router.post('/',
  body('message').trim().notEmpty().withMessage('Message is required'),
  validate,
  createDoubt
);
router.get('/', getDoubts);
router.get('/:id', getDoubtById);
router.post('/:id/message',
  body('message').trim().notEmpty().withMessage('Message is required'),
  validate,
  addMessage
);
router.put('/:id/resolve', resolveDoubt);

export default router;
