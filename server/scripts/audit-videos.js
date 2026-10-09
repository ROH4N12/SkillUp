import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../config/allCourses.json');
const courses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const allVideoMap = new Map();

courses.forEach(c => {
  (c.videos || []).forEach(v => {
    if (v && v.videoId) {
      if (!allVideoMap.has(v.videoId)) {
        allVideoMap.set(v.videoId, { ...v, courses: [c.title], domain: c.domain });
      } else {
        allVideoMap.get(v.videoId).courses.push(c.title);
      }
    }
  });
});

console.log(`Found ${allVideoMap.size} unique video IDs across ${courses.length} courses.`);

function checkVideo(videoId) {
  return new Promise((resolve) => {
    const req = https.request(
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      { method: 'HEAD', timeout: 5000 },
      (res) => {
        resolve({ videoId, status: res.statusCode });
      }
    );
    req.on('error', () => resolve({ videoId, status: 500 }));
    req.on('timeout', () => { req.destroy(); resolve({ videoId, status: 408 }); });
    req.end();
  });
}

async function audit() {
  const ids = Array.from(allVideoMap.keys());
  const invalid = [];
  const valid = [];

  const batchSize = 25;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(checkVideo));
    for (const r of results) {
      if (r.status === 200) {
        valid.push(r.videoId);
      } else {
        invalid.push({ videoId: r.videoId, status: r.status, meta: allVideoMap.get(r.videoId) });
      }
    }
    process.stdout.write(`Checked ${Math.min(i + batchSize, ids.length)}/${ids.length} videos...\r`);
  }

  console.log(`\nAudit Complete:`);
  console.log(`Valid: ${valid.length}`);
  console.log(`Invalid (404 / Unavailable): ${invalid.length}`);

  fs.writeFileSync(
    path.resolve(__dirname, 'audit-results.json'),
    JSON.stringify({ validCount: valid.length, invalidCount: invalid.length, invalid }, null, 2)
  );
  console.log('Results written to server/scripts/audit-results.json');
}

audit();
