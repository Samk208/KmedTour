'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Shield, Heart, Users, Globe, Target, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every clinic is thoroughly vetted for quality, safety, and international accreditation standards.',
    },
    {
      icon: Heart,
      title: 'Patient-First',
      description: 'Your health and wellbeing are our top priorities. We provide comprehensive support throughout your journey.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our team of medical coordinators and healthcare professionals guides you every step of the way.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Connecting African patients with world-class Korean medical facilities and specialists.',
    },
  ]

  const stats = [
    { number: '500+', label: 'Patients Helped' },
    { number: '50+', label: 'Partner Clinics' },
    { number: '15+', label: 'Countries Served' },
    { number: '98%', label: 'Satisfaction Rate' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--kmed-navy)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
              Making World-Class Healthcare Accessible to Africa
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Kmedtour bridges the gap between African patients seeking quality medical care and Korea&apos;s world-renowned healthcare system.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="w-full py-20" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--soft-grey)' }}>
                <Target className="h-4 w-4" style={{ color: 'var(--kmed-blue)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--kmed-blue)' }}>Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                Transforming Medical Tourism for African Patients
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                We started Kmedtour after witnessing countless African patients struggle with finding trustworthy medical options abroad. The lack of transparency, high costs, and complex logistics created barriers to accessing life-changing treatments.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                Today, we&apos;re proud to be the leading medical tourism platform connecting Africa with Korea&apos;s advanced healthcare system, providing end-to-end support that makes medical travel simple, safe, and affordable.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Kmedtour team"
                width={600}
                height={500}
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--soft-grey)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              Our Values
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center bg-white border-[var(--border-grey)]">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--kmed-blue)' }}
                >
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--kmed-navy)' }}>
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--kmed-blue)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-5xl font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-lg text-white/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--soft-grey)' }}>
              <Award className="h-4 w-4" style={{ color: 'var(--kmed-teal)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--kmed-teal)' }}>Join Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
              Ready to Experience World-Class Care?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
              Let us help you find the perfect clinic and guide you through your medical journey to Korea.
            </p>
            <Link href="/patient-intake">
              <Button size="lg" className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
