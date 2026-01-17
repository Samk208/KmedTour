'use client'

import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ParticleNetwork } from '@/components/ui/particle-network'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Database, Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden" style={{ backgroundColor: 'var(--cloud-white)' }}>
      {/* Background Elements */}
      <ParticleNetwork />
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[var(--kmed-teal)] blur-3xl" />
        <div className="absolute bottom-10 right-1/2 w-96 h-96 rounded-full bg-[var(--kmed-blue)] blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border bg-white/50 backdrop-blur-sm"
              style={{
                borderColor: 'var(--kmed-teal)',
                color: 'var(--kmed-teal)'
              }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--kmed-teal)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--kmed-teal)]"></span>
              </span>
              Deep Tech Medical Infrastructure
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance tracking-tight" style={{ color: 'var(--kmed-navy)' }}>
              The Operating System for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--kmed-blue)] to-[var(--kmed-teal)]">Medical Journey</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed max-w-2xl font-light" style={{ color: 'var(--deep-grey)' }}>
              We orchestrate your entire medical outcome. From AI-powered specialist matching to automated visa logistics and recovery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/patient-intake">
                <MagneticButton>
                  <Button
                    size="lg"
                    className="text-base px-8 py-7 bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Digital Intake
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </MagneticButton>
              </Link>

              <Link href="/how-it-works">
                <MagneticButton strength={0.2}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 py-7 border-2 hover:bg-white bg-white/50 backdrop-blur-sm"
                    style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}
                  >
                    View Workflow
                  </Button>
                </MagneticButton>
              </Link>
            </div>

            {/* Tech-Forward Stats */}
            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-gray-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-gray-400">
                  <Bot className="w-4 h-4" />
                  Automation
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>85%</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-gray-400">
                  <Database className="w-4 h-4" />
                  Data Points
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>10k+</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-gray-400">
                  <Globe className="w-4 h-4" />
                  Reach
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>Global</div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual: Abstract "Dashboard" or "Network" Concept */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
              {/* Use the existing image but frame it as "Infrastructure" */}
              <Image
                src="/modern-medical-clinic-in-korea-with-professional-s.jpg"
                alt="Medical Infrastructure"
                width={700}
                height={500}
                className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--kmed-navy)]/60 to-transparent pointer-events-none" />

              {/* Floating "System Status" Cards */}
              <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-[var(--kmed-navy)]">Matching Algorithm Active</span>
                  </div>
                  <span className="text-xs text-[var(--deep-grey)] font-mono">23ms</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[var(--kmed-blue)]" />
                    <span className="text-sm font-medium text-[var(--kmed-navy)]">Real-time Capacity Check</span>
                  </div>
                  <span className="text-xs text-[var(--deep-grey)] font-mono">Synced</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
