'use client'

import { Check } from 'lucide-react'

interface FormStepIndicatorProps {
  currentStep: number
}

export function FormStepIndicator({ currentStep }: FormStepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Medical Details' },
    { number: 3, label: 'Travel & Budget' },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  step.number < currentStep
                    ? 'bg-[var(--kmed-teal)] text-white'
                    : step.number === currentStep
                    ? 'bg-[var(--kmed-blue)] text-white'
                    : 'bg-[var(--soft-grey)] text-[var(--deep-grey)]'
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div
                className={`mt-2 text-xs sm:text-sm font-medium ${
                  step.number <= currentStep
                    ? 'text-[var(--kmed-navy)]'
                    : 'text-[var(--deep-grey)]'
                }`}
              >
                {step.label}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className="h-1 flex-1 mx-2"
                style={{
                  backgroundColor:
                    step.number < currentStep ? 'var(--kmed-teal)' : 'var(--soft-grey)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
