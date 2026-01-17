import { getSupabaseContext, isSupabaseConfigured } from '@/lib/api/client/supabase'
import treatmentsJson from '@/lib/data/treatments.json'
import { Treatment, treatmentSchema } from '@/lib/schemas/treatment'

interface TreatmentRow {
  external_id?: string | null
  id?: string
  slug?: string
  title?: string
  short_description?: string | null
  shortDescription?: string | null
  description?: string
  price_range?: string | null
  priceRange?: string | null
  price_note?: string | null
  priceNote?: string | null
  duration?: string | null
  success_rate?: string | null
  successRate?: string | null
  category?: string | null
  image_url?: string | null
  imageUrl?: string | null
  highlights?: string[] | null
}

function normalizeTreatmentRow(row: TreatmentRow): Treatment {
  return treatmentSchema.parse({
    id: row.external_id ?? row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description ?? row.shortDescription,
    description: row.description,
    priceRange: row.price_range ?? row.priceRange,
    priceNote: row.price_note ?? row.priceNote,
    duration: row.duration,
    successRate: row.success_rate ?? row.successRate,
    category: row.category,
    imageUrl: row.image_url ?? row.imageUrl,
    highlights: row.highlights ?? [],
  })
}

async function fetchTreatmentsFromSupabase(): Promise<Treatment[] | null> {
  if (!isSupabaseConfigured()) return null

  const { client } = getSupabaseContext()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('treatments')
      .select('*')
      .order('title', { ascending: true })

    if (error || !data) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:treatments] Supabase error, falling back to JSON:', error)
      }
      return null
    }

    return data.map((row) => normalizeTreatmentRow(row as TreatmentRow))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:treatments] Unexpected error, falling back to JSON:', error)
    }
    return null
  }
}

export async function getTreatments(): Promise<Treatment[]> {
  const fromDb = await fetchTreatmentsFromSupabase()
  if (fromDb && fromDb.length > 0) return fromDb

  return treatmentSchema.array().parse(treatmentsJson)
}

export async function getTreatmentBySlug(slug: string): Promise<Treatment | null> {
  const fromDb = await fetchTreatmentsFromSupabase()
  if (fromDb) {
    const match = fromDb.find((t) => t.slug === slug)
    if (match) return match
  }

  const fromJson = treatmentSchema.array().parse(treatmentsJson)
  return fromJson.find((t) => t.slug === slug) ?? null
}
