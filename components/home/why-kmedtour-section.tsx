'use client'

import { motion } from 'framer-motion'
import { BadgeDollarSign, ShieldCheck as VerifiedIcon, Globe2, FileCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function WhyKmedtourSection() {
  const { t } = useTranslation('common')
  const features = [
    {
      icon: VerifiedIcon,
      title: t('landing.benefits.items.technology.title') || 'Verified Hospitals Only',
      description: t('landing.benefits.items.technology.description') || 'Every hospital is accredited and verified. We check credentials, patient outcomes, and international readiness before recommending any clinic.',
    },
    {
      icon: Globe2,
      title: t('landing.benefits.items.support.title') || 'Everything Arranged for You',
      description: t('landing.benefits.items.support.description') || 'Hospital booking, travel, accommodation, and payments — all coordinated through one dedicated team.',
    },
    {
      icon: BadgeDollarSign,
      title: t('landing.benefits.items.pricing.title') || 'Transparent Pricing',
      description: t('landing.benefits.items.pricing.description') || 'See the real cost upfront. No hidden fees, no surprise charges, no inflated "foreigner" prices.',
    },
    {
      icon: FileCheck,
      title: t('landing.benefits.items.accreditation.title') || 'Visa & Paperwork Handled',
      description: t('landing.benefits.items.accreditation.description') || 'We prepare your visa invitation letters and medical documents so you don\u2019t have to worry about paperwork.',
    },
  ]

  return (
    <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--kmed-navy)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(57, 198, 176, 0.2)', color: 'var(--kmed-teal)' }}>
            {t('landing.benefits.badge') || "Why KmedTour"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
            {t('landing.benefits.title') || "Why Patients Choose KmedTour"}
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed text-gray-300">
            {t('landing.benefits.subtitle') || "We handle every detail of your medical journey so you can focus on getting better."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              className="text-center space-y-4 p-6 rounded-2xl transition-colors bg-white/5 border border-white/5 backdrop-blur-sm"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden group"
                style={{ backgroundColor: 'var(--kmed-teal)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <feature.icon className="h-8 w-8 text-white relative z-10" />
              </div>

              <h3 className="text-xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="text-sm leading-relaxed text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


