'use client'

import { useEffect, useState } from 'react'
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
  byState: Record<JourneyState, number>
}

export default function CoordinatorDashboard() {
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchJourneys()
  }, [])

  async function fetchJourneys() {
    try {
      const response = await fetch('/api/coordinator/journeys')
      const data = await response.json()

      if (data.success) {
        setJourneys(data.journeys)
        calculateStats(data.journeys)
      }
    } catch (error) {
      console.error('Failed to fetch journeys:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateStats(journeyList: Journey[]) {
    const byState = {} as Record<JourneyState, number>
    let active = 0
    let completed = 0
    let cancelled = 0

    journeyList.forEach((j) => {
      byState[j.current_state] = (byState[j.current_state] || 0) + 1

      if (j.current_state === 'COMPLETED') {
        completed++
      } else if (j.current_state === 'CANCELLED') {
        cancelled++
      } else {
        active++
      }
    })

    setStats({
      total: journeyList.length,
      active,
      completed,
      cancelled,
      byState,
    })
  }

  function filterJourneys(filter: string): Journey[] {
    switch (filter) {
      case 'active':
        return journeys.filter(
          (j) => j.current_state !== 'COMPLETED' && j.current_state !== 'CANCELLED'
        )
      case 'completed':
        return journeys.filter((j) => j.current_state === 'COMPLETED')
      case 'cancelled':
        return journeys.filter((j) => j.current_state === 'CANCELLED')
      default:
        return journeys
    }
  }

  function handleViewDetails(journeyId: string) {
    window.location.href = `/coordinator/journey/${journeyId}`
  }

  function handleTransition(journeyId: string) {
    window.location.href = `/coordinator/journey/${journeyId}?action=transition`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage patient journeys and track progress
          </p>
        </div>
        <Button onClick={() => window.location.href = '/coordinator/intakes'}>
          View New Intakes
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Journeys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* State Distribution */}
      {stats && (
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

      {/* Journey List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({journeys.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({stats?.active || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats?.completed || 0})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({stats?.cancelled || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filterJourneys(activeTab).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No journeys found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterJourneys(activeTab).map((journey) => (
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
