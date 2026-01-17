import { createPatientIntake } from '@/lib/api/repositories/patient-intake'
import { FullPatientIntake } from '@/lib/schemas/patient-intake'
import { useMutation } from '@tanstack/react-query'

// Patient intake submission hook
// Delegates to the repository layer, which currently operates in mock mode
// but is designed to plug in real Supabase logic later.
export function useSubmitPatientIntake() {
  return useMutation({
    mutationFn: async (data: FullPatientIntake) => {
      return createPatientIntake(data)
    },
  })
}
