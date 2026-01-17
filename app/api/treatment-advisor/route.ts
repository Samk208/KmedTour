import { generateTreatmentSuggestions, suggestionListSchema } from '@/lib/ai/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const treatmentAdvisorInputSchema = z.object({
  treatmentType: z.string().min(2),
  countryOfResidence: z.string().optional(),
  budgetRange: z.string().optional(),
  preferredLanguage: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const payload = treatmentAdvisorInputSchema.parse(json)

    const suggestions = await generateTreatmentSuggestions(payload)
    const validated = suggestionListSchema.parse(suggestions)

    return NextResponse.json({
      success: true,
      suggestions: validated,
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api/treatment-advisor] Error handling request:', error)
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to generate treatment suggestions at this time.',
        suggestions: [],
      },
      { status: 400 },
    )
  }
}
