import { getSupabaseContext, isSupabaseConfigured } from '@/lib/api/client/supabase'
import testimonialsJson from '@/lib/data/testimonials.json'
import { Testimonial, testimonialSchema } from '@/lib/schemas/testimonial'

interface TestimonialRow {
  external_id?: string | null
  id?: string
  name?: string
  country?: string
  country_code?: string | null
  countryCode?: string | null
  treatment?: string
  quote?: string
  rating?: number | null
  date?: string
}

function normalizeTestimonialRow(row: TestimonialRow): Testimonial {
  return testimonialSchema.parse({
    id: row.external_id ?? row.id,
    name: row.name,
    country: row.country,
    countryCode: row.country_code ?? row.countryCode,
    treatment: row.treatment,
    quote: row.quote,
    rating: row.rating,
    date: row.date,
  })
}

async function fetchTestimonialsFromSupabase(): Promise<Testimonial[] | null> {
  if (!isSupabaseConfigured()) return null

  const { client } = getSupabaseContext()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('testimonials')
      .select('*')
      .order('date', { ascending: false })

    if (error || !data) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[repo:testimonials] Supabase error, falling back to JSON:', error)
      }
      return null
    }

    return data.map((row) => normalizeTestimonialRow(row as TestimonialRow))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[repo:testimonials] Unexpected error, falling back to JSON:', error)
    }
    return null
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const fromDb = await fetchTestimonialsFromSupabase()
  if (fromDb && fromDb.length > 0) return fromDb

  return testimonialSchema.array().parse(testimonialsJson)
}
