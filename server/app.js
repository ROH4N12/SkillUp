import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import learnerRoutes from './routes/learner.js';
import notificationRoutes from './routes/notifications.js';
import rolesRoutes from './routes/roles.js';
import pathGeneratorRoutes from './routes/path-generator.js';
import videoRoutes from './routes/videos.js';
import settingsRoutes from './routes/settings.js';
import activityRoutes from './routes/activity.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected before handling any API requests
app.use(async (req, res, next) => {
  // Allow health checks without DB
  if (req.path === '/api/health') return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({ 
      message: err.message || 'Database connection error. Please ensure MONGO_URI is configured on Vercel.' 
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/learner', pathGeneratorRoutes);
app.use('/api/learner', videoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', settingsRoutes);
app.use('/api', rolesRoutes);
app.use('/api/activity', activityRoutes);

export default app;
