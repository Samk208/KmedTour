'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'white' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center space-y-8 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--kmed-blue) 0%, var(--kmed-teal) 100%)',
          }}
        >
          {/* Abstract techno-shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-4 border-white"></div>
          </div>

          <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance">
            Experience the Future of Medical Travel
          </h2>

          <p className="relative text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Let our operating system handle the logistics while you focus on recovery.
            Instant matching, transparent pricing, and full concierge automation.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/patient-intake">
              <Button
                size="lg"
                className="text-base px-8 py-7 bg-white hover:bg-white/90 shadow-lg text-[var(--kmed-blue)] font-bold"
              >
                Start Digital Intake
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-7 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Contact Support
              </Button>
            </Link>
          </div>

          <div className="relative flex flex-wrap justify-center gap-8 pt-8 text-white/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">24/7 System Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

