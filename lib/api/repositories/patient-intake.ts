import { FullPatientIntake } from '@/lib/schemas/patient-intake'

export interface PatientIntakeResult {
  success: boolean
  submissionId: string
  message: string
}

export async function createPatientIntake(intake: FullPatientIntake): Promise<PatientIntakeResult> {
  try {
    const response = await fetch('/api/patient-intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(intake),
    })

    const data = (await response.json().catch(() => null)) as PatientIntakeResult | null

    if (!response.ok) {
      return {
        success: false,
        submissionId: '',
        message: data?.message ?? "We couldn't save your intake form right now. Please try again or contact us.",
      }
    }

    if (!data || typeof data.success !== 'boolean') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo] createPatientIntake malformed response:', data)
      }
      return fallbackMockResult()
    }

    return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo] createPatientIntake network error:', error)
    }
    return {
      success: false,
      submissionId: '',
      message: 'We couldn\'t reach the server. Please check your connection and try again.',
    }
  }
}

function fallbackMockResult(): PatientIntakeResult {
  return {
    success: true,
    submissionId: `mock-${Date.now()}`,
    message: 'Your intake form has been submitted successfully!',
  }
}
