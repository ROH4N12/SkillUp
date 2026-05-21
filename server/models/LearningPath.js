import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  stageName: { type: String, required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { _id: false });

const learningPathSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  goal: { type: String, required: true },
  level: { type: String },
  knownSkills: [{ type: String }],
  stages: [stageSchema],
  // Legacy compat — flat course list for old paths
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  targetRole: { type: String },
}, { timestamps: true });

export default mongoose.model('LearningPath', learningPathSchema);
