#!/usr/bin/env node
/** QA gate for treatment-content sidecars: structure + fabrication checks. */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'lib', 'data', 'treatment-content');
const REQUIRED = ['overview', 'candidacy', 'procedure_steps', 'recovery_timeline', 'cost_breakdown', 'why_korea'];
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'));

// fabricated-expert pattern: "Dr. Name" / "Professor Name said/says/explains/notes"
const DR_QUOTE = /\b(Dr\.|Professor|Prof\.)\s+[A-Z][a-z]+/;
const ATTRIB_VERB = /\b(Dr\.|Professor|Prof\.)\s+[A-Z][a-z]+[^.]*\b(says?|said|explains?|notes?|states?|adds?)\b/;
// invented "studies show / N% of patients" style
const FAKE_STAT = /\b(studies show|research shows|a study (found|showed)|\d+\s?% of patients|surveys? (found|show))/i;
const MD_HEADING = /(^|\n)#{1,6}\s/;

let pass = 0;
const issues = [];
for (const f of files) {
  const slug = f.replace('.json', '');
  let t;
  try { t = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
  catch (e) { issues.push(`${slug}: INVALID JSON — ${e.message}`); continue; }

  const probs = [];
  if (t.slug !== slug) probs.push(`slug mismatch (${t.slug})`);
  if (!t.shortDescription || t.shortDescription.length < 8) probs.push('shortDescription');
  if (/comprehensive guide/i.test(t.shortDescription || '')) probs.push('shortDescription is boilerplate');
  if (!t.sections) probs.push('no sections');
  else for (const s of REQUIRED) {
    const v = t.sections[s];
    if (!v || v.trim().length < 120) probs.push(`thin/missing:${s}`);
    else {
      if (ATTRIB_VERB.test(v)) probs.push(`FABRICATED-QUOTE:${s}`);
      if (FAKE_STAT.test(v)) probs.push(`FAKE-STAT:${s}`);
      if (MD_HEADING.test(v)) probs.push(`MD-HEADING:${s}`);
      if (/\bhttps?:\/\//.test(v)) probs.push(`URL:${s}`);
    }
  }
  const allText = JSON.stringify(t);
  if (ATTRIB_VERB.test(allText)) probs.push('FABRICATED-QUOTE:faqs-or-text');
  if (!Array.isArray(t.faqs) || t.faqs.length < 4) probs.push(`faqs<4 (${t.faqs ? t.faqs.length : 0})`);

  if (probs.length) issues.push(`${slug}: ${probs.join(', ')}`);
  else pass++;
}

console.log(`Sidecars: ${files.length} | PASS: ${pass} | ISSUES: ${issues.length}`);
if (issues.length) console.log('\n' + issues.join('\n'));
// also flag any slice-1 slug with no file
process.exit(issues.length ? 1 : 0);
