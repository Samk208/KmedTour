import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ quoteId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { quoteId } = await params
    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get current quote with journey info
    const { data: quote, error: fetchError } = await client
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { success: false, message: 'Quote not found' },
        { status: 404 }
      )
    }

    if (quote.status !== 'SENT') {
      return NextResponse.json(
        { success: false, message: 'Quote must be in SENT status to accept' },
        { status: 400 }
      )
    }

    // Check if quote is still valid
    if (new Date(quote.valid_until) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Quote has expired' },
        { status: 400 }
      )
    }

    // Update quote status to ACCEPTED
    const { data: updated, error: updateError } = await client
      .from('quotes')
      .update({
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select('*')
      .single()

    if (updateError) {
      console.error('[api/quotes/accept] Update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to accept quote' },
        { status: 500 }
      )
    }

    // Create booking from accepted quote
    const { data: booking, error: bookingError } = await client
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

    if (bookingError) {
      console.error('[api/quotes/accept] Booking creation error:', bookingError)
      // Quote is accepted but booking failed - log for manual intervention
    }

    // Log event
    await client.from('journey_events').insert({
      journey_id: quote.journey_id,
      event_type: 'QUOTE_ACCEPTED',
      actor_type: 'patient',
      event_data: {
        quote_id: quoteId,
        booking_id: booking?.id,
        total_amount: quote.total_amount,
        currency: quote.currency,
      },
    })

    // Queue confirmation notification
    await client.from('notifications').insert({
      journey_id: quote.journey_id,
      template_name: 'quote_accepted',
      channel: 'email',
      priority: 'high',
      data: {
        quote_id: quoteId,
        booking_id: booking?.id,
      },
    })

    return NextResponse.json({
      success: true,
      quote: updated,
      bookingId: booking?.id,
      message: 'Quote accepted and booking created',
    })
  } catch (error) {
    console.error('[api/quotes/accept] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
