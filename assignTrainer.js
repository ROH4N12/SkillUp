import mongoose from 'mongoose';
import Course from './server/models/Course.js';
import User from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function assign() {
  await mongoose.connect(process.env.MONGO_URI);
  const trainer = await User.findOne({ role: 'trainer', email: 'trainer@test.com' });
  if (trainer) {
    await Course.updateMany({}, { trainerId: trainer._id });
    console.log('Assigned all courses to test trainer');
  } else {
    console.log('No trainer found');
  }
  process.exit();
}
assign();
