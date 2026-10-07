import Course from '../models/Course.js';
import LearningPath from '../models/LearningPath.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';
import { allCourses } from './allCourses.js';

export const engineeringCourses = allCourses;

let isSeeding = false;

export const autoSeedDatabase = async () => {
  if (isSeeding) return;
  try {
    isSeeding = true;
    const count = await Course.countDocuments();
    if (count === 0) {
      console.log('Database empty: auto-seeding all 123 engineering courses...');
      await Course.insertMany(engineeringCourses);
      console.log(`Successfully seeded ${engineeringCourses.length} courses across all domains.`);
    } else if (count < engineeringCourses.length) {
      // Sync any missing courses (e.g., Game Development, Blockchain, DevOps, etc.)
      const existingTitles = new Set(await Course.distinct('title'));
      const missing = engineeringCourses.filter(c => !existingTitles.has(c.title));
      if (missing.length > 0) {
        console.log(`Syncing ${missing.length} missing courses into database...`);
        await Course.insertMany(missing);
        console.log(`Successfully synced ${missing.length} new courses. Total: ${existingTitles.size + missing.length}`);
      }
    }
  } catch (error) {
    console.error('Auto-seed check error:', error.message);
  } finally {
    isSeeding = false;
  }
};

export const seedDemoUserData = async (user) => {
  try {
    if (user.role === 'learner') {
      const existingPath = await LearningPath.findOne({ user: user._id });
      if (!existingPath) {
        const courses = await Course.find();
        const frontendCourses = courses.filter(c => c.domain === 'Frontend Development');
        if (frontendCourses.length > 0) {
          await LearningPath.create({
            user: user._id,
            title: 'Frontend Engineering Track',
            description: 'Master full-spectrum frontend development with modern React and TypeScript.',
            goal: 'Frontend Development',
            level: 'Intermediate',
            stages: [
              { stageName: 'Foundation', courses: frontendCourses.filter(c => c.level === 'Beginner').map(c => c._id) },
              { stageName: 'Core Skills', courses: frontendCourses.filter(c => c.level === 'Intermediate').map(c => c._id) },
              { stageName: 'Advanced Mastery', courses: frontendCourses.filter(c => c.level === 'Advanced').map(c => c._id) },
            ],
            courses: frontendCourses.map(c => c._id),
          });

          // Create enrollments with nice realistic progress
          const toEnroll = frontendCourses.slice(0, 4);
          const progresses = [85, 100, 60, 20];
          const statuses = ['In Progress', 'Completed', 'In Progress', 'Not Started'];

          for (let i = 0; i < toEnroll.length; i++) {
            const exists = await Enrollment.findOne({ user: user._id, course: toEnroll[i]._id });
            if (!exists) {
              await Enrollment.create({
                user: user._id,
                course: toEnroll[i]._id,
                progress: progresses[i] || 0,
                status: statuses[i] || 'Not Started',
              });
            }
          }
        }
      }

      // Ensure initial notifications
      const notifCount = await Notification.countDocuments({ user: user._id });
      if (notifCount === 0) {
        await Notification.create([
          { user: user._id, title: "Welcome to SkillUp Demo!", message: "Your personalized Frontend Engineering path is live.", type: "system" },
          { user: user._id, title: "Course Progress Alert", message: "You completed React Fundamentals! Next up: TypeScript for Frontend.", type: "reminder" },
        ]);
      }
    }
  } catch (err) {
    console.error('Error seeding demo user data:', err.message);
  }
};

