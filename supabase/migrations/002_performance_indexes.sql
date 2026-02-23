-- Migration 002: Performance indexes
-- Adds missing indexes identified by production audit.
-- All CREATE INDEX use IF NOT EXISTS — safe to re-run.

-- ============================================================
-- patient_intakes: user_id (critical — patient dashboard query)
-- ============================================================
-- The patient dashboard queries: WHERE user_id = auth.uid()
-- Without this index every dashboard load is a full table scan.
create index if not exists idx_patient_intakes_user_id
  on public.patient_intakes (user_id);

-- ============================================================
-- quotes: patient_id lookup (used in quote ownership check)
-- ============================================================
create index if not exists idx_quotes_patient
  on public.quotes (patient_id)
  where patient_id is not null;

-- ============================================================
-- quotes: composite (journey_id, status) for coordinator queries
-- ============================================================
create index if not exists idx_quotes_journey_status
  on public.quotes (journey_id, status);

-- ============================================================
-- bookings: composite (journey_id, status) for dashboard
-- ============================================================
create index if not exists idx_bookings_journey_status
  on public.bookings (journey_id, status);

-- ============================================================
-- notifications: pending notifications for scheduler
-- ============================================================
create index if not exists idx_notifications_pending
  on public.notifications (status, priority, created_at)
  where status = 'pending';

-- ============================================================
-- journey_events: recent events per journey (timeline queries)
-- ============================================================
create index if not exists idx_journey_events_recent
  on public.journey_events (journey_id, created_at desc);
