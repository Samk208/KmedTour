import { getSupabaseContext } from '@/lib/api/client/supabase'
import { processNotificationQueue } from '@/lib/services/notifications'
import { NextResponse } from 'next/server'

// This endpoint can be called by a cron job to process the notification queue
// For example, with Vercel Cron or an external service

export async function POST(request: Request) {
  try {
    // Verify the request is authorized (use a secret token in production)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

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
    console.error('[api/notifications/process] Unexpected error:', error)
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
