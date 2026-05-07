import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  subject: { type: String, default: 'General' },
});

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true, trim: true },
  subject: { type: String, default: 'General' },
  examDate: { type: Date, default: null },
  tasks: [taskSchema],
  generatedByAI: { type: Boolean, default: false },
}, { timestamps: true });

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export default StudyPlan;
