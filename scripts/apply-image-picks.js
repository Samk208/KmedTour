#!/usr/bin/env node
/**
 * Apply chosen Pexels candidates as the live procedure images.
 *
 * Picks come from scripts/picks.json ({ "<slug>": "c1"|"c2"|"c3"|"c4"|"keep" }).
 * Any slug not in picks.json defaults to "c1" (the top curated candidate).
 * For each applied pick: copies the candidate over public/images/procedures/<slug>.jpg,
 * writes <slug>.attribution.json, deletes the stale <slug>.png, and points the
 * treatments.json imageUrl at the .jpg.
 *
 * Usage: node scripts/apply-image-picks.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CAND = path.join(ROOT, 'public', 'images', '_candidates');
const PROC = path.join(ROOT, 'public', 'images', 'procedures');
const TJSON = path.join(ROOT, 'lib', 'data', 'treatments.json');
const PICKS = path.join(__dirname, 'picks.json');

const picks = fs.existsSync(PICKS) ? JSON.parse(fs.readFileSync(PICKS, 'utf8')) : {};
const idxOf = { c1: 0, c2: 1, c3: 2, c4: 3 };
const treatments = JSON.parse(fs.readFileSync(TJSON, 'utf8'));
const bySlug = new Map(treatments.map((t) => [t.slug, t]));

let applied = 0, kept = 0, skipped = 0, refUpdated = 0;

for (const slug of fs.readdirSync(CAND)) {
  const metaPath = path.join(CAND, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) continue;
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const pick = picks[slug] || 'c1';
  if (pick === 'keep') { kept++; continue; }

  const i = idxOf[pick];
  const cand = meta.candidates && meta.candidates[i];
  if (!cand) { console.warn(`SKIP ${slug}: no candidate ${pick}`); skipped++; continue; }

  const srcImg = path.join(CAND, slug, cand.file);
  if (!fs.existsSync(srcImg)) { console.warn(`SKIP ${slug}: missing ${cand.file}`); skipped++; continue; }

  // copy image
  fs.copyFileSync(srcImg, path.join(PROC, `${slug}.jpg`));

  // attribution sidecar
  fs.writeFileSync(
    path.join(PROC, `${slug}.attribution.json`),
    JSON.stringify(
      {
        source: 'pexels',
        photo_id: cand.photo_id,
        photographer: cand.photographer,
        photographer_url: cand.photographer_url,
        pexels_url: cand.pexels_url,
        query: meta.query,
        alt: cand.alt,
        license: 'Pexels License — free for commercial use, no attribution required',
      },
      null,
      2,
    ),
  );

  // remove stale DALL-E png
  const png = path.join(PROC, `${slug}.png`);
  if (fs.existsSync(png)) fs.rmSync(png);

  // point treatments.json at the jpg
  const t = bySlug.get(slug);
  if (t && t.imageUrl !== `/images/procedures/${slug}.jpg`) {
    t.imageUrl = `/images/procedures/${slug}.jpg`;
    refUpdated++;
  }
  applied++;
}

fs.writeFileSync(TJSON, JSON.stringify(treatments, null, 2) + '\n');
console.log(`Applied: ${applied} | kept-existing: ${kept} | skipped: ${skipped} | treatments.json imageUrl updated: ${refUpdated}`);
