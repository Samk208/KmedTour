#!/usr/bin/env node
/**
 * Fetch 2–3 inline Pexels images per procedure and write them into the sidecar.
 *
 * Reads scripts/treatment-inline-queries.json ({slug: [{q, alt}, ...]}), pulls one
 * landscape Pexels photo per query into public/images/procedures/inline/<slug>-N.jpg,
 * writes an attribution sidecar, and sets the `images` array on
 * lib/data/treatment-content/<slug>.json: [{src, alt, credit}].
 *
 * Paths are baked into the sidecar (bundled via index.ts) — NO runtime fs in the page.
 *
 * Usage: node scripts/fetch-inline-images.js [slug ...]   (default: all slugs in the map)
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// load .env.local (worktree or canonical)
for (const rel of ['../.env.local', '../../../.env.local']) {
  const p = path.join(__dirname, rel);
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim();
      if (t && !t.startsWith('#') && t.includes('=')) {
        const i = t.indexOf('=');
        if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
      }
    }
    break;
  }
}

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) { console.error('PEXELS_API_KEY not found in .env.local'); process.exit(1); }

const ROOT = path.join(__dirname, '..');
const QUERIES = JSON.parse(fs.readFileSync(path.join(__dirname, 'treatment-inline-queries.json'), 'utf-8'));
delete QUERIES._comment;
const INLINE_DIR = path.join(ROOT, 'public', 'images', 'procedures', 'inline');
const CONTENT_DIR = path.join(ROOT, 'lib', 'data', 'treatment-content');
fs.mkdirSync(INLINE_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&size=large`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: API_KEY } }, (res) => {
      let b = '';
      res.on('data', (d) => (b += d));
      res.on('end', () => (res.statusCode === 200 ? resolve(JSON.parse(b)) : reject(new Error(`Pexels ${res.statusCode}: ${b.slice(0, 150)}`))));
    }).on('error', reject);
  });
}
function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return https.get(res.headers.location, (r2) => r2.pipe(fs.createWriteStream(dest)).on('finish', resolve)).on('error', reject);
      res.pipe(fs.createWriteStream(dest)).on('finish', resolve);
    }).on('error', reject);
  });
}

async function main() {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(QUERIES);
  for (const slug of slugs) {
    const scenes = QUERIES[slug];
    const sidecarPath = path.join(CONTENT_DIR, `${slug}.json`);
    if (!scenes || !fs.existsSync(sidecarPath)) { console.warn(`SKIP ${slug}: no queries or sidecar`); continue; }

    const images = [];
    const usedIds = new Set();
    for (let i = 0; i < scenes.length; i++) {
      const { q, alt } = scenes[i];
      try {
        const photos = (await pexels(q)).photos || [];
        const pick = photos.find((p) => !usedIds.has(p.id)) || photos[0];
        if (!pick) { console.warn(`  ${slug} #${i + 1}: 0 results for "${q}"`); await sleep(1500); continue; }
        usedIds.add(pick.id);
        const file = `${slug}-${i + 1}.jpg`;
        await download(pick.src.large, path.join(INLINE_DIR, file));
        const src = `/images/procedures/inline/${file}`;
        images.push({ src, alt, credit: pick.photographer });
        fs.writeFileSync(path.join(INLINE_DIR, `${file}.attribution.json`), JSON.stringify(
          { source: 'pexels', photo_id: pick.id, photographer: pick.photographer, photographer_url: pick.photographer_url, pexels_url: pick.url, query: q, license: 'Pexels License — free commercial use' }, null, 2));
        process.stdout.write('.');
      } catch (e) { console.warn(`  ${slug} #${i + 1} ERROR ${e.message}`); }
      await sleep(1500);
    }
    const sc = JSON.parse(fs.readFileSync(sidecarPath, 'utf-8'));
    sc.images = images;
    fs.writeFileSync(sidecarPath, JSON.stringify(sc, null, 2));
    console.log(`\n${slug}: ${images.length} inline images`);
  }
}
main();
