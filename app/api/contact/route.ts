import { getSupabaseContext } from '@/lib/api/client/supabase'
import { contactSubmissionSchema } from '@/lib/schemas/contact'
import { logger } from '@/lib/utils/logger'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit({
    ...RateLimitPresets.STANDARD,
    keyPrefix: 'contact',
  })(request)
  
  if (rateLimitResponse) {
    logger.warn('Contact form rate limit exceeded', {
      path: '/api/contact',
      method: 'POST',
    })
    return rateLimitResponse
  }
  try {
    const json = await request.json()
    const payload = contactSubmissionSchema.parse(json)

    const { client } = getSupabaseContext()

    if (client) {
      try {
        const { error } = await client.from('contact_submissions').insert({
          type: payload.type ?? 'patient_contact',
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone ?? null,
          message: payload.message,
          metadata: null,
          source_page: payload.sourcePage ?? null,
        })

        if (!error) {
          logger.info('Contact submission received', {
            path: '/api/contact',
            method: 'POST',
          }, {
            email: payload.email,
            type: payload.type,
          })
          
          return NextResponse.json({
            success: true,
            message: 'Your message has been received. We will get back to you shortly.',
          })
        }

        logger.warn('Supabase insert error, falling back to mock response', {
          path: '/api/contact',
        }, {
          error: error.message,
        })
      } catch (error) {
        logger.warn('Unexpected Supabase error, falling back to mock response', {
          path: '/api/contact',
        }, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you shortly.',
    })
  } catch (error) {
    logger.error('Invalid contact request', {
      path: '/api/contact',
      method: 'POST',
    }, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid contact data.',
      },
      { status: 400 },
    )
  }
}
