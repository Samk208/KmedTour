import { ImageResponse } from 'next/og'

import cityProceduresData from '@/lib/data/city-procedures.json'
import treatmentsData from '@/lib/data/treatments.json'

const cityProcedures = cityProceduresData as { city: string; citySlug: string; procedureSlug: string }[]
const treatments = treatmentsData as { id: string; slug: string; title: string; priceRange?: string }[]

export const alt = 'KmedTour – Verified Korean Medical Clinics'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: { city: string; procedure: string }
}) {
  const match = cityProcedures.find(
    (c) => c.citySlug === params.city && c.procedureSlug === params.procedure
  )
  const treatment = treatments.find((t) => t.slug === params.procedure)

  const city = match?.city ?? params.city
  const procedureTitle = treatment?.title ?? params.procedure
  const price = treatment?.priceRange ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2744 60%, #0a1628 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 72px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 32,
            color: '#2dd4bf',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: '#2dd4bf',
            }}
          />
          KmedTour · KAHF Verified Clinics
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          {procedureTitle}
          <br />
          <span style={{ color: '#2dd4bf' }}>in {city}, Korea</span>
        </div>

        {/* Sub-headline */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.75)',
            marginBottom: 40,
            lineHeight: 1.4,
          }}
        >
          Accredited clinics · Transparent pricing · Concierge support for African patients
        </div>

        {/* Price badge */}
        {price && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '12px 24px',
              width: 'fit-content',
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Est. Cost: {price}
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
