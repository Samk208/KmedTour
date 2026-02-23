import { getSupabaseContext } from '@/lib/api/client/supabase'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.GENEROUS, keyPrefix: 'stripe-webhook' })(request)
  if (rateLimitResponse) return rateLimitResponse

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
    logger.error('Payments webhook signature verification failed', {
      path: '/api/payments/webhook',
      method: 'POST',
    }, { error: err instanceof Error ? err.message : 'Unknown' }, err instanceof Error ? err : undefined)
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
          logger.warn('Payments webhook missing booking_id in metadata', { path: '/api/payments/webhook', method: 'POST' })
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
          logger.error('Payments webhook booking update error', { path: '/api/payments/webhook', method: 'POST' }, {}, updateError instanceof Error ? updateError : undefined)
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
        logger.info(`Payments webhook unhandled event type: ${event.type}`, { path: '/api/payments/webhook', method: 'POST' })
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    logger.error('Payments webhook processing error', { path: '/api/payments/webhook', method: 'POST' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
