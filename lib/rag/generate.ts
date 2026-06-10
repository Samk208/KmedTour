import { logger } from '@/lib/utils/logger'

export type RetrievedChunk = {
  chunk_id: string
  document_id: string
  title: string
  source_url: string | null
  content: string
  similarity: number
  metadata: unknown
}

const SYSTEM_PROMPT = `You are the KmedTour assistant. You help international patients with factual information about medical travel to South Korea: hospitals, procedures, prices, logistics, visas, and preparation.

Rules:
- Answer ONLY from the provided context. If the context does not cover the question, say so and suggest contacting a KmedTour medical coordinator.
- Cite sources inline with [1], [2] matching the numbered context entries.
- NEVER give medical advice, diagnosis, or treatment recommendations. Do not assess whether a procedure is right for the user.
- Be concise: a short paragraph or a few bullet points.`

export function buildContextBlock(context: RetrievedChunk[]): string {
  return context
    .map((c, idx) => {
      const urlPart = c.source_url ? ' (' + c.source_url + ')' : ''
      return `[${idx + 1}] ${c.title}${urlPart}\n${c.content}`
    })
    .join('\n\n---\n\n')
}

export async function generateWithPythonAgent(question: string, contextBlock: string): Promise<string> {
  const agentBaseUrl = process.env.PYTHON_AGENT_URL
  if (!agentBaseUrl) throw new Error('PYTHON_AGENT_URL not set')

  const content = contextBlock ? `CONTEXT:\n${contextBlock}\n\nQUESTION:\n${question}` : question
  const res = await fetch(`${agentBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content }],
      session_id: 'rag-session-' + Date.now(),
    }),
  })
  if (!res.ok) throw new Error(`Python agent error: ${res.status}`)
  const data = await res.json()
  if (typeof data.response !== 'string' || !data.response) throw new Error('Python agent returned empty response')
  return data.response
}

export async function generateWithGemini(question: string, contextBlock: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')
  // gemini-flash-latest is Google's rolling alias for the current stable Flash.
  // Pinned versions (1.5, then 2.0) have been retired under us twice — the alias
  // survives retirements. Override with GEMINI_MODEL to pin deliberately.
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: contextBlock ? `Context:\n${contextBlock}\n\nQuestion: ${question}` : question }],
          },
        ],
        // thinkingBudget 0 disables reasoning tokens on thinking-capable Flash
        // models — RAG answers here don't need them and they eat the token cap.
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
      }),
    }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gemini generateContent failed: ${res.status} ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('')
  if (!text) throw new Error('Gemini returned empty response')
  return text
}

export async function generateWithDeepSeek(question: string, contextBlock: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-pro',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Context:\n${contextBlock}\n\nQuestion: ${question}` },
      ],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DeepSeek/OpenRouter error: ${res.status} ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('DeepSeek returned empty response')
  return text
}

export async function generateWithOpenAI(question: string, contextBlock: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Context:\n${contextBlock}\n\nQuestion: ${question}` },
      ],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI returned empty response')
  return text
}

/**
 * Generate an answer with provider cascade:
 * Python agent -> Gemini -> DeepSeek (OpenRouter) -> OpenAI.
 * Each failure is logged and the next provider is tried; throws only if all fail.
 */
export async function generateAnswer(question: string, context: RetrievedChunk[]): Promise<string> {
  const contextBlock = buildContextBlock(context)
  const providers: Array<[string, (q: string, c: string) => Promise<string>]> = [
    ['python-agent', generateWithPythonAgent],
    ['gemini', generateWithGemini],
    ['deepseek', generateWithDeepSeek],
    ['openai', generateWithOpenAI],
  ]

  const errors: string[] = []
  for (const [name, fn] of providers) {
    try {
      return await fn(question, contextBlock)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`${name}: ${msg}`)
      logger.warn(`RAG generation provider failed: ${name}`, { path: '/api/rag/chat' }, { error: msg })
    }
  }
  throw new Error(`All generation providers failed — ${errors.join(' | ')}`)
}
