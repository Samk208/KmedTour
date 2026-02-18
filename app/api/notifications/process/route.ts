import { getSupabaseContext } from '@/lib/api/client/supabase'
import { processNotificationQueue } from '@/lib/services/notifications'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'

// This endpoint can be called by a cron job to process the notification queue.
// In production, set CRON_SECRET and send Authorization: Bearer <CRON_SECRET>.

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit({
    ...RateLimitPresets.STRICT,
    keyPrefix: 'notifications-process',
  })(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction && !cronSecret) {
      logger.warn('Notifications process: CRON_SECRET not set in production', {
        path: '/api/notifications/process',
      })
      return NextResponse.json(
        { success: false, message: 'Server misconfiguration' },
        { status: 503 }
      )
    }

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    const result = await processNotificationQueue(client)

    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
    })
  } catch (error) {
    logger.error('Notifications process unexpected error', {
      path: '/api/notifications/process',
      method: 'POST',
    }, { error: error instanceof Error ? error.message : 'Unknown' }, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for simple cron services
export async function GET(request: Request) {
  return POST(request)
}
