import { getSupabaseAdminContext } from '@/lib/api/client/supabase'
import { isEmergency, isMedicalAdvice } from '@/lib/rag/chat-guards'
import { geminiEmbed } from '@/lib/rag/embed'
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
