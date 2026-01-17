import { createContactSubmission } from '@/lib/api/repositories/contact'
import { ContactSubmission } from '@/lib/schemas/contact'
import { useMutation } from '@tanstack/react-query'

export function useContactSubmission() {
  return useMutation({
    mutationFn: (payload: ContactSubmission) => createContactSubmission(payload),
  })
}
