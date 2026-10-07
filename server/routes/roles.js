import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import LearningPath from '../models/LearningPath.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// COUNSELOR  ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

// ── GET /api/counselor/dashboard ─────────────────────────────────────
router.get('/counselor/dashboard', protect, requireRole('counselor'), async (req, res) => {
  try {
    const learners = await User.find({ role: 'learner' }).select('-password');
    const enrollments = await Enrollment.find().populate('course');
    const learningPaths = await LearningPath.find().populate('stages.courses');

    const learnerData = learners.map(learner => {
      const uid = learner._id.toString();
      const userEnrollments = enrollments.filter(e => e.user.toString() === uid);
      const courses = userEnrollments.length;
      const completed = userEnrollments.filter(e => e.status === 'Completed').length;
      const progressSum = userEnrollments.reduce((acc, curr) => acc + curr.progress, 0);
      const readiness = courses ? Math.round(progressSum / courses) : 0;

      // Risk thresholds per spec:  <40 High, 40-70 Medium, >70 Low
      const risk = readiness < 40 ? 'High' : readiness <= 70 ? 'Medium' : 'Low';
      const status = risk === 'High' ? 'At Risk' : risk === 'Medium' ? 'Needs Support' : 'On Track';

      // ── Real skill gap ─────────────────────────────────────────────
      const userPath = learningPaths.find(p => p.user.toString() === uid);
      const requiredSkills = new Set();
      const completedSkills = new Set();

      if (userPath?.stages?.length) {
        for (const stage of userPath.stages) {
          for (const course of stage.courses) {
            if (course?.skills) course.skills.forEach(s => requiredSkills.add(s));
          }
        }
      }
      userEnrollments.forEach(e => {
        if (e.status === 'Completed' && e.course?.skills) {
          e.course.skills.forEach(s => completedSkills.add(s));
        }
      });
      const missingSkills = [...requiredSkills].filter(s => !completedSkills.has(s));
      const skillGap = missingSkills.length;

      return {
        _id: learner._id,
        name: learner.name,
        email: learner.email,
        readiness,
        courses,
        completed,
        skillGap,
        missingSkills,
        acquiredSkills: [...completedSkills],
        requiredSkillsCount: requiredSkills.size,
        risk,
        status,
        learningPath: userPath?.title || 'No path assigned',
        careerGoal: learner.careerGoal || '',
      };
    });

    // Aggregate skill gap categories for chart
    const skillGapDistribution = [
      { name: 'Excellent', value: learnerData.filter(l => l.skillGap <= 2).length, color: '#10b981' },
      { name: 'Good', value: learnerData.filter(l => l.skillGap > 2 && l.skillGap <= 5).length, color: '#6366f1' },
      { name: 'Needs Work', value: learnerData.filter(l => l.skillGap > 5 && l.skillGap <= 8).length, color: '#f59e0b' },
      { name: 'Critical', value: learnerData.filter(l => l.skillGap > 8).length, color: '#ef4444' },
    ];

    res.json({
      activeLearners: learners.length,
      avgEngagement: learnerData.length
        ? Math.round(learnerData.reduce((acc, curr) => acc + curr.readiness, 0) / learnerData.length)
        : 0,
      studentsAtRisk: learnerData.filter(l => l.risk === 'High' || l.risk === 'Medium').length,
      learners: learnerData,
      skillGapDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/counselor/learner/:id ───────────────────────────────────
// Full detail view for a single learner
router.get('/counselor/learner/:id', protect, requireRole('counselor'), async (req, res) => {
  try {
    const learner = await User.findById(req.params.id).select('-password');
    if (!learner || learner.role !== 'learner') {
      return res.status(404).json({ message: 'Learner not found' });
    }

    const enrollments = await Enrollment.find({ user: learner._id }).populate('course');
    const path = await LearningPath.findOne({ user: learner._id }).populate('stages.courses');

    const completed = enrollments.filter(e => e.status === 'Completed').length;
    const inProgress = enrollments.filter(e => e.status === 'In Progress').length;
    const progressSum = enrollments.reduce((acc, e) => acc + e.progress, 0);
    const readiness = enrollments.length ? Math.round(progressSum / enrollments.length) : 0;

    // Skills
    const requiredSkills = new Set();
    const completedSkills = new Set();
    if (path?.stages?.length) {
      for (const stage of path.stages) {
        for (const course of stage.courses) {
          if (course?.skills) course.skills.forEach(s => requiredSkills.add(s));
        }
      }
    }
    enrollments.forEach(e => {
      if (e.status === 'Completed' && e.course?.skills) {
        e.course.skills.forEach(s => completedSkills.add(s));
      }
    });

    const courseList = enrollments.map(e => ({
      _id: e.course?._id,
      title: e.course?.title || 'Unknown',
      domain: e.course?.domain || '',
      progress: e.progress,
      status: e.status,
      lastAccessed: e.lastAccessed,
    }));

    // Learning path stages
    const stages = path?.stages?.map(stage => ({
      stageName: stage.stageName,
      courses: stage.courses.map(c => {
        const enrollment = enrollments.find(e => e.course?._id?.toString() === c._id.toString());
        return {
          _id: c._id,
          title: c.title,
          progress: enrollment ? enrollment.progress : 0,
          status: enrollment ? enrollment.status : 'Not Started',
        };
      }),
    })) || [];

    // Notifications sent to this learner
    const notifications = await Notification.find({ user: learner._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('sender', 'name role');

    res.json({
      _id: learner._id,
      name: learner.name,
      email: learner.email,
      careerGoal: learner.careerGoal || '',
      location: learner.location || '',
      phone: learner.phone || '',
      joinedAt: learner.createdAt,
      readiness,
      totalCourses: enrollments.length,
      completed,
      inProgress,
      requiredSkills: [...requiredSkills],
      acquiredSkills: [...completedSkills],
      missingSkills: [...requiredSkills].filter(s => !completedSkills.has(s)),
      courses: courseList,
      learningPath: {
        title: path?.title || 'No path assigned',
        goal: path?.goal || '',
        stages,
      },
      recentNotifications: notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// TRAINER  ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

// ── GET /api/trainer/dashboard ───────────────────────────────────────
router.get('/trainer/dashboard', protect, requireRole('trainer'), async (req, res) => {
  try {
    const allEnrollments = await Enrollment.find().populate('course').populate('user', 'name');
    const learnerCount = await User.countDocuments({ role: 'learner' });
    const allCourses = await Course.find();

    const completedTotal = allEnrollments.filter(e => e.status === 'Completed').length;
    const courseCompletion = allEnrollments.length
      ? Math.round((completedTotal / allEnrollments.length) * 100)
      : 0;

    // Average score based on progress
    const avgProgress = allEnrollments.length
      ? Math.round(allEnrollments.reduce((acc, e) => acc + e.progress, 0) / allEnrollments.length)
      : 0;

    // ── Per-course stats ──────────────────────────────────────────────
    const courseStatsMap = {};
    for (const course of allCourses) {
      courseStatsMap[course._id.toString()] = {
        course: course.title,
        enrolled: 0,
        completion: 0,
        avgScore: 0,
        totalProgress: 0,
        completedCount: 0,
      };
    }

    for (const e of allEnrollments) {
      const cid = e.course?._id?.toString();
      if (cid && courseStatsMap[cid]) {
        courseStatsMap[cid].enrolled += 1;
        courseStatsMap[cid].totalProgress += e.progress;
        if (e.status === 'Completed') courseStatsMap[cid].completedCount += 1;
      }
    }

    const courseStats = Object.values(courseStatsMap)
      .filter(c => c.enrolled > 0)
      .map(c => ({
        course: c.course,
        enrolled: c.enrolled,
        completion: Math.round((c.completedCount / c.enrolled) * 100),
        avgScore: c.enrolled ? Math.round(c.totalProgress / c.enrolled) : 0,
      }))
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 8);

    // ── Struggling learners (<40% progress) — include _id ────────────
    const strugglingLearners = allEnrollments
      .filter(e => e.progress > 0 && e.progress < 40 && e.user)
      .map(e => {
        const diff = Date.now() - new Date(e.updatedAt).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const lastActive = days === 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''} ago`;

        let issue = 'Low engagement';
        if (e.progress < 15) issue = 'Just started, needs encouragement';
        else if (days > 3) issue = 'Falling behind schedule';

        return {
          _id: e.user?._id || null,
          name: e.user?.name || 'Unknown',
          course: e.course?.title || 'Unknown',
          progress: e.progress,
          lastActive,
          issue,
        };
      })
      .slice(0, 6);

    // ── Performance trend data — REAL weekly aggregation ─────────────
    const performanceData = [];
    const now = Date.now();
    for (let i = 6; i >= 1; i--) {
      const weekEnd = new Date(now - (i - 1) * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);

      // Enrollments that had activity during this week
      const activeThisWeek = allEnrollments.filter(e => {
        const updated = new Date(e.updatedAt);
        return updated >= weekStart && updated < weekEnd;
      });

      const completedThisWeek = allEnrollments.filter(e => {
        const updated = new Date(e.updatedAt);
        return e.status === 'Completed' && updated < weekEnd;
      });

      const engagement = allEnrollments.length
        ? Math.round((activeThisWeek.length / Math.max(allEnrollments.length, 1)) * 100)
        : 0;
      const completion = allEnrollments.length
        ? Math.round((completedThisWeek.length / allEnrollments.length) * 100)
        : 0;
      const weekAvgScore = activeThisWeek.length
        ? Math.round(activeThisWeek.reduce((acc, e) => acc + e.progress, 0) / activeThisWeek.length)
        : avgProgress;

      performanceData.push({
        week: `Week ${7 - i}`,
        engagement: Math.min(100, engagement),
        completion: Math.min(100, completion),
        avgScore: Math.min(100, weekAvgScore),
      });
    }

    // ── Analytics counts ─────────────────────────────────────────────
    const activeLearnerIds = new Set(
      allEnrollments.filter(e => e.status === 'In Progress').map(e => e.user?._id?.toString()).filter(Boolean)
    );
    const completedLearnerIds = new Set(
      allEnrollments.filter(e => e.status === 'Completed').map(e => e.user?._id?.toString()).filter(Boolean)
    );

    res.json({
      activeStudents: learnerCount,
      activeCourses: allCourses.length,
      courseCompletion,
      avgAssessmentScore: avgProgress,
      activeLearners: activeLearnerIds.size,
      completedLearners: completedLearnerIds.size,
      completedEnrollments: completedTotal,
      inProgressEnrollments: allEnrollments.filter(e => e.status === 'In Progress').length,
      courseStats,
      strugglingLearners,
      performanceData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/trainer/analytics ───────────────────────────────────────
router.get('/trainer/analytics', protect, requireRole('trainer'), async (req, res) => {
  try {
    const learnerCount = await User.countDocuments({ role: 'learner' });
    const allEnrollments = await Enrollment.find().populate('course');

    const activeLearnerIds = new Set(
      allEnrollments.filter(e => e.status === 'In Progress').map(e => e.user.toString())
    );
    const completedLearnerIds = new Set(
      allEnrollments.filter(e => e.status === 'Completed').map(e => e.user.toString())
    );

    // Per-domain breakdown
    const domainMap = {};
    allEnrollments.forEach(e => {
      const domain = e.course?.domain || 'General';
      if (!domainMap[domain]) domainMap[domain] = { enrolled: 0, completed: 0 };
      domainMap[domain].enrolled += 1;
      if (e.status === 'Completed') domainMap[domain].completed += 1;
    });

    const domainAnalytics = Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      enrolled: data.enrolled,
      completed: data.completed,
      completionRate: data.enrolled ? Math.round((data.completed / data.enrolled) * 100) : 0,
    }));

    res.json({
      totalLearners: learnerCount,
      activeLearners: activeLearnerIds.size,
      completedLearners: completedLearnerIds.size,
      totalEnrollments: allEnrollments.length,
      completedEnrollments: allEnrollments.filter(e => e.status === 'Completed').length,
      inProgressEnrollments: allEnrollments.filter(e => e.status === 'In Progress').length,
      domainAnalytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/trainer/courses ─────────────────────────────────────────
router.get('/trainer/courses', protect, requireRole('trainer'), async (req, res) => {
  try {
    const allEnrollments = await Enrollment.find().populate('course');
    const allCourses = await Course.find();

    const courseStatsMap = {};
    for (const course of allCourses) {
      courseStatsMap[course._id.toString()] = {
        courseName: course.title,
        students: 0,
        avgCompletion: 0,
        avgScore: 0,
        totalProgress: 0,
        completedCount: 0,
      };
    }

    for (const e of allEnrollments) {
      const cid = e.course?._id?.toString();
      if (cid && courseStatsMap[cid]) {
        courseStatsMap[cid].students += 1;
        courseStatsMap[cid].totalProgress += e.progress;
        if (e.status === 'Completed') courseStatsMap[cid].completedCount += 1;
      }
    }

    const coursesList = Object.entries(courseStatsMap)
      .map(([id, c]) => ({
        courseId: id,
        courseName: c.courseName,
        students: c.students,
        avgCompletion: c.students > 0 ? Math.round((c.completedCount / c.students) * 100) : 0,
        avgScore: c.students > 0 ? Math.round(c.totalProgress / c.students) : 0,
      }))
      .sort((a, b) => b.students - a.students);

    res.json(coursesList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/trainer/students ─────────────────────────────────────────
router.get('/trainer/students', protect, requireRole('trainer'), async (req, res) => {
  try {
    // 1. Get trainer's courses
    let courses = await Course.find({ trainerId: req.user._id });
    
    // Fallback for missing trainerId assignments in older DB setups
    if (courses.length === 0) {
      courses = await Course.find();
    }

    const courseIds = courses.map(c => c._id);

    // 2. Look up enrollments matching these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name')
      .populate('course', 'title');

    // 3. Format and Group students
    const grouped = {};

    enrollments.forEach(e => {
      if (!e.user) return; // Ensure user still exists
      
      const userId = e.user._id.toString();
      
      if (!grouped[userId]) {
        grouped[userId] = {
          _id: e.user._id,
          name: e.user.name,
          courses: []
        };
      }
      
      grouped[userId].courses.push({
        title: e.course?.title || 'Unknown Course',
        progress: e.progress
      });
    });

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/trainer/course-analytics/:courseId ──────────────────────
router.get('/trainer/course-analytics/:courseId', protect, requireRole('trainer'), async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollments = await Enrollment.find({ course: courseId }).populate('user', 'name');

    const totalStudents = enrollments.length;
    const completedCount = enrollments.filter(e => e.status === 'Completed').length;
    const inProgressCount = enrollments.filter(e => e.status === 'In Progress').length;
    const avgProgress = totalStudents
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / totalStudents)
      : 0;
    const completionRate = totalStudents ? Math.round((completedCount / totalStudents) * 100) : 0;

    // Per-student breakdown
    const studentBreakdown = enrollments.map(e => ({
      _id: e.user?._id,
      name: e.user?.name || 'Unknown',
      progress: e.progress,
      status: e.status,
      lastAccessed: e.lastAccessed,
    }));

    res.json({
      courseId,
      courseName: course.title,
      domain: course.domain,
      level: course.level,
      totalStudents,
      completedCount,
      inProgressCount,
      avgProgress,
      completionRate,
      students: studentBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/trainer/learning-path/:userId ───────────────────────────
router.get('/trainer/learning-path/:userId', protect, requireRole('trainer'), async (req, res) => {
  try {
    const userId = req.params.userId;
    const learner = await User.findById(userId).select('name email');
    if (!learner) return res.status(404).json({ message: 'Learner not found' });

    const path = await LearningPath.findOne({ user: userId }).populate('stages.courses').populate('courses');
    const enrollments = await Enrollment.find({ user: userId }).populate('course', 'title');

    // Build progress map from real enrollments
    const progressMap = {};
    for (const e of enrollments) {
      if (e.course) {
        progressMap[e.course._id.toString()] = {
          progress: e.progress,
          status: e.status,
        };
      }
    }

    if (!path) {
      // No generated learning path — return enrolled courses as a flat list
      const courses = enrollments.map(e => ({
        courseId: e.course?._id,
        title: e.course?.title || 'Unknown',
        progress: e.progress,
        status: e.status,
      }));

      return res.json({
        learnerName: learner.name,
        hasPath: false,
        goal: 'No learning path generated',
        title: 'Enrolled Courses',
        stages: [],
        courses,
      });
    }

    // Map stages with real progress
    const stages = (path.stages || []).map(stage => ({
      stageName: stage.stageName,
      courses: (stage.courses || []).map(c => {
        const cid = c._id.toString();
        const enrollment = progressMap[cid];
        return {
          courseId: c._id,
          title: c.title,
          progress: enrollment?.progress || 0,
          status: enrollment?.status || 'Not Started',
        };
      }),
    }));

    res.json({
      learnerName: learner.name,
      hasPath: true,
      title: path.title,
      goal: path.goal,
      level: path.level,
      stages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
