-- ============================================================================
-- PART 6: Patient Portal & Authentication
-- ============================================================================

-- Link patient_intakes to Supabase Auth users
ALTER TABLE public.patient_intakes
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS portal_access_token text,
ADD COLUMN IF NOT EXISTS portal_access_expires_at timestamptz;

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_patient_intakes_user ON public.patient_intakes(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_intakes_token ON public.patient_intakes(portal_access_token);

-- Update RLS policies to allow patients to see their OWN records
-- Policy: "Patients can view their own intake record if user_id matches"
DROP POLICY IF EXISTS patient_view_own_intake ON public.patient_intakes;
CREATE POLICY patient_view_own_intake ON public.patient_intakes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: "Patients can view their own quotes"
DROP POLICY IF EXISTS patient_view_own_quotes ON public.quotes;
CREATE POLICY patient_view_own_quotes ON public.quotes
    FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM public.patient_intakes WHERE user_id = auth.uid()
        )
    );

-- Policy: "Patients can view their own bookings"
DROP POLICY IF EXISTS patient_view_own_bookings ON public.bookings;
CREATE POLICY patient_view_own_bookings ON public.bookings
    FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM public.patient_intakes WHERE user_id = auth.uid()
        )
    );

-- Policy: "Patients can view their own journey events (timeline)"
DROP POLICY IF EXISTS patient_view_own_events ON public.journey_events;
CREATE POLICY patient_view_own_events ON public.journey_events
    FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM public.patient_intakes WHERE user_id = auth.uid()
        )
    );

-- Secure function to claim an intake record
-- When a user logs in (or clicks magic link) for the first time, we can "claim" the intake
CREATE OR REPLACE FUNCTION public.claim_patient_intake(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Update the intake record that matches the email and has no user_id yet
    UPDATE public.patient_intakes
    SET user_id = v_user_id
    WHERE email = p_email 
      AND (user_id IS NULL OR user_id = v_user_id);
END;
$$;
