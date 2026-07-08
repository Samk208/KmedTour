#!/usr/bin/env node
/**
 * QA gate for treatment-content sidecars.
 *
 * HARD failures (exit 1 — block publish): structural/safety problems —
 *   invalid JSON, missing/thin core sections, fabricated expert quotes,
 *   fake statistics, markdown headings or raw URLs inside section prose,
 *   malformed FAQs, non-authoritative references.
 * SOFT warnings (exit 0 — reported, do NOT block): "not yet upgraded to the
 *   full factory format" — missing quickAnswer / keyFacts / costTable /
 *   keyTakeaways / entities, or non-skinny paragraphs. These mark which pages
 *   the content schedule still needs to upgrade; they never block a push.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'lib', 'data', 'treatment-content');
const REQUIRED = ['overview', 'candidacy', 'procedure_steps', 'recovery_timeline', 'cost_breakdown', 'why_korea'];
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'));

const ATTRIB_VERB = /\b(Dr\.|Professor|Prof\.)\s+[A-Z][a-z]+[^.]*\b(says?|said|explains?|notes?|states?|adds?)\b/;
const FAKE_STAT = /\b(studies show|research shows|a study (found|showed)|\d+\s?% of patients|surveys? (found|show))/i;
const MD_HEADING = /(^|\n)#{1,6}\s/;
const ALLOWED_REF = /(\.gov|\.edu|ncbi\.nlm\.nih\.gov|pubmed|nih\.gov|who\.int|wikipedia\.org|medicalkorea\.or\.kr|khidi\.or\.kr|frontiersin\.org|nature\.com|thelancet\.com|bmj\.com|\.go\.kr)/i;
const ALLOWED_ENTITY = /(wikipedia\.org|wikidata\.org)/i;
const SKINNY_MAX_WORDS = 50; // factory paragraph cap (bulk-affiliate playbook)
const FAQ_MAX_WORDS = 80; // factory FAQ answer cap (50-80 words, answer-first)
const QUICK_ANSWER_MAX_WORDS = 40; // quick-answer bullets stay extractable
// factory BANNED_WORDS (AI-slop tells) — hard fail, the generator must avoid these
const BANNED_WORDS = /\b(delve|tapestry|crucial|leverage|utilize|cutting-edge|game-changer|revolutionize|seamless|robust|realm|symphony|bustling|furthermore|moreover|testament|pivotal|synergy)\b|in today's (world|digital age|fast-paced)|it's important to note|needless to say|at the end of the day/i;
const HEDGING = /\b(may|might|perhaps|potentially|arguably)\b/i; // flagged in quick-answer zone only

const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

let hardPass = 0;
let fullFormat = 0;
const hardIssues = [];
const softIssues = [];

for (const f of files) {
  const slug = f.replace('.json', '');
  let t;
  try { t = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
  catch (e) { hardIssues.push(`${slug}: INVALID JSON — ${e.message}`); continue; }

  const hard = [];
  const soft = [];

  if (t.slug !== slug) hard.push(`slug mismatch (${t.slug})`);
  if (!t.shortDescription || t.shortDescription.length < 8) hard.push('shortDescription');
  if (/comprehensive guide/i.test(t.shortDescription || '')) hard.push('shortDescription is boilerplate');

  if (!t.sections) hard.push('no sections');
  else for (const s of REQUIRED) {
    const v = t.sections[s];
    if (!v || v.trim().length < 120) { hard.push(`thin/missing:${s}`); continue; }
    if (ATTRIB_VERB.test(v)) hard.push(`FABRICATED-QUOTE:${s}`);
    if (FAKE_STAT.test(v)) hard.push(`FAKE-STAT:${s}`);
    if (MD_HEADING.test(v)) hard.push(`MD-HEADING:${s}`);
    if (/\bhttps?:\/\//.test(v)) hard.push(`URL:${s}`);
    if (BANNED_WORDS.test(v)) hard.push(`BANNED-WORD:${s}`);
    // skinny check: >50 words soft, >80 words (wall of text) hard
    for (const block of v.split(/\n\n+/)) {
      const b = block.trim();
      if (!b) continue;
      const isList = b.split('\n').every((l) => /^\s*[-*]\s+/.test(l.trim()) || !l.trim());
      if (isList) continue;
      const w = wordCount(b);
      if (w > 80) { hard.push(`WALL-OF-TEXT:${s}(${w}w)`); break; }
      if (w > SKINNY_MAX_WORDS) { soft.push(`thick-paragraph:${s}(${w}w)`); }
    }
  }

  const allText = JSON.stringify(t);
  if (ATTRIB_VERB.test(allText)) hard.push('FABRICATED-QUOTE:faqs-or-text');
  if (!Array.isArray(t.faqs) || t.faqs.length < 4) hard.push(`faqs<4 (${t.faqs ? t.faqs.length : 0})`);
  else if (t.faqs.some((q) => !q.q || !q.a)) hard.push('faq-keys (must be q/a)');
  else for (const q of t.faqs) {
    if (wordCount(q.a) > FAQ_MAX_WORDS) soft.push(`faq>${FAQ_MAX_WORDS}w:"${q.q.slice(0, 40)}"(${wordCount(q.a)}w)`);
  }
  if (Array.isArray(t.quickAnswer)) for (const qa of t.quickAnswer) {
    if (wordCount(qa) > QUICK_ANSWER_MAX_WORDS) soft.push(`quickAnswer>${QUICK_ANSWER_MAX_WORDS}w(${wordCount(qa)}w)`);
    if (HEDGING.test(qa)) soft.push('quickAnswer-hedging');
  }

  if (Array.isArray(t.references)) {
    for (const r of t.references) {
      if (!r.url || !r.label) hard.push('reference missing url/label');
      else if (!ALLOWED_REF.test(r.url)) hard.push(`non-authoritative reference: ${r.url}`);
    }
  }

  // ---- full-format (soft) checks ----
  if (!Array.isArray(t.quickAnswer) || t.quickAnswer.length < 3) soft.push('quickAnswer<3');
  if (!Array.isArray(t.keyFacts) || t.keyFacts.length < 4) soft.push('keyFacts<4');
  if (!Array.isArray(t.costTable) || t.costTable.length < 3) soft.push('costTable<3');
  if (!Array.isArray(t.keyTakeaways) || t.keyTakeaways.length < 2) soft.push('keyTakeaways<2');
  if (!Array.isArray(t.entities) || t.entities.length < 3) soft.push('entities<3');
  else for (const e of t.entities) {
    if (!e.url || !e.name) soft.push('entity missing url/name');
    else if (!ALLOWED_ENTITY.test(e.url)) soft.push(`entity non-allowlisted: ${e.url}`);
  }

  if (hard.length) hardIssues.push(`${slug}: ${hard.join(', ')}`);
  else hardPass++;
  if (soft.length) softIssues.push(`${slug}: ${soft.join(', ')}`);
  else if (!hard.length) fullFormat++;
}

console.log(`Sidecars: ${files.length} | HARD-PASS: ${hardPass} | FULL-FORMAT: ${fullFormat} | HARD-FAIL: ${hardIssues.length} | needs-upgrade: ${softIssues.length}`);
if (hardIssues.length) console.log('\nHARD FAILURES (block publish):\n' + hardIssues.join('\n'));
if (softIssues.length) console.log('\nNEEDS-UPGRADE (soft, non-blocking):\n' + softIssues.join('\n'));

// Only HARD failures block a publish.
process.exit(hardIssues.length ? 1 : 0);
