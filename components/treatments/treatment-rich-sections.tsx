import Image from 'next/image'
import { Fragment } from 'react'

export type TreatmentFaq = { q: string; a: string }
export type TreatmentReference = { label: string; url: string }
export type TreatmentImage = { src: string; alt: string; credit?: string }
export type TreatmentEntity = { name: string; url: string }
export type TreatmentKeyFact = { label: string; value: string }
export type TreatmentCostRow = { item: string; cost: string }
export type TreatmentCallout = { type: 'tip' | 'warning' | 'takeaway'; title?: string; text: string }

export type TreatmentRichContent = {
  slug: string
  shortDescription: string
  /** 3–4 direct-answer bullets optimized for Google AI Overview / Position 0 */
  quickAnswer?: string[]
  /** At-a-Glance key facts (duration, anesthesia, hospital stay, recovery, etc.) */
  keyFacts?: TreatmentKeyFact[]
  sections: {
    overview: string
    candidacy: string
    procedure_steps: string
    recovery_timeline: string
    cost_breakdown: string
    why_korea: string
  }
  /** Structured cost rows rendered as a table under Cost Breakdown */
  costTable?: TreatmentCostRow[]
  /** Optional inline callouts (rendered after the overview) */
  callouts?: TreatmentCallout[]
  /** Key takeaways rendered as a highlighted box before the FAQ */
  keyTakeaways?: string[]
  /** Named entities for JSON-LD about/mentions + a Related Topics list */
  entities?: TreatmentEntity[]
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

// Render **bold** spans inside a plain-text string.
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-b${i}`}>{part}</strong> : <Fragment key={`${keyPrefix}-t${i}`}>{part}</Fragment>
  )
}

// Markdown-lite section body: blank-line-separated paragraphs + "- " bullet lists + **bold**.
function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean)
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
        const isList = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l))
        if (isList) {
          return (
            <ul className="content-list" key={`ul${bi}`}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^[-*]\s+/, ''), `li${bi}-${li}`)}</li>
              ))}
            </ul>
          )
        }
        return <p key={`p${bi}`}>{renderInline(block, `p${bi}`)}</p>
      })}
    </>
  )
}

function QuickAnswer({ points }: { points: string[] }) {
  return (
    <div className="quick-answer-box">
      <p className="callout-title">Quick Answer</p>
      <ul className="content-list">
        {points.map((p, i) => (
          <li key={i}>{renderInline(p, `qa${i}`)}</li>
        ))}
      </ul>
    </div>
  )
}

function KeyFactsTable({ facts }: { facts: TreatmentKeyFact[] }) {
  return (
    <div className="content-section">
      <h2>At a Glance</h2>
      <div className="table-wrapper">
        <table className="content-table">
          <tbody>
            {facts.map((f, i) => (
              <tr key={i}>
                <th scope="row" style={{ width: '40%' }}>{f.label}</th>
                <td>{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CostTable({ rows }: { rows: TreatmentCostRow[] }) {
  return (
    <div className="table-wrapper">
      <table className="content-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Typical Cost in Korea (USD)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.item}</td>
              <td>{r.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CALLOUT_LABEL: Record<TreatmentCallout['type'], string> = {
  tip: 'Pro Tip',
  warning: 'Important',
  takeaway: 'Key Takeaway',
}

function Callout({ callout }: { callout: TreatmentCallout }) {
  return (
    <div className={`callout-box callout-${callout.type}`}>
      <p className="callout-title">{callout.title || CALLOUT_LABEL[callout.type]}</p>
      <p>{renderInline(callout.text, 'co')}</p>
    </div>
  )
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

export function TreatmentRichSections({ content }: { content: TreatmentRichContent }) {
  return (
    <>
      {content.quickAnswer && content.quickAnswer.length > 0 && (
        <QuickAnswer points={content.quickAnswer} />
      )}

      {content.keyFacts && content.keyFacts.length > 0 && (
        <KeyFactsTable facts={content.keyFacts} />
      )}

      {SECTION_ORDER.map(({ key, title }) => {
        const body = content.sections[key]
        if (!body) return null
        const imgIdx = IMAGE_AFTER[key]
        const img = imgIdx !== undefined ? content.images?.[imgIdx] : undefined
        return (
          <Fragment key={key}>
            <div className="content-section">
              <h2>{title}</h2>
              <RichText text={body} />
              {key === 'cost_breakdown' && content.costTable && content.costTable.length > 0 && (
                <CostTable rows={content.costTable} />
              )}
            </div>
            {key === 'overview' && content.callouts?.map((c, i) => <Callout key={i} callout={c} />)}
            {img && <InlineImage image={img} />}
          </Fragment>
        )
      })}

      {content.keyTakeaways && content.keyTakeaways.length > 0 && (
        <div className="callout-box callout-takeaway">
          <p className="callout-title">Key Takeaways</p>
          <ul className="content-list">
            {content.keyTakeaways.map((t, i) => (
              <li key={i}>{renderInline(t, `kt${i}`)}</li>
            ))}
          </ul>
        </div>
      )}

      {content.faqs?.length > 0 && (
        <div className="content-section faq-section">
          <h2>Frequently Asked Questions</h2>
          {content.faqs.map((f, i) => (
            <Fragment key={i}>
              <h3>{f.q}</h3>
              <p>{renderInline(f.a, `faq${i}`)}</p>
            </Fragment>
          ))}
        </div>
      )}

      {content.entities && content.entities.length > 0 && (
        <div className="content-section">
          <h2>Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {content.entities.map((e, i) => (
              <a
                key={i}
                href={e.url}
                target="_blank"
                rel="noopener nofollow"
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--soft-grey)] hover:bg-[var(--kmed-teal)] hover:text-white transition-colors text-[var(--deep-grey)]"
              >
                {e.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {content.references && content.references.length > 0 && (
        <div className="content-section">
          <h2>Sources</h2>
          <ul className="content-list">
            {content.references.map((r, i) => (
              <li key={i}>
                <a className="content-link" href={r.url} target="_blank" rel="noopener nofollow">
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
