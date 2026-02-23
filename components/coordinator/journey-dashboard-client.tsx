'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JourneyCard } from '@/components/dashboard/journey-card'
import { type JourneyState } from '@/components/dashboard/journey-state-badge'

interface Journey {
  id: string
  patient_intake_id: string
  current_state: JourneyState
  state_data: Record<string, unknown>
  assigned_coordinator_id: string | null
  created_at: string
  updated_at: string
  patient_intake?: {
    full_name?: string
    email?: string
    treatment_type_slug?: string
  }
}

interface DashboardStats {
  total: number
  active: number
  completed: number
  cancelled: number
  byState: Record<string, number>
}

function calcStats(journeyList: Journey[]): DashboardStats {
  const byState: Record<string, number> = {}
  let active = 0, completed = 0, cancelled = 0

  for (const j of journeyList) {
    byState[j.current_state] = (byState[j.current_state] || 0) + 1
    if (j.current_state === 'COMPLETED') completed++
    else if (j.current_state === 'CANCELLED') cancelled++
    else active++
  }

  return { total: journeyList.length, active, completed, cancelled, byState }
}

function filterJourneys(journeys: Journey[], filter: string): Journey[] {
  switch (filter) {
    case 'active':
      return journeys.filter((j) => j.current_state !== 'COMPLETED' && j.current_state !== 'CANCELLED')
    case 'completed':
      return journeys.filter((j) => j.current_state === 'COMPLETED')
    case 'cancelled':
      return journeys.filter((j) => j.current_state === 'CANCELLED')
    default:
      return journeys
  }
}

interface Props {
  initialJourneys: Journey[]
}

export function JourneyDashboardClient({ initialJourneys }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const stats = calcStats(initialJourneys)

  function handleViewDetails(journeyId: string) {
    router.push(`/coordinator/journey/${journeyId}`)
  }

  function handleTransition(journeyId: string) {
    router.push(`/coordinator/journey/${journeyId}?action=transition`)
  }

  const visible = filterJourneys(initialJourneys, activeTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage patient journeys and track progress</p>
        </div>
        <Button onClick={() => router.push('/coordinator/intakes')}>
          View New Intakes
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Journeys', value: stats.total, color: '' },
          { label: 'Active', value: stats.active, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(stats.byState).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Journeys by State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byState).map(([state, count]) => (
                <Badge key={state} variant="secondary" className="text-sm">
                  {state.replace(/_/g, ' ')}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {visible.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No journeys found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  onViewDetails={handleViewDetails}
                  onTransition={handleTransition}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
