import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }], // Cloudinary image URLs
  timestamp: { type: Date, default: Date.now },
});

const doubtSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, default: 'New Doubt Session' }, // auto-set from first message
  subject: { type: String, default: 'General' },
  messages: [messageSchema],
  isResolved: { type: Boolean, default: false },
}, { timestamps: true });

const Doubt = mongoose.model('Doubt', doubtSchema);
export default Doubt;
