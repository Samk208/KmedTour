import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Clinic } from '@/lib/schemas/clinic'
import { Treatment } from '@/lib/schemas/treatment'

import clinicsData from '@/lib/data/clinics.json'
import mappingsData from '@/lib/data/mappings.json'
import treatmentsData from '@/lib/data/treatments.json'

const clinics = clinicsData as Clinic[]
const treatments = treatmentsData as Treatment[]
const mappings = mappingsData as { hospitalId: string; procedureId: string; verified?: boolean }[]

function getClinicBySlug(slug: string) {
  return clinics.find((clinic) => clinic.slug === slug)
}

function getProceduresForHospital(hospitalId: string) {
  const procedureIds = new Set(
    mappings.filter((m) => m.hospitalId === hospitalId).map((m) => m.procedureId)
  )
  return treatments.filter((t) => procedureIds.has(t.id))
}

function getHospitalImage(slug: string): string {
  // List of hospitals with generated images (update as you generate more)
  const hasImage = [
    'asan-medical-center',
    'banobagi-plastic-surgery-clinic',
    'cha-university-fertility-center-seoul-station'
  ].includes(slug)

  return hasImage ? `/images/hospitals/${slug}.png` : '/images/hospitals/default.jpg'
}

function buildMetadata(clinic: Clinic): Metadata {
  const city = clinic.location || 'South Korea'
  return {
    title: `${clinic.name} | KAHF/KOIHA Accredited Hospital in ${city}`,
    description: `${clinic.name} is a KAHF/KOIHA accredited hospital in ${city} offering international patient support via KmedTour concierge.`,
    alternates: { canonical: `/hospitals/${clinic.slug}` },
    openGraph: {
      title: `${clinic.name} | KAHF/KOIHA Accredited Hospital in ${city}`,
      description: `Accredited care, international patient services, and concierge support for ${clinic.name} in ${city}.`,
      url: `/hospitals/${clinic.slug}`,
      type: 'article',
    },
  }
}

function HospitalJsonLd(clinic: Clinic, procedures: Treatment[]) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: clinic.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: clinic.location || 'South Korea',
    },
    medicalSpecialty: clinic.specialties,
    areaServed: clinic.location,
    accreditation: clinic.accreditations,
    availableService: procedures.slice(0, 10).map((p) => ({
      '@type': 'MedicalProcedure',
      name: p.title,
    })),
    url: `https://kmedtour.now/hospitals/${clinic.slug}`,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export async function generateStaticParams() {
  return clinics.map((clinic) => ({ slug: clinic.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const clinic = getClinicBySlug(slug)
  if (!clinic) return {}
  return buildMetadata(clinic)
}

export default async function HospitalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const clinic = getClinicBySlug(slug)
  if (!clinic) return notFound()

  const procedures = getProceduresForHospital(clinic.id)

  return (
    <div className="bg-[var(--cloud-white)] min-h-screen">

      <div className="relative text-white py-24 overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={clinic.imageUrl || getHospitalImage(clinic.slug)}
            alt={`${clinic.name} - KAHF/KOIHA Accredited Hospital`}
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--kmed-blue)] via-[var(--kmed-cyan)]/80 to-[var(--kmed-navy)] opacity-90" />
        </div>

        <div className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-sm uppercase tracking-wide text-white/90 mb-2 font-medium">
            KAHF/KOIHA Accredited
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-sm">{clinic.name}</h1>
          <p className="text-lg text-white/95 max-w-3xl drop-shadow-sm font-light">
            International patient support via KmedTour concierge. Explore services, specialties, and
            vetted procedures without direct contact exposure.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="bg-white text-[var(--kmed-blue)] hover:bg-zinc-100 font-semibold" asChild>
              <Link href="/patient-intake">Request a personalized quote</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm" asChild>
              <Link href="/treatment-advisor">Talk to a care advisor</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        <section className="bg-white shadow-sm rounded-xl p-6 space-y-4 border border-[var(--border-grey)]">
          <div className="flex flex-wrap gap-2">
            {clinic.accreditations?.map((acc) => (
              <span
                key={acc}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--soft-grey)]"
                style={{ color: 'var(--kmed-navy)' }}
              >
                {acc}
              </span>
            ))}
            {clinic.languagesSupported?.length ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--soft-grey)] text-[var(--deep-grey)]">
                Languages: {clinic.languagesSupported.slice(0, 3).join(', ')}
              </span>
            ) : null}
            {clinic.facilities?.length ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--soft-grey)] text-[var(--deep-grey)]">
                Services: {clinic.facilities.slice(0, 2).join(', ')}
              </span>
            ) : null}
          </div>
          <p className="text-[var(--deep-grey)] leading-relaxed">{clinic.description}</p>
        </section>

        <section className="bg-white shadow-sm rounded-xl p-6 border border-[var(--border-grey)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
              Specialties & Procedures
            </h2>
            <Link
              href="/treatment-advisor"
              className="text-sm font-semibold"
              style={{ color: 'var(--kmed-blue)' }}
            >
              Get a curated match
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.slice(0, 6).map((spec) => (
              <span
                key={spec}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--soft-grey)] text-[var(--deep-grey)]"
              >
                {spec.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          {procedures.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {procedures.slice(0, 6).map((proc) => (
                <Link
                  key={proc.id}
                  href={`/procedures/${proc.slug}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--border-grey)] hover:border-[var(--kmed-blue)] transition-colors"
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {proc.title}
                    </p>
                    <p className="text-sm text-[var(--deep-grey)]">{proc.priceRange}</p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--kmed-blue)]">View</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--deep-grey)] text-sm">
              Procedures will be confirmed via concierge to ensure accuracy.
            </p>
          )}
        </section>

        <section className="bg-white shadow-sm rounded-xl p-6 border border-[var(--border-grey)] space-y-4">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
            Why book through KmedTour
          </h2>
          <ul className="list-disc pl-5 text-[var(--deep-grey)] space-y-2">
            <li>Concierge shields hospital contacts; we coordinate on your behalf.</li>
            <li>Accreditation-first listings (KAHF/KOIHA) with language and service filters.</li>
            <li>City-level guidance and verified procedure mappings to reduce research time.</li>
          </ul>
        </section>
      </div>
      {HospitalJsonLd(clinic, procedures)}
    </div>
  )
}
