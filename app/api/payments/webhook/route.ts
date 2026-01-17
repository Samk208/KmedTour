import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { success: false, message: 'Payment system not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { success: false, message: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[api/payments/webhook] Signature verification failed:', err)
    return NextResponse.json(
      { success: false, message: 'Invalid signature' },
      { status: 400 }
    )
  }

  const { client } = getSupabaseContext()

  if (!client) {
    return NextResponse.json(
      { success: false, message: 'Database not configured' },
      { status: 503 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.booking_id
        const journeyId = session.metadata?.journey_id
        const paymentType = session.metadata?.payment_type
        const paymentAmount = parseFloat(session.metadata?.payment_amount || '0')

        if (!bookingId) {
          console.error('[api/payments/webhook] Missing booking_id in metadata')
          break
        }

        // Update booking with payment info
        const { error: updateError } = await client
          .from('bookings')
          .update({
            status: paymentType === 'full' ? 'CONFIRMED' : 'DEPOSIT_PAID',
            amount_paid: paymentAmount,
            stripe_payment_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('[api/payments/webhook] Booking update error:', updateError)
        }

        // Log payment event
        if (journeyId) {
          await client.from('journey_events').insert({
            journey_id: journeyId,
            event_type: 'PAYMENT_COMPLETED',
            actor_type: 'system',
            event_data: {
              booking_id: bookingId,
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent,
              payment_type: paymentType,
              amount: paymentAmount,
              currency: session.currency,
            },
          })

          // Queue confirmation notification
          await client.from('notifications').insert({
            journey_id: journeyId,
            template_name: 'payment_received',
            channel: 'email',
            priority: 'high',
            data: {
              booking_id: bookingId,
              amount: paymentAmount,
              payment_type: paymentType,
            },
          })

          // If deposit paid, also queue WhatsApp notification
          await client.from('notifications').insert({
            journey_id: journeyId,
            template_name: 'payment_received',
            channel: 'whatsapp',
            priority: 'high',
            data: {
              booking_id: bookingId,
              amount: paymentAmount,
              payment_type: paymentType,
            },
          })
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.booking_id
        const journeyId = session.metadata?.journey_id

        if (journeyId) {
          await client.from('journey_events').insert({
            journey_id: journeyId,
            event_type: 'PAYMENT_EXPIRED',
            actor_type: 'system',
            event_data: {
              booking_id: bookingId,
              stripe_session_id: session.id,
            },
          })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata?.booking_id
        const journeyId = paymentIntent.metadata?.journey_id

        if (journeyId) {
          await client.from('journey_events').insert({
            journey_id: journeyId,
            event_type: 'PAYMENT_FAILED',
            actor_type: 'system',
            event_data: {
              booking_id: bookingId,
              stripe_payment_intent: paymentIntent.id,
              error: paymentIntent.last_payment_error?.message,
            },
          })
        }

        break
      }

      default:
        console.log(`[api/payments/webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('[api/payments/webhook] Processing error:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
