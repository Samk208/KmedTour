'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InfiniteMarquee } from '@/components/ui/infinite-marquee'
import { Activity, Cpu, Database, Globe, Heart, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Verified Excellence',
      description: 'We strictly vet every clinic against the highest international standards (JCI, K-Health).',
    },
    {
      icon: Cpu,
      title: 'Digital Precision',
      description: 'Our proprietary Medical OS organizes your entire journey with algorithmic efficiency.',
    },
    {
      icon: Heart,
      title: 'Human Touch',
      description: 'While our tech is advanced, our care is personal. Dedicated coordinators for every patient.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Democratizing access to Korea\'s elite medical infrastructure for patients worldwide.',
    },
  ]

  const stats = [
    { number: '500+', label: 'Successful Journeys' },
    { number: '50+', label: 'Elite Partners' },
    { number: '20+', label: 'Countries Served' },
    { number: '99%', label: 'Systems Uptime' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden bg-[#0a0f1c]">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#39c6b0 1px, transparent 1px), linear-gradient(90deg, #39c6b0 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="container relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-mono mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            SYSTEM ONLINE: KMED-OS V2.0
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight text-balance">
            The Operating System for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Global Medical Travel</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            KmedTour upgrades the medical tourism experience from a chaotic logistical challenge into a seamless, digital workflow. We connect the world to Korea's medical future.
          </p>
        </div>
      </section>

      <InfiniteMarquee />

      {/* Mission Section */}
      <section className="w-full py-24">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-teal-600 font-bold tracking-wider text-sm uppercase">Our Mission</div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Decoding Complex Care
                </h2>
              </div>

              <div className="prose prose-lg text-slate-600">
                <p>
                  Medical travel has historically been fragmented, opaque, and risky. Patients worldwide struggle to find trustworthy prices, verified doctors, and safe logistics.
                </p>
                <p>
                  We built KmedTour not just as an agency, but as a <span className="text-teal-700 font-semibold">technology platform</span>. By digitizing the patient journey—from AI-powered matching to secure digital health records—we eliminate friction and restore trust.
                </p>
                <p>
                  Today, we serve patients from North America, Europe, Asia, and beyond, proving that high-quality healthcare knows no borders.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Activity className="w-5 h-5 text-teal-500" /> Data-Driven
                  </div>
                  <p className="text-sm text-slate-500">Treatments based on clinical outcomes, not marketing.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Database className="w-5 h-5 text-blue-500" /> Transparent
                  </div>
                  <p className="text-sm text-slate-500">Clear pricing and direct hospital billing access.</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-2xl transform rotate-3 group-hover:rotate-2 transition-transform duration-500 opacity-20 blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white">
                <div className="bg-slate-100 p-2 border-b flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="aspect-video bg-slate-50 relative flex items-center justify-center">
                  {/* Abstract Representation of "The OS" */}
                  <div className="grid grid-cols-2 gap-4 w-3/4 opacity-80">
                    <div className="h-24 bg-white rounded-lg shadow-sm border p-4">
                      <div className="w-8 h-8 bg-teal-100 rounded mb-2"></div>
                      <div className="h-2 w-20 bg-slate-100 rounded"></div>
                      <div className="h-2 w-12 bg-slate-100 rounded mt-2"></div>
                    </div>
                    <div className="h-24 bg-white rounded-lg shadow-sm border p-4">
                      <div className="w-8 h-8 bg-blue-100 rounded mb-2"></div>
                      <div className="h-2 w-20 bg-slate-100 rounded"></div>
                      <div className="h-2 w-12 bg-slate-100 rounded mt-2"></div>
                    </div>
                    <div className="col-span-2 h-16 bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded"></div>
                        <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="w-full py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Architecture</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Our operating principles for a flawless medical journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-slate-200">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600"
                >
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="w-full py-24 bg-[#0a0f1c] text-white">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center border-t border-white/10 pt-12">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-teal-500 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-24">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Initialize Your Journey
              </h2>
              <p className="text-lg text-teal-100">
                Use our AI Treatment Advisor or browse our curated network of clinics to begin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/treatment-advisor">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 border-0 w-full sm:w-auto font-bold">
                    <Sparkles className="w-4 h-4 mr-2" /> Ask AI Advisor
                  </Button>
                </Link>
                <Link href="/patient-intake">
                  <Button size="lg" variant="outline" className="border-teal-200 text-teal-100 hover:bg-teal-700/50 hover:text-white w-full sm:w-auto">
                    Start Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import { Sparkles } from 'lucide-react'

