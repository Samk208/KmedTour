import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const coordinatorId = searchParams.get('coordinatorId')

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    let query = client
      .from('patient_journey_state')
      .select(`
        id,
        patient_intake_id,
        current_state,
        state_data,
        state_history,
        assigned_coordinator_id,
        created_at,
        updated_at,
        patient_intake:patient_intake_id(
          full_name,
          email,
          phone,
          treatment_type_slug,
          country_of_residence
        )
      `)
      .order('updated_at', { ascending: false })

    if (state) {
      query = query.eq('current_state', state)
    }

    if (coordinatorId) {
      query = query.eq('assigned_coordinator_id', coordinatorId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[api/coordinator/journeys] Fetch error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch journeys' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      journeys: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('[api/coordinator/journeys] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
