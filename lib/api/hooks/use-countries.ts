import { getCountries, getCountryBySlug } from '@/lib/api/repositories/countries-repository'
import { Country } from '@/lib/schemas/country'
import { useQuery } from '@tanstack/react-query'

export function useCountriesQuery() {
  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: () => getCountries(),
  })
}

export function useCountryQuery(slug: string | undefined) {
  return useQuery<Country | null>({
    queryKey: ['country', slug],
    queryFn: () => (slug ? getCountryBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
  })
}
