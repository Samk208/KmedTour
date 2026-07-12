/**
 * Seed rag_documents and rag_chunks from local KmedTour content.
 *
 * Run after 008_missing_tables.sql has been applied:
 *   node supabase/scripts/seed_rag.js
 */

require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
// gemini-embedding-001 is the current embedContent-capable model. text-embedding-004
// returns 404 on v1beta as of 2026-04. We pin outputDimensionality=768 because the
// rag_chunks.embedding column is vector(768).
const embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const embeddingDim = Number(process.env.GEMINI_EMBEDDING_OUTPUT_DIM || 768);

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY/GOOGLE_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), 'utf8'));
}

function plain(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join('\n');
  return String(value);
}

// Pull the rich /procedures factory content (sections, quick answer, key facts,
// cost table, FAQs) from the per-treatment sidecar so chat answers are as deep as
// the published pages — not the thin treatments.json description.
function loadTreatmentSidecar(slug) {
  const p = path.join(process.cwd(), 'lib/data/treatment-content', `${slug}.json`);
  if (!fs.existsSync(p)) return '';
  let sc;
  try {
    sc = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return '';
  }
  const parts = [];
  if (sc.quickAnswer) parts.push(plain(sc.quickAnswer));
  if (sc.sections && typeof sc.sections === 'object') {
    parts.push(Object.values(sc.sections).filter(Boolean).join('\n'));
  }
  if (Array.isArray(sc.keyFacts)) {
    parts.push(sc.keyFacts.map((f) => `${f.label}: ${f.value}`).join('\n'));
  }
  if (Array.isArray(sc.costTable)) {
    parts.push(sc.costTable.map((c) => `${c.item}: ${c.koreanCost} in Korea (vs ${c.globalCost} globally)`).join('\n'));
  }
  if (Array.isArray(sc.keyTakeaways)) parts.push(sc.keyTakeaways.filter(Boolean).join('\n'));
  if (Array.isArray(sc.faqs)) {
    parts.push(sc.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n'));
  }
  return parts.filter(Boolean).join('\n\n');
}

function chunkText(text, size = 1200, overlap = 160) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const chunks = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(start + size, normalized.length);
    const sentenceBreak = normalized.lastIndexOf('. ', end);
    if (sentenceBreak > start + Math.floor(size * 0.55)) {
      end = sentenceBreak + 1;
    }
    chunks.push(normalized.slice(start, end).trim());
    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

// Clinic `specialties` use a department enum; treatments use a `category`. This
// map bridges them so a clinic doc can list the procedures it offers with catalog
// price ranges — the link that lets chat answer "which clinic does X, for how much".
const SPECIALTY_TO_CATEGORIES = {
  DERMATOLOGY: ['Cosmetic'],
  PLASTIC_SURGERY: ['Cosmetic'],
  OPHTHALMOLOGY: ['Eye Care'],
  UROLOGY: ['Urology'],
  ORTHOPEDICS: ['Orthopedic', 'Spine', 'Rehabilitation'],
  PULMONOLOGY: ['Respiratory'],
  PEDIATRICS: ['Pediatrics'],
  OBSTETRICS_AND_GYNECOLOGY: ['Obstetrics', 'Gynecology'],
  'OBSTETRICS/GYNECOLOGY': ['Obstetrics', 'Gynecology'],
  OBSTETRICS_GYNECOLOGY: ['Obstetrics', 'Gynecology'],
  FERTILITY: ['Fertility'],
  NEUROSURGERY: ['Neurosurgery'],
  GASTROENTEROLOGY: ['Gastroenterology'],
  OTORHINOLARYNGOLOGY: ['ENT'],
  ONCOLOGY: ['Oncology', 'Cancer'],
  INTERNAL_MEDICINE: ['Preventive', 'Endocrine'],
  CARDIOLOGY: ['Cardiac', 'Vascular'],
  DENTISTRY: ['Dental', 'Dentistry'],
  DENTAL: ['Dental', 'Dentistry'],
};

const MAX_CLINIC_PROCEDURES = 15;

// Fallback for clinics whose `specialties` hold free-text instead of the enum
// (a data-quality issue in the source). Scan the specialty text for these
// keywords so e.g. "Specialized in ... rhinoplasty ... body contouring" still maps.
const KEYWORD_TO_CATEGORIES = [
  [/plastic|rhinoplasty|contouring|eyelid|blepharoplasty|facial|liposuction|cosmetic|anti-aging|dermatolog|breast surgery/, ['Cosmetic']],
  [/korean medicine|traditional|acupuncture|herbal|moxibustion|cupping/, ['Traditional']],
  [/orthopedic|spine|spinal|rehabilitation/, ['Orthopedic', 'Spine', 'Rehabilitation']],
  [/dental|dentist/, ['Dental', 'Dentistry']],
  [/fertility|ivf/, ['Fertility']],
  [/ophthalmolog|eye care/, ['Eye Care']],
  [/oncolog|cancer/, ['Oncology', 'Cancer']],
  [/cardiolog|cardiac/, ['Cardiac', 'Vascular']],
];

// Procedures in a clinic's specialty areas, with catalog (not clinic-specific)
// prices. Wording makes the "typical price, confirm exact quote" framing explicit
// so the grounded model does not assert a clinic charges a specific amount.
function buildClinicProcedureBlock(clinic, byCategory) {
  const categories = new Set();
  const specialtyText = (clinic.specialties || []).join(' ').toLowerCase();
  for (const s of clinic.specialties || []) {
    for (const cat of SPECIALTY_TO_CATEGORIES[String(s).trim().toUpperCase()] || []) {
      categories.add(cat);
    }
  }
  for (const [re, cats] of KEYWORD_TO_CATEGORIES) {
    if (re.test(specialtyText)) cats.forEach((c) => categories.add(c));
  }
  if (categories.size === 0) return '';

  const seen = new Set();
  const lines = [];
  for (const cat of categories) {
    for (const t of byCategory[cat] || []) {
      if (seen.has(t.slug)) continue;
      seen.add(t.slug);
      lines.push(`- ${t.title} (typical ${t.priceRange || 'contact for pricing'})`);
      if (lines.length >= MAX_CLINIC_PROCEDURES) break;
    }
    if (lines.length >= MAX_CLINIC_PROCEDURES) break;
  }
  if (lines.length === 0) return '';
  return (
    `Procedures offered at ${clinic.name} in its specialty areas ` +
    `(prices are typical KmedTour ranges — contact a coordinator for this clinic's exact quote):\n` +
    lines.join('\n')
  );
}

function buildSources() {
  const treatmentData = readJson('lib/data/treatments.json');
  const byCategory = {};
  for (const t of treatmentData) {
    const cat = t.category || 'Other';
    (byCategory[cat] = byCategory[cat] || []).push({ title: t.title, slug: t.slug, priceRange: t.priceRange });
  }

  // source_id pattern: '<kind>:<slug>'. Stable, readable, collision-free with
  // any non-seed rows that use UUIDs. Cleanup uses source_type='seed'.
  const clinics = readJson('lib/data/clinics.json').map((clinic) => ({
    title: clinic.name,
    source_url: `/hospitals/${clinic.slug}`,
    source_id: `clinic:${clinic.slug}`,
    metadata: { kind: 'clinic', slug: clinic.slug, external_id: clinic.id, content_hash: null },
    content: [
      clinic.name,
      clinic.shortDescription,
      clinic.description,
      `Location: ${clinic.location || 'South Korea'}`,
      `Specialties: ${plain(clinic.specialties)}`,
      `Accreditations: ${plain(clinic.accreditations)}`,
      `Languages: ${plain(clinic.languagesSupported)}`,
      `Highlights: ${plain(clinic.highlights)}`,
      `Facilities: ${plain(clinic.facilities)}`,
      buildClinicProcedureBlock(clinic, byCategory),
    ].filter(Boolean).join('\n'),
  }));

  const treatments = treatmentData.map((treatment) => ({
    title: treatment.title,
    source_url: `/procedures/${treatment.slug}`,
    source_id: `treatment:${treatment.slug}`,
    metadata: { kind: 'treatment', slug: treatment.slug, external_id: treatment.id },
    content: [
      treatment.title,
      treatment.shortDescription,
      treatment.description,
      `Category: ${treatment.category || 'medical procedure'}`,
      `Price range: ${treatment.priceRange || 'contact for pricing'}`,
      `Duration: ${treatment.duration || 'varies'}`,
      `Success rate: ${treatment.successRate || 'varies by patient'}`,
      `Highlights: ${plain(treatment.highlights)}`,
      loadTreatmentSidecar(treatment.slug),
    ].filter(Boolean).join('\n'),
  }));

  const articles = readJson('lib/data/articles.json').map((article) => ({
    title: article.title,
    source_url: `/content/articles/${article.slug}`,
    source_id: `article:${article.slug}`,
    metadata: { kind: 'article', slug: article.slug, external_id: article.id },
    content: [article.title, article.excerpt, article.content].filter(Boolean).join('\n'),
  }));

  // RAG-only knowledge docs (visa, logistics, payments, aftercare) — not site
  // pages; they exist so chat can answer core logistics questions.
  const knowledge = readJson('lib/data/rag-knowledge.json').map((doc) => ({
    title: doc.title,
    source_url: '/how-it-works',
    source_id: `knowledge:${doc.slug}`,
    metadata: { kind: 'knowledge', slug: doc.slug },
    content: [doc.title, doc.content].filter(Boolean).join('\n'),
  }));

  return [...clinics, ...treatments, ...articles, ...knowledge];
}

async function embed(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:embedContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: embeddingDim,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini embedContent failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const values = json?.embedding?.values;
  if (!Array.isArray(values) || values.length !== embeddingDim) {
    throw new Error(`Unexpected embedding dimension: ${Array.isArray(values) ? values.length : 'none'} (expected ${embeddingDim})`);
  }
  return `[${values.join(',')}]`;
}

async function main() {
  console.log('Clearing previous seeded RAG documents...');
  const { error: deleteError } = await supabase
    .from('rag_documents')
    .delete()
    .eq('source_type', 'seed');
  if (deleteError) throw deleteError;

  const sources = buildSources();
  let documentCount = 0;
  let chunkCount = 0;

  for (const source of sources) {
    const chunks = chunkText(source.content);
    if (chunks.length === 0) continue;

    // Production schema does not have content_hash / is_active on rag_documents.
    // Production schema does not have token_count on rag_chunks. We carry both
    // pieces of info in metadata so they remain queryable without a migration.
    const { data: document, error: documentError } = await supabase
      .from('rag_documents')
      .insert({
        title: source.title,
        source_url: source.source_url,
        source_type: 'seed',
        source_id: source.source_id,
        metadata: { ...source.metadata, content_hash: hashContent(source.content) },
      })
      .select('id')
      .single();
    if (documentError) throw documentError;

    const rows = [];
    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      rows.push({
        document_id: document.id,
        chunk_index: i,
        content,
        embedding: await embed(content),
        metadata: { ...source.metadata, token_count: Math.ceil(content.length / 4) },
      });
      process.stdout.write('.');
    }

    const { error: chunkError } = await supabase.from('rag_chunks').insert(rows);
    if (chunkError) throw chunkError;

    documentCount += 1;
    chunkCount += rows.length;
  }

  console.log(`\nSeeded ${documentCount} RAG documents and ${chunkCount} chunks.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
