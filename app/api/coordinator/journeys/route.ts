import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireRole } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.STANDARD, keyPrefix: 'coord-journeys' })(request)
  if (rateLimitResponse) return rateLimitResponse

  const auth = await requireRole('coordinator', 'admin')
  if (!auth.authenticated) return auth.response

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
      logger.error('Coordinator journeys fetch error', { path: '/api/coordinator/journeys', method: 'GET' }, {}, error instanceof Error ? error : undefined)
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
    logger.error('Coordinator journeys unexpected error', { path: '/api/coordinator/journeys', method: 'GET' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
