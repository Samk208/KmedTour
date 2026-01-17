'use client'

import { motion } from 'framer-motion'
import { BarChart3, Database, Globe2, ShieldCheck } from 'lucide-react'

export function WhyKmedtourSection() {
  const features = [
    {
      icon: Database,
      title: 'Data-Driven Verification',
      description: 'We don\u2019t just list clinics. Our system validates accreditations, survival rates, and patient outcomes in real-time.',
    },
    {
      icon: Globe2,
      title: 'End-to-End Orchestration',
      description: 'Our platform vertically integrates hospital booking, travel logistics, and payments into a single seamless workflow.',
    },
    {
      icon: BarChart3,
      title: 'Algorithmic Pricing',
      description: 'Get guaranteed price transparency. Our dynamic pricing engine prevents "foreigner surcharges" and hidden fees.',
    },
    {
      icon: ShieldCheck,
      title: 'Automated Compliance',
      description: 'Visa invitation letters and medical documentation are generated automatically, reducing administrative errors.',
    },
  ]

  return (
    <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--kmed-navy)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(57, 198, 176, 0.2)', color: 'var(--kmed-teal)' }}>
            Why KmedTour
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
            Medical Infrastructure, Not Just an Agency
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed text-gray-300">
            We built the operating system for medical tourism so you can focus on healing.
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


