'use client'

import { cn } from '@/lib/utils'
import { JourneyStateBadge, type JourneyState } from './journey-state-badge'

interface TimelineEvent {
  id: string
  event_type: string
  from_state: JourneyState | null
  to_state: JourneyState | null
  actor_type: string
  actor_id?: string
  event_data?: Record<string, unknown>
  created_at: string
}

interface JourneyTimelineProps {
  events: TimelineEvent[]
  className?: string
}

const eventTypeLabels: Record<string, string> = {
  JOURNEY_STARTED: 'Journey Started',
  STATE_TRANSITION: 'State Changed',
  COORDINATOR_ASSIGNED: 'Coordinator Assigned',
  QUOTE_CREATED: 'Quote Created',
  QUOTE_SENT: 'Quote Sent',
  QUOTE_ACCEPTED: 'Quote Accepted',
  QUOTE_REJECTED: 'Quote Rejected',
  PAYMENT_INITIATED: 'Payment Started',
  PAYMENT_COMPLETED: 'Payment Received',
  PAYMENT_FAILED: 'Payment Failed',
  PAYMENT_EXPIRED: 'Payment Expired',
  DOCUMENT_UPLOADED: 'Document Uploaded',
  NOTE_ADDED: 'Note Added',
  MESSAGE_SENT: 'Message Sent',
}

function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case 'JOURNEY_STARTED':
      return '🚀'
    case 'STATE_TRANSITION':
      return '➡️'
    case 'COORDINATOR_ASSIGNED':
      return '👤'
    case 'QUOTE_CREATED':
    case 'QUOTE_SENT':
      return '📝'
    case 'QUOTE_ACCEPTED':
      return '✅'
    case 'QUOTE_REJECTED':
      return '❌'
    case 'PAYMENT_INITIATED':
    case 'PAYMENT_COMPLETED':
      return '💳'
    case 'PAYMENT_FAILED':
    case 'PAYMENT_EXPIRED':
      return '⚠️'
    case 'DOCUMENT_UPLOADED':
      return '📄'
    case 'NOTE_ADDED':
      return '📌'
    case 'MESSAGE_SENT':
      return '💬'
    default:
      return '📋'
  }
}

export function JourneyTimeline({ events, className }: JourneyTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>
        No events yet
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm">
              {getEventIcon(event.event_type)}
            </div>
            {index < events.length - 1 && (
              <div className="w-px flex-1 bg-border my-1" />
            )}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {eventTypeLabels[event.event_type] || event.event_type}
              </span>
              {event.to_state && (
                <JourneyStateBadge state={event.to_state} />
              )}
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {formatEventDate(event.created_at)}
              {event.actor_type && (
                <span className="ml-2">
                  by {event.actor_type === 'system' ? 'System' : 'Coordinator'}
                </span>
              )}
            </div>

            {/* Event details */}
            {event.event_data && Object.keys(event.event_data).length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                {event.event_type === 'STATE_TRANSITION' && event.event_data.reason && (
                  <div>Reason: {String(event.event_data.reason)}</div>
                )}
                {event.event_type === 'QUOTE_CREATED' && (
                  <div>
                    Amount: {event.event_data.currency} {Number(event.event_data.total_amount).toLocaleString()}
                  </div>
                )}
                {event.event_type === 'PAYMENT_COMPLETED' && (
                  <div>
                    Amount: {event.event_data.currency} {Number(event.event_data.amount).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
