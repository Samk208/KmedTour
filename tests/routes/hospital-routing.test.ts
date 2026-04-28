import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

describe('hospital detail routing', () => {
  it('generates locale-aware hospital detail params for a known hospital', async () => {
    const { generateStaticParams } = await import('@/app/[locale]/hospitals/[slug]/page')

    const params = await generateStaticParams()

    expect(params).toContainEqual({ locale: 'en', slug: 'asan-medical-center' })
  })

  it('redirects legacy clinic detail URLs to canonical hospital detail URLs', async () => {
    const { default: LegacyClinicDetailPage } = await import('@/app/[locale]/clinics/[slug]/page')

    await expect(
      LegacyClinicDetailPage({
        params: Promise.resolve({ locale: 'en', slug: 'asan-medical-center' }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/en/hospitals/asan-medical-center')
  })
})
