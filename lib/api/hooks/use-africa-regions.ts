import { getAfricaRegions } from '@/lib/api/repositories/africa-regions-repository'
import { AfricaRegion } from '@/lib/schemas/africa-region'
import { useQuery } from '@tanstack/react-query'

export function useAfricaRegionsQuery() {
  return useQuery<AfricaRegion[]>({
    queryKey: ['africa-regions'],
    queryFn: () => getAfricaRegions(),
  })
}
