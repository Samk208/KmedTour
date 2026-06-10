import { getSupabaseAdminContext } from '@/lib/api/client/supabase'
import { isEmergency, isMedicalAdvice } from '@/lib/rag/chat-guards'
import { generateAnswer, type RetrievedChunk } from '@/lib/rag/generate'
import { apiError, createErrorId } from '@/lib/utils/api-response'
import { logger } from '@/lib/utils/logger'
import { rateLimit as rateLimitMiddleware } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const RAG_LIMIT = Number(process.env.RAG_RATE_LIMIT || 30)
const RAG_WINDOW_MS = 60_000

const ragChatRequestSchema = z.object({
  message: z.string().min(2),
})

async function geminiEmbed(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!key) {
    throw new Error('[rag] GEMINI_API_KEY (or GOOGLE_API_KEY) is not set')
  }

  // gemini-embedding-001 is the current embedContent-capable model. text-embedding-004
  // returns 404 on v1beta as of 2026-04. outputDimensionality=768 must match the
  // rag_chunks.embedding column type and the dim used at seed-time.
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
    logger.error('Gemini embedContent failed', { path: '/api/rag/chat' }, { status: res.status, body })
    throw new Error(`[rag] embedContent failed: ${res.status} ${body}`)
  }

  const json = await res.json()
  const values = json?.embedding?.values
  if (!Array.isArray(values) || values.length !== dim) {
    throw new Error(`[rag] embedContent returned wrong embedding dim: ${Array.isArray(values) ? values.length : 'none'} (expected ${dim})`)
  }

  return values
}

function safetyResponse(route: 'emergency' | 'human', answer: string) {
  return NextResponse.json({ success: true, route, answer, citations: [], retrieved: [] })
}

async function runRetrieval(
  client: NonNullable<Awaited<ReturnType<typeof getSupabaseAdminContext>>['client']>,
  message: string
): Promise<RetrievedChunk[]> {
  const embedding = await geminiEmbed(message)
  const { data, error } = await client.rpc('match_rag_chunks', {
    query_embedding: embedding,
    match_count: 8,
    min_similarity: 0.2,
  })
  if (error) {
    logger.warn('RAG match_rag_chunks RPC error', { path: '/api/rag/chat' }, { error: error.message })
    return []
  }
  return (data || []) as RetrievedChunk[]
}

function buildSuccessResponse(retrieved: RetrievedChunk[], answer: string) {
  const citations = retrieved.map((c, idx) => ({
    ref: `[${idx + 1}]`,
    title: c.title,
    source_url: c.source_url,
    similarity: c.similarity,
  }))
  return NextResponse.json({
    success: true,
    route: retrieved.length > 0 ? 'rag' : 'fallback',
    answer,
    citations,
    retrieved: retrieved.map((c) => ({ title: c.title, source_url: c.source_url, similarity: c.similarity })),
  })
}

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await rateLimitMiddleware({
      limit: RAG_LIMIT,
      windowMs: RAG_WINDOW_MS,
      keyPrefix: 'rag',
    })(request)
    if (rateLimitResponse) {
      logger.warn('RAG chat rate limit exceeded', { path: '/api/rag/chat', method: 'POST' })
      return rateLimitResponse
    }

    const payload = ragChatRequestSchema.parse(await request.json())

    if (isEmergency(payload.message)) {
      return safetyResponse(
        'emergency',
        '🚨 This may be a medical emergency. Please call emergency services immediately (Korea: 119 / US: 911 / EU: 112). This assistant cannot help with emergencies.'
      )
    }

    if (isMedicalAdvice(payload.message)) {
      return safetyResponse(
        'human',
        "I can't provide medical advice, diagnosis, or treatment recommendations. Please consult a qualified healthcare professional. If you'd like, we can help arrange a consultation with a medical coordinator."
      )
    }

    const { client } = getSupabaseAdminContext()
    let retrieved: RetrievedChunk[] = []

    if (client) {
      try {
        retrieved = await runRetrieval(client, payload.message)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        logger.warn('RAG retrieval/embedding failed, generating without context', { path: '/api/rag/chat' }, { error: msg })
      }
    } else {
      logger.info('RAG chat: Supabase not configured, generating without context', { path: '/api/rag/chat' })
    }

    let answer: string
    try {
      answer = await generateAnswer(payload.message, retrieved)
    } catch (genError: unknown) {
      logger.error('RAG generation failed', { path: '/api/rag/chat' }, { error: genError instanceof Error ? genError.message : 'Unknown' })
      answer = "I apologize, but I am currently unable to process your request. Please contact our medical coordinators via the 'Contact' page."
    }

    return buildSuccessResponse(retrieved, answer)
  } catch (error) {
    const errorId = createErrorId('rag')
    logger.error('RAG chat request failed', {
      path: '/api/rag/chat',
      method: 'POST',
    }, {
      errorId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined)

    return apiError('Unable to process your request at this time.', 400, {
      errorId,
      code: 'RAG_REQUEST_FAILED',
    })
  }
}
