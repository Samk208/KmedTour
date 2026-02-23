import { procedureGuides } from '@/lib/data/pseo-content'

interface ProcedureContentProps {
  procedureSlug: string
  treatmentTitle: string
}

export function PseoProccedureContent({ procedureSlug, treatmentTitle }: ProcedureContentProps) {
  const guide = procedureGuides[procedureSlug]
  if (!guide) return null

  return (
    <div className="space-y-12">
      {/* What Is This Procedure + Candidate Criteria */}
      <section aria-labelledby="candidate-heading">
        <h2
          id="candidate-heading"
          className="mb-4 text-2xl font-bold text-[var(--kmed-navy)]"
        >
          Who Is {treatmentTitle} For?
        </h2>
        <ul className="space-y-2">
          {guide.candidateFor.map((criterion, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700">
              <span
                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--kmed-blue)] text-white text-xs font-bold"
                aria-hidden="true"
              >
                ✓
              </span>
              {criterion}
            </li>
          ))}
        </ul>
      </section>

      {/* What to Expect — 3-step timeline */}
      <section aria-labelledby="expect-heading">
        <h2
          id="expect-heading"
          className="mb-6 text-2xl font-bold text-[var(--kmed-navy)]"
        >
          What to Expect
        </h2>
        <ol className="space-y-6">
          {guide.whatToExpect.map((item, i) => (
            <li key={i} className="flex gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--kmed-blue)] text-white font-bold text-sm"
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--kmed-navy)]">{item.step}</h3>
                  <span className="text-sm text-gray-500 italic">{item.duration}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Why South Korea */}
      <section
        aria-labelledby="why-korea-heading"
        className="rounded-xl border border-[var(--kmed-blue)]/20 bg-blue-50/40 p-6"
      >
        <h2
          id="why-korea-heading"
          className="mb-4 text-2xl font-bold text-[var(--kmed-navy)]"
        >
          Why South Korea for {treatmentTitle}?
        </h2>
        <ul className="space-y-3">
          {guide.whyKorea.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700">
              <span className="mt-0.5 text-[var(--kmed-blue)] text-lg font-bold" aria-hidden="true">
                →
              </span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      {guide.faqs.length > 0 && (
        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="mb-6 text-2xl font-bold text-[var(--kmed-navy)]"
          >
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {guide.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <dt className="font-semibold text-[var(--kmed-navy)] mb-2">{faq.question}</dt>
                <dd className="text-gray-700 leading-relaxed">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}
