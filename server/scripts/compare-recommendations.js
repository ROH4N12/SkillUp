// ═══════════════════════════════════════════════════════════════════════════
// compare-recommendations.js
// ═══════════════════════════════════════════════════════════════════════════
// Side-by-side comparison: OLD domain-alias matcher vs NEW semantic embeddings.
//
// Usage:  node server/scripts/compare-recommendations.js
//
// This script does NOT need MongoDB — it works directly against the
// hardcoded seed data and the embedding service so you can run it offline.
// ═══════════════════════════════════════════════════════════════════════════

import { engineeringCourses } from '../config/seedDatabase.js';
import {
  buildCourseEmbeddings,
  rankCoursesByGoal,
} from '../services/embeddingService.js';
import {
  resolveDomain,
  scoreCourseInDomain,
  DOMAIN_ALIASES,
} from '../routes/path-generator.js';

// ── 10 test goals intentionally NOT in DOMAIN_ALIASES ───────────────────
const TEST_GOALS = [
  'I want to build websites',
  'get into ML engineering',
  'understand cloud infra',
  'learn how to design intuitive mobile user interfaces',
  'pen testing and ethical hacking tools',
  'build scalable microservices with relational and NoSQL databases',
  'analyze big datasets and create statistical charts',
  'develop cross platform iOS and Android applications',
  'automate continuous integration and deployment with containers',
  'deep neural network architectures and natural language processing',
];

// Give each seed course a fake _id so the embedding service can track them
const coursesWithIds = engineeringCourses.map((c, i) => ({
  ...c,
  _id: String(i),
}));

// Build a quick lookup from fake _id → course object
const courseById = Object.fromEntries(coursesWithIds.map(c => [c._id, c]));

// ── OLD LOGIC: resolveDomain → filter by domain → scoreCourseInDomain ──
function oldRecommend(goal) {
  const domain = resolveDomain(goal);
  if (!domain) return { domain: null, top3: [] };

  const domainCourses = coursesWithIds.filter(c => c.domain === domain);
  const scored = domainCourses
    .map(c => ({ course: c, score: scoreCourseInDomain(c, goal, 'Beginner', []) }))
    .sort((a, b) => b.score - a.score);

  return {
    domain,
    top3: scored.slice(0, 3).map(s => ({
      title: s.course.title,
      domain: s.course.domain,
      score: s.score,
    })),
  };
}

// ── NEW LOGIC: semantic similarity → top 3 ──────────────────────────────
async function newRecommend(goal) {
  const ranked = await rankCoursesByGoal(goal);
  const top3 = ranked.slice(0, 3).map(r => {
    const c = courseById[r.courseId];
    return {
      title: c.title,
      domain: c.domain,
      similarity: parseFloat(r.similarity.toFixed(4)),
    };
  });
  return { top3 };
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Loading embedding model and precomputing course vectors …\n');
  await buildCourseEmbeddings(coursesWithIds);
  console.log('');

  const SEPARATOR = '─'.repeat(90);

  for (const goal of TEST_GOALS) {
    console.log(SEPARATOR);
    console.log(`GOAL: "${goal}"`);
    console.log(SEPARATOR);

    // Old
    const old = oldRecommend(goal);
    console.log(`\n  OLD (domain-alias):  resolved domain = ${old.domain || '❌ NONE'}`);
    if (old.top3.length === 0) {
      console.log('    ⛔  No matches — goal not in DOMAIN_ALIASES');
    } else {
      old.top3.forEach((c, i) =>
        console.log(`    ${i + 1}. ${c.title}  [${c.domain}]  score=${c.score}`)
      );
    }

    // New
    const nw = await newRecommend(goal);
    console.log(`\n  NEW (semantic embeddings):`);
    nw.top3.forEach((c, i) =>
      console.log(`    ${i + 1}. ${c.title}  [${c.domain}]  similarity=${c.similarity}`)
    );

    console.log('');
  }

  console.log(SEPARATOR);
  console.log('✅  Comparison complete.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
