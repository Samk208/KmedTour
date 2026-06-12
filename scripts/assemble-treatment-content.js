#!/usr/bin/env node
/**
 * Parse persisted subagent batch outputs into validated per-slug sidecar files.
 * Usage: node scripts/assemble-treatment-content.js <file1> <file2> ...
 * Each input is either a raw JSON array of treatment objects, or a tool-result
 * wrapper [{type:"text", text:"<json array string>"}].
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'lib', 'data', 'treatment-content');
fs.mkdirSync(OUT_DIR, { recursive: true });

const REQUIRED_SECTIONS = ['overview', 'candidacy', 'procedure_steps', 'recovery_timeline', 'cost_breakdown', 'why_korea'];

function extractArray(raw) {
  let data;
  try { data = JSON.parse(raw); } catch { return null; }
  // tool-result wrapper: [{type:text, text:"<json array> + trailing agent metadata"}]
  if (Array.isArray(data) && data.length && data[0] && data[0].type === 'text') {
    const txt = data[0].text;
    const start = txt.indexOf('[');
    const end = txt.lastIndexOf(']');
    if (start === -1 || end === -1) return null;
    try { data = JSON.parse(txt.slice(start, end + 1)); } catch (e) { console.error('  inner parse:', e.message); return null; }
  }
  return Array.isArray(data) ? data : null;
}

function validate(t) {
  const problems = [];
  if (!t.slug) problems.push('no slug');
  if (!t.shortDescription || t.shortDescription.length < 8) problems.push('shortDescription');
  if (!t.sections || typeof t.sections !== 'object') {
    problems.push('no sections');
  } else {
    for (const s of REQUIRED_SECTIONS) {
      if (!t.sections[s] || t.sections[s].trim().length < 120) problems.push(`section:${s}`);
    }
  }
  if (!Array.isArray(t.faqs) || t.faqs.length < 3) problems.push('faqs<3');
  return problems;
}

const valid = [];
const invalid = [];
for (const file of process.argv.slice(2)) {
  const arr = extractArray(fs.readFileSync(file, 'utf8'));
  if (!arr) { console.error(`PARSE FAIL: ${file}`); continue; }
  for (const t of arr) {
    const probs = validate(t);
    if (probs.length === 0) {
      // strip any junk extra keys; keep only the schema
      const clean = { slug: t.slug, shortDescription: t.shortDescription, sections: {}, faqs: t.faqs };
      for (const s of REQUIRED_SECTIONS) clean.sections[s] = t.sections[s].trim();
      fs.writeFileSync(path.join(OUT_DIR, `${t.slug}.json`), JSON.stringify(clean, null, 2));
      valid.push(t.slug);
    } else {
      invalid.push(`${t.slug || '??'} [${probs.join(', ')}]`);
    }
  }
}

console.log(`\nVALID (${valid.length}): ${valid.join(', ')}`);
console.log(`\nINVALID (${invalid.length}):\n  ${invalid.join('\n  ')}`);
