import { getSupabaseContext } from '@/lib/api/client/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ quoteId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { quoteId } = await params
    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data, error } = await client
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      quote: data,
    })
  } catch (error) {
    console.error('[api/quotes/[quoteId]] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

const updateQuoteSchema = z.object({
  treatmentCost: z.number().positive().optional(),
  accommodationCost: z.number().nonnegative().optional(),
  transportCost: z.number().nonnegative().optional(),
  miscCost: z.number().nonnegative().optional(),
  validUntil: z.string().datetime().optional(),
  paymentSchedule: z.array(z.object({
    amount: z.number().positive(),
    dueDate: z.string(),
    description: z.string(),
  })).optional(),
  notes: z.string().optional(),
})

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { quoteId } = await params
    const json = await request.json()
    const payload = updateQuoteSchema.parse(json)

    const { client } = getSupabaseContext()

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get current quote
    const { data: current, error: fetchError } = await client
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { success: false, message: 'Quote not found' },
        { status: 404 }
      )
    }

    if (current.status !== 'DRAFT' && current.status !== 'SENT') {
      return NextResponse.json(
        { success: false, message: 'Cannot modify quote in current status' },
        { status: 400 }
      )
    }

    // Calculate new total if costs changed
    const treatmentCost = payload.treatmentCost ?? current.treatment_cost
    const accommodationCost = payload.accommodationCost ?? current.accommodation_cost
    const transportCost = payload.transportCost ?? current.transport_cost
    const miscCost = payload.miscCost ?? current.misc_cost
    const totalAmount = treatmentCost + accommodationCost + transportCost + miscCost

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (payload.treatmentCost !== undefined) updateData.treatment_cost = payload.treatmentCost
    if (payload.accommodationCost !== undefined) updateData.accommodation_cost = payload.accommodationCost
    if (payload.transportCost !== undefined) updateData.transport_cost = payload.transportCost
    if (payload.miscCost !== undefined) updateData.misc_cost = payload.miscCost
    if (payload.validUntil !== undefined) updateData.valid_until = payload.validUntil
    if (payload.paymentSchedule !== undefined) updateData.payment_schedule = payload.paymentSchedule
    if (payload.notes !== undefined) updateData.notes = payload.notes

    // Recalculate total
    updateData.total_amount = totalAmount

    const { data: updated, error: updateError } = await client
      .from('quotes')
      .update(updateData)
      .eq('id', quoteId)
      .select('*')
      .single()

    if (updateError) {
      console.error('[api/quotes/[quoteId]] Update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update quote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quote: updated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('[api/quotes/[quoteId]] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
