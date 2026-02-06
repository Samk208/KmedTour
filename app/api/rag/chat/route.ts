import { logger } from '@/lib/utils/logger'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getSupabaseContext } from '@/lib/api/client/supabase'

type RateLimitEntry = {
  count: number
  resetAtMs: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || existing.resetAtMs <= now) {
    rateLimitStore.set(key, { count: 1, resetAtMs: now + windowMs })
    return true
  }

  if (existing.count >= limit) {
    return false
  }

  existing.count += 1
  return true
}

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

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  "can't breathe",
  'difficulty breathing',
  'severe bleeding',
  'heavy bleeding',
  'suicide',
  'kill myself',
  'overdose',
  'unconscious',
  'stroke',
  'seizure',
  'emergency',
]

const MEDICAL_ADVICE_PHRASES = [
  'should i get',
  'should i have',
  'do i need',
  'diagnose',
  "what's wrong with",
  'am i sick',
  'what medication',
  'what treatment',
]

function isEmergency(text: string): boolean {
  const q = text.toLowerCase()
  return EMERGENCY_KEYWORDS.some((k) => q.includes(k))
}

function isMedicalAdvice(text: string): boolean {
  const q = text.toLowerCase()
  return MEDICAL_ADVICE_PHRASES.some((k) => q.includes(k))
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
      const cite = `[${idx + 1}] ${c.title}${c.source_url ? ` (${c.source_url})` : ''}`
      return `${cite}\n${c.content}`
    })
    .join('\n\n---\n\n')

  const contentWithContext = args.context.length > 0
    ? `CONTEXT:
${contextBlock}

QUESTION:
${args.question}`
    : args.question

  try {
    const res = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: contentWithContext }],
        session_id: 'rag-session-' + Date.now()
      })
    })

    if (!res.ok) {
      // If Python server is down or errors, throw to trigger fallback/error handling
      throw new Error(`Python agent error: ${res.status}`)
    }

    const data = await res.json()
    return data.response

  } catch (error) {
    // Fallback: If Python agent is offline, we could try OpenAI directly here as last resort
    // For now, let's re-throw so the UI knows there's a connection issue (or we can implement direct OpenAI fallback here if desired)
    logger.warn('Python agent connection failed, using fallback', { path: '/api/rag/chat' }, { error: error instanceof Error ? error.message : 'Unknown' })
  
    // Quick fallback to direct OpenAI if Python is down (to ensure reliability)
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

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const ok = rateLimit(ip, Number(process.env.RAG_RATE_LIMIT || 30), 60_000)
    if (!ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Please try again shortly.',
        },
        { status: 429 },
      )
    }

    const payload = ragChatRequestSchema.parse(await request.json())

    if (isEmergency(payload.message)) {
      return NextResponse.json({
        success: true,
        route: 'emergency',
        answer:
          '🚨 This may be a medical emergency. Please call emergency services immediately (Korea: 119 / US: 911 / EU: 112). This assistant cannot help with emergencies.',
        citations: [],
        retrieved: [],
      })
    }

    if (isMedicalAdvice(payload.message)) {
      return NextResponse.json({
        success: true,
        route: 'human',
        answer:
          'I can’t provide medical advice, diagnosis, or treatment recommendations. Please consult a qualified healthcare professional. If you’d like, we can help arrange a consultation with a medical coordinator.',
        citations: [],
        retrieved: [],
      })
    }

    const { client } = getSupabaseContext()
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supabase is not configured.',
        },
        { status: 500 },
      )
    }

    let embedding: number[] | null = null
    let retrieved: RetrievedChunk[] = []

    try {
      embedding = await geminiEmbed(payload.message)

      const { data, error } = await client.rpc('match_rag_chunks', {
        query_embedding: embedding,
        match_count: 8,
        min_similarity: 0.2,
      })

      if (error) {
        logger.warn('RAG match_rag_chunks RPC error', { path: '/api/rag/chat' }, { error: error.message })
      } else {
        retrieved = (data || []) as RetrievedChunk[]
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      logger.warn('RAG retrieval/embedding failed, falling back to general knowledge', {
        path: '/api/rag/chat',
      }, {
        error: errorMessage,
      })
    }

    // Proceeed to generate answer even if retrieval failed (empty context)
    let answer = ''
    try {
      answer = await callPythonAgent({
        question: payload.message,
        context: retrieved,
      })
    } catch (genError: unknown) {
      const errorMessage = genError instanceof Error ? genError.message : 'Unknown error'
      logger.error('RAG generation failed (likely API key issue)', {
        path: '/api/rag/chat',
      }, {
        error: errorMessage,
      })
      answer = "I apologize, but I am currently unable to process your request due to a technical service interruption (API Key invalid). Please contact our medical coordinators directly via the 'Contact' page for immediate assistance."
    }

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
      retrieved: retrieved.map((c) => ({
        title: c.title,
        source_url: c.source_url,
        similarity: c.similarity,
      })),
    })
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
