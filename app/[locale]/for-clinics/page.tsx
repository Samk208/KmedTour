'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, CheckCircle, Globe, Shield, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function ForClinicsPage() {
  const { t } = useTranslation()
  const benefits = [
    {
      icon: Users,
      title: t('forClinicsPage.benefits.items.item1.title') || 'Access African Market',
      description: t('forClinicsPage.benefits.items.item1.description') || 'Connect with thousands of qualified patients from Africa seeking quality medical care.',
    },
    {
      icon: TrendingUp,
      title: t('forClinicsPage.benefits.items.item2.title') || 'Increase Revenue',
      description: t('forClinicsPage.benefits.items.item2.description') || 'Grow your international patient volume with our verified lead generation system.',
    },
    {
      icon: Globe,
      title: t('forClinicsPage.benefits.items.item3.title') || 'Marketing Support',
      description: t('forClinicsPage.benefits.items.item3.description') || 'Get featured on our platform, content hub, and marketing campaigns to African audiences.',
    },
    {
      icon: Shield,
      title: t('forClinicsPage.benefits.items.item4.title') || 'Quality Patients',
      description: t('forClinicsPage.benefits.items.item4.description') || 'Receive pre-qualified patients who have been screened for suitability and budget.',
    },
  ]

  const features = [
    t('forClinicsPage.features.items.item1') || 'Featured placement on Kmedtour platform',
    t('forClinicsPage.features.items.item2') || 'Patient referrals matching your specialties',
    t('forClinicsPage.features.items.item3') || 'Dedicated account manager',
    t('forClinicsPage.features.items.item4') || 'Translation and coordination support',
    t('forClinicsPage.features.items.item5') || 'Marketing to African markets',
    t('forClinicsPage.features.items.item6') || 'Patient feedback and reviews',
    t('forClinicsPage.features.items.item7') || 'Payment processing support',
    t('forClinicsPage.features.items.item8') || 'Performance analytics dashboard',
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--kmed-navy)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
              {t('forClinicsPage.hero.title') || "Partner with Kmedtour to Grow Your International Practice"}
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {t('forClinicsPage.hero.subtitle') || "Join Korea's leading medical tourism platform connecting top clinics with qualified African patients seeking world-class care."}
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-[var(--kmed-teal)] hover:bg-[var(--kmed-teal)]/90 text-white">
                {t('forClinicsPage.hero.button') || "Become a Partner"}
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
              {t('forClinicsPage.benefits.title') || "Why Partner with Kmedtour?"}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
              {t('forClinicsPage.benefits.subtitle') || "We handle patient acquisition, screening, and logistics so you can focus on providing excellent care."}
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
                {t('forClinicsPage.features.title') || "What You Get as a Partner Clinic"}
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                {t('forClinicsPage.features.subtitle') || "Our comprehensive partnership program provides everything you need to successfully serve international patients from Africa."}
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
                {t('forClinicsPage.requirements.title') || "Partnership Requirements"}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    {t('forClinicsPage.requirements.items.item1.title') || "Accreditation"}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    {t('forClinicsPage.requirements.items.item1.description') || "JCI, ISO, or equivalent international healthcare accreditation"}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    {t('forClinicsPage.requirements.items.item2.title') || "Language Support"}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    {t('forClinicsPage.requirements.items.item2.description') || "English-speaking staff or translation services for international patients"}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    {t('forClinicsPage.requirements.items.item3.title') || "International Experience"}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    {t('forClinicsPage.requirements.items.item3.description') || "Experience treating international patients with proven track record"}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    {t('forClinicsPage.requirements.items.item4.title') || "Transparency"}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    {t('forClinicsPage.requirements.items.item4.description') || "Clear pricing, success rates, and willingness to provide detailed information"}
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
              {t('forClinicsPage.cta.title') || "Ready to Expand Your International Practice?"}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
              {t('forClinicsPage.cta.subtitle') || "Join leading Korean clinics already partnering with Kmedtour to serve African patients."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white">
                  {t('forClinicsPage.cta.primaryBtn') || "Schedule a Call"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/content">
                <Button size="lg" variant="outline">
                  {t('forClinicsPage.cta.secondaryBtn') || "Learn More"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
