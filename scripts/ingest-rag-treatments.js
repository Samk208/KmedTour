const path = require('path')

require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH || path.join(process.cwd(), '.env.local'),
})

const { createClient } = require('@supabase/supabase-js')

const treatments = require('../lib/data/treatments.json')

async function geminiEmbed(text) {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('[ingest] GEMINI_API_KEY is not set')
  }

  const model = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[ingest] embedContent failed: ${res.status} ${body}`)
  }

  const json = await res.json()
  const values = json?.embedding?.values
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('[ingest] embedContent returned no embedding values')
  }

  return values
}

function chunkText(text, maxChars) {
  const chunks = []
  const t = (text || '').trim()
  if (!t) return chunks

  for (let i = 0; i < t.length; i += maxChars) {
    chunks.push(t.slice(i, i + maxChars))
  }

  return chunks
}

function buildTreatmentDoc(t) {
  const parts = [
    `Title: ${t.title}`,
    t.category ? `Category: ${t.category}` : null,
    t.priceRange ? `Price range: ${t.priceRange}` : null,
    t.duration ? `Duration: ${t.duration}` : null,
    t.successRate ? `Success rate: ${t.successRate}` : null,
    t.shortDescription ? `Summary: ${t.shortDescription}` : null,
    t.description ? `Description: ${t.description}` : null,
    Array.isArray(t.highlights) && t.highlights.length
      ? `Keywords: ${t.highlights.join(', ')}`
      : null,
  ].filter(Boolean)

  return parts.join('\n')
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      '[ingest] SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY must be set',
    )
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const maxChars = Number(process.env.RAG_CHUNK_MAX_CHARS || 900)

  console.log(`[ingest] Starting ingestion for ${treatments.length} treatments...`)

  for (const t of treatments) {
    const sourceId = String(t.slug || t.id)
    const title = String(t.title || sourceId)

    const { data: docRows, error: docUpsertError } = await supabase
      .from('rag_documents')
      .upsert(
        {
          source_type: 'treatment',
          source_id: sourceId,
          title,
          source_url: t.slug ? `/treatments/${t.slug}` : null,
          metadata: {
            treatment_id: t.id,
            slug: t.slug,
            category: t.category,
            priceRange: t.priceRange,
          },
        },
        { onConflict: 'source_type,source_id' },
      )
      .select('id')

    if (docUpsertError) {
      console.error('[ingest] Failed to upsert rag_documents:', docUpsertError)
      continue
    }

    const documentId = docRows?.[0]?.id
    if (!documentId) {
      console.error('[ingest] No document id returned for', sourceId)
      continue
    }

    const fullText = buildTreatmentDoc(t)
    const textChunks = chunkText(fullText, maxChars)

    const { error: delError } = await supabase
      .from('rag_chunks')
      .delete()
      .eq('document_id', documentId)

    if (delError) {
      console.error('[ingest] Failed to delete old chunks for', sourceId, delError)
      continue
    }

    const rows = []

    for (let i = 0; i < textChunks.length; i++) {
      const content = textChunks[i]
      const embedding = await geminiEmbed(content)

      rows.push({
        document_id: documentId,
        chunk_index: i,
        content,
        embedding,
        metadata: {
          source_type: 'treatment',
          source_id: sourceId,
          chunk_index: i,
        },
      })
    }

    const { error: chunkInsertError } = await supabase
      .from('rag_chunks')
      .insert(rows)

    if (chunkInsertError) {
      console.error('[ingest] Failed to insert chunks for', sourceId, chunkInsertError)
      continue
    }

    console.log(`[ingest] Ingested: ${sourceId} (${rows.length} chunks)`) 
  }

  console.log('[ingest] Done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
