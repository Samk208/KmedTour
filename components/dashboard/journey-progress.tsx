'use client'

import { cn } from '@/lib/utils'
import { type JourneyState } from './journey-state-badge'

interface JourneyProgressProps {
  currentState: JourneyState
  className?: string
}

const journeySteps: { state: JourneyState; label: string }[] = [
  { state: 'INQUIRY', label: 'Inquiry' },
  { state: 'SCREENING', label: 'Screening' },
  { state: 'MATCHING', label: 'Matching' },
  { state: 'QUOTE', label: 'Quote' },
  { state: 'BOOKING', label: 'Booking' },
  { state: 'PRE_TRAVEL', label: 'Pre-Travel' },
  { state: 'TREATMENT', label: 'Treatment' },
  { state: 'POST_CARE', label: 'Post-Care' },
  { state: 'FOLLOWUP', label: 'Follow-up' },
  { state: 'COMPLETED', label: 'Complete' },
]

function getStateIndex(state: JourneyState): number {
  if (state === 'CANCELLED') return -1
  const index = journeySteps.findIndex((s) => s.state === state)
  return index >= 0 ? index : 0
}

export function JourneyProgress({ currentState, className }: JourneyProgressProps) {
  const currentIndex = getStateIndex(currentState)
  const isCancelled = currentState === 'CANCELLED'

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Vertical stepper */}
      <div className="sm:hidden space-y-2">
        {journeySteps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex && !isCancelled
          const isPending = index > currentIndex || isCancelled

          return (
            <div key={step.state} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'text-sm',
                  isCurrent && 'font-medium',
                  isPending && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Desktop: Horizontal stepper */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {journeySteps.map((step, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex && !isCancelled
            const isPending = index > currentIndex || isCancelled

            return (
              <div key={step.state} className="flex flex-col items-center">
                {/* Step indicator */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                    isPending && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'mt-2 text-xs text-center max-w-[60px]',
                    isCurrent && 'font-medium text-foreground',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="relative mt-4">
          <div className="absolute top-1/2 left-5 right-5 h-1 -translate-y-1/2 bg-muted rounded-full" />
          <div
            className="absolute top-1/2 left-5 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-500"
            style={{
              width: isCancelled
                ? '0%'
                : `${Math.min((currentIndex / (journeySteps.length - 1)) * 100, 100)}%`,
              maxWidth: 'calc(100% - 40px)',
            }}
          />
        </div>
      </div>

      {/* Cancelled state */}
      {isCancelled && (
        <div className="mt-4 text-center text-sm text-destructive">
          Journey was cancelled
        </div>
      )}
    </div>
  )
}
