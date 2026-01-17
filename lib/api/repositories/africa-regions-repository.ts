import { getSupabaseContext, isSupabaseConfigured } from '@/lib/api/client/supabase'
import africaRegionsJson from '@/lib/data/africa-regions.json'
import { AfricaRegion, africaRegionSchema } from '@/lib/schemas/africa-region'
import { z } from 'zod'

interface AfricaRegionRow {
  country_name?: string | null
  name?: string | null
  country_code?: string | null
  code?: string | null
  region?: string | null
  tips?: Partial<AfricaRegion['tips']> | null
}

function normalizeAfricaRegionRow(row: AfricaRegionRow): AfricaRegion {
  return africaRegionSchema.parse({
    name: row.country_name ?? row.name,
    code: row.country_code ?? row.code,
    region: row.region,
    tips: row.tips ?? {},
  })
}

async function fetchAfricaRegionsFromSupabase(): Promise<AfricaRegion[] | null> {
  if (!isSupabaseConfigured()) return null

  const { client } = getSupabaseContext()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('africa_regions')
      .select('*')
      .order('country_name', { ascending: true })

    if (error || !data) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:africa-regions] Supabase error, falling back to JSON:', error)
      }
      return null
    }

    return data.map((row) => normalizeAfricaRegionRow(row as AfricaRegionRow))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:africa-regions] Unexpected error, falling back to JSON:', error)
    }
    return null
  }
}

export async function getAfricaRegions(): Promise<AfricaRegion[]> {
  const fromDb = await fetchAfricaRegionsFromSupabase()
  if (fromDb && fromDb.length > 0) return fromDb

  const countries = africaRegionsJson.countries ?? []
  return z
    .array(africaRegionSchema)
    .parse(countries)
}
