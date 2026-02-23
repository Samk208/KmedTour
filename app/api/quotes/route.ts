import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireAuth } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createQuoteSchema = z.object({
  journeyId: z.string().uuid(),
  hospitalId: z.string().uuid(),
  treatmentId: z.string().uuid(),
  treatmentCost: z.number().positive(),
  accommodationCost: z.number().nonnegative().optional().default(0),
  transportCost: z.number().nonnegative().optional().default(0),
  miscCost: z.number().nonnegative().optional().default(0),
  currency: z.string().length(3).default('USD'),
  validUntil: z.string().datetime().optional(),
  paymentSchedule: z.array(z.object({
    amount: z.number().positive(),
    dueDate: z.string(),
    description: z.string(),
  })).optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.STANDARD, keyPrefix: 'quotes' })(request)
  if (rateLimitResponse) return rateLimitResponse

  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const json = await request.json()
    const payload = createQuoteSchema.parse(json)

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    const totalAmount =
      payload.treatmentCost +
      payload.accommodationCost +
      payload.transportCost +
      payload.miscCost

    // Calculate valid until (default 14 days if not provided)
    const validUntil = payload.validUntil ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await client
      .from('quotes')
      .insert({
        journey_id: payload.journeyId,
        hospital_id: payload.hospitalId,
        treatment_id: payload.treatmentId,
        treatment_cost: payload.treatmentCost,
        accommodation_cost: payload.accommodationCost,
        transport_cost: payload.transportCost,
        misc_cost: payload.miscCost,
        total_amount: totalAmount,
        currency: payload.currency,
        status: 'DRAFT',
        version: 1,
        valid_until: validUntil,
        payment_schedule: payload.paymentSchedule || null,
        notes: payload.notes || null,
      })
      .select('*')
      .single()

    if (error) {
      logger.error('Quote create error', { path: '/api/quotes', method: 'POST' }, {}, error instanceof Error ? error : undefined)
      return NextResponse.json(
        { success: false, message: 'Failed to create quote' },
        { status: 500 }
      )
    }

    // Log event
    await client.from('journey_events').insert({
      journey_id: payload.journeyId,
      event_type: 'QUOTE_CREATED',
      actor_type: 'coordinator',
      event_data: {
        quote_id: data.id,
        total_amount: totalAmount,
        currency: payload.currency,
      },
    })

    return NextResponse.json({
      success: true,
      quote: data,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    logger.error('Quote create unexpected error', { path: '/api/quotes', method: 'POST' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.STANDARD, keyPrefix: 'quotes' })(request)
  if (rateLimitResponse) return rateLimitResponse

  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const journeyId = searchParams.get('journeyId')

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    let query = client
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })

    if (journeyId) {
      query = query.eq('journey_id', journeyId)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Quotes fetch error', { path: '/api/quotes', method: 'GET' }, {}, error instanceof Error ? error : undefined)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch quotes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quotes: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    logger.error('Quotes fetch unexpected error', { path: '/api/quotes', method: 'GET' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
