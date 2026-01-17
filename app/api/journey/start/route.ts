import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const startJourneySchema = z.object({
  patientIntakeId: z.string().uuid(),
  initialData: z.record(z.unknown()).optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const payload = startJourneySchema.parse(json)

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if journey already exists for this intake
    const { data: existing } = await client
      .from('patient_journey_state')
      .select('id')
      .eq('patient_intake_id', payload.patientIntakeId)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Journey already exists for this patient intake' },
        { status: 409 }
      )
    }

    // Create new journey
    const { data, error } = await client
      .from('patient_journey_state')
      .insert({
        patient_intake_id: payload.patientIntakeId,
        current_state: 'INQUIRY',
        state_data: payload.initialData || {},
        state_history: [{
          state: 'INQUIRY',
          entered_at: new Date().toISOString(),
          actor: 'system',
          reason: 'Journey started',
        }],
      })
      .select('id, current_state, created_at')
      .single()

    if (error) {
      console.error('[api/journey/start] Supabase error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to start journey' },
        { status: 500 }
      )
    }

    // Log the journey start event
    await client.from('journey_events').insert({
      journey_id: data.id,
      event_type: 'JOURNEY_STARTED',
      from_state: null,
      to_state: 'INQUIRY',
      actor_type: 'system',
      event_data: { source: 'api' },
    })

    return NextResponse.json({
      success: true,
      journeyId: data.id,
      currentState: data.current_state,
      createdAt: data.created_at,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('[api/journey/start] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
