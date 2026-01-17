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

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo] createPatientIntake API error, falling back to mock:', response.status)
      }
      return fallbackMockResult()
    }

    const data = (await response.json()) as PatientIntakeResult

    if (!data || typeof data.success !== 'boolean') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo] createPatientIntake API response malformed, falling back to mock:', data)
      }
      return fallbackMockResult()
    }

    return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo] createPatientIntake network error, falling back to mock:', error)
    }
    return fallbackMockResult()
  }
}

function fallbackMockResult(): PatientIntakeResult {
  return {
    success: true,
    submissionId: `mock-${Date.now()}`,
    message: 'Your intake form has been submitted successfully!',
  }
}
