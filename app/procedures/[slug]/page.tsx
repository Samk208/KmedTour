import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

import { Button } from '@/components/ui/button'
import { Clinic } from '@/lib/schemas/clinic'
import { Treatment } from '@/lib/schemas/treatment'

import cityProceduresData from '@/lib/data/city-procedures.json'
import clinicsData from '@/lib/data/clinics.json'
import mappingsData from '@/lib/data/mappings.json'
import treatmentsData from '@/lib/data/treatments.json'

import '@/app/styles/enhanced-content.css'

const BASE_URL = 'https://kmedtour.now'

const clinics = clinicsData as Clinic[]
const treatments = treatmentsData as Treatment[]
const mappings = mappingsData as { hospitalId: string; procedureId: string; verified?: boolean }[]
const cityProcedures = cityProceduresData as { city: string; citySlug: string; procedureSlug: string }[]

function getTreatmentBySlug(slug: string) {
  return treatments.find((t) => t.slug === slug)
}

function getHospitalsForProcedure(procedureId: string) {
  const hospitalIds = new Set(
    mappings.filter((m) => m.procedureId === procedureId).map((m) => m.hospitalId)
  )
  return clinics.filter((c) => hospitalIds.has(c.id))
}

function getCitiesForProcedure(procedureSlug: string) {
  const cities = cityProcedures.filter((c) => c.procedureSlug === procedureSlug)
  return cities.slice(0, 12)
}

function getProcedureImage(slug: string): string {
  const hasImage = ['rhinoplasty', 'double-eyelid-surgery', 'facelift'].includes(slug)
  return hasImage ? `/images/procedures/${slug}.png` : '/images/procedures/default.jpg'
}

function getGeneratedContent(slug: string): string | null {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'generated', 'procedures', `${slug}.md`)
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

function parseMarkdownContent(markdown: string): ContentSection[] {
  const sections: ContentSection[] = []
  const lines = markdown.split('\n')

  let currentSection: ContentSection | null = null
  let inTable = false
  let tableContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // H2 headings denote new sections
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
    // H3 subheadings
    else if (line.startsWith('### ')) {
      if (currentSection) {
        currentSection.content += `\n<h3>${line.replace('### ', '').trim()}</h3>\n`
      }
    }
    // Table detection
    else if (line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true
        tableContent = []
      }
      tableContent.push(line)
    }
    // Regular content
    else if (currentSection) {
      if (inTable && !line.trim().startsWith('|')) {
        currentSection.content += '\n<div class="table-wrapper">\n' + createHtmlTable(tableContent) + '\n</div>\n'
        tableContent = []
        inTable = false
      }
      currentSection.content += line + '\n'
    }
  }

  // Push final section
  if (currentSection) {
    if (inTable && tableContent.length > 0) {
      currentSection.content += '\n<div class="table-wrapper">\n' + createHtmlTable(tableContent) + '\n</div>\n'
    }
    sections.push(currentSection)
  }

  return sections
}

function extractFAQs(sections: ContentSection[]): FAQ[] {
  const faqs: FAQ[] = []

  const faqSection = sections.find(s => s.type === 'faq')
  if (!faqSection) return faqs

  const lines = faqSection.content.split('\n')
  let currentQuestion = ''
  let currentAnswer = ''

  for (const line of lines) {
    // H3 questions
    if (line.trim().startsWith('<h3>')) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.trim()
        })
      }
      // Start new question
      currentQuestion = line.replace(/<\/?h3>/g, '').trim()
      currentAnswer = ''
    } else if (currentQuestion && line.trim()) {
      currentAnswer += line + ' '
    }
  }

  // Save last Q&A
  if (currentQuestion && currentAnswer) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.trim()
    })
  }

  return faqs
}

function createHtmlTable(tableLines: string[]): string {
  if (tableLines.length < 2) return ''

  const headers = tableLines[0].split('|').filter(h => h.trim())
  // Skip separator line (index 1)
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
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="content-link">$1</a>')
    // Code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Bullets
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="content-list">$&</ul>')
}

function buildMetadata(proc: Treatment): Metadata {
  const imageUrl = `${BASE_URL}${getProcedureImage(proc.slug)}`

  return {
    title: `${proc.title} in Korea | Complete Guide, Costs, Top Hospitals 2026`,
    description: `Comprehensive guide to ${proc.title} in Korea. Compare costs, find KAHF-accredited hospitals, understand recovery timeline. Save 60-75% vs Western prices.`,

    // Absolute canonical URL
    alternates: {
      canonical: `${BASE_URL}/procedures/${proc.slug}`
    },

    // Enhanced Open Graph
    openGraph: {
      title: `${proc.title} in Korea | Complete Guide 2026`,
      description: `Everything you need to know about ${proc.title} in Korea - costs, recovery, top hospitals, and patient stories.`,
      url: `${BASE_URL}/procedures/${proc.slug}`,
      siteName: 'KmedTour',
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${proc.title} in Korea - Comprehensive Medical Guide`
        }
      ],
    },

    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title: `${proc.title} in Korea | Complete Guide 2026`,
      description: `Comprehensive guide to ${proc.title} - costs, recovery, top hospitals. Save 60-75% vs Western prices.`,
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

function ProcedureJsonLd(proc: Treatment, hospitals: Clinic[]) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: proc.title,
    procedureType: proc.category,
    estimatedCost: proc.priceRange,
    howPerformed: proc.shortDescription,
    provider: hospitals.slice(0, 5).map((h) => ({
      '@type': 'Hospital',
      name: h.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: h.location || 'South Korea',
      },
      accreditation: h.accreditations,
    })),
    url: `${BASE_URL}/procedures/${proc.slug}`,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function BreadcrumbJsonLd(proc: Treatment) {
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
        name: 'Procedures',
        item: `${BASE_URL}/procedures`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: proc.title,
        item: `${BASE_URL}/procedures/${proc.slug}`
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
  return treatments.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const treatment = getTreatmentBySlug(slug)
  if (!treatment) return {}
  return buildMetadata(treatment)
}

export default async function EnhancedProcedurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const treatment = getTreatmentBySlug(slug)
  if (!treatment) return notFound()

  const hospitals = getHospitalsForProcedure(treatment.id)
  const cities = getCitiesForProcedure(treatment.slug)
  const generatedContent = getGeneratedContent(slug)
  const contentSections = generatedContent ? parseMarkdownContent(generatedContent) : []
  const faqs = extractFAQs(contentSections)

  return (
    <div className="bg-[var(--cloud-white)] min-h-screen">
        {/* Hero Section */}
        <div className="relative text-white py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={getProcedureImage(treatment.slug)}
              alt={`${treatment.title} procedure - Patient consultation at KAHF-accredited hospital in Seoul, South Korea`}
              fill
              className="object-cover opacity-25"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--kmed-blue)] via-[var(--kmed-navy)] to-[var(--kmed-teal)] opacity-95" />
          </div>

          <div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 text-sm text-white/80">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/procedures" className="hover:text-white transition-colors">Procedures</Link>
              <span>/</span>
              <span className="text-white font-medium">{treatment.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
                {treatment.category || 'Medical Procedure'}
              </span>
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[var(--kmed-teal)]/40 backdrop-blur-sm">
                {treatment.priceRange}
              </span>
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/15 backdrop-blur-sm">
                ⭐ KAHF Accredited Hospitals
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
              {treatment.title} in Korea
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mb-8 leading-relaxed">
              {treatment.shortDescription || 'Comprehensive guide to costs, recovery timeline, top hospitals, and everything you need to know.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-[var(--kmed-blue)] hover:bg-white/90 font-semibold text-lg px-8" size="lg" asChild>
                <Link href="/patient-intake">Get Free Quote</Link>
              </Button>
              <Button variant="outline" className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-lg px-8" size="lg" asChild>
                <Link href="/treatment-advisor">Speak to Advisor</Link>
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
                <h2 className="text-center">Ready to Begin Your Journey?</h2>
                <p className="text-center text-lg mb-6">
                  Get matched with KAHF-accredited hospitals and receive a personalized treatment plan.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button className="bg-[var(--kmed-blue)] text-white hover:bg-[var(--kmed-navy)] font-semibold px-8" size="lg" asChild>
                    <Link href="/patient-intake">Request Consultation</Link>
                  </Button>
                  <Button variant="outline" className="border-2 border-[var(--kmed-blue)] text-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/5 font-semibold px-8" size="lg" asChild>
                    <Link href={`/hospitals?procedure=${treatment.slug}`}>View Hospitals</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Facts */}
              <div className="content-section sticky top-4">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>Quick Facts</h3>
                <div className="space-y-4">
                  <div className="pb-3 border-b border-[var(--border-grey)]">
                    <p className="text-sm text-[var(--deep-grey)] mb-1">Typical Cost</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--kmed-blue)' }}>
                      {treatment.priceRange}
                    </p>
                  </div>
                  <div className="pb-3 border-b border-[var(--border-grey)]">
                    <p className="text-sm text-[var(--deep-grey)] mb-1">Duration</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--kmed-blue)' }}>
                      {treatment.duration || 'Varies by case'}
                    </p>
                  </div>
                  <div className="pb-3 border-b border-[var(--border-grey)]">
                    <p className="text-sm text-[var(--deep-grey)] mb-1">Success Rate</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--kmed-blue)' }}>
                      {treatment.successRate || 'Consult surgeon'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--deep-grey)] mb-1">Accredited Hospitals</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--kmed-blue)' }}>
                      {hospitals.length}+ Available
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Hospitals */}
              <div className="content-section">
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>Top Hospitals</h3>
                <div className="space-y-3">
                  {hospitals.slice(0, 5).map((h) => (
                    <Link
                      key={h.id}
                      href={`/hospitals/${h.slug}`}
                      className="block p-3 rounded-lg border border-[var(--border-grey)] hover:border-[var(--kmed-blue)] hover:shadow-md transition-all"
                    >
                      <p className="font-semibold text-sm" style={{ color: 'var(--kmed-navy)' }}>
                        {h.name}
                      </p>
                      <p className="text-xs text-[var(--deep-grey)] mt-1">{h.location}</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--kmed-teal)' }}>
                        View Details →
                      </p>
                    </Link>
                  ))}
                </div>
                {hospitals.length > 5 && (
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/hospitals">View All {hospitals.length} Hospitals</Link>
                  </Button>
                )}
              </div>

              {/* Cities */}
              {cities.length > 0 && (
                <div className="content-section">
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>Available Cities</h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((c) => (
                      <Link
                        key={`${c.citySlug}-${c.procedureSlug}`}
                        href={`/${c.citySlug}/${c.procedureSlug}`}
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--soft-grey)] hover:bg-[var(--kmed-teal)] hover:text-white transition-colors"
                        style={{ color: 'var(--deep-grey)' }}
                      >
                        {c.city}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schema Markup */}
        {ProcedureJsonLd(treatment, hospitals)}
        {BreadcrumbJsonLd(treatment)}
        {FAQPageJsonLd(faqs)}
      </div>
  )
}



