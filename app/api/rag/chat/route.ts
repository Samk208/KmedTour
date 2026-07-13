import { getSupabaseAdminContext } from '@/lib/api/client/supabase'
import { isEmergency, isMedicalAdvice } from '@/lib/rag/chat-guards'
import { condenseForRetrieval } from '@/lib/rag/condense'
import { logQuery } from '@/lib/rag/query-log'
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
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .max(12)
    .optional()
    .default([]),
})

function safetyResponse(route: 'emergency' | 'human' | 'fallback', answer: string) {
  return NextResponse.json({ success: true, route, answer, citations: [], retrieved: [] })
}

async function runRetrieval(
  client: NonNullable<Awaited<ReturnType<typeof getSupabaseAdminContext>>['client']>,
  query: string
): Promise<RetrievedChunk[]> {
  const embedding = await geminiEmbed(query)
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
    let retrievalAttempted = false
    let condensedQuery: string | null = null

    if (client) {
      retrievalAttempted = true
      try {
        // Embed the query condensed with recent history so follow-ups
        // ("how long does that one take?") retrieve against the right subject.
        condensedQuery = condenseForRetrieval(payload.message, payload.history)
        retrieved = await runRetrieval(client, condensedQuery)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        logger.warn('RAG retrieval/embedding failed, generating without context', { path: '/api/rag/chat' }, { error: msg })
        retrievalAttempted = false // embedding/RPC broke, not a genuine "no match"
      }
    } else {
      logger.info('RAG chat: Supabase not configured, generating without context', { path: '/api/rag/chat' })
    }

    // Empty-context hard-stop: if retrieval ran cleanly but matched nothing, hand
    // off to a coordinator instead of generating an ungrounded (hallucinated) answer.
    if (retrievalAttempted && retrieved.length === 0) {
      logger.info('RAG chat: no relevant context, handing off', { path: '/api/rag/chat' })
      if (client) {
        await logQuery(client, {
          question: payload.message,
          condensed_query: condensedQuery,
          route: 'fallback',
          top_similarity: null,
          num_results: 0,
          citations: [],
        })
      }
      return safetyResponse(
        'fallback',
        "I don't have information on that in our knowledge base yet. A KmedTour medical coordinator can help directly — please reach out via the Contact page and we'll get you an answer."
      )
    }

    let answer: string
    try {
      answer = await generateAnswer(payload.message, retrieved, payload.history)
    } catch (genError: unknown) {
      logger.error('RAG generation failed', { path: '/api/rag/chat' }, { error: genError instanceof Error ? genError.message : 'Unknown' })
      answer = "I apologize, but I am currently unable to process your request. Please contact our medical coordinators via the 'Contact' page."
    }

    if (client) {
      await logQuery(client, {
        question: payload.message,
        condensed_query: condensedQuery,
        route: retrieved.length > 0 ? 'rag' : 'fallback',
        top_similarity: retrieved[0]?.similarity ?? null,
        num_results: retrieved.length,
        citations: retrieved.map((c) => ({ title: c.title, source_url: c.source_url, similarity: c.similarity })),
      })
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
