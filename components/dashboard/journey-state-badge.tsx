'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type JourneyState =
  | 'INQUIRY'
  | 'SCREENING'
  | 'MATCHING'
  | 'QUOTE'
  | 'BOOKING'
  | 'PRE_TRAVEL'
  | 'TREATMENT'
  | 'POST_CARE'
  | 'FOLLOWUP'
  | 'CANCELLED'
  | 'COMPLETED'

const stateConfig: Record<JourneyState, { label: string; className: string }> = {
  INQUIRY: {
    label: 'Inquiry',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  },
  SCREENING: {
    label: 'Screening',
    className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
  },
  MATCHING: {
    label: 'Matching',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
  QUOTE: {
    label: 'Quote',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  },
  BOOKING: {
    label: 'Booking',
    className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  },
  PRE_TRAVEL: {
    label: 'Pre-Travel',
    className: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
  TREATMENT: {
    label: 'Treatment',
    className: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
  },
  POST_CARE: {
    label: 'Post-Care',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  FOLLOWUP: {
    label: 'Follow-up',
    className: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  },
}

interface JourneyStateBadgeProps {
  state: JourneyState
  className?: string
}

export function JourneyStateBadge({ state, className }: JourneyStateBadgeProps) {
  const config = stateConfig[state] || stateConfig.INQUIRY

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
