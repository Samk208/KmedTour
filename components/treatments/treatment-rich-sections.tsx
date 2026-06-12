import Image from 'next/image'
import { Fragment } from 'react'

export type TreatmentFaq = { q: string; a: string }
export type TreatmentReference = { label: string; url: string }
export type TreatmentImage = { src: string; alt: string; credit?: string }

export type TreatmentRichContent = {
  slug: string
  shortDescription: string
  sections: {
    overview: string
    candidacy: string
    procedure_steps: string
    recovery_timeline: string
    cost_breakdown: string
    why_korea: string
  }
  faqs: TreatmentFaq[]
  references?: TreatmentReference[]
  images?: TreatmentImage[]
}

const SECTION_ORDER: { key: keyof TreatmentRichContent['sections']; title: string }[] = [
  { key: 'overview', title: 'Overview' },
  { key: 'candidacy', title: 'Am I a Candidate?' },
  { key: 'procedure_steps', title: 'How the Procedure Works' },
  { key: 'recovery_timeline', title: 'Recovery Timeline' },
  { key: 'cost_breakdown', title: 'Cost Breakdown' },
  { key: 'why_korea', title: 'Why Korea' },
]

// Interleave inline images after these sections (image[0] after overview, etc.)
const IMAGE_AFTER: Record<string, number> = {
  overview: 0,
  procedure_steps: 1,
  recovery_timeline: 2,
}

function InlineImage({ image }: { image: TreatmentImage }) {
  return (
    <figure className="my-8">
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-[var(--border-grey)]">
        <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
      </div>
      {image.credit && (
        <figcaption className="mt-2 text-xs text-[var(--deep-grey)]">Photo: {image.credit} / Pexels</figcaption>
      )}
    </figure>
  )
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  )
}

export function TreatmentRichSections({ content }: { content: TreatmentRichContent }) {
  return (
    <>
      {SECTION_ORDER.map(({ key, title }) => {
        const body = content.sections[key]
        if (!body) return null
        const imgIdx = IMAGE_AFTER[key]
        const img = imgIdx !== undefined ? content.images?.[imgIdx] : undefined
        return (
          <Fragment key={key}>
            <div className="content-section">
              <h2>{title}</h2>
              <Paragraphs text={body} />
            </div>
            {img && <InlineImage image={img} />}
          </Fragment>
        )
      })}

      {content.faqs?.length > 0 && (
        <div className="content-section faq-section">
          <h2>Frequently Asked Questions</h2>
          {content.faqs.map((f, i) => (
            <Fragment key={i}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </Fragment>
          ))}
        </div>
      )}

      {content.references && content.references.length > 0 && (
        <div className="content-section">
          <h2>Sources</h2>
          <ul>
            {content.references.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noopener nofollow">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
