import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

const createCheckoutSchema = z.object({
  bookingId: z.string().uuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  paymentType: z.enum(['full', 'deposit']).default('deposit'),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const payload = createCheckoutSchema.parse(json)

    if (!stripe) {
      return NextResponse.json(
        { success: false, message: 'Payment system not configured' },
        { status: 503 }
      )
    }

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get booking with quote and journey info
    const { data: booking, error: bookingError } = await client
      .from('bookings')
      .select(`
        *,
        quote:quote_id(total_amount, currency, payment_schedule),
        journey:journey_id(
          patient_intake_id,
          patient_intake:patient_intake_id(full_name, email)
        )
      `)
      .eq('id', payload.bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { success: false, message: 'Booking is not awaiting payment' },
        { status: 400 }
      )
    }

    // Calculate payment amount
    let paymentAmount: number
    let paymentDescription: string

    if (payload.paymentType === 'deposit') {
      // Use payment schedule if available, otherwise 30% deposit
      const schedule = booking.quote?.payment_schedule as Array<{ amount: number; description: string }> | null
      if (schedule && schedule.length > 0) {
        paymentAmount = schedule[0].amount
        paymentDescription = schedule[0].description
      } else {
        paymentAmount = Math.round(booking.total_amount * 0.3)
        paymentDescription = 'Deposit (30%)'
      }
    } else {
      paymentAmount = booking.total_amount
      paymentDescription = 'Full payment'
    }

    // Get patient info for Stripe
    const patientIntake = (booking.journey as { patient_intake?: { full_name?: string; email?: string } })?.patient_intake
    const customerEmail = patientIntake?.email || undefined
    const customerName = patientIntake?.full_name || 'Patient'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: payload.bookingId,
      line_items: [
        {
          price_data: {
            currency: (booking.currency || 'usd').toLowerCase(),
            product_data: {
              name: `Medical Tourism Booking - ${paymentDescription}`,
              description: `Booking ID: ${payload.bookingId}`,
            },
            unit_amount: Math.round(paymentAmount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: `${payload.successUrl}?session_id={CHECKOUT_SESSION_ID}&booking_id=${payload.bookingId}`,
      cancel_url: `${payload.cancelUrl}?booking_id=${payload.bookingId}`,
      metadata: {
        booking_id: payload.bookingId,
        journey_id: booking.journey_id,
        payment_type: payload.paymentType,
        payment_amount: paymentAmount.toString(),
      },
    })

    // Log payment initiation
    await client.from('journey_events').insert({
      journey_id: booking.journey_id,
      event_type: 'PAYMENT_INITIATED',
      actor_type: 'patient',
      event_data: {
        booking_id: payload.bookingId,
        stripe_session_id: session.id,
        payment_type: payload.paymentType,
        amount: paymentAmount,
        currency: booking.currency,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('[api/payments/create-checkout] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
