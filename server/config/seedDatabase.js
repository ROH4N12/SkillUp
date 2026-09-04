import Course from '../models/Course.js';
import LearningPath from '../models/LearningPath.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';

export const engineeringCourses = [
  // ===== Frontend Development =====
  { title: "HTML & CSS Fundamentals", domain: "Frontend Development", skills: ["HTML", "CSS"], level: "Beginner", prerequisites: [], duration: "3 Weeks", difficulty: "Beginner", description: "Build solid foundations in web markup and styling." },
  { title: "JavaScript Essentials", domain: "Frontend Development", skills: ["JavaScript"], level: "Beginner", prerequisites: ["HTML", "CSS"], duration: "4 Weeks", difficulty: "Beginner", description: "Master core JavaScript concepts and DOM manipulation." },
  { title: "React Fundamentals", domain: "Frontend Development", skills: ["React", "JavaScript"], level: "Intermediate", prerequisites: ["JavaScript"], duration: "5 Weeks", difficulty: "Intermediate", description: "Component-based UI development with React." },
  { title: "Advanced React Patterns", domain: "Frontend Development", skills: ["React", "TypeScript"], level: "Advanced", prerequisites: ["React"], duration: "4 Weeks", difficulty: "Advanced", description: "HOCs, render props, hooks patterns, and performance." },
  { title: "TypeScript for Frontend", domain: "Frontend Development", skills: ["TypeScript", "JavaScript"], level: "Intermediate", prerequisites: ["JavaScript"], duration: "3 Weeks", difficulty: "Intermediate", description: "Add type safety to your JavaScript projects." },
  { title: "State Management with Redux", domain: "Frontend Development", skills: ["Redux", "React"], level: "Intermediate", prerequisites: ["React"], duration: "3 Weeks", difficulty: "Intermediate", description: "Global state management in large React apps." },
  { title: "Frontend Testing with Jest", domain: "Frontend Development", skills: ["Jest", "Testing", "React"], level: "Advanced", prerequisites: ["React", "JavaScript"], duration: "3 Weeks", difficulty: "Advanced", description: "Unit and integration testing for frontend apps." },

  // ===== Backend Development =====
  { title: "Node.js Fundamentals", domain: "Backend Development", skills: ["Node.js", "JavaScript"], level: "Beginner", prerequisites: ["JavaScript"], duration: "4 Weeks", difficulty: "Beginner", description: "Server-side JavaScript with Node.js runtime." },
  { title: "Express.js & REST APIs", domain: "Backend Development", skills: ["Express", "REST API", "Node.js"], level: "Intermediate", prerequisites: ["Node.js"], duration: "4 Weeks", difficulty: "Intermediate", description: "Build production REST APIs with Express." },
  { title: "Database Design with MongoDB", domain: "Backend Development", skills: ["MongoDB", "Database"], level: "Intermediate", prerequisites: ["Node.js"], duration: "3 Weeks", difficulty: "Intermediate", description: "NoSQL database modeling and queries." },
  { title: "SQL & PostgreSQL", domain: "Backend Development", skills: ["SQL", "PostgreSQL", "Database"], level: "Intermediate", prerequisites: [], duration: "4 Weeks", difficulty: "Intermediate", description: "Relational database fundamentals." },
  { title: "Authentication & Security", domain: "Backend Development", skills: ["JWT", "Security", "OAuth"], level: "Advanced", prerequisites: ["Express", "Node.js"], duration: "3 Weeks", difficulty: "Advanced", description: "Implement secure auth flows and protect APIs." },
  { title: "Microservices Architecture", domain: "Backend Development", skills: ["Microservices", "Docker", "Node.js"], level: "Advanced", prerequisites: ["Express", "Docker"], duration: "5 Weeks", difficulty: "Advanced", description: "Design and deploy microservice systems." },
  { title: "Java Backend with Spring Boot", domain: "Backend Development", skills: ["Java", "Spring Boot"], level: "Intermediate", prerequisites: ["Java"], duration: "6 Weeks", difficulty: "Intermediate", description: "Enterprise Java backend development." },

  // ===== Data Science =====
  { title: "Python Programming Basics", domain: "Data Science", skills: ["Python"], level: "Beginner", prerequisites: [], duration: "4 Weeks", difficulty: "Beginner", description: "Learn Python from scratch for data work." },
  { title: "Statistics & Probability", domain: "Data Science", skills: ["Statistics", "Mathematics"], level: "Beginner", prerequisites: [], duration: "4 Weeks", difficulty: "Beginner", description: "Essential math foundations for data science." },
  { title: "Data Analysis with Pandas", domain: "Data Science", skills: ["Pandas", "Python", "Data Analysis"], level: "Intermediate", prerequisites: ["Python"], duration: "4 Weeks", difficulty: "Intermediate", description: "Data manipulation and exploration." },
  { title: "Data Visualization", domain: "Data Science", skills: ["Matplotlib", "Seaborn", "Python"], level: "Intermediate", prerequisites: ["Pandas", "Python"], duration: "3 Weeks", difficulty: "Intermediate", description: "Create insightful charts and dashboards." },
  { title: "Machine Learning Foundations", domain: "Data Science", skills: ["Machine Learning", "Scikit-Learn", "Python"], level: "Advanced", prerequisites: ["Python", "Statistics"], duration: "6 Weeks", difficulty: "Advanced", description: "Supervised and unsupervised learning algorithms." },

  // ===== Machine Learning =====
  { title: "Linear Algebra for ML", domain: "Machine Learning", skills: ["Linear Algebra", "Mathematics"], level: "Beginner", prerequisites: [], duration: "3 Weeks", difficulty: "Beginner", description: "Vectors, matrices, and eigenvalues for ML." },
  { title: "Python for Machine Learning", domain: "Machine Learning", skills: ["Python", "NumPy"], level: "Beginner", prerequisites: [], duration: "4 Weeks", difficulty: "Beginner", description: "Python programming focused on ML workflows." },
  { title: "Supervised Learning", domain: "Machine Learning", skills: ["Regression", "Classification", "Scikit-Learn"], level: "Intermediate", prerequisites: ["Python", "Linear Algebra"], duration: "5 Weeks", difficulty: "Intermediate", description: "Regression, classification, and model evaluation." },
  { title: "Unsupervised Learning & Clustering", domain: "Machine Learning", skills: ["Clustering", "Dimensionality Reduction"], level: "Intermediate", prerequisites: ["Python", "Statistics"], duration: "4 Weeks", difficulty: "Intermediate", description: "K-Means, PCA, and anomaly detection." },
  { title: "Deep Learning with TensorFlow", domain: "Machine Learning", skills: ["Deep Learning", "TensorFlow", "Neural Networks"], level: "Advanced", prerequisites: ["Python", "Linear Algebra", "Machine Learning"], duration: "6 Weeks", difficulty: "Advanced", description: "Neural networks, CNNs, and RNNs." },
  { title: "Natural Language Processing", domain: "Machine Learning", skills: ["NLP", "Transformers", "Python"], level: "Advanced", prerequisites: ["Deep Learning", "Python"], duration: "5 Weeks", difficulty: "Advanced", description: "Text processing, embeddings, and LLMs." },

  // ===== Cybersecurity =====
  { title: "Networking Fundamentals", domain: "Cybersecurity", skills: ["Networking", "TCP/IP", "DNS"], level: "Beginner", prerequisites: [], duration: "3 Weeks", difficulty: "Beginner", description: "OSI model, protocols, and packet analysis." },
  { title: "Linux for Security", domain: "Cybersecurity", skills: ["Linux", "Bash"], level: "Beginner", prerequisites: [], duration: "3 Weeks", difficulty: "Beginner", description: "Command line mastery for security operations." },
  { title: "Web Application Security", domain: "Cybersecurity", skills: ["OWASP", "Security", "Web"], level: "Intermediate", prerequisites: ["Networking", "HTML"], duration: "4 Weeks", difficulty: "Intermediate", description: "OWASP Top 10 and vulnerability assessment." },
  { title: "Ethical Hacking & Pentesting", domain: "Cybersecurity", skills: ["Pentesting", "Kali Linux"], level: "Intermediate", prerequisites: ["Linux", "Networking"], duration: "5 Weeks", difficulty: "Intermediate", description: "Offensive security techniques and tools." },
  { title: "Advanced Threat Analysis", domain: "Cybersecurity", skills:  ["Threat Modeling", "SIEM", "Forensics"], level: "Advanced", prerequisites: ["Pentesting", "Networking"], duration: "5 Weeks", difficulty: "Advanced", description: "SOC operations, incident response, and forensics." },

  // ===== Cloud Computing =====
  { title: "Cloud Computing Basics", domain: "Cloud Computing", skills: ["Cloud", "AWS"], level: "Beginner", prerequisites: [], duration: "3 Weeks", difficulty: "Beginner", description: "Introduction to cloud models and services." },
  { title: "Docker & Containerization", domain: "Cloud Computing", skills: ["Docker", "Containers"], level: "Intermediate", prerequisites: ["Linux"], duration: "3 Weeks", difficulty: "Intermediate", description: "Container-based development and deployment." },
  { title: "Kubernetes Orchestration", domain: "Cloud Computing", skills: ["Kubernetes", "Docker"], level: "Advanced", prerequisites: ["Docker"], duration: "5 Weeks", difficulty: "Advanced", description: "Container orchestration at scale." },
  { title: "CI/CD Pipelines", domain: "Cloud Computing", skills: ["CI/CD", "GitHub Actions", "DevOps"], level: "Intermediate", prerequisites: ["Docker"], duration: "3 Weeks", difficulty: "Intermediate", description: "Automated testing and deployment workflows." },
  { title: "AWS Solutions Architect", domain: "Cloud Computing", skills: ["AWS", "Cloud Architecture"], level: "Advanced", prerequisites: ["Cloud", "Docker"], duration: "6 Weeks", difficulty: "Advanced", description: "Design scalable, resilient cloud architectures." },

  // ===== UI/UX Design =====
  { title: "Design Thinking Fundamentals", domain: "UI/UX Design", skills: ["Design Thinking", "UX Research"], level: "Beginner", prerequisites: [], duration: "3 Weeks", difficulty: "Beginner", description: "User-centered design process and empathy mapping." },
  { title: "Figma & Prototyping", domain: "UI/UX Design", skills: ["Figma", "Prototyping"], level: "Beginner", prerequisites: [], duration: "3 Weeks", difficulty: "Beginner", description: "UI design tool proficiency and interactive prototypes." },
  { title: "Visual Design Principles", domain: "UI/UX Design", skills: ["Typography", "Color Theory", "Layout"], level: "Intermediate", prerequisites: ["Figma"], duration: "4 Weeks", difficulty: "Intermediate", description: "Typography, grids, color, and hierarchy." },
  { title: "Design Systems", domain: "UI/UX Design", skills: ["Design Systems", "Component Libraries"], level: "Advanced", prerequisites: ["Figma", "Visual Design"], duration: "4 Weeks", difficulty: "Advanced", description: "Build scalable, consistent component libraries." },
  { title: "Usability Testing & Analytics", domain: "UI/UX Design", skills: ["Usability Testing", "Analytics"], level: "Advanced", prerequisites: ["UX Research"], duration: "3 Weeks", difficulty: "Advanced", description: "Validate designs with real user testing." },

  // ===== Mobile Development =====
  { title: "React Native Basics", domain: "Mobile Development", skills: ["React Native", "JavaScript"], level: "Beginner", prerequisites: ["React", "JavaScript"], duration: "4 Weeks", difficulty: "Beginner", description: "Cross-platform mobile development with React Native." },
  { title: "Advanced Mobile Patterns", domain: "Mobile Development", skills: ["React Native", "Navigation", "State Management"], level: "Intermediate", prerequisites: ["React Native"], duration: "4 Weeks", difficulty: "Intermediate", description: "Complex navigation, offline storage, and native modules." },
  { title: "Flutter Development", domain: "Mobile Development", skills: ["Flutter", "Dart"], level: "Intermediate", prerequisites: [], duration: "5 Weeks", difficulty: "Intermediate", description: "Google's UI toolkit for building native apps." },
];

let isSeeding = false;

export const autoSeedDatabase = async () => {
  if (isSeeding) return;
  try {
    const count = await Course.countDocuments();
    if (count === 0) {
      isSeeding = true;
      console.log('Database empty: auto-seeding engineering courses...');
      await Course.insertMany(engineeringCourses);
      console.log(`Successfully seeded ${engineeringCourses.length} courses across all domains.`);
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

