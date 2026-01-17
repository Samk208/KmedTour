'use client'

import { ReactNode } from 'react'

interface AdvisorStepProps {
  title: string
  subtitle: string
  children: ReactNode
  currentStep: number
  totalSteps: number
}

export function AdvisorStep({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
}: AdvisorStepProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--deep-grey)' }}>
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--kmed-blue)' }}>
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-border-grey rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              backgroundColor: 'var(--kmed-blue)',
              width: `${(currentStep / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--deep-grey)' }}>
            {title}
          </h2>
          <p className="text-base" style={{ color: 'var(--medium-grey)' }}>
            {subtitle}
          </p>
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
