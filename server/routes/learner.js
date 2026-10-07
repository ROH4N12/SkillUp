import express from 'express';
import { protect } from '../middleware/auth.js';
import Enrollment from '../models/Enrollment.js';
import LearningPath from '../models/LearningPath.js';
import Course from '../models/Course.js';
import Activity from '../models/Activity.js';
import { logActivity, getLocalDateStr } from './activity.js';

const router = express.Router();

// ── GET /api/learner/dashboard ───────────────────────────────────────
// Fully dynamic — every value derived from real enrollment data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate('course');
    const path = await LearningPath.findOne({ user: req.user._id }).populate('stages.courses');

    const completed = enrollments.filter(e => e.status === 'Completed').length;
    const inProgress = enrollments.filter(e => e.status === 'In Progress').length;

    // Career Readiness = (completed courses in path / total courses in path) × 100
    let totalPathCourses = 0;
    let completedPathCourses = 0;
    if (path?.stages?.length) {
      const pathCourseIds = new Set();
      for (const stage of path.stages) {
        for (const course of stage.courses) {
          pathCourseIds.add(course._id.toString());
        }
      }
      totalPathCourses = pathCourseIds.size;
      completedPathCourses = enrollments.filter(
        e => e.status === 'Completed' && pathCourseIds.has(e.course._id.toString())
      ).length;
    }
    const readiness = totalPathCourses > 0
      ? Math.round((completedPathCourses / totalPathCourses) * 100)
      : 0;

    // Skills mastered — count unique skills from completed course documents
    const completedSkills = new Set();
    enrollments.forEach(e => {
      if (e.status === 'Completed' && e.course?.skills) {
        e.course.skills.forEach(s => completedSkills.add(s));
      }
    });

    // Current course (first In Progress)
    const currentEnrollment = enrollments.find(e => e.status === 'In Progress');
    const currentCourse = currentEnrollment ? {
      title: currentEnrollment.course?.title || 'Unknown',
      progress: currentEnrollment.progress,
    } : null;

    // Remaining courses
    const remainingCourses = totalPathCourses - completedPathCourses;

    // Skill progress — real monthly data from enrollment timestamps
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const skillProgressData = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const completedByMonth = enrollments.filter(e => {
        const updated = new Date(e.updatedAt);
        return e.status === 'Completed' && updated < nextMonth;
      }).length;
      const progressByMonth = totalPathCourses > 0
        ? Math.round((completedByMonth / totalPathCourses) * 100)
        : 0;
      skillProgressData.push({
        month: monthNames[targetMonth.getMonth()],
        progress: progressByMonth,
      });
    }

    // Skill radar — from enrolled course domains (real data)
    const domainMap = {};
    enrollments.forEach(e => {
      const domain = e.course?.domain || 'General';
      if (!domainMap[domain]) domainMap[domain] = { total: 0, completed: 0 };
      domainMap[domain].total += 1;
      if (e.status === 'Completed') domainMap[domain].completed += 1;
    });
    const skillRadarData = Object.entries(domainMap).slice(0, 5).map(([skill, data]) => ({
      skill,
      current: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      required: 100,
    }));

    // Calculate true active days over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = getLocalDateStr(thirtyDaysAgo);

    const activities = await Activity.find({
      user: req.user._id,
      date: { $gte: dateLimit }
    }).select('date');
    const activeDaysCount = new Set(activities.map(a => a.date)).size;

    res.json({
      metrics: {
        readiness,
        completed,
        inProgress,
        skillsMastered: completedSkills.size,
        learningStreak: activeDaysCount,
        totalPathCourses,
        remainingCourses,
      },
      currentCourse,
      skillProgressData,
      skillRadarData: skillRadarData.length > 0 ? skillRadarData : [
        { skill: 'No Data', current: 0, required: 100 },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/learner/path ────────────────────────────────────────────
router.get('/path', protect, async (req, res) => {
  try {
    let path = await LearningPath.findOne({ user: req.user._id })
      .populate('stages.courses')
      .populate('courses');

    if (!path) {
      return res.json({ stages: [], courses: [], title: 'No path assigned', subtitle: 'Click "Customize Path" to generate one!' });
    }

    const enrollments = await Enrollment.find({ user: req.user._id });

    if (path.stages && path.stages.length > 0) {
      const stages = path.stages.map(stage => ({
        stageName: stage.stageName,
        courses: stage.courses.map(course => {
          const enrollment = enrollments.find(e => e.course.toString() === course._id.toString());
          return {
            _id: course._id,
            title: course.title,
            domain: course.domain,
            duration: course.duration || 'Self-Paced',
            progress: enrollment ? enrollment.progress : 0,
            status: enrollment ? enrollment.status : 'Not Started'
          };
        })
      }));

      return res.json({
        title: path.title,
        subtitle: path.description,
        goal: path.goal,
        stages
      });
    }

    // Legacy flat path fallback
    const pathCourses = (path.courses || []).map(course => {
      const enrollment = enrollments.find(e => e.course.toString() === course._id.toString());
      return {
        _id: course._id,
        title: course.title,
        progress: enrollment ? enrollment.progress : 0,
        status: enrollment ? enrollment.status : 'Not Started'
      };
    });

    res.json({
      title: path.title,
      subtitle: path.description,
      courses: pathCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/learner/progress/:courseId ───────────────────────────────
router.put('/progress/:courseId', protect, async (req, res) => {
  try {
    const { progress } = req.body;
    let enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });

    const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

    if (enrollment) {
      enrollment.progress = progress;
      enrollment.status = status;
      enrollment.lastAccessed = new Date();
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: req.params.courseId,
        progress,
        status
      });
    }

    // Auto-log activity when progress > 0
    if (progress > 0) {
      await logActivity(req.user._id, status === 'Completed' ? 'course_completed' : 'progress_updated');
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/learner/complete/:courseId ───────────────────────────────
// Marks a course as 100% complete in one action
router.put('/complete/:courseId', protect, async (req, res) => {
  try {
    let enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });

    if (enrollment) {
      enrollment.progress = 100;
      enrollment.status = 'Completed';
      enrollment.lastAccessed = new Date();
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: req.params.courseId,
        progress: 100,
        status: 'Completed',
      });
    }

    // Auto-log activity
    await logActivity(req.user._id, 'course_completed');

    res.json({ message: 'Course marked as completed', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/learner/progress/reset ────────────────────────────────
// Wipes all enrollment progress for current user
router.delete('/progress/reset', protect, async (req, res) => {
  try {
    await Enrollment.deleteMany({ user: req.user._id });
    res.json({ message: 'All progress has been reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/learner/progress-stats ──────────────────────────────────
router.get('/progress-stats', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course')
      .sort({ updatedAt: -1 });

    const path = await LearningPath.findOne({ user: req.user._id }).populate('stages.courses');

    const totalCourses = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'Completed').length;
    const inProgress = enrollments.filter(e => e.status === 'In Progress').length;
    const completionRate = totalCourses ? Math.round((completed / totalCourses) * 100) : 0;

    // Total path courses for accurate readiness
    let totalPathCourses = 0;
    if (path?.stages?.length) {
      for (const stage of path.stages) {
        totalPathCourses += stage.courses.length;
      }
    }

    // Per-course progress list
    const courseProgress = enrollments.map(e => ({
      course: e.course?.title || 'Unknown',
      progress: e.progress,
      status: e.status,
      completedVideos: e.completedVideos?.length || 0,
    }));

    // Recent activity from enrollment timestamps
    const recentActivity = enrollments.slice(0, 8).map(e => {
      let action = '';
      let type = 'course';
      if (e.status === 'Completed') {
        action = `Completed '${e.course?.title || 'a course'}'`;
        type = 'achievement';
      } else if (e.status === 'In Progress') {
        action = `Progressed on '${e.course?.title || 'a course'}' (${e.progress}%)`;
        type = 'course';
      } else {
        action = `Enrolled in '${e.course?.title || 'a course'}'`;
        type = 'course';
      }

      const diff = Date.now() - new Date(e.updatedAt).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const time = days > 0 ? `${days} day${days > 1 ? 's' : ''} ago` : hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ago` : 'Just now';

      return { action, time, type };
    });

    // Real weekly progress based on enrollment data
    const weeklyProgress = [];
    for (let i = 6; i >= 1; i--) {
      const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const completedByWeek = enrollments.filter(e => {
        return e.status === 'Completed' && new Date(e.updatedAt) <= weekStart;
      }).length;
      weeklyProgress.push({
        date: `Week ${7 - i}`,
        hours: Math.round(completedByWeek * 12),
        completion: totalCourses ? Math.round((completedByWeek / totalCourses) * 100) : 0,
      });
    }

    // Calculate active days from Activity collection
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = getLocalDateStr(thirtyDaysAgo);
    const activities = await Activity.find({
      user: req.user._id,
      date: { $gte: dateLimit }
    }).select('date');
    const activeDaysCount = new Set(activities.map(a => a.date)).size;

    // Activity data by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const now = new Date();
    const activityData = months.map((month, idx) => {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - 5 + idx, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - 4 + idx, 1);
      const coursesThisMonth = enrollments.filter(e => {
        const d = new Date(e.updatedAt);
        return d >= targetMonth && d < nextMonth;
      }).length;
      return {
        month,
        courses: coursesThisMonth,
        assessments: 0,
        projects: 0,
      };
    });

    res.json({
      totalCourses,
      totalPathCourses,
      completed,
      inProgress,
      completionRate,
      learningStreak: activeDaysCount,
      achievements: completed,
      totalHours: Math.round(completed * 12 + inProgress * 6),
      hoursThisWeek: Math.round(inProgress * 3),
      courseProgress,
      recentActivity,
      weeklyProgress,
      activityData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
