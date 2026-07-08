#!/usr/bin/env node
/**
 * QA gate for pSEO guide sidecars (lib/data/pseo-guides/*.json).
 *
 * HARD failures (exit 1 — block publish): invalid JSON, missing/thin required
 * arrays, fabricated expert quotes, fake statistics, markdown headings or raw
 * URLs in prose, banned AI-slop words, wall-of-text answers.
 * SOFT warnings (exit 0): over-long FAQ answers / detail paragraphs.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'lib', 'data', 'pseo-guides');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'));

const ATTRIB_VERB = /\b(Dr\.|Professor|Prof\.)\s+[A-Z][a-z]+[^.]*\b(says?|said|explains?|notes?|states?|adds?)\b/;
const FAKE_STAT = /\b(studies show|research shows|a study (found|showed)|\d+\s?% of patients|surveys? (found|show))/i;
const MD_HEADING = /(^|\n)#{1,6}\s/;
const BANNED_WORDS = /\b(delve|tapestry|crucial|leverage|utilize|cutting-edge|game-changer|revolutionize|seamless|robust|realm|symphony|bustling|furthermore|moreover|testament|pivotal|synergy)\b|in today's (world|digital age|fast-paced)|it's important to note|needless to say|at the end of the day/i;

const wc = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

let hardPass = 0;
const hardIssues = [];
const softIssues = [];

for (const f of files) {
  const slug = f.replace('.json', '');
  let g;
  try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
  catch (e) { hardIssues.push(`${slug}: INVALID JSON — ${e.message}`); continue; }

  const hard = [];
  const soft = [];

  if (g.slug !== slug) hard.push(`slug mismatch (${g.slug})`);
  if (!Array.isArray(g.candidateFor) || g.candidateFor.length < 3) hard.push('candidateFor<3');
  if (!Array.isArray(g.whatToExpect) || g.whatToExpect.length < 3) hard.push('whatToExpect<3');
  else for (const s of g.whatToExpect) {
    if (!s.step || !s.duration || !s.detail) hard.push('whatToExpect keys (step/duration/detail)');
    else if (wc(s.detail) < 20) hard.push(`thin step detail: ${s.step}`);
    else if (wc(s.detail) > 90) soft.push(`step detail>90w: ${s.step}(${wc(s.detail)}w)`);
  }
  if (!Array.isArray(g.whyKorea) || g.whyKorea.length < 3) hard.push('whyKorea<3');
  if (!Array.isArray(g.faqs) || g.faqs.length < 3) hard.push(`faqs<3 (${g.faqs ? g.faqs.length : 0})`);
  else for (const q of g.faqs) {
    if (!q.question || !q.answer) hard.push('faq keys (question/answer)');
    else {
      if (wc(q.answer) < 25) hard.push(`thin faq: "${q.question.slice(0, 40)}"`);
      if (wc(q.answer) > 110) hard.push(`WALL-OF-TEXT faq: "${q.question.slice(0, 40)}"(${wc(q.answer)}w)`);
      else if (wc(q.answer) > 80) soft.push(`faq>80w: "${q.question.slice(0, 40)}"(${wc(q.answer)}w)`);
    }
  }

  const all = JSON.stringify(g);
  if (ATTRIB_VERB.test(all)) hard.push('FABRICATED-QUOTE');
  if (FAKE_STAT.test(all)) hard.push('FAKE-STAT');
  if (MD_HEADING.test(all)) hard.push('MD-HEADING');
  if (/https?:\/\//.test(all)) hard.push('raw URL in prose');
  if (BANNED_WORDS.test(all)) hard.push('BANNED-WORD');

  if (hard.length) hardIssues.push(`${slug}: ${[...new Set(hard)].join(', ')}`);
  else hardPass++;
  if (soft.length) softIssues.push(`${slug}: ${soft.join(', ')}`);
}

console.log(`Guides: ${files.length} | HARD-PASS: ${hardPass} | HARD-FAIL: ${hardIssues.length} | soft-warnings: ${softIssues.length}`);
if (hardIssues.length) console.log('\nHARD FAILURES (block publish):\n' + hardIssues.join('\n'));
if (softIssues.length) console.log('\nSOFT (non-blocking):\n' + softIssues.join('\n'));
process.exit(hardIssues.length ? 1 : 0);
