import { getSupabaseContext } from '@/lib/api/client/supabase'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { FullPatientIntake, fullPatientIntakeSchema } from '@/lib/schemas/patient-intake'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit({
    ...RateLimitPresets.STANDARD,
    keyPrefix: 'patient-intake',
  })(request)
  if (rateLimitResponse) {
    logger.warn('Patient intake rate limit exceeded', {
      path: '/api/patient-intake',
      method: 'POST',
    })
    return rateLimitResponse
  }

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

        logger.error('Patient intake Supabase insert error', { path: '/api/patient-intake', method: 'POST' }, {}, error instanceof Error ? error : undefined)
        return NextResponse.json(
          {
            success: false,
            message: "We couldn't save your intake form right now. Please try again in a moment or contact us.",
          },
          { status: 503 }
        )
      } catch (error) {
        logger.error('Patient intake unexpected Supabase error', { path: '/api/patient-intake', method: 'POST' }, {}, error instanceof Error ? error : undefined)
        return NextResponse.json(
          {
            success: false,
            message: "We couldn't save your intake form right now. Please try again in a moment or contact us.",
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: crypto.randomUUID(),
      message: 'Your intake form has been submitted successfully!',
    })
  } catch (error) {
    logger.error('Patient intake invalid request body', { path: '/api/patient-intake', method: 'POST' }, {}, error instanceof Error ? error : undefined)

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid intake data.',
      },
      { status: 400 },
    )
  }
}
