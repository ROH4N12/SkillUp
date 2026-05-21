import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  domain: { type: String, required: true },
  skills: [{ type: String }],
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  prerequisites: [{ type: String }],
  duration: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  instructor: { type: String },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  videos: [{
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    channel: { type: String },
  }],
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
