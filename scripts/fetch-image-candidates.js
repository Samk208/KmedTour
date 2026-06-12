#!/usr/bin/env node
/**
 * Fetch curated Pexels photo candidates per treatment slug.
 *
 * Reads scripts/treatment-image-queries.json (curated scene queries — the fix
 * for the "ACL reconstruction = CNC machine" class of mismatch that came from
 * source-real-images.js's `<slug> medical` fallback), pulls the top 4 landscape
 * candidates per slug into public/images/_candidates/<slug>/, and records
 * meta.json per slug for the apply + contact-sheet steps.
 *
 * Paced: one search API call per 18s (Pexels free tier = 200 req/hr; photo CDN
 * downloads don't count against the API quota). 113 slugs ≈ 35 min.
 *
 * Usage: node scripts/fetch-image-candidates.js [--resume]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// .env.local lives in the canonical checkout; this script also runs from a
// worktree at .worktrees/<name>, so walk up until we find one.
for (const rel of ['../.env.local', '../../../.env.local']) {
  const envPath = path.join(__dirname, rel);
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const t = line.trim();
      if (t && !t.startsWith('#') && t.includes('=')) {
        const i = t.indexOf('=');
        const key = t.slice(0, i).trim();
        if (!process.env[key]) process.env[key] = t.slice(i + 1).trim();
      }
    }
    break;
  }
}

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('PEXELS_API_KEY not found in environment/.env.local');
  process.exit(1);
}

const QUERIES = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'treatment-image-queries.json'), 'utf-8'),
);
delete QUERIES._comment;

const CAND_ROOT = path.join(__dirname, '..', 'public', 'images', '_candidates');
const PACE_MS = 18_000;
const PER_PAGE = 4;
const RESUME = process.argv.includes('--resume');

function pexelsSearch(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${PER_PAGE}&orientation=landscape&size=medium`;
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { Authorization: API_KEY } }, (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Pexels ${res.statusCode}: ${body.slice(0, 200)}`));
          }
          resolve(JSON.parse(body));
        });
      })
      .on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return https
            .get(res.headers.location, (r2) => r2.pipe(fs.createWriteStream(destPath)).on('finish', resolve))
            .on('error', reject);
        }
        res.pipe(fs.createWriteStream(destPath)).on('finish', resolve);
      })
      .on('error', reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const slugs = Object.keys(QUERIES);
  let done = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const dir = path.join(CAND_ROOT, slug);
    const metaPath = path.join(dir, 'meta.json');
    if (RESUME && fs.existsSync(metaPath)) {
      skipped++;
      continue;
    }
    fs.mkdirSync(dir, { recursive: true });

    const query = QUERIES[slug];
    try {
      const result = await pexelsSearch(query);
      const photos = result.photos || [];
      const meta = { slug, query, fetched_at: new Date().toISOString(), candidates: [] };

      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        const file = `cand-${i + 1}.jpg`;
        await downloadImage(p.src.large, path.join(dir, file));
        meta.candidates.push({
          file,
          photo_id: p.id,
          photographer: p.photographer,
          photographer_url: p.photographer_url,
          pexels_url: p.url,
          alt: p.alt || '',
          avg_color: p.avg_color || '',
        });
      }

      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      done++;
      console.log(`[${done + skipped}/${slugs.length}] ${slug}: ${photos.length} candidates ("${query}")`);
      if (photos.length === 0) console.log(`  WARN zero results for "${query}" — needs a new query`);
    } catch (err) {
      console.error(`[${done + skipped}/${slugs.length}] ${slug}: ERROR ${err.message}`);
      // keep going; missing meta.json marks it for --resume retry
    }

    await sleep(PACE_MS);
  }

  console.log(`\nDone. fetched=${done} skipped=${skipped} total=${slugs.length}`);
}

main();
