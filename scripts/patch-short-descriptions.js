#!/usr/bin/env node
/** Replace treatments.json shortDescription with the curated sidecar version. */
const fs = require('fs');
const path = require('path');

const tPath = path.join(__dirname, '..', 'lib', 'data', 'treatments.json');
const dir = path.join(__dirname, '..', 'lib', 'data', 'treatment-content');
const treatments = JSON.parse(fs.readFileSync(tPath, 'utf8'));

let patched = 0;
for (const t of treatments) {
  const sc = path.join(dir, `${t.slug}.json`);
  if (fs.existsSync(sc)) {
    const rich = JSON.parse(fs.readFileSync(sc, 'utf8'));
    if (rich.shortDescription && rich.shortDescription !== t.shortDescription) {
      t.shortDescription = rich.shortDescription;
      patched++;
    }
  }
}
fs.writeFileSync(tPath, JSON.stringify(treatments, null, 2) + '\n');
console.log(`Patched shortDescription for ${patched} treatments.`);
