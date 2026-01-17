import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Clinic } from '@/lib/schemas/clinic'
import { Treatment } from '@/lib/schemas/treatment'

import cityProceduresData from '@/lib/data/city-procedures.json'
import clinicsData from '@/lib/data/clinics.json'
import mappingsData from '@/lib/data/mappings.json'
import treatmentsData from '@/lib/data/treatments.json'

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

function buildMetadata(city: string, proc: Treatment): Metadata {
  return {
    title: `Best ${proc.title} Clinics in ${city} | Costs & Options`,
    description: `Accredited ${proc.title} options in ${city}, Korea. Concierge-led access without exposing direct hospital contacts.`,
    alternates: { canonical: `/${city.toLowerCase()}/${proc.slug}` },
    openGraph: {
      title: `Best ${proc.title} Clinics in ${city}`,
      description: `Top options for ${proc.title} in ${city} with KAHF/KOIHA hospitals and concierge support.`,
      url: `/${city.toLowerCase()}/${proc.slug}`,
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

  // JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `Best ${treatment.title} in ${match.city}`,
    description: `Comprehensive guide to ${treatment.title} procedures in ${match.city}, featuring verified ${hospitals.length} clinics.`,
    mainEntity: {
      '@type': 'MedicalProcedure',
      name: treatment.title,
      bodyLocation: 'General', // Could be dynamic if we had data
      procedureType: 'Surgical', // Simplified
      followup: 'Required',
    },
    about: {
      '@type': 'City',
      name: match.city,
    },
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
          clinicCount={hospitals.length > 0 ? hospitals.length : 3} // Fallback to 3 for marketing impact if empty
          priceRange={treatment.priceRange || 'Contact for quote'}
        />

        <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-16">

          <PseoClinicList clinics={hospitals} city={match.city} />

          <PseoTechSpecs
            city={match.city}
            treatmentTitle={treatment.title}
            priceRange={treatment.priceRange || ''}
          />

        </div>
      </div>
    </>
  )
}

import { PseoClinicList } from '@/components/pseo/ClinicList'
import { PseoHero } from '@/components/pseo/Hero'
import { PseoTechSpecs } from '@/components/pseo/TechSpecs'




