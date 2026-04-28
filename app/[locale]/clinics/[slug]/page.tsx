import { locales } from '@/lib/i18n/locales'
import clinicsData from '@/lib/data/clinics.json'
import type { Clinic } from '@/lib/schemas/clinic'
import { redirect } from 'next/navigation'

const clinics = clinicsData as Clinic[]

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    clinics.map((clinic) => ({ locale, slug: clinic.slug }))
  )
}

export default async function LegacyClinicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  redirect(`/${locale}/hospitals/${slug}`)
}
