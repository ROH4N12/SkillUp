import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { seedDemoUserData } from '../config/seedDatabase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ message: 'Name is too long' });
    }
    // Role is always forced to 'learner' — trainer/counselor are admin-assigned only
    
    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'learner',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { access_token } = req.body;
    // Role is always forced to 'learner' for new Google signups
    
    // Fetch google user info
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const googleData = await googleRes.json();
    
    if (!googleRes.ok) {
       return res.status(401).json({ message: 'Invalid google token' });
    }
    
    const { email, name, sub } = googleData;
    
    let user = await User.findOne({ email });
    if (!user) {
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash('google_oauth_no_password_' + sub, salt);
       user = await User.create({
         name: name || 'Google User',
         email,
         password: hashedPassword,
         role: 'learner',
       });
    }

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Instant 1-Click Demo Login Route for Evaluation / Analysis
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body;
    const targetRole = ['learner', 'trainer', 'counselor'].includes(role) ? role : 'learner';

    const demoProfiles = {
      learner: { name: 'Rohan (Learner)', email: 'rohan.learner@skillup.ai' },
      trainer: { name: 'Rohit (Senior Trainer)', email: 'rohit.trainer@skillup.ai' },
      counselor: { name: 'Sayujya (Academic Counselor)', email: 'sayujya.counselor@skillup.ai' },
    };

    const profile = demoProfiles[targetRole];

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('DemoSkillUp2026!', salt);
      user = await User.create({
        name: profile.name,
        email: profile.email,
        password: hashedPassword,
        role: targetRole,
      });
    }

    // Populate realistic learner metrics if needed
    await seedDemoUserData(user);

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

export default router;
