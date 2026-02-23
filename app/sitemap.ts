import type { MetadataRoute } from 'next'
import clinicsData from '@/lib/data/clinics.json'
import treatmentsData from '@/lib/data/treatments.json'
import cityProceduresData from '@/lib/data/city-procedures.json'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kmedtour.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const clinics = clinicsData as { slug: string }[]
  const treatments = treatmentsData as { slug: string }[]
  const cityProcedures = cityProceduresData as { citySlug: string; procedureSlug: string }[]

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/how-it-works`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/procedures`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/hospitals`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/treatment-advisor`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Hospital pages
  const hospitalEntries: MetadataRoute.Sitemap = clinics.map((clinic) => ({
    url: `${siteUrl}/hospitals/${clinic.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Procedure pages
  const procedureEntries: MetadataRoute.Sitemap = treatments.map((proc) => ({
    url: `${siteUrl}/procedures/${proc.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // City + Procedure pSEO pages
  const cityProcedureEntries: MetadataRoute.Sitemap = cityProcedures.map((cp) => ({
    url: `${siteUrl}/${cp.citySlug}/${cp.procedureSlug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...hospitalEntries,
    ...procedureEntries,
    ...cityProcedureEntries,
  ]
}
