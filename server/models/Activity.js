import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  activity: { type: String, required: true },
}, { timestamps: true });

activitySchema.index({ user: 1, date: 1, activity: 1 }, { unique: true });

export default mongoose.model('Activity', activitySchema);
