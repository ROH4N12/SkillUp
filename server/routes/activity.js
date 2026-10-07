import express from 'express';
import { protect } from '../middleware/auth.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// ── Timezone-safe date helper (IST) ─────────────────────────────────
// Returns YYYY-MM-DD in Asia/Kolkata timezone, avoiding UTC drift
export function getLocalDateStr(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// ── Reusable activity logger (can be imported by other routes) ───────
export async function logActivity(userId, activity) {
  const dateStr = getLocalDateStr();
  await Activity.updateOne(
    { user: userId, date: dateStr, activity },
    { $setOnInsert: { user: userId, date: dateStr, activity } },
    { upsert: true }
  );
}

// ── POST /api/activity/log ──────────────────────────────────────────
router.post('/log', protect, async (req, res) => {
  try {
    const { activity } = req.body;
    if (!activity) return res.status(400).json({ message: 'Activity missing' });

    await logActivity(req.user._id, activity);

    res.json({ message: 'Activity logged successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/activity/streak ────────────────────────────────────────
router.get('/streak', protect, async (req, res) => {
  try {
    // Calculate the date limit in IST-aware format
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = getLocalDateStr(thirtyDaysAgo);

    const activities = await Activity.find({
      user: req.user._id,
      date: { $gte: dateLimit }
    }).select('date');

    const activeDates = [...new Set(activities.map(a => a.date))];
    
    res.json(activeDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
