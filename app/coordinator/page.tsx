import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JourneyDashboardClient } from '@/components/coordinator/journey-dashboard-client'

export const dynamic = 'force-dynamic'

export default async function CoordinatorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/coordinator/login')
  }

  const { data: raw } = await supabase
    .from('patient_journey_state')
    .select(`
      id,
      patient_intake_id,
      current_state,
      state_data,
      assigned_coordinator_id,
      created_at,
      updated_at,
      patient_intake:patient_intake_id(
        full_name,
        email,
        treatment_type_slug,
        country_of_residence
      )
    `)
    .order('updated_at', { ascending: false })

  // Normalise the one-to-many join result to a single object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const journeys = (raw ?? []).map((r: any) => ({
    ...r,
    patient_intake: Array.isArray(r.patient_intake) ? r.patient_intake[0] : r.patient_intake,
  }))

  return <JourneyDashboardClient initialJourneys={journeys} />
}
