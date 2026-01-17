'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PatientIntake {
  id: string
  full_name: string
  email: string
  phone: string | null
  country_of_residence: string | null
  treatment_type_slug: string | null
  treatment_details: string | null
  budget_range: string | null
  created_at: string
  has_journey?: boolean
}

export default function IntakesPage() {
  const [intakes, setIntakes] = useState<PatientIntake[]>([])
  const [loading, setLoading] = useState(true)
  const [startingJourney, setStartingJourney] = useState<string | null>(null)

  useEffect(() => {
    fetchIntakes()
  }, [])

  async function fetchIntakes() {
    try {
      const response = await fetch('/api/coordinator/intakes')
      const data = await response.json()

      if (data.success) {
        setIntakes(data.intakes)
      }
    } catch (error) {
      console.error('Failed to fetch intakes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function startJourney(intakeId: string) {
    setStartingJourney(intakeId)
    try {
      const response = await fetch('/api/journey/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientIntakeId: intakeId }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to the new journey
        window.location.href = `/coordinator/journey/${data.journeyId}`
      } else {
        alert(data.message || 'Failed to start journey')
      }
    } catch (error) {
      console.error('Failed to start journey:', error)
      alert('Failed to start journey')
    } finally {
      setStartingJourney(null)
    }
  }

  function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading intakes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Intakes</h1>
          <p className="text-muted-foreground mt-1">
            Review new patient submissions and start journeys
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/coordinator'}
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Intakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{intakes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {intakes.filter((i) => !i.has_journey).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Journey Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {intakes.filter((i) => i.has_journey).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intakes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Submissions</CardTitle>
          <CardDescription>
            Click "Start Journey" to begin managing a patient's medical tourism journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {intakes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No patient intakes yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intakes.map((intake) => (
                  <TableRow key={intake.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{intake.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {intake.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {intake.treatment_type_slug?.replace(/-/g, ' ') || '-'}
                    </TableCell>
                    <TableCell>{intake.country_of_residence || '-'}</TableCell>
                    <TableCell>{intake.budget_range || '-'}</TableCell>
                    <TableCell>{formatDate(intake.created_at)}</TableCell>
                    <TableCell>
                      {intake.has_journey ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Journey Started
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {intake.has_journey ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Could fetch and navigate to journey
                          }}
                        >
                          View Journey
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startJourney(intake.id)}
                          disabled={startingJourney === intake.id}
                        >
                          {startingJourney === intake.id
                            ? 'Starting...'
                            : 'Start Journey'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
