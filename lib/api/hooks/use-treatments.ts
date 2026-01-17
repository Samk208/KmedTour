import { getTreatmentBySlug, getTreatments } from '@/lib/api/repositories/treatments-repository'
import { Treatment } from '@/lib/schemas/treatment'
import { useQuery } from '@tanstack/react-query'

export function useTreatmentsQuery() {
  return useQuery<Treatment[]>({
    queryKey: ['treatments'],
    queryFn: () => getTreatments(),
  })
}

export function useTreatmentQuery(slug: string | undefined) {
  return useQuery<Treatment | null>({
    queryKey: ['treatment', slug],
    queryFn: () => (slug ? getTreatmentBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
  })
}
