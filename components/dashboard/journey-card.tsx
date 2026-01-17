'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JourneyStateBadge, type JourneyState } from './journey-state-badge'
import { JourneyProgress } from './journey-progress'
import { cn } from '@/lib/utils'

interface JourneyCardProps {
  journey: {
    id: string
    current_state: JourneyState
    created_at: string
    updated_at: string
    patient_intake?: {
      full_name?: string
      email?: string
      treatment_type_slug?: string
    }
    assigned_coordinator_id?: string
  }
  onViewDetails?: (journeyId: string) => void
  onTransition?: (journeyId: string) => void
  className?: string
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function JourneyCard({ journey, onViewDetails, onTransition, className }: JourneyCardProps) {
  const patientName = journey.patient_intake?.full_name || 'Unknown Patient'
  const treatmentType = journey.patient_intake?.treatment_type_slug?.replace(/-/g, ' ') || 'Treatment'

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg capitalize">{patientName}</CardTitle>
            <CardDescription className="capitalize">{treatmentType}</CardDescription>
          </div>
          <JourneyStateBadge state={journey.current_state} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Journey Progress */}
        <JourneyProgress currentState={journey.current_state} />

        {/* Journey Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Started</span>
            <div className="font-medium">{formatDate(journey.created_at)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Last Updated</span>
            <div className="font-medium">{formatDate(journey.updated_at)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails(journey.id)}
            >
              View Details
            </Button>
          )}
          {onTransition && journey.current_state !== 'COMPLETED' && journey.current_state !== 'CANCELLED' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onTransition(journey.id)}
            >
              Advance State
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
