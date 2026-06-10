import { logger } from '@/lib/utils/logger'

/**
 * Embed text with Gemini. gemini-embedding-001 is the current embedContent-capable
 * model (text-embedding-004 is retired). outputDimensionality must match the
 * rag_chunks.embedding column (vector(768)) and the dim used at seed-time.
 */
export async function geminiEmbed(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!key) {
    throw new Error('[rag] GEMINI_API_KEY (or GOOGLE_API_KEY) is not set')
  }

  const model = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001'
  const dim = Number(process.env.GEMINI_EMBEDDING_OUTPUT_DIM || 768)

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: dim,
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    logger.error('Gemini embedContent failed', { path: '/api/rag' }, { status: res.status, body })
    throw new Error(`[rag] embedContent failed: ${res.status} ${body}`)
  }

  const json = await res.json()
  const values = json?.embedding?.values
  if (!Array.isArray(values) || values.length !== dim) {
    throw new Error(`[rag] embedContent returned wrong embedding dim: ${Array.isArray(values) ? values.length : 'none'} (expected ${dim})`)
  }

  return values
}
