import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['learner', 'counselor', 'trainer'],
    default: 'learner',
  },
  careerGoal: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    notifications: { type: Boolean, default: true },
    progressReminders: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
