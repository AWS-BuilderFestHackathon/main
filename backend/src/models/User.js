import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: null },
  password: { type: String, default: null }, // null for OAuth users
  googleId: { type: String, default: null, sparse: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },

  // Preferences
  theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
  defaultDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  notificationsEnabled: { type: Boolean, default: true },
  preferredStudyTimes: [{ type: String }],

  // Statistics
  totalNotes: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  totalDoubts: { type: Number, default: 0 },
  studyStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },

  // OTP
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpType: { type: String, enum: ['email', 'phone'], default: 'email' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
