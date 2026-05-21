import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import learnerRoutes from './routes/learner.js';
import notificationRoutes from './routes/notifications.js';
import rolesRoutes from './routes/roles.js';
import pathGeneratorRoutes from './routes/path-generator.js';
import videoRoutes from './routes/videos.js';
import settingsRoutes from './routes/settings.js';
import activityRoutes from './routes/activity.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/learner', pathGeneratorRoutes);
app.use('/api/learner', videoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', settingsRoutes);
app.use('/api', rolesRoutes);
app.use('/api/activity', activityRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
