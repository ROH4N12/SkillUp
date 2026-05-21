import express from 'express';
import { protect } from '../middleware/auth.js';
import Course from '../models/Course.js';
import LearningPath from '../models/LearningPath.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// DOMAIN ALIAS MAP — maps common user goals to the exact domain string
// used in the Course collection.  If a goal doesn't match any alias we
// fall back to fuzzy matching, but ONLY within the best-matched domain.
// ═══════════════════════════════════════════════════════════════════════
const DOMAIN_ALIASES = {
  // Frontend
  'frontend':             'Frontend Development',
  'frontend development': 'Frontend Development',
  'front end':            'Frontend Development',
  'front-end':            'Frontend Development',
  'react':                'Frontend Development',
  'html':                 'Frontend Development',
  'css':                  'Frontend Development',
  'javascript frontend':  'Frontend Development',
  'web development':      'Frontend Development',
  'web design':           'Frontend Development',
  'ui development':       'Frontend Development',

  // Backend
  'backend':              'Backend Development',
  'backend development':  'Backend Development',
  'back end':             'Backend Development',
  'back-end':             'Backend Development',
  'node.js':              'Backend Development',
  'express':              'Backend Development',
  'server side':          'Backend Development',
  'api development':      'Backend Development',
  'java backend':         'Backend Development',
  'spring boot':          'Backend Development',

  // Data Science
  'data science':         'Data Science',
  'data analytics':       'Data Science',
  'data analysis':        'Data Science',
  'pandas':               'Data Science',

  // Machine Learning
  'machine learning':     'Machine Learning',
  'ml':                   'Machine Learning',
  'deep learning':        'Machine Learning',
  'ai':                   'Machine Learning',
  'artificial intelligence': 'Machine Learning',
  'nlp':                  'Machine Learning',
  'tensorflow':           'Machine Learning',
  'neural networks':      'Machine Learning',

  // Cybersecurity
  'cybersecurity':        'Cybersecurity',
  'cyber security':       'Cybersecurity',
  'security':             'Cybersecurity',
  'ethical hacking':      'Cybersecurity',
  'pentesting':           'Cybersecurity',
  'network security':     'Cybersecurity',

  // Cloud Computing
  'cloud computing':      'Cloud Computing',
  'cloud':                'Cloud Computing',
  'aws':                  'Cloud Computing',
  'devops':               'Cloud Computing',
  'docker':               'Cloud Computing',
  'kubernetes':           'Cloud Computing',
  'ci/cd':                'Cloud Computing',

  // UI/UX Design
  'ui/ux design':         'UI/UX Design',
  'ui/ux':                'UI/UX Design',
  'ux design':            'UI/UX Design',
  'ui design':            'UI/UX Design',
  'user experience':      'UI/UX Design',
  'figma':                'UI/UX Design',
  'design':               'UI/UX Design',

  // Mobile Development
  'mobile development':   'Mobile Development',
  'mobile':               'Mobile Development',
  'react native':         'Mobile Development',
  'flutter':              'Mobile Development',
  'app development':      'Mobile Development',
  'mobile app':           'Mobile Development',
};

// Stage size limits
const STAGE_LIMITS = {
  Foundation:        4,   // max 4
  'Core Skills':     5,   // max 5
  'Advanced Topics': 3,   // max 3
};
const MAX_TOTAL = 12;

// ═══════════════════════════════════════════════════════════════════════
// Resolve user goal → exact domain string
// ═══════════════════════════════════════════════════════════════════════
function resolveDomain(goal) {
  const goalLower = goal.toLowerCase().trim();

  // 1. Direct alias lookup
  if (DOMAIN_ALIASES[goalLower]) return DOMAIN_ALIASES[goalLower];

  // 2. Partial alias match (goal contains an alias key or vice-versa)
  for (const [alias, domain] of Object.entries(DOMAIN_ALIASES)) {
    if (goalLower.includes(alias) || alias.includes(goalLower)) {
      return domain;
    }
  }

  // 3. No match found
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// Score a course WITHIN its already-matched domain.  This score is used
// only to rank courses; irrelevant courses are already excluded.
// ═══════════════════════════════════════════════════════════════════════
function scoreCourseInDomain(course, goal, level, knownSkills) {
  let score = 10; // base score — every domain-matched course starts relevant
  const goalLower = goal.toLowerCase();
  const titleLower = (course.title || '').toLowerCase();
  const courseSkills = (course.skills || []).map(s => s.toLowerCase());
  const knownLower = (knownSkills || []).map(s => s.toLowerCase().trim());

  // Title relevance to goal keywords (+3)
  const goalWords = goalLower.split(/\s+/).filter(w => w.length > 2);
  for (const word of goalWords) {
    if (titleLower.includes(word)) { score += 3; break; }
  }

  // Skill tag overlap with goal keywords (+2)
  for (const word of goalWords) {
    if (courseSkills.some(s => s.includes(word) || word.includes(s))) {
      score += 2; break;
    }
  }

  // Level alignment bonus (+3)
  const courseLevel = (course.level || course.difficulty || '').toLowerCase();
  if (courseLevel === (level || '').toLowerCase()) {
    score += 3;
  }

  // Skill gap bonus: +2 per skill the user does NOT know
  for (const skill of courseSkills) {
    if (!knownLower.some(k => k.includes(skill) || skill.includes(k))) {
      score += 2;
    }
  }

  // Penalty: -3 per skill user already knows
  for (const skill of courseSkills) {
    if (knownLower.some(k => k.includes(skill) || skill.includes(k))) {
      score -= 3;
    }
  }

  return Math.max(1, score);
}

// Level order for sorting into stages
const LEVEL_ORDER = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };

function getLevelOrder(course) {
  const lvl = (course.level || course.difficulty || 'beginner').toLowerCase();
  return LEVEL_ORDER[lvl] ?? 1;
}

// ═══════════════════════════════════════════════════════════════════════
// Deduplicate courses with overlapping skills (keep the higher-scored one)
// ═══════════════════════════════════════════════════════════════════════
function deduplicateCourses(scoredCourses) {
  const kept = [];
  const usedSkillSets = [];

  for (const item of scoredCourses) {
    const skills = new Set((item.course.skills || []).map(s => s.toLowerCase()));

    // Check overlap with already-kept courses
    let isDuplicate = false;
    for (const existingSkills of usedSkillSets) {
      const overlap = [...skills].filter(s => existingSkills.has(s)).length;
      const overlapRatio = skills.size > 0 ? overlap / skills.size : 0;
      // If >70% of this course's skills are already covered, skip it
      if (overlapRatio > 0.7) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      kept.push(item);
      usedSkillSets.push(skills);
    }
  }

  return kept;
}

// ═══════════════════════════════════════════════════════════════════════
// POST /generate-path
// ═══════════════════════════════════════════════════════════════════════
router.post('/generate-path', protect, async (req, res) => {
  try {
    const { goal, level, knownSkills } = req.body;

    if (!goal || goal.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a learning goal.' });
    }

    // ─── Step 1: Resolve goal → domain ──────────────────────────────
    const resolvedDomain = resolveDomain(goal);

    if (!resolvedDomain) {
      return res.status(200).json({
        message: `Could not identify a domain for "${goal}". Please try a specific domain like "Frontend Development", "Data Science", "Machine Learning", "Cybersecurity", "Backend Development", "Cloud Computing", "UI/UX Design", or "Mobile Development".`,
        path: null
      });
    }

    // ─── Step 2: Strict domain filter — only exact-match courses ────
    const domainCourses = await Course.find({ domain: resolvedDomain });

    if (domainCourses.length < 2) {
      return res.status(200).json({
        message: `Not enough courses available for "${resolvedDomain}". Please contact an administrator to add more courses for this domain.`,
        path: null
      });
    }

    // ─── Step 3: Score within the domain ────────────────────────────
    const scored = domainCourses.map(course => ({
      course,
      score: scoreCourseInDomain(course, goal, level, knownSkills)
    })).sort((a, b) => {
      // Primary: level order (beginner → intermediate → advanced)
      const levelDiff = getLevelOrder(a.course) - getLevelOrder(b.course);
      if (levelDiff !== 0) return levelDiff;
      // Secondary: higher score first
      return b.score - a.score;
    });

    // ─── Step 4: Deduplicate similar courses ────────────────────────
    const deduped = deduplicateCourses(scored);

    // ─── Step 5: Distribute into stages with size limits ────────────
    const foundation = [];
    const core = [];
    const advanced = [];

    for (const { course } of deduped) {
      const lvl = getLevelOrder(course);
      if (lvl === 0 && foundation.length < STAGE_LIMITS.Foundation) {
        foundation.push(course._id);
      } else if (lvl === 1 && core.length < STAGE_LIMITS['Core Skills']) {
        core.push(course._id);
      } else if (lvl === 2 && advanced.length < STAGE_LIMITS['Advanced Topics']) {
        advanced.push(course._id);
      }
    }

    // ─── Step 6: Enforce total cap ──────────────────────────────────
    let allCourseIds = [...foundation, ...core, ...advanced];
    if (allCourseIds.length > MAX_TOTAL) {
      allCourseIds = allCourseIds.slice(0, MAX_TOTAL);
    }

    // Re-slice stages against the capped list
    const stages = [];
    if (foundation.length > 0) stages.push({ stageName: 'Foundation', courses: foundation });
    if (core.length > 0)       stages.push({ stageName: 'Core Skills', courses: core });
    if (advanced.length > 0)   stages.push({ stageName: 'Advanced Topics', courses: advanced });

    // ─── Step 7: Upsert the learning path ───────────────────────────
    const pathTitle = `${resolvedDomain} Learning Path`;
    const pathDescription = `Personalized ${resolvedDomain} roadmap generated for ${level || 'all'} level.`;

    let existingPath = await LearningPath.findOne({ user: req.user._id });

    if (existingPath) {
      existingPath.title = pathTitle;
      existingPath.description = pathDescription;
      existingPath.goal = resolvedDomain;
      existingPath.level = level;
      existingPath.knownSkills = knownSkills || [];
      existingPath.stages = stages;
      existingPath.courses = allCourseIds;
      await existingPath.save();
    } else {
      existingPath = await LearningPath.create({
        user: req.user._id,
        title: pathTitle,
        description: pathDescription,
        goal: resolvedDomain,
        level,
        knownSkills: knownSkills || [],
        stages,
        courses: allCourseIds,
      });
    }

    // ─── Step 8: Return populated path ──────────────────────────────
    const populated = await LearningPath.findById(existingPath._id)
      .populate('stages.courses')
      .populate('courses');

    res.json({ message: 'Path generated successfully!', path: populated });
  } catch (error) {
    console.error('Path generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
