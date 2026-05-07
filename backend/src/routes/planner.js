import express from 'express';
import { body } from 'express-validator';
import {
  generatePlan, getPlans, getPlanById,
  addTask, updateTask, deleteTask, deletePlan,
} from '../controllers/plannerController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();
router.use(protect);

router.post('/generate',
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('examDate').isISO8601().withMessage('Valid exam date required'),
  validate,
  generatePlan
);
router.get('/', getPlans);
router.get('/:id', getPlanById);
router.delete('/:id', deletePlan);
router.post('/:id/task',
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('date').isISO8601().withMessage('Valid date required'),
  validate,
  addTask
);
router.put('/:planId/task/:taskId', updateTask);
router.delete('/:planId/task/:taskId', deleteTask);

export default router;
