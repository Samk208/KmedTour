import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Clinic } from '@/lib/schemas/clinic'
import { Treatment } from '@/lib/schemas/treatment'
import { getBaseUrl } from '@/lib/utils/content-parser'
import { MedicalDisclaimer } from '@/components/shared/medical-disclaimer'
import { PseoClinicList } from '@/components/pseo/ClinicList'
import { PseoHero } from '@/components/pseo/Hero'
import { PseoTechSpecs } from '@/components/pseo/TechSpecs'
import { PseoProccedureContent } from '@/components/pseo/ProcedureContent'
import { procedureGuides } from '@/lib/data/pseo-content'

import cityProceduresData from '@/lib/data/city-procedures.json'
import clinicsData from '@/lib/data/clinics.json'
import mappingsData from '@/lib/data/mappings.json'
import treatmentsData from '@/lib/data/treatments.json'

const BASE_URL = getBaseUrl()
const clinics = clinicsData as Clinic[]
const treatments = treatmentsData as Treatment[]
const mappings = mappingsData as { hospitalId: string; procedureId: string; verified?: boolean }[]
const cityProcedures = cityProceduresData as { city: string; citySlug: string; procedureSlug: string }[]

function findCityProcedure(citySlug: string, procedureSlug: string) {
  return cityProcedures.find((c) => c.citySlug === citySlug && c.procedureSlug === procedureSlug)
}

function getTreatmentBySlug(slug: string) {
  return treatments.find((t) => t.slug === slug)
}

function getHospitalsForCityProcedure(city: string, procedureId: string) {
  const hospitalIds = new Set(
    mappings.filter((m) => m.procedureId === procedureId).map((m) => m.hospitalId)
  )
  return clinics.filter((c) => c.location?.toLowerCase() === city.toLowerCase() && hospitalIds.has(c.id))
}

/** Other cities offering the same procedure (for internal linking) */
function getOtherCitiesForProcedure(procedureSlug: string, excludeCity: string) {
  const seen = new Set<string>()
  return cityProcedures
    .filter((c) => c.procedureSlug === procedureSlug && c.citySlug !== excludeCity)
    .filter((c) => {
      if (seen.has(c.citySlug)) return false
      seen.add(c.citySlug)
      return true
    })
    .slice(0, 4)
}

/** Other procedures available in the same city (for internal linking) */
function getOtherProceduresInCity(citySlug: string, excludeSlug: string) {
  const seen = new Set<string>()
  return cityProcedures
    .filter((c) => c.citySlug === citySlug && c.procedureSlug !== excludeSlug)
    .filter((c) => {
      if (seen.has(c.procedureSlug)) return false
      seen.add(c.procedureSlug)
      return true
    })
    .slice(0, 5)
}

function buildMetadata(city: string, proc: Treatment): Metadata {
  return {
    title: `Best ${proc.title} Clinics in ${city}, Korea | Verified & Affordable`,
    description: `Find accredited ${proc.title} clinics in ${city}, Korea. Compare costs, check KAHF/KOIHA accreditation, and get concierge support for African patients. ${proc.priceRange ? `Est. cost: ${proc.priceRange}.` : ''}`,
    alternates: { canonical: `${BASE_URL}/${city.toLowerCase()}/${proc.slug}` },
    openGraph: {
      title: `Best ${proc.title} Clinics in ${city}, Korea`,
      description: `Verified ${proc.title} options in ${city} with transparent pricing, KAHF accreditation, and dedicated coordinator support for international patients.`,
      url: `${BASE_URL}/${city.toLowerCase()}/${proc.slug}`,
      type: 'article',
    },
  }
}

export async function generateStaticParams() {
  return cityProcedures.map((c) => ({
    city: c.citySlug,
    procedure: c.procedureSlug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; procedure: string }>
}): Promise<Metadata> {
  const { city, procedure } = await params
  const match = findCityProcedure(city, procedure)
  const treatment = getTreatmentBySlug(procedure)
  if (!match || !treatment) return {}
  return buildMetadata(match.city, treatment)
}

export default async function CityProcedurePage({
  params,
}: {
  params: Promise<{ city: string; procedure: string }>
}) {
  const { city, procedure } = await params
  const match = findCityProcedure(city, procedure)
  const treatment = getTreatmentBySlug(procedure)

  if (!match || !treatment) return notFound()

  const hospitals = getHospitalsForCityProcedure(match.city, treatment.id)
  const otherCities = getOtherCitiesForProcedure(procedure, city)
  const otherProcedures = getOtherProceduresInCity(city, procedure)
  const guide = procedureGuides[procedure] ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `Best ${treatment.title} in ${match.city}, Korea`,
    description: `Comprehensive guide to ${treatment.title} procedures in ${match.city}, featuring ${hospitals.length} verified clinics.`,
    url: `${BASE_URL}/${city}/${procedure}`,
    mainEntity: {
      '@type': 'MedicalProcedure',
      name: treatment.title,
      description: treatment.shortDescription,
      ...(treatment.duration ? { duration: treatment.duration } : {}),
      followup: 'Required — post-op monitoring coordinated by KmedTour',
    },
    about: {
      '@type': 'City',
      name: match.city,
      containedInPlace: { '@type': 'Country', name: 'South Korea' },
    },
    ...(treatment.priceRange
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            description: treatment.priceRange,
          },
        }
      : {}),
    ...(guide && guide.faqs.length > 0
      ? {
          hasPart: {
            '@type': 'FAQPage',
            mainEntity: guide.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[var(--cloud-white)] min-h-screen pb-20">
        <PseoHero
          city={match.city}
          treatmentTitle={treatment.title}
          clinicCount={hospitals.length}
          priceRange={treatment.priceRange || 'Contact for quote'}
        />

        <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-16">

          <section aria-labelledby="clinics-heading">
            <h2 id="clinics-heading" className="mb-6 text-2xl font-bold text-[var(--kmed-navy)]">
              Verified {treatment.title} Clinics in {match.city}
            </h2>
            <PseoClinicList clinics={hospitals} city={match.city} />
          </section>

          <PseoTechSpecs
            city={match.city}
            treatmentTitle={treatment.title}
            priceRange={treatment.priceRange || ''}
            duration={treatment.duration}
            recoveryTime={treatment.recoveryTime}
          />

          <PseoProccedureContent
            procedureSlug={procedure}
            treatmentTitle={treatment.title}
          />

          {/* Internal linking: same procedure in other cities */}
          {otherCities.length > 0 && (
            <section aria-labelledby="other-cities-heading">
              <h2 id="other-cities-heading" className="mb-4 text-lg font-bold text-[var(--kmed-navy)]">
                {treatment.title} in Other Korean Cities
              </h2>
              <div className="flex flex-wrap gap-3">
                {otherCities.map((c) => (
                  <Link
                    key={c.citySlug}
                    href={`/${c.citySlug}/${procedure}`}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[var(--kmed-blue)] hover:border-[var(--kmed-blue)] hover:shadow-sm transition-all"
                  >
                    {treatment.title} in {c.city}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Internal linking: other procedures in the same city */}
          {otherProcedures.length > 0 && (
            <section aria-labelledby="other-procedures-heading">
              <h2 id="other-procedures-heading" className="mb-4 text-lg font-bold text-[var(--kmed-navy)]">
                Other Treatments Available in {match.city}
              </h2>
              <div className="flex flex-wrap gap-3">
                {otherProcedures.map((p) => {
                  const t = getTreatmentBySlug(p.procedureSlug)
                  if (!t) return null
                  return (
                    <Link
                      key={p.procedureSlug}
                      href={`/${city}/${p.procedureSlug}`}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[var(--kmed-blue)] hover:border-[var(--kmed-blue)] hover:shadow-sm transition-all"
                    >
                      {t.title}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          <MedicalDisclaimer context={`${treatment.title} in ${match.city}`} />

        </div>
      </div>
    </>
  )
}
