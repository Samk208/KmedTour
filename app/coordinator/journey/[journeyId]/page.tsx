'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { JourneyStateBadge, type JourneyState } from '@/components/dashboard/journey-state-badge'
import { JourneyProgress } from '@/components/dashboard/journey-progress'
import { JourneyTimeline } from '@/components/dashboard/journey-timeline'

interface Journey {
  id: string
  patient_intake_id: string
  current_state: JourneyState
  state_data: Record<string, unknown>
  state_history: Array<{
    state: JourneyState
    entered_at: string
    actor: string
    reason: string
  }>
  assigned_coordinator_id: string | null
  created_at: string
  updated_at: string
}

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

const STATE_TRANSITIONS: Record<JourneyState, JourneyState[]> = {
  INQUIRY: ['SCREENING', 'CANCELLED'],
  SCREENING: ['MATCHING', 'CANCELLED'],
  MATCHING: ['QUOTE', 'CANCELLED'],
  QUOTE: ['BOOKING', 'MATCHING', 'CANCELLED'],
  BOOKING: ['PRE_TRAVEL', 'CANCELLED'],
  PRE_TRAVEL: ['TREATMENT', 'CANCELLED'],
  TREATMENT: ['POST_CARE', 'CANCELLED'],
  POST_CARE: ['FOLLOWUP', 'COMPLETED'],
  FOLLOWUP: ['COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
}

export default function JourneyDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const journeyId = params.journeyId as string

  const [journey, setJourney] = useState<Journey | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransitionDialog, setShowTransitionDialog] = useState(
    searchParams.get('action') === 'transition'
  )
  const [targetState, setTargetState] = useState<JourneyState | ''>('')
  const [transitionReason, setTransitionReason] = useState('')
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    fetchJourney()
    fetchTimeline()
  }, [journeyId])

  async function fetchJourney() {
    try {
      const response = await fetch(`/api/journey/${journeyId}`)
      const data = await response.json()

      if (data.success) {
        setJourney(data.journey)
      }
    } catch (error) {
      console.error('Failed to fetch journey:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTimeline() {
    try {
      const response = await fetch(`/api/journey/${journeyId}/timeline`)
      const data = await response.json()

      if (data.success) {
        setTimeline(data.timeline)
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
    }
  }

  async function handleTransition() {
    if (!targetState || !transitionReason || !journey) return

    setTransitioning(true)
    try {
      const response = await fetch(`/api/journey/${journeyId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetState,
          reason: transitionReason,
          actor: 'coordinator',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowTransitionDialog(false)
        setTargetState('')
        setTransitionReason('')
        fetchJourney()
        fetchTimeline()
      } else {
        alert(data.message || 'Failed to transition state')
      }
    } catch (error) {
      console.error('Failed to transition:', error)
      alert('Failed to transition state')
    } finally {
      setTransitioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading journey...</div>
      </div>
    )
  }

  if (!journey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Journey not found</div>
      </div>
    )
  }

  const allowedTransitions = STATE_TRANSITIONS[journey.current_state] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/coordinator'}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Journey Details</h1>
            <p className="text-muted-foreground text-sm">
              ID: {journey.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <JourneyStateBadge state={journey.current_state} />
          {allowedTransitions.length > 0 && (
            <Button onClick={() => setShowTransitionDialog(true)}>
              Change State
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <JourneyProgress currentState={journey.current_state} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Timeline</CardTitle>
              <CardDescription>
                Complete history of this patient journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JourneyTimeline events={timeline} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Journey Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <div>{new Date(journey.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <div>{new Date(journey.updated_at).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Coordinator</Label>
                  <div>
                    {journey.assigned_coordinator_id
                      ? journey.assigned_coordinator_id.slice(0, 8) + '...'
                      : 'Not assigned'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>State History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {journey.state_history?.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <JourneyStateBadge state={entry.state} />
                      <span className="text-muted-foreground">
                        {new Date(entry.entered_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common actions for this journey stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {journey.current_state === 'QUOTE' && (
                  <>
                    <Button variant="outline" className="justify-start">
                      Create New Quote
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Send Quote to Patient
                    </Button>
                  </>
                )}
                {journey.current_state === 'BOOKING' && (
                  <>
                    <Button variant="outline" className="justify-start">
                      View Booking Details
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Send Payment Link
                    </Button>
                  </>
                )}
                {journey.current_state === 'PRE_TRAVEL' && (
                  <>
                    <Button variant="outline" className="justify-start">
                      Update Travel Details
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Send Pre-Travel Checklist
                    </Button>
                  </>
                )}
                <Button variant="outline" className="justify-start">
                  Add Note
                </Button>
                <Button variant="outline" className="justify-start">
                  Send Message
                </Button>
                <Button variant="outline" className="justify-start">
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transition Dialog */}
      <Dialog open={showTransitionDialog} onOpenChange={setShowTransitionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Journey State</DialogTitle>
            <DialogDescription>
              Current state: <strong>{journey.current_state}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New State</Label>
              <Select value={targetState} onValueChange={(v) => setTargetState(v as JourneyState)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new state" />
                </SelectTrigger>
                <SelectContent>
                  {allowedTransitions.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason for Change</Label>
              <Textarea
                placeholder="Explain why you're changing the state..."
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransitionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransition}
              disabled={!targetState || !transitionReason || transitioning}
            >
              {transitioning ? 'Changing...' : 'Change State'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
