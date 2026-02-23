import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireAuth } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { validateUUID } from '@/lib/utils/validate-params'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ quoteId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.STRICT, keyPrefix: 'quote-reject' })(request)
  if (rateLimitResponse) return rateLimitResponse

  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { quoteId } = await params
    const invalid = validateUUID(quoteId, 'quoteId')
    if (invalid) return invalid

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data: quote, error: fetchError } = await client
      .from('quotes')
      .select(`
        id, journey_id, status, total_amount, currency,
        journey:journey_id(
          patient_intake:patient_intake_id(user_id)
        )
      `)
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { success: false, message: 'Quote not found' },
        { status: 404 }
      )
    }

    // Ownership check — only the patient who owns this quote may reject it
    const journey = Array.isArray(quote.journey) ? quote.journey[0] : quote.journey
    const intake = Array.isArray(journey?.patient_intake) ? journey?.patient_intake[0] : journey?.patient_intake
    if (intake?.user_id !== auth.user.id) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const rejectableStatuses = ['SENT', 'READY', 'VIEWED']
    if (!rejectableStatuses.includes(quote.status)) {
      return NextResponse.json(
        { success: false, message: `Cannot reject a quote with status: ${quote.status}` },
        { status: 400 }
      )
    }

    const { data: updated, error: updateError } = await client
      .from('quotes')
      .update({
        status: 'REJECTED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select('id, status')
      .single()

    if (updateError) {
      logger.error('Quote reject update error', { path: '/api/quotes/reject', method: 'POST' }, {}, updateError instanceof Error ? updateError : undefined)
      return NextResponse.json(
        { success: false, message: 'Failed to reject quote' },
        { status: 500 }
      )
    }

    await client.from('journey_events').insert({
      journey_id: quote.journey_id,
      event_type: 'QUOTE_REJECTED',
      actor_type: 'patient',
      event_data: {
        quote_id: quoteId,
        total_amount: quote.total_amount,
        currency: quote.currency,
      },
    })

    await client.from('notifications').insert({
      journey_id: quote.journey_id,
      template_name: 'quote_rejected',
      channel: 'email',
      priority: 'high',
      data: { quote_id: quoteId },
    })

    return NextResponse.json({
      success: true,
      quote: updated,
      message: 'Quote declined. Your coordinator has been notified.',
    })
  } catch (error) {
    logger.error('Quote reject unexpected error', { path: '/api/quotes/reject', method: 'POST' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
