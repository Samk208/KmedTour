import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireAuth } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.STANDARD, keyPrefix: 'bookings' })(request)
  if (rateLimitResponse) return rateLimitResponse

  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const journeyId = searchParams.get('journeyId')
    const status = searchParams.get('status')

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    let query = client
      .from('bookings')
      .select(`
        *,
        quote:quote_id(total_amount, currency, payment_schedule)
      `)
      .order('created_at', { ascending: false })

    if (journeyId) {
      query = query.eq('journey_id', journeyId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Bookings fetch error', { path: '/api/bookings', method: 'GET' }, {}, error instanceof Error ? error : undefined)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      bookings: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    logger.error('Bookings unexpected error', { path: '/api/bookings', method: 'GET' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
