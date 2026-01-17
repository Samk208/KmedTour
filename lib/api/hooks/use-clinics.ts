import { getClinicBySlug, getClinics } from '@/lib/api/repositories/clinics-repository'
import { Clinic } from '@/lib/schemas/clinic'
import { useQuery } from '@tanstack/react-query'

export function useClinicsQuery() {
  return useQuery<Clinic[]>({
    queryKey: ['clinics'],
    queryFn: () => getClinics(),
  })
}

export function useClinicQuery(slug: string | undefined) {
  return useQuery<Clinic | null>({
    queryKey: ['clinic', slug],
    queryFn: () => (slug ? getClinicBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
  })
}
