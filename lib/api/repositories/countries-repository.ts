import { getSupabaseContext, isSupabaseConfigured } from '@/lib/api/client/supabase'
import countriesJson from '@/lib/data/countries.json'
import { Country, countrySchema } from '@/lib/schemas/country'

interface CountryRow {
  external_id?: string | null
  id?: string
  slug?: string
  name?: string
  region?: string | null
  flag?: string | null
  visa_info?: Country['visaInfo'] | null
  visaInfo?: Country['visaInfo'] | null
  travel_info?: Country['travelInfo'] | null
  travelInfo?: Country['travelInfo'] | null
  medical_tourism_notes?: string | null
  medicalTourismNotes?: string | null
  common_treatments?: string[] | null
  commonTreatments?: string[] | null
}

function normalizeCountryRow(row: CountryRow): Country {
  return countrySchema.parse({
    id: row.external_id ?? row.id,
    slug: row.slug,
    name: row.name,
    region: row.region,
    flag: row.flag,
    visaInfo: row.visa_info ?? row.visaInfo,
    travelInfo: row.travel_info ?? row.travelInfo,
    medicalTourismNotes: row.medical_tourism_notes ?? row.medicalTourismNotes,
    commonTreatments: row.common_treatments ?? row.commonTreatments ?? [],
  })
}

async function fetchCountriesFromSupabase(): Promise<Country[] | null> {
  if (!isSupabaseConfigured()) return null

  const { client } = getSupabaseContext()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('countries')
      .select('*')
      .order('name', { ascending: true })

    if (error || !data) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:countries] Supabase error, falling back to JSON:', error)
      }
      return null
    }

    return data.map((row) => normalizeCountryRow(row as CountryRow))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:countries] Unexpected error, falling back to JSON:', error)
    }
    return null
  }
}

export async function getCountries(): Promise<Country[]> {
  const fromDb = await fetchCountriesFromSupabase()
  if (fromDb && fromDb.length > 0) return fromDb

  return countrySchema.array().parse(countriesJson)
}

export async function getCountryBySlug(slug: string): Promise<Country | null> {
  const fromDb = await fetchCountriesFromSupabase()
  if (fromDb) {
    const match = fromDb.find((c) => c.slug === slug)
    if (match) return match
  }

  const fromJson = countrySchema.array().parse(countriesJson)
  return fromJson.find((c) => c.slug === slug) ?? null
}
