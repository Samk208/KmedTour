import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireAuth } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { validateUUID } from '@/lib/utils/validate-params'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ journeyId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { journeyId } = await params
    const invalid = validateUUID(journeyId, 'journeyId')
    if (invalid) return invalid

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Verify journey exists
    const { data: journey, error: journeyError } = await client
      .from('patient_journey_state')
      .select('id')
      .eq('id', journeyId)
      .single()

    if (journeyError || !journey) {
      return NextResponse.json(
        { success: false, message: 'Journey not found' },
        { status: 404 }
      )
    }

    // Get all events for this journey
    const { data: events, error: eventsError } = await client
      .from('journey_events')
      .select('*')
      .eq('journey_id', journeyId)
      .order('created_at', { ascending: true })

    if (eventsError) {
      logger.error('Journey timeline fetch error', { path: '/api/journey/timeline', method: 'GET' }, {}, eventsError instanceof Error ? eventsError : undefined)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch timeline' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      timeline: events || [],
      count: events?.length || 0,
    })
  } catch (error) {
    logger.error('Journey timeline unexpected error', { path: '/api/journey/timeline', method: 'GET' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
