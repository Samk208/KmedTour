import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ bookingId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { bookingId } = await params
    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data, error } = await client
      .from('bookings')
      .select(`
        *,
        quote:quote_id(*),
        journey:journey_id(
          current_state,
          patient_intake_id,
          assigned_coordinator_id
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: data,
    })
  } catch (error) {
    console.error('[api/bookings/[bookingId]] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

const updateBookingSchema = z.object({
  travelArrivalDate: z.string().datetime().optional(),
  travelDepartureDate: z.string().datetime().optional(),
  travelFlightDetails: z.record(z.unknown()).optional(),
  accommodationName: z.string().optional(),
  accommodationAddress: z.string().optional(),
  accommodationCheckIn: z.string().datetime().optional(),
  accommodationCheckOut: z.string().datetime().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  specialRequirements: z.string().optional(),
})

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { bookingId } = await params
    const json = await request.json()
    const payload = updateBookingSchema.parse(json)

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (payload.travelArrivalDate !== undefined) updateData.travel_arrival_date = payload.travelArrivalDate
    if (payload.travelDepartureDate !== undefined) updateData.travel_departure_date = payload.travelDepartureDate
    if (payload.travelFlightDetails !== undefined) updateData.travel_flight_details = payload.travelFlightDetails
    if (payload.accommodationName !== undefined) updateData.accommodation_name = payload.accommodationName
    if (payload.accommodationAddress !== undefined) updateData.accommodation_address = payload.accommodationAddress
    if (payload.accommodationCheckIn !== undefined) updateData.accommodation_check_in = payload.accommodationCheckIn
    if (payload.accommodationCheckOut !== undefined) updateData.accommodation_check_out = payload.accommodationCheckOut
    if (payload.emergencyContactName !== undefined) updateData.emergency_contact_name = payload.emergencyContactName
    if (payload.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = payload.emergencyContactPhone
    if (payload.specialRequirements !== undefined) updateData.special_requirements = payload.specialRequirements

    const { data: updated, error: updateError } = await client
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select('*')
      .single()

    if (updateError) {
      console.error('[api/bookings/[bookingId]] Update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: updated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('[api/bookings/[bookingId]] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
