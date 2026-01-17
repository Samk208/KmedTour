import treatmentsData from '@/lib/data/treatments.json'
import { z } from 'zod'

const suggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
})

export const suggestionListSchema = z.array(suggestionSchema)
export type Suggestion = z.infer<typeof suggestionSchema>

export interface TreatmentAdvisorInput {
  treatmentType: string
  countryOfResidence?: string
  budgetRange?: string
  preferredLanguage?: string
}

type TreatmentLite = {
  id: string
  slug?: string
  title: string
  category?: string
  priceRange?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const treatments = (treatmentsData as any[]).map((t) => ({
  id: t.id,
  slug: t.slug,
  title: t.title,
  category: t.category,
  priceRange: t.priceRange,
})) as TreatmentLite[]

export function isAIConfigured(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENROUTER_API_KEY,
  )
}

export type AIProvider = 'openai' | 'gemini' | 'xai' | 'claude' | 'openrouter' | null

export function getAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.XAI_API_KEY) return 'xai'
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  if (process.env.OPENROUTER_API_KEY) return 'openrouter'
  return null
}

export async function generateTreatmentSuggestions(
  input: TreatmentAdvisorInput,
): Promise<Suggestion[]> {
  const provider = getAIProvider()

  if (provider === 'openrouter') {
    const result = await callOpenRouter(input)
    const grounded = groundSuggestions(input, result || [])
    if (grounded.length) return suggestionListSchema.parse(grounded)
  }

  if (provider === 'openai') {
    const result = await callOpenAI(input)
    const grounded = groundSuggestions(input, result || [])
    if (grounded.length) return suggestionListSchema.parse(grounded)
  }

  if (provider === 'gemini') {
    const result = await callGemini(input)
    const grounded = groundSuggestions(input, result || [])
    if (grounded.length) return suggestionListSchema.parse(grounded)
  }

  if (!provider) {
    return generateMockSuggestions(input)
  }

  // Fallback to mock until other providers are wired
  return generateMockSuggestions(input)
}

async function callOpenAI(input: TreatmentAdvisorInput): Promise<Suggestion[] | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const model = process.env.OPENAI_MODEL || 'gpt-4-turbo'

  const procedureCatalog = treatments
    .map((t) => `${t.id}:${t.slug || ''}:${t.title}`)
    .join('\n')

  const prompt = `
You are a medical tourism concierge for Korea. Given the user's intent, suggest 2-3 treatment options that map to our internal procedure list. NEVER invent contact details or phone/email. Avoid precise hospital addresses.

User intent:
- treatment: ${input.treatmentType}
- budget: ${input.budgetRange || 'unspecified'}
- language: ${input.preferredLanguage || 'unspecified'}
- country: ${input.countryOfResidence || 'unspecified'}

Respond ONLY as JSON with an array of suggestions:
[
  {
    "id": "procedure_id_from_catalog",
    "title": "Friendly label",
    "description": "Short value-focused pitch",
    "reason": "Why it fits",
    "confidence": 0.0-1.0
  }
]

Procedure Catalog (id:slug:title):
${procedureCatalog}

Use ONLY ids from the catalog.
`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      console.error('[AI] OpenAI call failed', res.status, await res.text())
      return null
    }

    const json = await res.json()
    const content = json?.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      return parsed
    }
    if (parsed && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions
    }
    // Handle wrapped object (e.g. { "treatments": [...] })
    const values = Object.values(parsed).find(Array.isArray) as Suggestion[] | undefined
    return values || null
  } catch (err) {
    console.error('[AI] OpenAI error', err)
  }

  return null
}

async function callGemini(input: TreatmentAdvisorInput): Promise<Suggestion[] | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

  const procedureCatalog = treatments
    .map((t) => `${t.id}:${t.slug || ''}:${t.title}`)
    .join('\n')

  const prompt = `
You are a medical tourism concierge for Korea. Given the user's intent, suggest 2-3 treatment options that map to our internal procedure list.

User intent:
- treatment: ${input.treatmentType}
- budget: ${input.budgetRange || 'unspecified'}
- language: ${input.preferredLanguage || 'unspecified'}

Procedure Catalog (id:slug:title):
${procedureCatalog}

Respond ONLY as JSON with an array of suggestions matching this schema:
[
  {
    "id": "procedure_id_from_catalog",
    "title": "Friendly label",
    "description": "Short value-focused pitch",
    "reason": "Why it fits",
    "confidence": 0.0-1.0
  }
]
`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        }),
      }
    )

    if (!res.ok) {
      console.error('[AI] Gemini call failed', res.status, await res.text())
      return null
    }

    const json = await res.json()
    const content = json?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) return null

    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
    // Gemini often wraps in specific ways depending on schema, but basic JSON mode usually returns the object directly
    // If it returns { suggestions: [...] }
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) return parsed.suggestions
    const values = Object.values(parsed).find(Array.isArray) as Suggestion[] | undefined
    return values || null
  } catch (err) {
    console.error('[AI] Gemini error', err)
  }

  return null
}

async function callOpenRouter(input: TreatmentAdvisorInput): Promise<Suggestion[] | null> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null

  const model =
    process.env.OPENROUTER_MODEL_MAIN || 'anthropic/claude-3.5-sonnet'

  const procedureCatalog = treatments
    .map((t) => `${t.id}:${t.slug || ''}:${t.title}`)
    .join('\n')

  const prompt = `
You are a medical tourism concierge for Korea. Given the user's intent, suggest 2-3 treatment options that map to our internal procedure list. NEVER invent contact details or phone/email. Avoid precise hospital addresses.

User intent:
- treatment: ${input.treatmentType}
- budget: ${input.budgetRange || 'unspecified'}
- language: ${input.preferredLanguage || 'unspecified'}
- country: ${input.countryOfResidence || 'unspecified'}

Respond ONLY as JSON with an array of suggestions:
[
  {
    "id": "procedure_id_from_catalog",
    "title": "Friendly label",
    "description": "Short value-focused pitch",
    "reason": "Why it fits",
    "confidence": 0.0-1.0
  }
]

Procedure Catalog (id:slug:title):
${procedureCatalog}

Use ONLY ids from the catalog.
`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 300,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      console.error('[AI] OpenRouter call failed', res.status, await res.text())
      return null
    }

    const json = await res.json()
    const content = json?.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      return parsed
    }
    if (parsed && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions
    }
  } catch (err) {
    console.error('[AI] OpenRouter error', err)
  }

  return null
}

function generateMockSuggestions(input: TreatmentAdvisorInput): Suggestion[] {
  const base: Suggestion[] = [
    {
      id: 'treatment-1',
      title: 'Specialist clinic matching your treatment',
      description:
        'A top-tier Korean clinic with strong experience in your requested treatment and international patients.',
      reason: `Matches treatment type "${input.treatmentType}" with strong outcomes for international patients.`,
      confidence: 0.8,
    },
    {
      id: 'treatment-2',
      title: 'Cost-optimized option',
      description:
        'A high-quality clinic that offers more budget-friendly packages while maintaining safety and quality.',
      reason: input.budgetRange
        ? `Aligned with your budget range (${input.budgetRange}).`
        : 'Optimized for value and total trip cost.',
      confidence: 0.7,
    },
  ]

  return suggestionListSchema.parse(base)
}

function groundSuggestions(input: TreatmentAdvisorInput, raw: Suggestion[]): Suggestion[] {
  if (!raw || !raw.length) {
    return keywordFallback(input)
  }

  const byId = new Map(treatments.map((t) => [t.id, t]))
  const bySlug = new Map(treatments.filter((t) => t.slug).map((t) => [t.slug!, t]))

  const grounded: Suggestion[] = []

  raw.forEach((s) => {
    const id = s.id || ''
    const slugMatch = bySlug.get(id)
    const idMatch = byId.get(id)
    const target = idMatch || slugMatch
    if (target) {
      grounded.push({
        id: target.id,
        title: target.title,
        description: s.description || target.priceRange || target.category || target.title,
        reason: s.reason || `Matches requested treatment "${input.treatmentType}".`,
        confidence: Math.min(Math.max(s.confidence ?? 0.7, 0), 1),
      })
    }
  })

  if (grounded.length === 0) {
    return keywordFallback(input)
  }

  const seen = new Set<string>()
  return grounded.filter((g) => {
    if (seen.has(g.id)) return false
    seen.add(g.id)
    return true
  })
}

function keywordFallback(input: TreatmentAdvisorInput): Suggestion[] {
  const term = (input.treatmentType || '').toLowerCase()
  const matches = treatments.filter((t) => t.title.toLowerCase().includes(term))
  const pick = (matches.length ? matches : treatments).slice(0, 3)

  return pick.map((t, idx) => ({
    id: t.id,
    title: t.title,
    description: t.priceRange || `Explore ${t.title} options in Korea.`,
    reason: idx === 0 ? `Best match for "${input.treatmentType}".` : `Relevant alternative for "${input.treatmentType}".`,
    confidence: 0.7 - idx * 0.05,
  }))
}
