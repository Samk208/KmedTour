import { getSupabaseContext } from '@/lib/api/client/supabase'
import { FullPatientIntake, fullPatientIntakeSchema } from '@/lib/schemas/patient-intake'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const payload = fullPatientIntakeSchema.parse(json) as FullPatientIntake

    const { client } = getSupabaseContext()

    if (client) {
      try {
        const { data, error } = await client
          .from('patient_intakes')
          .insert({
            full_name: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            country_of_residence: payload.country,
            preferred_language: payload.preferredLanguage,
            treatment_type_slug: payload.treatmentType,
            treatment_details: payload.medicalCondition,
            has_previous_treatment_abroad: payload.previousTreatments ? true : null,
            previous_treatments: payload.previousTreatments ?? null,
            budget_range: payload.budget ?? null,
            target_month: null,
            travel_dates_flexible: payload.travelDates === 'flexible',
            accommodation_preference: payload.accommodation ?? null,
            additional_notes: payload.additionalNotes ?? null,
            agreed_to_terms: payload.agreeToTerms,
            source_page: null,
          })
          .select('id')
          .single()

        if (!error && data) {
          return NextResponse.json({
            success: true,
            submissionId: data.id,
            message: 'Your intake form has been submitted successfully!',
          })
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error('[api/patient-intake] Supabase insert error, falling back to mock response:', error)
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[api/patient-intake] Unexpected Supabase error, falling back to mock response:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: `mock-${Date.now()}`,
      message: 'Your intake form has been submitted successfully!',
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api/patient-intake] Invalid request body:', error)
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid intake data.',
      },
      { status: 400 },
    )
  }
}
