import { getSupabaseContext } from '@/lib/api/client/supabase'
import { requireAuth } from '@/lib/utils/api-auth'
import { logger } from '@/lib/utils/logger'
import { NextResponse } from 'next/server'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Fetch all patient intakes with journey status
    const { data: intakes, error: intakesError } = await client
      .from('patient_intakes')
      .select(`
        id,
        full_name,
        email,
        phone,
        country_of_residence,
        treatment_type_slug,
        treatment_details,
        budget_range,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (intakesError) {
      logger.error('Coordinator intakes fetch error', { path: '/api/coordinator/intakes', method: 'GET' }, {}, intakesError instanceof Error ? intakesError : undefined)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch intakes' },
        { status: 500 }
      )
    }

    // Check which intakes have journeys
    const intakeIds = intakes?.map((i) => i.id) || []

    let journeyMap: Record<string, boolean> = {}

    if (intakeIds.length > 0) {
      const { data: journeys } = await client
        .from('patient_journey_state')
        .select('patient_intake_id')
        .in('patient_intake_id', intakeIds)

      if (journeys) {
        journeyMap = journeys.reduce((acc, j) => {
          acc[j.patient_intake_id] = true
          return acc
        }, {} as Record<string, boolean>)
      }
    }

    // Add journey status to intakes
    const intakesWithStatus = intakes?.map((intake) => ({
      ...intake,
      has_journey: journeyMap[intake.id] || false,
    })) || []

    return NextResponse.json({
      success: true,
      intakes: intakesWithStatus,
      count: intakesWithStatus.length,
    })
  } catch (error) {
    logger.error('Coordinator intakes unexpected error', { path: '/api/coordinator/intakes', method: 'GET' }, {}, error instanceof Error ? error : undefined)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
