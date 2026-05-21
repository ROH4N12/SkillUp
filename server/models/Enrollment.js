import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  completedVideos: [{ type: String }],
  lastAccessed: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Enrollment', enrollmentSchema);
