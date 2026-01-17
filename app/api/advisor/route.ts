import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamObject } from 'ai'
import { z } from 'zod'

import treatmentsData from '@/lib/data/treatments.json'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || '',
})

export async function POST(req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = JSON.stringify((treatmentsData as any[]).map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        priceRange: t.priceRange,
        description: t.description,
        recoveryTime: t.recoveryTime
    })))

    const { symptoms, duration, budget, language } = await req.json()

    const result = await streamObject({
        model: google('gemini-1.5-flash'),
        schema: z.object({
            matches: z.array(z.object({
                id: z.string().describe('The ID of the treatment from the context'),
                confidence: z.number().describe('Match confidence score 0-100'),
                reasons: z.array(z.string()).describe('List of 3 specific reasons why this matches the user profile')
            })),
            reasoning: z.string().describe('A brief, empathetic explanations of the overall analysis')
        }),
        system: `You are an expert medical concierge for KmedTour. 
    Your goal is to match a patient's symptoms and constraints to the BEST medical treatments available in Korea.
    
    CONTEXT (Available Treatments):
    ${context}

    USER PROFILE:
    - Symptoms/Concerns: ${symptoms.join(', ')}
    - Budget: ${budget}
    - Duration Available: ${duration}
    - Languages: ${language.join(', ')}

    INSTRUCTIONS:
    1. Analyze the user's constraints.
    2. Select the top 1-3 treatments from the CONTEXT that match.
    3. Be strict about budget: if they say "Low", favor cheaper procedures.
    4. Be strict about duration: if they say "1 week", exclude major surgeries with long recovery.
    5. Be empathetic but professional.`,
        prompt: 'Find the best treatment matches for this patient.',
    })

    return result.toTextStreamResponse()
}
