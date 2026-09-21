import express from 'express';
import { protect } from '../middleware/auth.js';
import Course from '../models/Course.js';
import LearningPath from '../models/LearningPath.js';
import { rankCoursesByGoal, isReady as embeddingsReady } from '../services/embeddingService.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// ⚠️  DEPRECATED — DOMAIN_ALIASES & resolveDomain / scoreCourseInDomain
// ═══════════════════════════════════════════════════════════════════════
// The functions below are the LEGACY recommendation system that required
// every user goal to map to a fixed domain via hardcoded aliases.
// They are kept here intentionally so old-vs-new behavior can be compared
// side by side (see server/scripts/compare-recommendations.js).
//
// The ACTIVE recommendation pipeline is the semantic embedding system
// starting at the POST /generate-path handler further below.
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

// Stage size limits (unchanged)
const STAGE_LIMITS = {
  Foundation:        4,   // max 4
  'Core Skills':     5,   // max 5
  'Advanced Topics': 3,   // max 3
};
const MAX_TOTAL = 12;

// ═══════════════════════════════════════════════════════════════════════
// DEPRECATED — Resolve user goal → exact domain string
// ═══════════════════════════════════════════════════════════════════════
/** @deprecated Use semantic embedding pipeline instead */
export function resolveDomain(goal) {
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
// DEPRECATED — Score a course WITHIN its already-matched domain.
// ═══════════════════════════════════════════════════════════════════════
/** @deprecated Use semantic re-ranking instead */
export function scoreCourseInDomain(course, goal, level, knownSkills) {
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
// SEMANTIC RE-RANKING — applies level & skill-gap bonuses on top of the
// raw cosine-similarity score from the embedding engine.
// ═══════════════════════════════════════════════════════════════════════
function semanticRerank(course, similarity, level, knownSkills) {
  let score = similarity; // base = cosine similarity (0..1)

  const courseLevel = (course.level || course.difficulty || '').toLowerCase();
  const courseSkills = (course.skills || []).map(s => s.toLowerCase());
  const knownLower = (knownSkills || []).map(s => s.toLowerCase().trim());

  // Level alignment bonus (+0.15 if user's declared level matches course level)
  if (courseLevel === (level || '').toLowerCase()) {
    score += 0.15;
  }

  // Skill gap bonus: +0.05 per skill the user does NOT yet know
  for (const skill of courseSkills) {
    if (!knownLower.some(k => k.includes(skill) || skill.includes(k))) {
      score += 0.05;
    }
  }

  // Known-skill penalty: -0.05 per skill user already has
  for (const skill of courseSkills) {
    if (knownLower.some(k => k.includes(skill) || skill.includes(k))) {
      score -= 0.05;
    }
  }

  return score;
}

// ═══════════════════════════════════════════════════════════════════════
// POST /generate-path  (NEW — embedding-based semantic pipeline)
// ═══════════════════════════════════════════════════════════════════════
router.post('/generate-path', protect, async (req, res) => {
  try {
    const { goal, level, knownSkills } = req.body;

    if (!goal || goal.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a learning goal.' });
    }

    // ─── Step 1: Semantic ranking across ALL courses ────────────────
    if (!embeddingsReady()) {
      // Embeddings haven't been built yet (edge case on very first request)
      return res.status(503).json({
        message: 'The recommendation engine is still warming up. Please try again in a few seconds.',
        path: null,
      });
    }

    const rankings = await rankCoursesByGoal(goal);

    // ─── Step 2: Fetch all course documents in a single query ───────
    const allCourses = await Course.find({});
    const courseMap = new Map();
    for (const c of allCourses) {
      courseMap.set(c._id.toString(), c);
    }

    // ─── Step 3: Re-rank with level & skill-gap bonuses ─────────────
    const scored = rankings
      .map(({ courseId, similarity }) => {
        const course = courseMap.get(courseId);
        if (!course) return null;
        return {
          course,
          score: semanticRerank(course, similarity, level, knownSkills),
          similarity, // keep raw similarity for debugging
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Primary: level order (beginner → intermediate → advanced)
        const levelDiff = getLevelOrder(a.course) - getLevelOrder(b.course);
        if (levelDiff !== 0) return levelDiff;
        // Secondary: higher re-ranked score first
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

    // ─── Step 7: Determine descriptive title ────────────────────────
    // Use the dominant domain from the top-ranked courses for the title
    const topDomains = deduped.slice(0, 5).map(d => d.course.domain);
    const domainFreq = {};
    for (const d of topDomains) domainFreq[d] = (domainFreq[d] || 0) + 1;
    const dominantDomain = Object.entries(domainFreq)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Custom';

    const pathTitle = `${dominantDomain} Learning Path`;
    const pathDescription = `Personalized ${dominantDomain} roadmap generated for ${level || 'all'} level.`;

    // ─── Step 8: Upsert the learning path ───────────────────────────
    let existingPath = await LearningPath.findOne({ user: req.user._id });

    if (existingPath) {
      existingPath.title = pathTitle;
      existingPath.description = pathDescription;
      existingPath.goal = dominantDomain;
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
        goal: dominantDomain,
        level,
        knownSkills: knownSkills || [],
        stages,
        courses: allCourseIds,
      });
    }

    // ─── Step 9: Return populated path ──────────────────────────────
    const populated = await LearningPath.findById(existingPath._id)
      .populate('stages.courses')
      .populate('courses');

    res.json({ message: 'Path generated successfully!', path: populated });
  } catch (error) {
    console.error('Path generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

export { DOMAIN_ALIASES };
export default router;
