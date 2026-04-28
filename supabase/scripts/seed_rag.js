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
const embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

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

function buildSources() {
  const clinics = readJson('lib/data/clinics.json').map((clinic) => ({
    title: clinic.name,
    source_url: `/hospitals/${clinic.slug}`,
    metadata: { kind: 'clinic', slug: clinic.slug, external_id: clinic.id },
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
    ].filter(Boolean).join('\n'),
  }));

  const treatments = readJson('lib/data/treatments.json').map((treatment) => ({
    title: treatment.title,
    source_url: `/procedures/${treatment.slug}`,
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
    ].filter(Boolean).join('\n'),
  }));

  const articles = readJson('lib/data/articles.json').map((article) => ({
    title: article.title,
    source_url: `/content/articles/${article.slug}`,
    metadata: { kind: 'article', slug: article.slug, external_id: article.id },
    content: [article.title, article.excerpt, article.content].filter(Boolean).join('\n'),
  }));

  return [...clinics, ...treatments, ...articles];
}

async function embed(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:embedContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini embedContent failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const values = json?.embedding?.values;
  if (!Array.isArray(values) || values.length !== 768) {
    throw new Error(`Unexpected embedding dimension: ${Array.isArray(values) ? values.length : 'none'}`);
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

    const { data: document, error: documentError } = await supabase
      .from('rag_documents')
      .insert({
        title: source.title,
        source_url: source.source_url,
        source_type: 'seed',
        content_hash: hashContent(source.content),
        metadata: source.metadata,
        is_active: true,
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
        token_count: Math.ceil(content.length / 4),
        metadata: source.metadata,
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
