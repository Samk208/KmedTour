'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function CTASection() {
  const { t } = useTranslation('common')
  return (
    <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'white' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center space-y-8 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--kmed-blue) 0%, var(--kmed-teal) 100%)',
          }}
        >
          {/* Animated floating circles */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white opacity-10 pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -20, 0],
              y: [0, 10, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-4 border-white opacity-10 pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white opacity-5 pointer-events-none"
          />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance"
          >
            {t('landing.finalCta.title') || "Experience the Future of Medical Travel"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            {t('landing.finalCta.subtitle') || "Let our operating system handle the logistics while you focus on recovery. Instant matching, transparent pricing, and full concierge automation."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link href="/patient-intake">
              <Button
                size="lg"
                className="text-base px-8 py-7 bg-white hover:bg-white/90 shadow-lg text-[var(--kmed-blue)] font-bold transition-all hover:scale-105 hover:shadow-xl"
              >
                {t('landing.finalCta.ctaPrimary') || "Start Digital Intake"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-7 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
              >
                {t('landing.finalCta.ctaSecondary') || "Contact Support"}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative flex flex-wrap justify-center gap-8 pt-8 text-white/80"
          >
            {[
              'AI-Powered Matching',
              'No Hidden Fees',
              '24/7 System Access',
            ].map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + i * 0.15, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
