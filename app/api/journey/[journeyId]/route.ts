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

    const { data, error } = await client
      .from('patient_journey_state')
      .select(`
        id,
        patient_intake_id,
        current_state,
        state_data,
        state_history,
        assigned_coordinator_id,
        created_at,
        updated_at
      `)
      .eq('id', journeyId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Journey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      journey: data,
    })
  } catch (error) {
    console.error('[api/journey/[journeyId]] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
