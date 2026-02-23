import { getSupabaseContext } from '@/lib/api/client/supabase'
import { isEmergency, isMedicalAdvice } from '@/lib/rag/chat-guards'
import { logger } from '@/lib/utils/logger'
import { rateLimit as rateLimitMiddleware } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const RAG_LIMIT = Number(process.env.RAG_RATE_LIMIT || 30)
const RAG_WINDOW_MS = 60_000

const ragChatRequestSchema = z.object({
  message: z.string().min(2),
})

type RetrievedChunk = {
  chunk_id: string
  document_id: string
  title: string
  source_url: string | null
  content: string
  similarity: number
  metadata: unknown
}

async function geminiEmbed(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('[rag] GEMINI_API_KEY is not set')
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
    logger.error('Gemini embedContent failed', { path: '/api/rag/chat' }, { status: res.status, body })
    throw new Error(`[rag] embedContent failed: ${res.status} ${body}`)
  }

  const json = await res.json()
  const values = json?.embedding?.values
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('[rag] embedContent returned no embedding values')
  }

  return values
}

async function callPythonAgent(args: {
  question: string
  context: RetrievedChunk[]
}): Promise<string> {
  // Construct the prompt with context
  const contextBlock = args.context
    .map((c, idx) => {
      const urlPart = c.source_url ? ' (' + c.source_url + ')' : ''
      return `[${idx + 1}] ${c.title}${urlPart}\n${c.content}`
    })
    .join('\n\n---\n\n')

  const contentWithContext = args.context.length > 0
    ? `CONTEXT:
${contextBlock}

QUESTION:
${args.question}`
    : args.question

  const agentBaseUrl = process.env.PYTHON_AGENT_URL || 'http://127.0.0.1:8000'
  try {
    const res = await fetch(`${agentBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: contentWithContext }],
        session_id: 'rag-session-' + Date.now()
      })
    })

    if (!res.ok) {
      throw new Error(`Python agent error: ${res.status}`)
    }

    const data = await res.json()
    return data.response

  } catch (error) {
    logger.warn('Python agent connection failed, using fallback', { path: '/api/rag/chat' }, { error: error instanceof Error ? error.message : 'Unknown' })
    return await fallbackOpenAIGenerate(args.question, contextBlock)
  }
}

async function fallbackOpenAIGenerate(question: string, context: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error("No Python agent and no OpenAI Key")

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are KmedTour medical assistant. Provide helpful, safe general info.' },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
      ]
    })
  })

  const data = await res.json()
  return data.choices?.[0]?.message?.content || "Service unavailable."
}

function safetyResponse(route: 'emergency' | 'human', answer: string) {
  return NextResponse.json({ success: true, route, answer, citations: [], retrieved: [] })
}

async function runRetrieval(
  client: NonNullable<Awaited<ReturnType<typeof getSupabaseContext>>['client']>,
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

    const { client } = getSupabaseContext()
    let retrieved: RetrievedChunk[] = []

    if (client) {
      try {
        retrieved = await runRetrieval(client, payload.message)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        logger.warn('RAG retrieval/embedding failed, using direct Python agent', { path: '/api/rag/chat' }, { error: msg })
      }
    } else {
      logger.info('RAG chat: Supabase not configured, using direct Python agent', { path: '/api/rag/chat' })
    }

    let answer: string
    try {
      answer = await callPythonAgent({ question: payload.message, context: retrieved })
    } catch (genError: unknown) {
      logger.error('RAG generation failed', { path: '/api/rag/chat' }, { error: genError instanceof Error ? genError.message : 'Unknown' })
      answer = "I apologize, but I am currently unable to process your request. Please contact our medical coordinators via the 'Contact' page."
    }

    return buildSuccessResponse(retrieved, answer)
  } catch (error) {
    logger.error('RAG chat request failed', {
      path: '/api/rag/chat',
      method: 'POST',
    }, {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined)

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to process your request at this time.',
      },
      { status: 400 },
    )
  }
}
