import clinicsData from '@/lib/data/clinics.json'
import treatmentsData from '@/lib/data/treatments.json'
import cityProceduresData from '@/lib/data/city-procedures.json'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kmedtour.now'

export default function sitemap() {
  const clinics = clinicsData as { slug: string }[]
  const treatments = treatmentsData as { slug: string }[]
  const cityProcedures = cityProceduresData as { citySlug: string; procedureSlug: string }[]

  const hospitalEntries = clinics.map((clinic) => ({
    url: `${siteUrl}/hospitals/${clinic.slug}`,
    changefreq: 'weekly',
    priority: 0.8,
  }))

  const procedureEntries = treatments.map((proc) => ({
    url: `${siteUrl}/procedures/${proc.slug}`,
    changefreq: 'weekly',
    priority: 0.8,
  }))

  const cityProcedureEntries = cityProcedures.map((cp) => ({
    url: `${siteUrl}/${cp.citySlug}/${cp.procedureSlug}`,
    changefreq: 'weekly',
    priority: 0.7,
  }))

  return [...hospitalEntries, ...procedureEntries, ...cityProcedureEntries]
}



