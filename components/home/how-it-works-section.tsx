'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ClipboardList, Cpu, Plane, ShieldCheck } from 'lucide-react'
import { useRef } from 'react'

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Track scroll progress for drawing the line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  // Transform scroll progress to line height (0% to 100%)
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  const steps = [
    {
      icon: ClipboardList,
      title: 'Digital Intake',
      description: 'Upload your medical history via our secure portal. Our AI extracts key data instantly.',
      color: 'var(--kmed-blue)',
    },
    {
      icon: Cpu,
      title: 'Intelligent Matching',
      description: 'Our algorithms rank 50+ clinics against your outcome needs, budget, and urgency.',
      color: 'var(--kmed-teal)',
    },
    {
      icon: Plane,
      title: 'Logistics Orchestration',
      description: 'We automate visa letters, flight bookings, and hotel arrangements in one workflow.',
      color: 'var(--kmed-blue)',
    },
    {
      icon: ShieldCheck,
      title: 'Concierge Recovery',
      description: 'From airport pickup to post-op checkups, our operating system tracks every step.',
      color: 'var(--kmed-teal)',
    },
  ]

  return (
    <section ref={containerRef} className="w-full py-20 md:py-32 relative overflow-hidden" style={{ backgroundColor: 'white' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}>
            System Workflow
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
            Intelligent Medical Orchestration
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
            We replace manual coordination with automated precision.
          </p>
        </div>

        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 w-full h-1 bg-gray-100 -z-10">
            <motion.div
              style={{ width: lineHeight }}
              className="h-full bg-[var(--kmed-blue)] origin-left"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative flex flex-col items-center text-center space-y-4 group hover:transform hover:translate-y-[-5px] transition-transform duration-300"
            >
              {/* Step Number Badge */}
              <div
                className="absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md z-10"
                style={{ backgroundColor: step.color }}
              >
                {index + 1}
              </div>

              {/* Icon Container with subtle animation */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <step.icon className="h-8 w-8" style={{ color: step.color }} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                {step.description}
              </p>

              {/* Connector Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-[2px] bg-gray-100" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


