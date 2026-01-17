import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const assignCoordinatorSchema = z.object({
  coordinatorId: z.string().uuid(),
  notes: z.string().optional(),
})

interface RouteParams {
  params: Promise<{ journeyId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { journeyId } = await params
    const json = await request.json()
    const payload = assignCoordinatorSchema.parse(json)

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get current journey
    const { data: journey, error: fetchError } = await client
      .from('patient_journey_state')
      .select('id, assigned_coordinator_id')
      .eq('id', journeyId)
      .single()

    if (fetchError || !journey) {
      return NextResponse.json(
        { success: false, message: 'Journey not found' },
        { status: 404 }
      )
    }

    const previousCoordinatorId = journey.assigned_coordinator_id

    // Update coordinator assignment
    const { data: updated, error: updateError } = await client
      .from('patient_journey_state')
      .update({
        assigned_coordinator_id: payload.coordinatorId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', journeyId)
      .select('id, assigned_coordinator_id, updated_at')
      .single()

    if (updateError) {
      console.error('[api/journey/assign-coordinator] Update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to assign coordinator' },
        { status: 500 }
      )
    }

    // Log the assignment event
    await client.from('journey_events').insert({
      journey_id: journeyId,
      event_type: 'COORDINATOR_ASSIGNED',
      actor_type: 'system',
      event_data: {
        previous_coordinator_id: previousCoordinatorId,
        new_coordinator_id: payload.coordinatorId,
        notes: payload.notes,
      },
    })

    return NextResponse.json({
      success: true,
      journeyId: updated.id,
      coordinatorId: updated.assigned_coordinator_id,
      previousCoordinatorId,
      updatedAt: updated.updated_at,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('[api/journey/assign-coordinator] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
