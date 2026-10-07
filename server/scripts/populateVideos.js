/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BATCH VIDEO PRECOMPUTATION SCRIPT (YouTube Data API v3)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * Populates and caches tutorial videos on Course documents in MongoDB using
 * the official YouTube Data API v3.
 * 
 * By pre-populating videos ahead of time, runtime API requests (e.g.
 * GET /api/learner/videos/:courseId) are 100% pure database reads with:
 *   - ZERO external network calls on user requests
 *   - Instantaneous response latency (< 20ms)
 *   - Bounded, predictable API quota consumption governed by course count
 *     rather than user traffic.
 * 
 * QUOTA USAGE & BUDGETING:
 * - YouTube Data API v3 daily free quota: 10,000 units/day.
 * - search.list costs 100 units per call.
 * - videos.list (contentDetails) costs 1 unit per batch call.
 * - Total per course: 101 units.
 * - Seeding ~43 courses consumes ~4,343 units (~43% of daily quota).
 * - If quota is exhausted, the script automatically and gracefully switches
 *   to the curated static VIDEO_FALLBACKS map for all remaining courses.
 * 
 * WHEN TO RUN THIS SCRIPT:
 * 1. Initial Setup: Run once after database seeding to populate all courses.
 * 2. New Courses: Re-run after adding new courses. Repeated runs only inspect
 *    courses whose videos[] array is empty, consuming 0 quota for already-cached
 *    courses.
 * 3. Maintenance / Refresh: Run roughly monthly or quarterly with `--force`
 *    to refresh stale or deprecated videos across all courses.
 * 
 * CLI USAGE:
 *   node server/scripts/populateVideos.js            # Only empty courses
 *   node server/scripts/populateVideos.js --force    # Re-fetch ALL courses
 *   node server/scripts/populateVideos.js --limit=10 # Process at most 10 courses
 * ═══════════════════════════════════════════════════════════════════════════
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Course from '../models/Course.js';
import { VIDEO_FALLBACKS, pickFallbackVideos } from '../routes/videos.js';

// Resolve environment variables from project root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Extract set of preferred channels from static fallback list
const PREFERRED_CHANNELS = new Set(
  Object.values(VIDEO_FALLBACKS)
    .flatMap(list => list.map(v => v.channel.toLowerCase().trim()))
);

/**
 * Check if a channel title matches any preferred educational channel
 */
function isPreferredChannel(channelTitle) {
  if (!channelTitle) return false;
  const lower = channelTitle.toLowerCase().trim();
  for (const preferred of PREFERRED_CHANNELS) {
    if (lower.includes(preferred) || preferred.includes(lower)) {
      return true;
    }
  }
  return false;
}

/**
 * Parse ISO 8601 duration (e.g. PT15M33S, PT1H2M10S) to total seconds
 */
function parseDurationToSeconds(durationStr) {
  if (!durationStr) return 0;
  const regex = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationStr.match(regex);
  if (!matches) return 0;
  const days = parseInt(matches[1] || '0', 10);
  const hours = parseInt(matches[2] || '0', 10);
  const minutes = parseInt(matches[3] || '0', 10);
  const seconds = parseInt(matches[4] || '0', 10);
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

/**
 * Decode HTML entities commonly present in YouTube video titles
 */
function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

/**
 * Sleep helper to prevent bursting / rate-limiting
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main batch populator
 */
async function populateVideos() {
  console.log('═'.repeat(70));
  console.log('  SkillUp — YouTube Video Batch Precomputation Engine');
  console.log('═'.repeat(70));

  const force = process.argv.includes('--force');
  const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
  const maxLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

  if (!YOUTUBE_API_KEY) {
    console.warn('\n⚠️  WARNING: YOUTUBE_API_KEY is not set in environment or .env.');
    console.warn('   The script will populate all target courses with curated fallback videos.\n');
  } else {
    console.log('\n🔑 YouTube Data API v3 Key loaded successfully from environment.');
  }

  // Connect to MongoDB
  await connectDB();

  // Find candidate courses
  const query = force
    ? {}
    : { $or: [{ videos: { $exists: false } }, { videos: { $size: 0 } }] };

  let courses = await Course.find(query);
  if (maxLimit < courses.length) {
    courses = courses.slice(0, maxLimit);
  }

  console.log(`📋 Found ${courses.length} course(s) to process ${force ? '(FORCED all courses)' : '(courses with empty videos)'}.\n`);

  if (courses.length === 0) {
    console.log('✅ All courses already have populated videos. Nothing to do.');
    console.log('   (Run with --force to overwrite existing videos).\n');
    await mongoose.disconnect();
    process.exit(0);
  }

  let totalQuotaUnits = 0;
  let liveSearchCount = 0;
  let fallbackCount = 0;
  let quotaExceeded = false;

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const indexStr = `[${i + 1}/${courses.length}]`;
    const searchQuery = `${course.title} tutorial`;

    // If quota was already exceeded or no API key, use fallback immediately
    if (quotaExceeded || !YOUTUBE_API_KEY) {
      const fallbacks = pickFallbackVideos(course).slice(0, 3);
      course.videos = fallbacks;
      await course.save();
      fallbackCount++;
      console.log(`${indexStr} 🔄 Fallback: "${course.title}" (${fallbacks.length} videos) | Quota: ${totalQuotaUnits} units`);
      continue;
    }

    try {
      // Step 1: search.list (100 quota units)
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      totalQuotaUnits += 100;

      if (!searchRes.ok) {
        const errorData = await searchRes.json().catch(() => ({}));
        const reason = errorData.error?.errors?.[0]?.reason || searchRes.statusText;

        if (searchRes.status === 403 && (reason === 'quotaExceeded' || reason === 'rateLimitExceeded')) {
          console.warn(`\n⚠️  YouTube API Quota Exceeded (HTTP ${searchRes.status} - ${reason}).`);
          console.warn('   Switching to static fallback videos for remaining courses...\n');
          quotaExceeded = true;
        } else {
          console.warn(`   YouTube search.list failed for "${course.title}" (${reason}). Using fallback.`);
        }

        const fallbacks = pickFallbackVideos(course).slice(0, 3);
        course.videos = fallbacks;
        await course.save();
        fallbackCount++;
        console.log(`${indexStr} 🔄 Fallback: "${course.title}" (${fallbacks.length} videos) | Quota: ${totalQuotaUnits} units`);
        continue;
      }

      const searchData = await searchRes.json();
      const rawItems = searchData.items || [];
      const videoIds = rawItems.map(item => item.id?.videoId).filter(Boolean);

      if (videoIds.length === 0) {
        // No search results returned, use fallback
        const fallbacks = pickFallbackVideos(course).slice(0, 3);
        course.videos = fallbacks;
        await course.save();
        fallbackCount++;
        console.log(`${indexStr} 🔄 Fallback (0 search results): "${course.title}" | Quota: ${totalQuotaUnits} units`);
        await sleep(300);
        continue;
      }

      // Step 2: videos.list for duration details (1 quota unit)
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      totalQuotaUnits += 1;

      let durationMap = new Map();
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        for (const item of (detailsData.items || [])) {
          const durationSeconds = parseDurationToSeconds(item.contentDetails?.duration);
          durationMap.set(item.id, durationSeconds);
        }
      }

      // Step 3: Filter & sort candidates
      // Filter out shorts / videos under 3 minutes (180s)
      const validCandidates = [];
      for (const item of rawItems) {
        const vid = item.id?.videoId;
        if (!vid) continue;
        const durationSec = durationMap.get(vid);
        // Exclude if duration is known and < 180 seconds
        if (durationSec !== undefined && durationSec < 180) {
          continue;
        }

        const channel = item.snippet?.channelTitle || 'Unknown';
        validCandidates.push({
          videoId: vid,
          title: decodeHtmlEntities(item.snippet?.title || course.title),
          thumbnail: item.snippet?.thumbnails?.medium?.url ||
                     item.snippet?.thumbnails?.high?.url ||
                     `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
          channel: channel,
          isPreferred: isPreferredChannel(channel),
        });
      }

      // Sort: prefer channels from VIDEO_FALLBACKS map
      validCandidates.sort((a, b) => {
        if (a.isPreferred && !b.isPreferred) return -1;
        if (!a.isPreferred && b.isPreferred) return 1;
        return 0; // preserve search relevance
      });

      // Keep top 3
      const selected = validCandidates.slice(0, 3).map(({ videoId, title, thumbnail, channel }) => ({
        videoId,
        title,
        thumbnail,
        channel,
      }));

      if (selected.length > 0) {
        course.videos = selected;
        await course.save();
        liveSearchCount++;
        const prefTag = selected.some(s => isPreferredChannel(s.channel)) ? ' ★ preferred channel' : '';
        console.log(`${indexStr} 🎬 YouTube API: "${course.title}" (${selected.length} videos${prefTag}) | Quota: ${totalQuotaUnits} units`);
      } else {
        // All results were filtered out (e.g. all < 3 mins), use fallback
        const fallbacks = pickFallbackVideos(course).slice(0, 3);
        course.videos = fallbacks;
        await course.save();
        fallbackCount++;
        console.log(`${indexStr} 🔄 Fallback (filtered duration): "${course.title}" | Quota: ${totalQuotaUnits} units`);
      }
    } catch (err) {
      console.error(`   Error processing "${course.title}":`, err.message);
      const fallbacks = pickFallbackVideos(course).slice(0, 3);
      course.videos = fallbacks;
      await course.save();
      fallbackCount++;
      console.log(`${indexStr} 🔄 Fallback (on error): "${course.title}" | Quota: ${totalQuotaUnits} units`);
    }

    // Rate-limit delay between courses (300ms)
    await sleep(300);
  }

  // Final summary
  console.log('\n' + '═'.repeat(70));
  console.log('  BATCH PRECOMPUTATION SUMMARY');
  console.log('═'.repeat(70));
  console.log(`  • Courses Processed:          ${courses.length}`);
  console.log(`  • Live YouTube API Searches:  ${liveSearchCount}`);
  console.log(`  • Fallback Videos Assigned:   ${fallbackCount}`);
  console.log(`  • Total Quota Units Consumed: ${totalQuotaUnits} units (Daily Limit: 10,000)`);
  console.log('═'.repeat(70) + '\n');

  await mongoose.disconnect();
  console.log('🔌 Database disconnected cleanly. Done!\n');
}

// Execute script
populateVideos().catch(err => {
  console.error('Fatal batch script error:', err);
  process.exit(1);
});
