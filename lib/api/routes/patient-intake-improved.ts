/**
 * Improved Patient Intake API with Retry Logic and Better Error Handling
 * 
 * This module should replace app/api/patient-intake/route.ts
 * 
 * Improvements:
 * 1. Retry logic with exponential backoff (Supabase timeouts)
 * 2. Better fallback handling (alerts admin instead of silent failure)
 * 3. Email confirmation to patient
 * 4. Coordinator notification webhook
 * 5. Comprehensive error logging
 * 
 * DRY RUN: Test this thoroughly before deploying
 */

import { getSupabaseContext } from '@/lib/api/client/supabase'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { FullPatientIntake, fullPatientIntakeSchema } from '@/lib/schemas/patient-intake'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// Configuration
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 100
const MAX_RETRY_DELAY_MS = 3000

/**
 * Exponential backoff retry helper
 * 
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function getRetryDelay(attempt: number): number {
  const exponentialDelay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt)
  return Math.min(exponentialDelay, MAX_RETRY_DELAY_MS)
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Send confirmation email to patient
 * Uses Resend API
 */
async function sendConfirmationEmail(email: string, submissionId: string): Promise<void> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'intake@kmedtour.com',
        to: email,
        subject: 'Your KmedTour Medical Intake Form - Received ✓',
        html: `
          <h2>Thank you for submitting your intake form!</h2>
          <p>We've received your information and our medical team will review it within 24-48 hours.</p>
          <p><strong>Your Reference Number:</strong> ${submissionId}</p>
          <p>Please keep this reference number for your records. You'll need it to track your application.</p>
          <p>If you have any questions, reply to this email or contact us at support@kmedtour.com</p>
        `,
      }),
    })

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`)
    }

    logger.info('Confirmation email sent', { email, submissionId })
  } catch (error) {
    // Don't fail the request if email fails, but log it
    logger.error('Failed to send confirmation email', { email, submissionId }, {}, error instanceof Error ? error : undefined)
  }
}

/**
 * Notify coordinator of new intake via webhook
 * Uses Slack or internal webhook
 */
async function notifyCoordinator(payload: FullPatientIntake, submissionId: string): Promise<void> {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL
  if (!slackWebhook) {
    logger.warn('SLACK_WEBHOOK_URL not configured, coordinator notification skipped')
    return
  }

  try {
    await fetch(slackWebhook, {
      method: 'POST',
      body: JSON.stringify({
        text: `📋 New Patient Intake`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New Patient Intake Received*\n*Name:* ${payload.fullName}\n*Email:* ${payload.email}\n*Treatment:* ${payload.treatmentType}\n*Budget:* ${payload.budget || 'Not specified'}\n*Ref:* ${submissionId}`,
            },
          },
        ],
      }),
    })

    logger.info('Coordinator notification sent', { submissionId, email: payload.email })
  } catch (error) {
    // Don't fail the request if notification fails
    logger.error('Failed to notify coordinator', { submissionId }, {}, error instanceof Error ? error : undefined)
  }
}

/**
 * Alert admin of fallback submission (Supabase unavailable)
 * This is a CRITICAL issue that requires immediate attention
 */
async function alertAdminOfFallback(payload: FullPatientIntake, submissionId: string): Promise<void> {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL
  if (!slackWebhook) {
    console.error('🚨 CRITICAL: Patient intake using fallback UUID (Supabase down) and Slack not configured!')
    return
  }

  try {
    await fetch(slackWebhook, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 CRITICAL: Patient Intake Fallback Activated`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🚨 CRITICAL ALERT*\n*Supabase is unavailable!*\nPatient intake was submitted but data was NOT saved to database.\n*Email:* ${payload.email}\n*Fallback UUID:* ${submissionId}\n*Action Required:* Check Supabase status and manually process this intake if database recovers.`,
            },
          },
        ],
      }),
    })

    logger.fatal('Fallback submission activated - Supabase unavailable', { email: payload.email, submissionId })
  } catch (error) {
    logger.fatal('Failed to alert admin of fallback', { email: payload.email, submissionId }, {}, error instanceof Error ? error : undefined)
  }
}

/**
 * Insert patient intake into Supabase with retry logic
 */
async function insertPatientIntake(
  client: SupabaseClient,
  payload: FullPatientIntake
): Promise<{ data: unknown; error: unknown } | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await client
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

      return result
    } catch (error) {
      // If this is the last attempt, return the error
      if (attempt === MAX_RETRIES) {
        return { data: null, error }
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt)
      logger.warn(`Patient intake insert failed, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`, {
        email: payload.email,
      })
      await sleep(delay)
    }
  }

  return null
}

/**
 * Main POST handler
 */
export async function POST(request: Request) {
  // Rate limiting
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
    // Parse and validate request
    const json = await request.json()
    const payload = fullPatientIntakeSchema.parse(json) as FullPatientIntake

    const { client } = getSupabaseContext()

    if (client) {
      try {
        // Attempt insert with retry logic
        const { data, error } = await insertPatientIntake(client, payload)

        if (!error && data) {
          // Success! Send confirmation and notify
          await Promise.all([
            sendConfirmationEmail(payload.email, data.id),
            notifyCoordinator(payload, data.id),
          ])

          return NextResponse.json({
            success: true,
            submissionId: data.id,
            message: 'Your intake form has been submitted successfully!',
          })
        }

        // Database error (e.g., constraint violation, permission denied)
        logger.error(
          'Patient intake Supabase insert failed after retries',
          { path: '/api/patient-intake', method: 'POST', email: payload.email },
          {},
          error instanceof Error ? error : undefined
        )

        return NextResponse.json(
          {
            success: false,
            message: "We couldn't save your intake form right now. Please try again in a moment or contact us.",
          },
          { status: 503 }
        )
      } catch (error) {
        // Unexpected error during insert
        logger.error(
          'Patient intake unexpected Supabase error',
          { path: '/api/patient-intake', method: 'POST', email: payload.email },
          {},
          error instanceof Error ? error : undefined
        )

        return NextResponse.json(
          {
            success: false,
            message: "We couldn't save your intake form right now. Please try again in a moment or contact us.",
          },
          { status: 503 }
        )
      }
    }

    // CRITICAL: Supabase client is null (unavailable)
    const fallbackId = crypto.randomUUID()

    // Alert admin immediately
    await alertAdminOfFallback(payload, fallbackId)

    // Return 202 Accepted (not 200 OK) to signal partial success
    return NextResponse.json(
      {
        success: true,
        submissionId: fallbackId,
        message: 'Your intake form has been submitted successfully!',
        warning: 'System temporarily unavailable - your application will be manually reviewed',
      },
      { status: 202 }
    )
  } catch (error) {
    // Invalid request body
    logger.error(
      'Patient intake invalid request body',
      { path: '/api/patient-intake', method: 'POST' },
      {},
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid intake data.',
      },
      { status: 400 }
    )
  }
}
