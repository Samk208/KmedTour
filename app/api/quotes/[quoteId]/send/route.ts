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

    // Get current quote
    const { data: quote, error: fetchError } = await client
      .from('quotes')
      .select('*, journey:journey_id(patient_intake_id)')
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { success: false, message: 'Quote not found' },
        { status: 404 }
      )
    }

    if (quote.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, message: 'Quote has already been sent' },
        { status: 400 }
      )
    }

    // Update quote status to SENT
    const { data: updated, error: updateError } = await client
      .from('quotes')
      .update({
        status: 'SENT',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select('*')
      .single()

    if (updateError) {
      console.error('[api/quotes/send] Update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to send quote' },
        { status: 500 }
      )
    }

    // Log event
    await client.from('journey_events').insert({
      journey_id: quote.journey_id,
      event_type: 'QUOTE_SENT',
      actor_type: 'coordinator',
      event_data: {
        quote_id: quoteId,
        total_amount: quote.total_amount,
        currency: quote.currency,
      },
    })

    // Queue notification to patient (will be processed by notification worker)
    await client.from('notifications').insert({
      journey_id: quote.journey_id,
      template_name: 'quote_ready',
      channel: 'email',
      priority: 'high',
      data: {
        quote_id: quoteId,
        total_amount: quote.total_amount,
        currency: quote.currency,
        valid_until: quote.valid_until,
      },
    })

    return NextResponse.json({
      success: true,
      quote: updated,
      message: 'Quote sent to patient',
    })
  } catch (error) {
    console.error('[api/quotes/send] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
