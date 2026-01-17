'use client'

import { ProtocolStep } from '@/components/how-it-works/protocol-step'
import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ParticleNetwork } from '@/components/ui/particle-network'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Database, HeartPulse, Lock, Plane, Server, ShieldCheck, UserCheck } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--cloud-white)] font-sans selection:bg-[var(--kmed-teal)] selection:text-white">

      {/* HERO: System Architecture */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden bg-[var(--kmed-navy)] text-white">
        <div className="absolute inset-0 opacity-20">
          <ParticleNetwork />
        </div>

        {/* Abstract Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="container relative mx-auto max-w-[1240px] px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-mono tracking-wider text-[var(--kmed-teal)]">
              <div className="w-2 h-2 rounded-full bg-[var(--kmed-teal)] animate-pulse" />
              Operational Protocol v2.4
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--kmed-teal)] to-blue-400">Architecture</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              KmedTour is not a travel agency. It is a vertically integrated operating system that orchestrates medical data, logistics, and financial transactions into a single secure workflow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MAIN PROTOCOL TIMELINE */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto max-w-[1000px] px-4 space-y-24">

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-sm font-mono font-bold tracking-[0.2em] text-[var(--kmed-navy)] uppercase mb-4">Execution Sequence</h2>
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-gray-200 mx-auto" />
          </motion.div>

          <div className="space-y-0 relative">
            <ProtocolStep
              number="01"
              title="Data Ingestion & Analysis"
              description="Submit your medical history via our HIPAA-compliant portal. Our AI extracts key biomarkers and structuring unstructured data for specialist review."
              icon={Database}
              align="left"
            />
            <ProtocolStep
              number="02"
              title="Algorithmic Matching"
              description="Our matching engine queries 50+ verfied clinics, ranking them by survival rates, equipment specificity, and surgeon volume for your condition."
              icon={Server}
              align="right"
            />
            <ProtocolStep
              number="03"
              title="Consultation & Verification"
              description="Engage in encrypted video consultations with shortlisted surgeons. Receive a verified treatment plan with guaranteed line-item pricing."
              icon={UserCheck}
              align="left"
            />
            <ProtocolStep
              number="04"
              title="Logistics Orchestration"
              description="Once confirmed, the system auto-generates visa invitation letters, books medical transport, and reserves recovery accommodation."
              icon={Plane}
              align="right"
            />
            <ProtocolStep
              number="05"
              title="Clinical Execution"
              description="Arrive at the facility. Your dedicated concierge ensures all check-in administrative protocols are pre-cleared."
              icon={Building2}
              align="left"
            />
            <ProtocolStep
              number="06"
              title="Recovery Protocol"
              description="Post-op monitoring via our app. Virtual check-ins ensures stable recovery before your return flight."
              icon={HeartPulse}
              isLast={true}
              align="right"
            />
          </div>

        </div>
      </section>

      {/* SECURITY CORE */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-[1240px] px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-[var(--kmed-blue)] font-bold mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span>Security Core</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--kmed-navy)]">Bank-Grade Encryption for Your Medical Data</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We treat your medical records with the same rigor as financial transactions. Our infrastructure is built on private, encrypted channels.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "End-to-end encryption for all documents",
                  "HIPAA & GDPR compliant data handling",
                  "Ephemeral data access for clinics",
                  "Audit logs for every record access"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--kmed-teal)]" />
                    <span className="font-medium text-[var(--kmed-navy)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Element: Minimalist Lock Graphic */}
            <div className="relative h-[400px] bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
              <div className="relative z-10 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  className="w-32 h-32 rounded-full bg-[var(--kmed-blue)]/10 flex items-center justify-center mx-auto"
                >
                  <Lock className="w-12 h-12 text-[var(--kmed-blue)]" />
                </motion.div>
                <div className="text-sm font-mono text-gray-400">STATUS: SECURE</div>
                <div className="text-xs font-mono text-gray-300">AES-256 ENCRYPTION ACTIVE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA: Initialize System */}
      <section className="py-20 bg-[var(--kmed-navy)] text-center">
        <div className="container mx-auto max-w-[800px] px-4 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white">Ready to Initialize?</h2>
          <p className="text-lg text-gray-400">Start the intake protocol. It takes less than 10 minutes to ingest your requirements.</p>
          <div className="flex justify-center">
            <Link href="/patient-intake">
              <MagneticButton>
                <Button size="lg" className="bg-[var(--kmed-teal)] hover:bg-[var(--kmed-teal)]/90 text-white px-10 py-8 text-lg font-bold shadow-[0_0_20px_rgba(57,198,176,0.3)]">
                  Start Digital Intake
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
