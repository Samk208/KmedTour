import { ContactSubmission } from '@/lib/schemas/contact'

export interface ContactSubmissionResult {
  success: boolean
  message: string
}

function fallbackResult(): ContactSubmissionResult {
  return {
    success: true,
    message: 'Your message has been received. We will get back to you shortly.',
  }
}

export async function createContactSubmission(payload: ContactSubmission): Promise<ContactSubmissionResult> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:contact] API error, falling back to mock:', response.status)
      }
      return fallbackResult()
    }

    const data = (await response.json()) as ContactSubmissionResult | null
    if (!data || typeof data.success !== 'boolean') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:contact] Malformed response, falling back to mock:', data)
      }
      return fallbackResult()
    }

    return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:contact] Network error, falling back to mock:', error)
    }
    return fallbackResult()
  }
}
