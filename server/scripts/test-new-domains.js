import { allCourses } from '../config/allCourses.js';
import { buildCourseEmbeddings, rankCoursesByGoal } from '../services/embeddingService.js';

async function main() {
  const coursesWithIds = allCourses.map((c, i) => ({ ...c, _id: String(i) }));
  const map = Object.fromEntries(coursesWithIds.map(c => [c._id, c]));
  console.log(`Precomputing embeddings for all ${coursesWithIds.length} courses...`);
  await buildCourseEmbeddings(coursesWithIds);

  const testPrompts = [
    'learn rust ownership and building webassembly',
    'become a prompt engineer and build langchain rag agents',
    'master computer architecture digital logic and hardware',
    'robotics slam and ros2 navigation',
    'site reliability engineering and opentelemetry tracing',
    'prepare for technical placements and dsa coding interviews',
    'hardware pcb design and stm32 embedded arm',
    'product management and prd prioritization with okrs'
  ];

  for (const q of testPrompts) {
    const res = await rankCoursesByGoal(q);
    console.log(`\nQUERY: "${q}"`);
    res.slice(0, 3).forEach((r, idx) => {
      const c = map[r.courseId];
      console.log(`  ${idx + 1}. ${c.title} [${c.domain}] (sim=${r.similarity.toFixed(4)})`);
    });
  }
}

main().catch(console.error);
