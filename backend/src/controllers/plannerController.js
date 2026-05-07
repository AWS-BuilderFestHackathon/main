import StudyPlan from '../models/StudyPlan.js';
import { generateStudyPlan } from '../services/geminiService.js';
import { asyncHandler } from '../utils/helpers.js';

// POST /api/planner/generate
export const generatePlan = asyncHandler(async (req, res) => {
  const { subject, examDate, hoursPerDay = 2, currentLevel = 'beginner' } = req.body;

  const planData = await generateStudyPlan({ subject, examDate, hoursPerDay, currentLevel });

  const plan = await StudyPlan.create({
    user: req.user._id,
    title: planData.title || `${subject} Study Plan`,
    subject,
    examDate,
    tasks: planData.tasks || [],
    generatedByAI: true,
  });

  res.status(201).json({ success: true, plan });
});

// GET /api/planner
export const getPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, plans });
});

// GET /api/planner/:id
export const getPlanById = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found' });
  res.json({ success: true, plan });
});

// POST /api/planner/:id/task
export const addTask = asyncHandler(async (req, res) => {
  const { title, description, date, duration, priority, subject } = req.body;

  const plan = await StudyPlan.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $push: { tasks: { title, description, date, duration, priority, subject } } },
    { new: true, runValidators: true }
  );

  if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found' });
  res.json({ success: true, plan });
});

// PUT /api/planner/:planId/task/:taskId
export const updateTask = asyncHandler(async (req, res) => {
  const { completed, title, description, priority, date, duration } = req.body;
  const plan = await StudyPlan.findOne({ _id: req.params.planId, user: req.user._id });

  if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found' });

  const task = plan.tasks.id(req.params.taskId);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  if (completed !== undefined) task.completed = completed;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority) task.priority = priority;
  if (date) task.date = date;
  if (duration) task.duration = duration;

  await plan.save();
  res.json({ success: true, plan });
});

// DELETE /api/planner/:planId/task/:taskId
export const deleteTask = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.planId, user: req.user._id });
  if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found' });

  plan.tasks.pull({ _id: req.params.taskId });
  await plan.save();
  res.json({ success: true, plan });
});

// DELETE /api/planner/:id
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found' });
  res.json({ success: true, message: 'Plan deleted' });
});
