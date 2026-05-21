import express from 'express';
import { protect } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import yts from 'yt-search';

const router = express.Router();

// ── Static video fallback map (curated, high-quality YouTube videos) ────
const VIDEO_FALLBACKS = {
  'react': [
    { videoId: 'bMknfKXIFA8', title: 'React Course - Beginner\'s Tutorial (2024)', thumbnail: 'https://img.youtube.com/vi/bMknfKXIFA8/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: 'SqcY0GlETPk', title: 'React Tutorial for Beginners', thumbnail: 'https://img.youtube.com/vi/SqcY0GlETPk/mqdefault.jpg', channel: 'Programming with Mosh' },
    { videoId: 'CgkZ7MvWUAA', title: 'React JS Full Course 2024', thumbnail: 'https://img.youtube.com/vi/CgkZ7MvWUAA/mqdefault.jpg', channel: 'Dave Gray' },
    { videoId: 'RVFAyFWO4go', title: 'React JS Tutorial for Beginners - Full Course', thumbnail: 'https://img.youtube.com/vi/RVFAyFWO4go/mqdefault.jpg', channel: 'Academind' },
  ],
  'javascript': [
    { videoId: 'PkZNo7MFNFg', title: 'Learn JavaScript - Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/PkZNo7MFNFg/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: 'W6NZfCJ1udo', title: 'JavaScript for Beginners – Full Course', thumbnail: 'https://img.youtube.com/vi/W6NZfCJ1udo/mqdefault.jpg', channel: 'Programming with Mosh' },
    { videoId: 'lI1ae4REbFM', title: 'JavaScript Full Course (2024)', thumbnail: 'https://img.youtube.com/vi/lI1ae4REbFM/mqdefault.jpg', channel: 'Bro Code' },
    { videoId: 'Zi-Q0t4gMC8', title: 'JavaScript Crash Course', thumbnail: 'https://img.youtube.com/vi/Zi-Q0t4gMC8/mqdefault.jpg', channel: 'Academind' },
  ],
  'typescript': [
    { videoId: '30LWjhZzg50', title: 'TypeScript Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/30LWjhZzg50/mqdefault.jpg', channel: 'Dave Gray' },
    { videoId: 'BwuLxPH8IDs', title: 'TypeScript Tutorial for Beginners', thumbnail: 'https://img.youtube.com/vi/BwuLxPH8IDs/mqdefault.jpg', channel: 'Academind' },
    { videoId: 'zQnBQ4tB3ZA', title: 'TypeScript Crash Course', thumbnail: 'https://img.youtube.com/vi/zQnBQ4tB3ZA/mqdefault.jpg', channel: 'Traversy Media' },
  ],
  'node': [
    { videoId: 'Oe421EPjeBE', title: 'Node.js and Express.js - Full Course', thumbnail: 'https://img.youtube.com/vi/Oe421EPjeBE/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: 'TlB_eWDSMt4', title: 'Node.js Tutorial for Beginners', thumbnail: 'https://img.youtube.com/vi/TlB_eWDSMt4/mqdefault.jpg', channel: 'Programming with Mosh' },
    { videoId: 'f2EqECiTBL8', title: 'Node.js Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/f2EqECiTBL8/mqdefault.jpg', channel: 'Dave Gray' },
  ],
  'python': [
    { videoId: 'rfscVS0vtbw', title: 'Learn Python - Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: '_uQrJ0TkZlc', title: 'Python Tutorial - Full Course', thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/mqdefault.jpg', channel: 'Programming with Mosh' },
    { videoId: 'XKHEtdqhLK8', title: 'Python Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/XKHEtdqhLK8/mqdefault.jpg', channel: 'Bro Code' },
  ],
  'machine learning': [
    { videoId: 'i_LwzRVP7bg', title: 'Machine Learning Course for Beginners', thumbnail: 'https://img.youtube.com/vi/i_LwzRVP7bg/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: 'NWONeJKn6kc', title: 'Machine Learning Full Course', thumbnail: 'https://img.youtube.com/vi/NWONeJKn6kc/mqdefault.jpg', channel: 'Edureka' },
    { videoId: 'GwIo3gDZCVQ', title: 'Machine Learning Tutorial for Beginners', thumbnail: 'https://img.youtube.com/vi/GwIo3gDZCVQ/mqdefault.jpg', channel: 'Simplilearn' },
  ],
  'data science': [
    { videoId: 'ua-CiDNNj30', title: 'Data Science Full Course', thumbnail: 'https://img.youtube.com/vi/ua-CiDNNj30/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: '-ETQ97mXXF0', title: 'Data Science Tutorial for Beginners', thumbnail: 'https://img.youtube.com/vi/-ETQ97mXXF0/mqdefault.jpg', channel: 'Edureka' },
    { videoId: 'LHBE6Q9XlzI', title: 'Python for Data Science', thumbnail: 'https://img.youtube.com/vi/LHBE6Q9XlzI/mqdefault.jpg', channel: 'freeCodeCamp' },
  ],
  'css': [
    { videoId: 'OXGznpKZ_sA', title: 'CSS Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/OXGznpKZ_sA/mqdefault.jpg', channel: 'Dave Gray' },
    { videoId: '1Rs2ND1ryYc', title: 'CSS Tutorial – Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/1Rs2ND1ryYc/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: 'wRNinF7YQqQ', title: 'CSS Crash Course', thumbnail: 'https://img.youtube.com/vi/wRNinF7YQqQ/mqdefault.jpg', channel: 'Traversy Media' },
  ],
  'html': [
    { videoId: 'kUMe1FH4CHE', title: 'HTML Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/kUMe1FH4CHE/mqdefault.jpg', channel: 'Dave Gray' },
    { videoId: 'qz0aGYrrlhU', title: 'HTML Tutorial for Beginners', thumbnail: 'https://img.youtube.com/vi/qz0aGYrrlhU/mqdefault.jpg', channel: 'Programming with Mosh' },
    { videoId: 'pQN-pnXPaVg', title: 'HTML Full Course', thumbnail: 'https://img.youtube.com/vi/pQN-pnXPaVg/mqdefault.jpg', channel: 'freeCodeCamp' },
  ],
  'cybersecurity': [
    { videoId: 'hXSFdwIOfnE', title: 'Cybersecurity Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/hXSFdwIOfnE/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: 'PlHnamdwGmw', title: 'Ethical Hacking Full Course', thumbnail: 'https://img.youtube.com/vi/PlHnamdwGmw/mqdefault.jpg', channel: 'Edureka' },
    { videoId: 'lpa8uy244zg', title: 'Cybersecurity for Beginners', thumbnail: 'https://img.youtube.com/vi/lpa8uy244zg/mqdefault.jpg', channel: 'NetworkChuck' },
  ],
  'cloud': [
    { videoId: 'r4YIdn2eTm4', title: 'Cloud Computing Full Course', thumbnail: 'https://img.youtube.com/vi/r4YIdn2eTm4/mqdefault.jpg', channel: 'Edureka' },
    { videoId: 'M988_fsOSWo', title: 'AWS Full Course for Beginners', thumbnail: 'https://img.youtube.com/vi/M988_fsOSWo/mqdefault.jpg', channel: 'Simplilearn' },
    { videoId: 'NKEFWyqJ5XA', title: 'Cloud Computing Tutorial', thumbnail: 'https://img.youtube.com/vi/NKEFWyqJ5XA/mqdefault.jpg', channel: 'Great Learning' },
  ],
  'default': [
    { videoId: 'PkZNo7MFNFg', title: 'Programming Fundamentals', thumbnail: 'https://img.youtube.com/vi/PkZNo7MFNFg/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: 'zOjov-2OZ0E', title: 'Learn to Code - Full Course', thumbnail: 'https://img.youtube.com/vi/zOjov-2OZ0E/mqdefault.jpg', channel: 'freeCodeCamp' },
    { videoId: '8mAITcNt710', title: 'Computer Science Fundamentals', thumbnail: 'https://img.youtube.com/vi/8mAITcNt710/mqdefault.jpg', channel: 'freeCodeCamp' },
  ],
};

/**
 * Match the best fallback video set by scanning course title/domain/skills
 */
function pickFallbackVideos(course) {
  const haystack = `${course.title} ${course.domain} ${(course.skills || []).join(' ')}`.toLowerCase();

  for (const keyword of Object.keys(VIDEO_FALLBACKS)) {
    if (keyword !== 'default' && haystack.includes(keyword)) {
      return VIDEO_FALLBACKS[keyword];
    }
  }
  return VIDEO_FALLBACKS['default'];
}

// ── GET /api/learner/videos/:courseId ──────────────────────────────────
router.get('/videos/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Populate cache if empty
    if (!course.videos || course.videos.length === 0) {
      try {
        const query = `${course.title} tutorial`;
        const searchResult = await yts(query);
        const fetchedVideos = searchResult.videos.slice(0, 3).map(v => ({
          videoId: v.videoId,
          title: v.title,
          thumbnail: v.thumbnail,
          channel: v.author.name
        }));
        
        if (fetchedVideos.length > 0) {
          course.videos = fetchedVideos;
        } else {
          course.videos = pickFallbackVideos(course);
        }
      } catch (err) {
        console.error('yt-search failed, using fallbacks:', err);
        course.videos = pickFallbackVideos(course);
      }
      await course.save();
    }

    // Get user's enrollment to check completed videos
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });

    const completedSet = new Set(enrollment?.completedVideos || []);

    const videos = course.videos.map(v => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      channel: v.channel,
      completed: completedSet.has(v.videoId),
    }));

    res.json({ videos, totalVideos: videos.length, completedCount: completedSet.size });
  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/learner/videos/complete ──────────────────────────────────
router.put('/videos/complete', protect, async (req, res) => {
  try {
    const { courseId, videoId, completed } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Upsert enrollment
    let enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: courseId,
        progress: 0,
        status: 'Not Started',
        completedVideos: [],
      });
    }

    // Toggle video completion
    const idx = enrollment.completedVideos.indexOf(videoId);
    if (completed && idx === -1) {
      enrollment.completedVideos.push(videoId);
    } else if (!completed && idx !== -1) {
      enrollment.completedVideos.splice(idx, 1);
    }

    // Recalculate progress from video completion ratio
    const totalVideos = course.videos?.length || 1;
    const completedCount = enrollment.completedVideos.length;
    const newProgress = Math.round((completedCount / totalVideos) * 100);

    enrollment.progress = newProgress;
    enrollment.status = newProgress === 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : 'Not Started';
    enrollment.lastAccessed = new Date();
    await enrollment.save();

    res.json({
      progress: enrollment.progress,
      status: enrollment.status,
      completedVideos: enrollment.completedVideos,
    });
  } catch (error) {
    console.error('Video complete error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
