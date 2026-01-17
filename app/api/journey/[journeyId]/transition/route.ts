import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const JourneyState = z.enum([
  'INQUIRY',
  'SCREENING',
  'MATCHING',
  'QUOTE',
  'BOOKING',
  'PRE_TRAVEL',
  'TREATMENT',
  'POST_CARE',
  'FOLLOWUP',
  'CANCELLED',
  'COMPLETED',
])

type JourneyStateType = z.infer<typeof JourneyState>

// Valid state transitions
const STATE_TRANSITIONS: Record<JourneyStateType, JourneyStateType[]> = {
  INQUIRY: ['SCREENING', 'CANCELLED'],
  SCREENING: ['MATCHING', 'CANCELLED'],
  MATCHING: ['QUOTE', 'CANCELLED'],
  QUOTE: ['BOOKING', 'MATCHING', 'CANCELLED'],
  BOOKING: ['PRE_TRAVEL', 'CANCELLED'],
  PRE_TRAVEL: ['TREATMENT', 'CANCELLED'],
  TREATMENT: ['POST_CARE', 'CANCELLED'],
  POST_CARE: ['FOLLOWUP', 'COMPLETED'],
  FOLLOWUP: ['COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
}

const transitionSchema = z.object({
  targetState: JourneyState,
  reason: z.string().min(1),
  actor: z.string().optional().default('coordinator'),
  metadata: z.record(z.unknown()).optional(),
})

interface RouteParams {
  params: Promise<{ journeyId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { journeyId } = await params
    const json = await request.json()
    const payload = transitionSchema.parse(json)

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get current journey state
    const { data: journey, error: fetchError } = await client
      .from('patient_journey_state')
      .select('id, current_state, state_history')
      .eq('id', journeyId)
      .single()

    if (fetchError || !journey) {
      return NextResponse.json(
        { success: false, message: 'Journey not found' },
        { status: 404 }
      )
    }

    const currentState = journey.current_state as JourneyStateType
    const targetState = payload.targetState

    // Validate transition
    const allowedTransitions = STATE_TRANSITIONS[currentState] || []
    if (!allowedTransitions.includes(targetState)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid transition from ${currentState} to ${targetState}`,
          allowedTransitions,
        },
        { status: 400 }
      )
    }

    // Update state history
    const stateHistory = Array.isArray(journey.state_history) ? journey.state_history : []
    const newHistoryEntry = {
      state: targetState,
      entered_at: new Date().toISOString(),
      actor: payload.actor,
      reason: payload.reason,
      metadata: payload.metadata,
    }

    // Update journey
    const { data: updated, error: updateError } = await client
      .from('patient_journey_state')
      .update({
        current_state: targetState,
        state_history: [...stateHistory, newHistoryEntry],
        updated_at: new Date().toISOString(),
      })
      .eq('id', journeyId)
      .select('id, current_state, updated_at')
      .single()

    if (updateError) {
      console.error('[api/journey/transition] Update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to transition state' },
        { status: 500 }
      )
    }

    // Log the transition event
    await client.from('journey_events').insert({
      journey_id: journeyId,
      event_type: 'STATE_TRANSITION',
      from_state: currentState,
      to_state: targetState,
      actor_type: payload.actor === 'system' ? 'system' : 'coordinator',
      actor_id: payload.actor !== 'system' ? payload.actor : null,
      event_data: {
        reason: payload.reason,
        metadata: payload.metadata,
      },
    })

    return NextResponse.json({
      success: true,
      previousState: currentState,
      currentState: updated.current_state,
      updatedAt: updated.updated_at,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('[api/journey/transition] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
