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

    const data = (await response.json().catch(() => null)) as ContactSubmissionResult | null

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? 'We couldn\'t save your message right now. Please try again or email us directly.',
      }
    }

    if (!data || typeof data.success !== 'boolean') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:contact] Malformed response:', data)
      }
      return fallbackResult()
    }

    return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:contact] Network error:', error)
    }
    return {
      success: false,
      message: 'We couldn\'t reach the server. Please check your connection and try again.',
    }
  }
}
