import { getSupabaseContext, isSupabaseConfigured } from '@/lib/api/client/supabase'
import clinicsJson from '@/lib/data/clinics.json'
import { Clinic, clinicSchema } from '@/lib/schemas/clinic'

interface ClinicRow {
  external_id?: string | null
  id?: string
  slug?: string
  name?: string
  short_description?: string | null
  shortDescription?: string | null
  description?: string | null
  location?: string | null
  address?: string | null
  specialties?: string[] | null
  accreditations?: string[] | null
  year_established?: number | null
  yearEstablished?: number | null
  international_patients?: string | null
  internationalPatients?: string | null
  languages_supported?: string[] | null
  languagesSupported?: string[] | null
  price_range?: string | null
  priceRange?: string | null
  rating?: number | null
  review_count?: number | null
  reviewCount?: number | null
  success_rate?: string | null
  successRate?: string | null
  image_url?: string | null
  imageUrl?: string | null
  logo_url?: string | null
  logoUrl?: string | null
  highlights?: string[] | null
  facilities?: string[] | null
  doctors?: Clinic['doctors'] | null
}

function normalizeClinicRow(row: ClinicRow): Clinic {
  return clinicSchema.parse({
    id: row.external_id ?? row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? row.shortDescription,
    description: row.description,
    location: row.location,
    address: row.address,
    specialties: row.specialties ?? [],
    accreditations: row.accreditations ?? [],
    yearEstablished: row.year_established ?? row.yearEstablished,
    internationalPatients: row.international_patients ?? row.internationalPatients,
    languagesSupported: row.languages_supported ?? row.languagesSupported ?? [],
    priceRange: row.price_range ?? row.priceRange,
    rating: row.rating,
    reviewCount: row.review_count ?? row.reviewCount,
    successRate: row.success_rate ?? row.successRate,
    imageUrl: row.image_url ?? row.imageUrl,
    logoUrl: row.logo_url ?? row.logoUrl,
    highlights: row.highlights ?? [],
    facilities: row.facilities ?? [],
    doctors: row.doctors ?? [],
  })
}

async function fetchClinicsFromSupabase(): Promise<Clinic[] | null> {
  if (!isSupabaseConfigured()) return null

  const { client } = getSupabaseContext()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('clinics')
      .select('*')
      .order('name', { ascending: true })

    if (error || !data) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:clinics] Supabase error, falling back to JSON:', error)
      }
      return null
    }

    return data.map((row) => normalizeClinicRow(row as ClinicRow))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:clinics] Unexpected error, falling back to JSON:', error)
    }
    return null
  }
}

export async function getClinics(): Promise<Clinic[]> {
  const fromDb = await fetchClinicsFromSupabase()
  if (fromDb && fromDb.length > 0) return fromDb

  return clinicSchema.array().parse(clinicsJson)
}

export async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  const fromDb = await fetchClinicsFromSupabase()
  if (fromDb) {
    const match = fromDb.find((c) => c.slug === slug)
    if (match) return match
  }

  const fromJson = clinicSchema.array().parse(clinicsJson)
  return fromJson.find((c) => c.slug === slug) ?? null
}
