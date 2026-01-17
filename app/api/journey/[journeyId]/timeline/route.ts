import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ journeyId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { journeyId } = await params
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
      console.error('[api/journey/timeline] Fetch error:', eventsError)
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
    console.error('[api/journey/timeline] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
