'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Globe, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ForClinicsPage() {
  const benefits = [
    {
      icon: Users,
      title: 'Access African Market',
      description: 'Connect with thousands of qualified patients from Africa seeking quality medical care.',
    },
    {
      icon: TrendingUp,
      title: 'Increase Revenue',
      description: 'Grow your international patient volume with our verified lead generation system.',
    },
    {
      icon: Globe,
      title: 'Marketing Support',
      description: 'Get featured on our platform, content hub, and marketing campaigns to African audiences.',
    },
    {
      icon: Shield,
      title: 'Quality Patients',
      description: 'Receive pre-qualified patients who have been screened for suitability and budget.',
    },
  ]

  const features = [
    'Featured placement on Kmedtour platform',
    'Patient referrals matching your specialties',
    'Dedicated account manager',
    'Translation and coordination support',
    'Marketing to African markets',
    'Patient feedback and reviews',
    'Payment processing support',
    'Performance analytics dashboard',
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--kmed-navy)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
              Partner with Kmedtour to Grow Your International Practice
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Join Korea&apos;s leading medical tourism platform connecting top clinics with qualified African patients seeking world-class care.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-[var(--kmed-teal)] hover:bg-[var(--kmed-teal)]/90 text-white">
                Become a Partner
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full py-20" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              Why Partner with Kmedtour?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
              We handle patient acquisition, screening, and logistics so you can focus on providing excellent care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center bg-white border-[var(--border-grey)] hover:shadow-lg transition-shadow">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--kmed-blue)' }}
                >
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--kmed-navy)' }}>
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--soft-grey)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                What You Get as a Partner Clinic
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                Our comprehensive partnership program provides everything you need to successfully serve international patients from Africa.
              </p>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--kmed-teal)' }} />
                    <span className="text-base" style={{ color: 'var(--deep-grey)' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 bg-white border-[var(--border-grey)]">
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--kmed-navy)' }}>
                Partnership Requirements
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Accreditation
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    JCI, ISO, or equivalent international healthcare accreditation
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Language Support
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    English-speaking staff or translation services for international patients
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    International Experience
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    Experience treating international patients with proven track record
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Transparency
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    Clear pricing, success rates, and willingness to provide detailed information
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
              Ready to Expand Your International Practice?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
              Join leading Korean clinics already partnering with Kmedtour to serve African patients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white">
                  Schedule a Call
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/content">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
