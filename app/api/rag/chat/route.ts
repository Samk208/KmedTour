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
    throw new Error(`[rag] embedContent failed: ${res.status} ${body}`)
  }

  const json = await res.json()
  const values = json?.embedding?.values
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('[rag] embedContent returned no embedding values')
  }

  return values
}

async function geminiGenerateAnswer(args: {
  question: string
  context: RetrievedChunk[]
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('[rag] GEMINI_API_KEY is not set')
  }

  const model = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash'

  const contextBlock = args.context
    .map((c, idx) => {
      const cite = `[${idx + 1}] ${c.title}${c.source_url ? ` (${c.source_url})` : ''}`
      return `${cite}\n${c.content}`
    })
    .join('\n\n---\n\n')

  const system = `You are KmedTour's medical tourism assistant.

Rules:
- Provide general information only. Do not give medical advice or diagnosis.
- Use ONLY the provided CONTEXT for factual claims.
- If CONTEXT is insufficient, say you don't have enough verified info and suggest a consultation.
- Keep the answer concise.
- When using information from a source, include a citation marker like [1], [2].`

  const prompt = `CONTEXT:\n${contextBlock || '(none)'}\n\nQUESTION:\n${args.question}\n\nAnswer:`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${system}\n\n${prompt}` }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[rag] generateContent failed: ${res.status} ${body}`)
  }

  const json = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('')
  if (!text) {
    throw new Error('[rag] generateContent returned no text')
  }

  return text
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

    const embedding = await geminiEmbed(payload.message)

    const { data, error } = await client.rpc('match_rag_chunks', {
      query_embedding: embedding,
      match_count: 8,
      min_similarity: 0.2,
    })

    if (error) {
      throw new Error(`[rag] match_rag_chunks RPC failed: ${error.message}`)
    }

    const retrieved = (data || []) as RetrievedChunk[]

    if (retrieved.length === 0) {
      return NextResponse.json({
        success: true,
        route: 'rag',
        answer:
          "I don't have enough verified information in my knowledge base to answer that confidently. Would you like to book a free consultation with our medical coordinators?",
        citations: [],
        retrieved: [],
      })
    }

    const answer = await geminiGenerateAnswer({
      question: payload.message,
      context: retrieved,
    })

    const citations = retrieved.map((c, idx) => ({
      ref: `[${idx + 1}]`,
      title: c.title,
      source_url: c.source_url,
      similarity: c.similarity,
    }))

    return NextResponse.json({
      success: true,
      route: 'rag',
      answer,
      citations,
      retrieved: retrieved.map((c) => ({
        title: c.title,
        source_url: c.source_url,
        similarity: c.similarity,
      })),
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api/rag/chat] Error:', error)
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to process your request at this time.',
      },
      { status: 400 },
    )
  }
}
