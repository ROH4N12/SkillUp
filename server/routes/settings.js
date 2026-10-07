import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// ── GET /api/user/profile ────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      location: user.location || '',
      careerGoal: user.careerGoal || '',
      preferences: user.preferences || {
        theme: 'light',
        notifications: true,
        progressReminders: true,
        weeklyReports: false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/user/profile ────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, location, careerGoal, preferences } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (careerGoal !== undefined) user.careerGoal = careerGoal;
    if (preferences) {
      user.preferences = { ...user.preferences.toObject?.() || user.preferences, ...preferences };
    }

    await user.save();

    // Also update localStorage hint
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      careerGoal: user.careerGoal,
      preferences: user.preferences,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/user/password ───────────────────────────────────────────
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
