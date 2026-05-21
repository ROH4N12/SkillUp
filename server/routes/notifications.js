import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// ── GET /api/notifications ───────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/notifications/unread-count ──────────────────────────────
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/notifications/:id/read ──────────────────────────────────
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/notifications/read-all ──────────────────────────────────
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/notifications/send ─────────────────────────────────────
// Counselor/Trainer can send notifications to specific users
router.post('/send', protect, async (req, res) => {
  try {
    const senderRole = req.user.role;
    if (senderRole !== 'counselor' && senderRole !== 'trainer') {
      return res.status(403).json({ message: 'Only counselors and trainers can send notifications' });
    }

    const { userId, title, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'userId and message are required' });
    }

    console.log("Sending to:", userId);

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      sender: req.user._id,
      title: title || `Message from ${req.user.name}`,
      message: message,
      type: senderRole, // trainer or counselor securely selected
      read: false,
      createdAt: new Date()
    });

    console.log("Saved notification:", notification);

    res.status(201).json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/notifications/reminder ─────────────────────────────────
router.post('/reminder', protect, async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.user._id,
      title: req.body.title || 'New Reminder',
      message: req.body.message || 'Custom reminder set by user',
      type: 'reminder'
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
