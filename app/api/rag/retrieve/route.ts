import { getSupabaseAdminContext } from '@/lib/api/client/supabase'
import { isEmergency, isMedicalAdvice } from '@/lib/rag/chat-guards'
import { geminiEmbed } from '@/lib/rag/embed'
import { apiError, createErrorId } from '@/lib/utils/api-response'
import { logger } from '@/lib/utils/logger'
import { rateLimit as rateLimitMiddleware } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Retrieval-only endpoint for the voice agent's search_kmedtour tool.
 * Hard-gates emergency / medical-advice queries server-side (same guards as
 * text chat) by returning a directive the locked voice prompt must obey,
 * instead of content.
 */

const RETRIEVE_LIMIT = Number(process.env.RAG_RATE_LIMIT || 30)

const retrieveRequestSchema = z.object({
  query: z.string().min(2).max(500),
})

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await rateLimitMiddleware({
      limit: RETRIEVE_LIMIT,
      windowMs: 60_000,
      keyPrefix: 'rag-retrieve',
    })(request)
    if (rateLimitResponse) return rateLimitResponse

    const { query } = retrieveRequestSchema.parse(await request.json())

    if (isEmergency(query)) {
      return NextResponse.json({
        success: true,
        directive: {
          type: 'emergency',
          say: 'This may be a medical emergency. Please call 119 in Korea, or your local emergency number, right now. I cannot help with emergencies.',
        },
        chunks: [],
      })
    }

    if (isMedicalAdvice(query)) {
      return NextResponse.json({
        success: true,
        directive: {
          type: 'medical_advice',
          say: 'I cannot give medical advice or treatment recommendations. A KmedTour coordinator can arrange a consultation with a clinician — would you like that?',
        },
        chunks: [],
      })
    }

    const { client } = getSupabaseAdminContext()
    if (!client) {
      return NextResponse.json({ success: true, directive: null, chunks: [] })
    }

    const embedding = await geminiEmbed(query)
    const { data, error } = await client.rpc('match_rag_chunks', {
      query_embedding: embedding,
      match_count: 5,
      min_similarity: 0.2,
    })

    if (error) {
      logger.warn('retrieve: match_rag_chunks RPC error', { path: '/api/rag/retrieve' }, { error: error.message })
      return NextResponse.json({ success: true, directive: null, chunks: [] })
    }

    const chunks = (data || []).map((c: { title: string; content: string; source_url: string | null; similarity: number }) => ({
      title: c.title,
      content: c.content,
      source_url: c.source_url,
      similarity: c.similarity,
    }))

    return NextResponse.json({ success: true, directive: null, chunks })
  } catch (error) {
    const errorId = createErrorId('retrieve')
    logger.error('retrieve request failed', { path: '/api/rag/retrieve', method: 'POST' }, {
      errorId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined)
    return apiError('Unable to search right now.', 400, { errorId, code: 'RETRIEVE_FAILED' })
  }
}
