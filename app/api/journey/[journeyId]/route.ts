import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireAuth } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { validateUUID } from '@/lib/utils/validate-params'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ journeyId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.STANDARD, keyPrefix: 'journey-detail' })(request)
  if (rateLimitResponse) return rateLimitResponse

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
    logger.error('Journey fetch unexpected error', { path: '/api/journey/[journeyId]', method: 'GET' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
