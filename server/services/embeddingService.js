// ═══════════════════════════════════════════════════════════════════════════
// embeddingService.js — Local Semantic Embedding Engine for Course Matching
// ═══════════════════════════════════════════════════════════════════════════
//
// MODEL CHOICE: @xenova/transformers  with  Xenova/all-MiniLM-L6-v2
// ───────────────────────────────────────────────────────────────────
//  • Runs the all-MiniLM-L6-v2 sentence-transformer model locally via ONNX
//    Runtime inside Node.js — no external API, no GPU, no paid keys.
//  • Produces 384-dimensional dense vectors that capture deep semantic
//    meaning (e.g. "I want to build websites" is close to "HTML & CSS
//    Fundamentals" even though they share zero exact tokens).
//  • The ONNX model (~23 MB) is auto-downloaded on first use and cached
//    in node_modules/.cache.  Loading takes ~1-2 s on a cold start, but
//    subsequent calls are instantaneous because the pipeline stays in RAM.
//
// TRADEOFFS
//  • Pro:  True semantic similarity — handles paraphrases, abbreviations,
//          synonyms.  Works for ANY goal string, not just predefined aliases.
//  • Pro:  Zero cost.  Runs entirely locally, ideal for a student project.
//  • Pro:  Small enough for Vercel serverless (fits within 250 MB limit).
//  • Con:  First cold-start adds ~1-2 s latency while ONNX loads.
//          Mitigated by pre-loading during server boot.
//  • Con:  For very large catalogs (10k+ courses) you'd want a vector DB
//          (Pinecone, Qdrant).  For ~43 courses, brute-force dot product
//          over an in-memory array is instantaneous.
//
// ═══════════════════════════════════════════════════════════════════════════

import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import os from 'os';

// Configure cache for serverless environments (Vercel has read-only filesystem except /tmp)
try {
  env.cacheDir = path.join(os.tmpdir(), '.cache', 'transformers');
} catch (e) {
  // Ignore if unable to set
}

// ── Singleton pipeline & cache ──────────────────────────────────────────
let extractor = null;
let courseEmbeddingsCache = []; // [{ courseId, embedding: Float32Array }]
let isInitialized = false;

/**
 * Build the text blob used to represent a course for embedding.
 * Concatenating title + description + skills gives the model enough
 * context to distinguish "Docker & Containerization" from "CI/CD Pipelines"
 * even though both live under Cloud Computing.
 */
function buildCourseText(course) {
  const parts = [
    course.title || '',
    course.description || '',
    'Skills: ' + (course.skills || []).join(', '),
    'Domain: ' + (course.domain || ''),
  ];
  return parts.filter(Boolean).join('. ');
}

/**
 * Lazily load the sentence-transformer pipeline.
 * Called once; subsequent calls return the cached instance.
 */
async function getExtractor() {
  if (!extractor) {
    console.log('[EmbeddingService] Loading all-MiniLM-L6-v2 …');
    const start = Date.now();
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log(`[EmbeddingService] Model ready in ${Date.now() - start} ms`);
  }
  return extractor;
}

/**
 * Embed a single text string → normalized Float32Array (384-dim).
 */
async function embedText(text) {
  const ext = await getExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return output.data; // Float32Array, already L2-normalized
}

/**
 * Cosine similarity between two L2-normalized vectors = dot product.
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Precompute embeddings for every course in the catalog.
 * Call this once at server startup (or after seeding new courses).
 * @param {Array} courses — Mongoose Course documents (or plain objects)
 */
export async function buildCourseEmbeddings(courses) {
  if (!courses || courses.length === 0) {
    console.log('[EmbeddingService] No courses to embed — skipping.');
    return;
  }

  console.log(`[EmbeddingService] Embedding ${courses.length} courses …`);
  const start = Date.now();

  const cache = [];
  for (const course of courses) {
    const text = buildCourseText(course);
    const embedding = await embedText(text);
    cache.push({
      courseId: course._id.toString(),
      embedding,
    });
  }

  courseEmbeddingsCache = cache;
  isInitialized = true;
  console.log(`[EmbeddingService] All ${cache.length} courses embedded in ${Date.now() - start} ms`);
}

/**
 * Rank ALL courses by semantic similarity to a free-text goal.
 * Returns an array sorted by descending cosine similarity:
 *   [{ courseId, similarity }, ...]
 *
 * @param {string} goalText — the user's goal, e.g. "I want to build websites"
 * @returns {Promise<Array<{ courseId: string, similarity: number }>>}
 */
export async function rankCoursesByGoal(goalText) {
  if (!isInitialized || courseEmbeddingsCache.length === 0) {
    console.warn('[EmbeddingService] Cache empty — returning empty ranking.');
    return [];
  }

  const goalEmbedding = await embedText(goalText);

  const ranked = courseEmbeddingsCache.map(({ courseId, embedding }) => ({
    courseId,
    similarity: cosineSimilarity(goalEmbedding, embedding),
  }));

  ranked.sort((a, b) => b.similarity - a.similarity);
  return ranked;
}

/**
 * Check if embeddings are ready.
 */
export function isReady() {
  return isInitialized;
}

/**
 * Force-reload the pipeline (useful for tests or hot-reload scenarios).
 */
export async function resetEmbeddings() {
  courseEmbeddingsCache = [];
  isInitialized = false;
}

export { buildCourseText, embedText, cosineSimilarity };
