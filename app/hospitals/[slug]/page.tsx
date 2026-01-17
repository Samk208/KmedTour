import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

import { Button } from '@/components/ui/button'
import { Clinic } from '@/lib/schemas/clinic'
import { Treatment } from '@/lib/schemas/treatment'

import clinicsData from '@/lib/data/clinics.json'
import mappingsData from '@/lib/data/mappings.json'
import treatmentsData from '@/lib/data/treatments.json'

import '@/app/styles/enhanced-content.css'

const BASE_URL = 'https://kmedtour.now'

const clinics = clinicsData as Clinic[]
const treatments = treatmentsData as Treatment[]
const mappings = mappingsData as { hospitalId: string; procedureId: string; verified?: boolean }[]

function getClinicBySlug(slug: string) {
  return clinics.find((clinic) => clinic.slug === slug)
}

function getProceduresForHospital(hospitalId: string) {
  const procedureIds = new Set(
    mappings.filter((m) => m.hospitalId === hospitalId).map((m) => m.procedureId)
  )
  return treatments.filter((t) => procedureIds.has(t.id))
}

function getHospitalImage(slug: string): string {
  const hasImage = [
    'asan-medical-center',
    'banobagi-plastic-surgery-clinic',
    'cha-university-fertility-center-seoul-station'
  ].includes(slug)
  return hasImage ? `/images/hospitals/${slug}.png` : '/images/hospitals/default.jpg'
}

function getGeneratedContent(slug: string): string | null {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'generated', 'hospitals', `${slug}.md`)
    if (fs.existsSync(contentPath)) {
      return fs.readFileSync(contentPath, 'utf-8')
    }
  } catch (error) {
    console.error('Error reading generated content:', error)
  }
  return null
}

interface ContentSection {
  title: string
  content: string
  type: 'intro' | 'section' | 'table' | 'list' | 'faq' | 'disclaimer'
}

interface FAQ {
  question: string
  answer: string
}

function extractFAQs(sections: ContentSection[]): FAQ[] {
  const faqs: FAQ[] = []

  const faqSection = sections.find(s => s.type === 'faq')
  if (!faqSection) return faqs

  const lines = faqSection.content.split('\n')
  let currentQuestion = ''
  let currentAnswer = ''

  for (const line of lines) {
    if (line.trim().startsWith('<h3>')) {
      if (currentQuestion && currentAnswer) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.trim()
        })
      }
      currentQuestion = line.replace(/<\/?h3>/g, '').trim()
      currentAnswer = ''
    } else if (currentQuestion && line.trim()) {
      currentAnswer += line + ' '
    }
  }

  if (currentQuestion && currentAnswer) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.trim()
    })
  }

  return faqs
}

function parseMarkdownContent(markdown: string): ContentSection[] {
  const sections: ContentSection[] = []
  const lines = markdown.split('\n')

  let currentSection: ContentSection | null = null
  let inTable = false
  let tableContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection)
      }
      if (inTable && tableContent.length > 0) {
        currentSection!.content += '\n' + tableContent.join('\n')
        tableContent = []
        inTable = false
      }

      const title = line.replace('## ', '').trim()
      const isFAQ = title.toLowerCase().includes('faq') || title.toLowerCase().includes('question')
      const isDisclaimer = title.toLowerCase().includes('disclaimer')

      currentSection = {
        title,
        content: '',
        type: isDisclaimer ? 'disclaimer' : isFAQ ? 'faq' : 'section'
      }
    }
    else if (line.startsWith('### ')) {
      if (currentSection) {
        currentSection.content += `\n<h3>${line.replace('### ', '').trim()}</h3>\n`
      }
    }
    else if (line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true
        tableContent = []
      }
      tableContent.push(line)
    }
    else if (currentSection) {
      if (inTable && !line.trim().startsWith('|')) {
        currentSection.content += '\n<div class="table-wrapper">\n' + createHtmlTable(tableContent) + '\n</div>\n'
        tableContent = []
        inTable = false
      }
      currentSection.content += line + '\n'
    }
  }

  if (currentSection) {
    if (inTable && tableContent.length > 0) {
      currentSection.content += '\n<div class="table-wrapper">\n' + createHtmlTable(tableContent) + '\n</div>\n'
    }
    sections.push(currentSection)
  }

  return sections
}

function createHtmlTable(tableLines: string[]): string {
  if (tableLines.length < 2) return ''

  const headers = tableLines[0].split('|').filter(h => h.trim())
  const rows = tableLines.slice(2).map(line =>
    line.split('|').filter(cell => cell.trim())
  )

  let html = '<table class="content-table">\n<thead>\n<tr>\n'
  headers.forEach(header => {
    html += `<th>${header.trim()}</th>\n`
  })
  html += '</tr>\n</thead>\n<tbody>\n'

  rows.forEach(row => {
    html += '<tr>\n'
    row.forEach(cell => {
      html += `<td>${cell.trim()}</td>\n`
    })
    html += '</tr>\n'
  })

  html += '</tbody>\n</table>'
  return html
}

function formatMarkdownText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="content-link">$1</a>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="content-list">$&</ul>')
}

function buildMetadata(clinic: Clinic): Metadata {
  const city = clinic.location || 'South Korea'
  const imageUrl = `${BASE_URL}${clinic.imageUrl || getHospitalImage(clinic.slug)}`

  return {
    title: `${clinic.name} | Complete Guide - KAHF Accredited Hospital ${city} 2026`,
    description: `Comprehensive guide to ${clinic.name} - services, specialties, international patient support, costs, and everything you need to know.`,

    // Absolute canonical URL
    alternates: {
      canonical: `${BASE_URL}/hospitals/${clinic.slug}`
    },

    // Enhanced Open Graph
    openGraph: {
      title: `${clinic.name} | KAHF Accredited Hospital in ${city}`,
      description: `Discover ${clinic.name} - accredited care, international services, and comprehensive patient support.`,
      url: `${BASE_URL}/hospitals/${clinic.slug}`,
      siteName: 'KmedTour',
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${clinic.name} - KAHF/KOIHA Accredited Hospital in ${city}`
        }
      ],
    },

    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title: `${clinic.name} | KAHF Accredited Hospital 2026`,
      description: `Comprehensive guide to ${clinic.name} - services, specialties, and international patient support.`,
      images: [imageUrl],
      creator: '@KmedTour',
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

function HospitalJsonLd(clinic: Clinic, procedures: Treatment[]) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: clinic.name,
    description: clinic.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: clinic.location || 'South Korea',
      addressCountry: 'KR'
    },
    medicalSpecialty: clinic.specialties,
    areaServed: clinic.location,
    accreditation: clinic.accreditations,
    availableService: procedures.slice(0, 10).map((p) => ({
      '@type': 'MedicalProcedure',
      name: p.title,
    })),
    url: `${BASE_URL}/hospitals/${clinic.slug}`,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function BreadcrumbJsonLd(clinic: Clinic) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Hospitals',
        item: `${BASE_URL}/hospitals`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: clinic.name,
        item: `${BASE_URL}/hospitals/${clinic.slug}`
      }
    ]
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function FAQPageJsonLd(faqs: FAQ[]) {
  if (faqs.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export async function generateStaticParams() {
  return clinics.map((clinic) => ({ slug: clinic.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const clinic = getClinicBySlug(slug)
  if (!clinic) return {}
  return buildMetadata(clinic)
}

export default async function EnhancedHospitalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const clinic = getClinicBySlug(slug)
  if (!clinic) return notFound()

  const procedures = getProceduresForHospital(clinic.id)
  const generatedContent = getGeneratedContent(slug)
  const contentSections = generatedContent ? parseMarkdownContent(generatedContent) : []
  const faqs = extractFAQs(contentSections)

  return (
    <div className="bg-[var(--cloud-white)] min-h-screen">
        {/* Hero Section */}
        <div className="relative text-white py-28 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={clinic.imageUrl || getHospitalImage(clinic.slug)}
              alt={`${clinic.name} - KAHF/KOIHA Accredited Hospital in ${clinic.location || 'South Korea'} - International patient facilities`}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--kmed-blue)] via-[var(--kmed-cyan)]/90 to-[var(--kmed-navy)] opacity-92" />
          </div>

          <div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 text-sm text-white/80">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/hospitals" className="hover:text-white transition-colors">Hospitals</Link>
              <span>/</span>
              <span className="text-white font-medium">{clinic.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-5">
              {clinic.accreditations?.map((acc) => (
                <span
                  key={acc}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm"
                >
                  {acc}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight drop-shadow-lg">
              {clinic.name}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mb-3 leading-relaxed">
              {clinic.location && <span className="font-semibold">📍 {clinic.location}</span>}
            </p>
            <p className="text-lg text-white/90 max-w-3xl mb-8">
              International patient support via KmedTour concierge. KAHF/KOIHA accredited facility with comprehensive medical services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-[var(--kmed-blue)] hover:bg-white/90 font-semibold text-lg px-8" size="lg" asChild>
                <Link href="/patient-intake">Request Consultation</Link>
              </Button>
              <Button variant="outline" className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-lg px-8" size="lg" asChild>
                <Link href="/treatment-advisor">Talk to Advisor</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {contentSections.map((section, index) => (
                <div
                  key={index}
                  className={`content-section ${section.type === 'faq' ? 'faq-section' : ''} ${section.type === 'disclaimer' ? 'disclaimer-section' : ''}`}
                >
                  <h2>{section.title}</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdownText(section.content)
                    }}
                  />
                </div>
              ))}

              {/* CTA Section */}
              <div className="content-section bg-gradient-to-br from-[var(--kmed-blue)]/5 to-[var(--kmed-teal)]/5 border-2 border-[var(--kmed-blue)]/20">
                <h2 className="text-center">Ready to Begin Your Care Journey?</h2>
                <p className="text-center text-lg mb-6">
                  Connect with {clinic.name} through KmedTour's concierge service for personalized support.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button className="bg-[var(--kmed-blue)] text-white hover:bg-[var(--kmed-navy)] font-semibold px-8" size="lg" asChild>
                    <Link href="/patient-intake">Request Appointment</Link>
                  </Button>
                  <Button variant="outline" className="border-2 border-[var(--kmed-blue)] text-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/5 font-semibold px-8" size="lg" asChild>
                    <Link href="/hospitals">Compare Hospitals</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Hospital Info */}
              <div className="content-section sticky top-4">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>Hospital Info</h3>
                <div className="space-y-4">
                  {clinic.location && (
                    <div className="pb-3 border-b border-[var(--border-grey)]">
                      <p className="text-sm text-[var(--deep-grey)] mb-1">Location</p>
                      <p className="text-base font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                        {clinic.location}
                      </p>
                    </div>
                  )}
                  {clinic.specialties && clinic.specialties.length > 0 && (
                    <div className="pb-3 border-b border-[var(--border-grey)]">
                      <p className="text-sm text-[var(--deep-grey)] mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1.5">
                        {clinic.specialties.slice(0, 5).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded text-xs font-medium bg-[var(--soft-grey)]"
                            style={{ color: 'var(--kmed-navy)' }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pb-3">
                    <p className="text-sm text-[var(--deep-grey)] mb-1">Available Procedures</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--kmed-blue)' }}>
                      {procedures.length}+ Treatments
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Procedures */}
              <div className="content-section">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>Available Procedures</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {procedures.slice(0, 12).map((proc) => (
                    <Link
                      key={proc.id}
                      href={`/procedures/${proc.slug}`}
                      className="block p-3 rounded-lg border border-[var(--border-grey)] hover:border-[var(--kmed-blue)] hover:shadow-md transition-all"
                    >
                      <p className="font-semibold text-sm" style={{ color: 'var(--kmed-navy)' }}>
                        {proc.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--kmed-teal)' }}>
                        {proc.priceRange}
                      </p>
                    </Link>
                  ))}
                </div>
                {procedures.length > 12 && (
                  <p className="text-sm text-[var(--deep-grey)] mt-4 text-center">
                    +{procedures.length - 12} more procedures available
                  </p>
                )}
              </div>

              {/* Contact CTA */}
              <div className="content-section bg-gradient-to-br from-[var(--kmed-teal)]/10 to-[var(--kmed-blue)]/10">
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--kmed-navy)' }}>Need Help?</h3>
                <p className="text-sm text-[var(--deep-grey)] mb-4">
                  Our concierge team is ready to assist with appointments, quotes, and travel planning.
                </p>
                <Button className="w-full bg-[var(--kmed-blue)] text-white hover:bg-[var(--kmed-navy)]" asChild>
                  <Link href="/treatment-advisor">Talk to an Advisor</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Schema Markup */}
        {HospitalJsonLd(clinic, procedures)}
        {BreadcrumbJsonLd(clinic)}
        {FAQPageJsonLd(faqs)}
      </div>
  )
}



