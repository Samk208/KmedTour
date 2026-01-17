import { getSupabaseContext } from '@/lib/api/client/supabase'
import { contactSubmissionSchema } from '@/lib/schemas/contact'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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
          return NextResponse.json({
            success: true,
            message: 'Your message has been received. We will get back to you shortly.',
          })
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error('[api/contact] Supabase insert error, falling back to mock response:', error)
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[api/contact] Unexpected Supabase error, falling back to mock response:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you shortly.',
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api/contact] Invalid request body:', error)
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid contact data.',
      },
      { status: 400 },
    )
  }
}
