'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className="w-full border-t" style={{ backgroundColor: 'var(--kmed-navy)', color: 'white' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">Kmedtour</div>
            <p className="text-sm text-gray-300">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.company')}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t('nav.about')}
              </Link>
              <Link href="/how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t('nav.howItWorks')}
              </Link>
              <Link href="/for-clinics" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t('nav.forClinics')}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.support')}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t('nav.contact')}
              </Link>
              <Link href="/content" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t('nav.content')}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.legal')}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">
                {t('footer.termsOfService')}
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-300">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
