import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Original Content
  originalText: { type: String, required: true },
  title: { type: String, default: 'Untitled Note', trim: true },
  subject: { type: String, default: 'General', trim: true },

  // AI Generated
  summary: { type: String, required: true },
  keyPoints: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  estimatedReadTime: { type: String, default: '5 minutes' },

  // Metadata
  tags: [{ type: String }],
  fileUrl: { type: String, default: null }, // Cloudinary URL for uploaded files
  wordCount: { type: Number, default: 0 },
}, { timestamps: true });

// Auto word count
noteSchema.pre('save', function (next) {
  if (this.isModified('originalText')) {
    this.wordCount = this.originalText.trim().split(/\s+/).length;
  }
  next();
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
