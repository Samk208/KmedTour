import { Metadata } from 'next'

import { ProceduresDirectory } from '@/components/treatments/procedures-directory'

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://kmedtour.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Medical Procedures in Korea | Costs, Hospitals & Recovery Guides | KmedTour',
  description:
    'Browse 113 medical procedures at KAHF-accredited Korean hospitals. Compare real costs, recovery timelines, and candidacy — save 60-75% vs Western prices.',
  alternates: {
    canonical: `${BASE_URL}/procedures`,
  },
  openGraph: {
    title: 'Medical Procedures in Korea | KmedTour',
    description:
      'In-depth guides to 113 procedures at Korean hospitals — costs, recovery, candidacy, and top hospitals.',
    url: `${BASE_URL}/procedures`,
    siteName: 'KmedTour',
    type: 'website',
  },
}

export default function ProceduresIndexPage() {
  return <ProceduresDirectory />
}
