import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kmedtour.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/coordinator/',
          '/dashboard/',
          '/patient/',
          '/patient-intake/',
          '/favorites/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
