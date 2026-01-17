import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
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

function getTreatmentBySlug(slug: string) {
  return treatments.find((t) => t.slug === slug)
}

function getHospitalsForProcedure(procedureId: string) {
  const hospitalIds = new Set(
    mappings.filter((m) => m.procedureId === procedureId).map((m) => m.hospitalId)
  )
  return clinics.filter((c) => hospitalIds.has(c.id))
}

function getCitiesForProcedure(procedureSlug: string) {
  const cities = cityProcedures.filter((c) => c.procedureSlug === procedureSlug)
  return cities.slice(0, 12)
}

function getProcedureImage(slug: string): string {
  // List of procedures with generated images (update as you generate more)
  const hasImage = [
    'rhinoplasty',
    'double-eyelid-surgery',
    'facelift'
  ].includes(slug)

  return hasImage ? `/images/procedures/${slug}.png` : '/images/procedures/default.jpg'
}

function buildMetadata(proc: Treatment): Metadata {
  return {
    title: `${proc.title} in Korea | Costs, Recovery, Top Hospitals`,
    description: `${proc.title} with KAHF/KOIHA-accredited hospitals, concierge coordination, and city-specific options.`,
    alternates: { canonical: `/procedures/${proc.slug}` },
    openGraph: {
      title: `${proc.title} in Korea | Costs, Recovery, Top Hospitals`,
      description: `Discover ${proc.title} options with accredited hospitals and KmedTour concierge.`,
      url: `/procedures/${proc.slug}`,
      type: 'article',
    },
  }
}

function ProcedureJsonLd(proc: Treatment, hospitals: Clinic[]) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: proc.title,
    procedureType: proc.category,
    estimatedCost: proc.priceRange,
    howPerformed: proc.shortDescription,
    provider: hospitals.slice(0, 5).map((h) => ({
      '@type': 'Hospital',
      name: h.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: h.location || 'South Korea',
      },
      accreditation: h.accreditations,
    })),
    url: `https://kmedtour.now/procedures/${proc.slug}`,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export async function generateStaticParams() {
  return treatments.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const treatment = getTreatmentBySlug(slug)
  if (!treatment) return {}
  return buildMetadata(treatment)
}

export default async function ProcedurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const treatment = getTreatmentBySlug(slug)
  if (!treatment) return notFound()

  const hospitals = getHospitalsForProcedure(treatment.id)
  const cities = getCitiesForProcedure(treatment.slug)

  return (
    <div className="bg-[var(--cloud-white)] min-h-screen">
      {/* Hero Section with Image */}
      <div className="relative text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={getProcedureImage(treatment.slug)}
            alt={`${treatment.title} - Medical Procedure in Korea`}
            fill
            className="object-cover opacity-25"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--kmed-blue)] to-[var(--kmed-navy)] opacity-95" />
        </div>

        <div className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
              {treatment.category || 'Medical Procedure'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--kmed-teal)]/30 backdrop-blur-sm">
              {treatment.priceRange}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{treatment.title}</h1>
          <p className="text-lg text-white/90 max-w-3xl mb-6">
            {treatment.shortDescription || treatment.description?.slice(0, 150) + '...'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-[var(--kmed-blue)] hover:bg-white/90 font-semibold" size="lg" asChild>
              <Link href="/patient-intake">Request a personalized quote</Link>
            </Button>
            <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm" size="lg" asChild>
              <Link href="/treatment-advisor">Get matched by advisor</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        <section className="bg-white shadow-sm rounded-xl p-6 space-y-3 border border-[var(--border-grey)]">
          <div className="flex flex-wrap gap-2">
            {treatment.highlights.slice(0, 6).map((h) => (
              <span
                key={h}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--soft-grey)] text-[var(--deep-grey)]"
              >
                {h}
              </span>
            ))}
          </div>
          <p className="text-[var(--deep-grey)] leading-relaxed">{treatment.description}</p>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[var(--deep-grey)]">Typical Cost</p>
              <p className="font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                {treatment.priceRange}
              </p>
            </div>
            <div>
              <p className="text-[var(--deep-grey)]">Duration</p>
              <p className="font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                {treatment.duration || 'Varies'}
              </p>
            </div>
            <div>
              <p className="text-[var(--deep-grey)]">Success Rate</p>
              <p className="font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                {treatment.successRate || 'Consult advisor'}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white shadow-sm rounded-xl p-6 border border-[var(--border-grey)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
              Top accredited hospitals for this procedure
            </h2>
            <Link
              href="/clinics"
              className="text-sm font-semibold"
              style={{ color: 'var(--kmed-blue)' }}
            >
              Browse all clinics
            </Link>
          </div>
          {hospitals.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {hospitals.slice(0, 6).map((h) => (
                <Link
                  key={h.id}
                  href={`/hospitals/${h.slug}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--border-grey)] hover:border-[var(--kmed-blue)] transition-colors"
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {h.name}
                    </p>
                    <p className="text-sm text-[var(--deep-grey)]">{h.location}</p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--kmed-blue)]">View</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--deep-grey)] text-sm">
              We’ll match you with accredited hospitals through concierge.
            </p>
          )}
        </section>

        <section className="bg-white shadow-sm rounded-xl p-6 border border-[var(--border-grey)] space-y-4">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
            Cities where you can get this procedure
          </h2>
          {cities.length ? (
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <Link
                  key={`${c.citySlug}-${c.procedureSlug}`}
                  href={`/${c.citySlug}/${c.procedureSlug}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--soft-grey)] hover:bg-[var(--border-grey)] transition-colors"
                  style={{ color: 'var(--deep-grey)' }}
                >
                  {c.city}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--deep-grey)] text-sm">Coming soon via concierge guidance.</p>
          )}
        </section>
      </div>
      {ProcedureJsonLd(treatment, hospitals)}
    </div>
  )
}

