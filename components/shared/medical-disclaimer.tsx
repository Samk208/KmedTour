'use client'

import { AlertTriangle } from 'lucide-react'

interface MedicalDisclaimerProps {
  /** Optional additional context, e.g. procedure name */
  context?: string
  /** Compact variant for sidebars / cards */
  compact?: boolean
}

/**
 * Global medical disclaimer banner.
 * Must appear on all pages that display medical information:
 *   - Procedure detail pages
 *   - Hospital detail pages
 *   - City-procedure pSEO pages
 *   - Treatment advisor results
 */
export function MedicalDisclaimer({ context, compact = false }: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed mt-4 border-t pt-3">
        <AlertTriangle className="inline-block h-3 w-3 mr-1 -mt-0.5" />
        Information provided is for general reference only and does not constitute
        medical advice. Always consult a qualified healthcare professional before
        making treatment decisions.
      </p>
    )
  }

  return (
    <section
      role="note"
      aria-label="Medical Disclaimer"
      className="rounded-lg border-2 border-amber-200 bg-amber-50/60 p-6 my-8"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <h3 className="font-semibold text-amber-900 text-sm">
            Medical Information Disclaimer
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            The information provided on this page
            {context ? ` about ${context}` : ''} is for general educational and
            informational purposes only. It is <strong>not</strong> intended as,
            and should not be construed as, medical advice, diagnosis, or
            treatment recommendations.
          </p>
          <p className="text-sm text-amber-800 leading-relaxed">
            Always seek the advice of a qualified healthcare professional
            regarding any medical condition or treatment. Never disregard
            professional medical advice or delay seeking it because of
            information found on this website. Individual treatment outcomes may
            vary. Costs shown are estimates and may differ based on individual
            circumstances.
          </p>
          <p className="text-xs text-amber-700 mt-2">
            KmedTour acts as a medical tourism facilitator and does not provide
            direct medical services. All treatments are performed by
            independently accredited healthcare providers in South Korea.
          </p>
        </div>
      </div>
    </section>
  )
}
