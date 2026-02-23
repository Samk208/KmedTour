import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireAuth } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { validateUUID } from '@/lib/utils/validate-params'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

interface RouteParams {
  params: Promise<{ quoteId: string }>
}

/** Resolve the patient user_id from a quote's nested journey join. */
function resolveQuoteOwner(
  quote: { journey?: unknown }
): string | undefined {
  const journey = Array.isArray(quote.journey) ? quote.journey[0] : quote.journey
  const raw = (journey as { patient_intake?: unknown })?.patient_intake
  const intake = Array.isArray(raw) ? raw[0] : raw
  return (intake as { user_id?: string } | undefined)?.user_id
}

async function createBooking(
  client: SupabaseClient,
  quote: Record<string, unknown>,
  quoteId: string,
) {
  const { data: booking, error } = await client
    .from('bookings')
    .insert({
      journey_id: quote.journey_id,
      quote_id: quoteId,
      hospital_id: quote.hospital_id,
      treatment_id: quote.treatment_id,
      status: 'PENDING_PAYMENT',
      total_amount: quote.total_amount,
      currency: quote.currency,
      payment_schedule: quote.payment_schedule,
    })
    .select('id')
    .single()

  if (error) {
    logger.error('Quote accept booking creation error', { path: '/api/quotes/accept', method: 'POST' }, {}, error instanceof Error ? error : undefined)
  }
  return booking
}

async function logAcceptedEvents(
  client: SupabaseClient,
  quote: Record<string, unknown>,
  quoteId: string,
  bookingId: string | undefined,
) {
  await client.from('journey_events').insert({
    journey_id: quote.journey_id,
    event_type: 'QUOTE_ACCEPTED',
    actor_type: 'patient',
    event_data: { quote_id: quoteId, booking_id: bookingId, total_amount: quote.total_amount, currency: quote.currency },
  })

  await client.from('notifications').insert({
    journey_id: quote.journey_id,
    template_name: 'quote_accepted',
    channel: 'email',
    priority: 'high',
    data: { quote_id: quoteId, booking_id: bookingId },
  })
}

export async function POST(request: Request, { params }: RouteParams) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.STRICT, keyPrefix: 'quote-accept' })(request)
  if (rateLimitResponse) return rateLimitResponse

  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { quoteId } = await params
    const invalid = validateUUID(quoteId, 'quoteId')
    if (invalid) return invalid

    const { client } = getSupabaseContext()
    if (!client) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 503 })
    }

    const { data: quote, error: fetchError } = await client
      .from('quotes')
      .select('*, journey:journey_id(patient_intake:patient_intake_id(user_id))')
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json({ success: false, message: 'Quote not found' }, { status: 404 })
    }

    if (resolveQuoteOwner(quote) !== auth.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    if (quote.status !== 'SENT') {
      return NextResponse.json({ success: false, message: 'Quote must be in SENT status to accept' }, { status: 400 })
    }

    if (new Date(quote.valid_until as string) < new Date()) {
      return NextResponse.json({ success: false, message: 'Quote has expired' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await client
      .from('quotes')
      .update({ status: 'ACCEPTED', accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', quoteId)
      .select('*')
      .single()

    if (updateError) {
      logger.error('Quote accept update error', { path: '/api/quotes/accept', method: 'POST' }, {}, updateError instanceof Error ? updateError : undefined)
      return NextResponse.json({ success: false, message: 'Failed to accept quote' }, { status: 500 })
    }

    const booking = await createBooking(client, quote as Record<string, unknown>, quoteId)
    await logAcceptedEvents(client, quote as Record<string, unknown>, quoteId, booking?.id)

    return NextResponse.json({ success: true, quote: updated, bookingId: booking?.id, message: 'Quote accepted and booking created' })
  } catch (error) {
    logger.error('Quote accept unexpected error', { path: '/api/quotes/accept', method: 'POST' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
