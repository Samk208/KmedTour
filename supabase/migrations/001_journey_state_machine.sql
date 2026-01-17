-- Migration: 001_journey_state_machine.sql
-- Purpose: Create journey state enum and enhance patient_journey_state table
-- Date: 2026-01-16

-- ==============================
-- Journey State Enum
-- ==============================

-- Create the journey state enum type
DO $$ BEGIN
    CREATE TYPE journey_state AS ENUM (
        'INQUIRY',
        'SCREENING',
        'MATCHING',
        'QUOTE',
        'BOOKING',
        'PRE_TRAVEL',
        'TREATMENT',
        'POST_CARE',
        'FOLLOWUP',
        'CANCELLED',
        'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================
-- Enhanced patient_journey_state table
-- ==============================

-- Add new columns to existing table
ALTER TABLE public.patient_journey_state
ADD COLUMN IF NOT EXISTS state journey_state NOT NULL DEFAULT 'INQUIRY',
ADD COLUMN IF NOT EXISTS previous_state journey_state,
ADD COLUMN IF NOT EXISTS state_entered_at timestamptz NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS expected_completion_at timestamptz,
ADD COLUMN IF NOT EXISTS assigned_coordinator_id uuid,
ADD COLUMN IF NOT EXISTS assigned_coordinator_name text,
ADD COLUMN IF NOT EXISTS recovery_data jsonb,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Migrate existing current_stage data to new state column if data exists
UPDATE public.patient_journey_state
SET state = CASE current_stage
    WHEN 'INTAKE' THEN 'INQUIRY'::journey_state
    WHEN 'TRIAGE' THEN 'SCREENING'::journey_state
    WHEN 'MATCHING' THEN 'MATCHING'::journey_state
    WHEN 'QUOTE' THEN 'QUOTE'::journey_state
    WHEN 'BOOKING' THEN 'BOOKING'::journey_state
    ELSE 'INQUIRY'::journey_state
END
WHERE state IS NULL OR state = 'INQUIRY'::journey_state;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_journey_state_state ON public.patient_journey_state(state);
CREATE INDEX IF NOT EXISTS idx_journey_state_updated ON public.patient_journey_state(last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_state_coordinator ON public.patient_journey_state(assigned_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_journey_state_entered ON public.patient_journey_state(state_entered_at DESC);

-- ==============================
-- State transition validation function
-- ==============================

CREATE OR REPLACE FUNCTION public.validate_journey_state_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    valid_transitions jsonb := '{
        "INQUIRY": ["SCREENING", "CANCELLED"],
        "SCREENING": ["MATCHING", "CANCELLED"],
        "MATCHING": ["QUOTE", "SCREENING", "CANCELLED"],
        "QUOTE": ["BOOKING", "MATCHING", "CANCELLED"],
        "BOOKING": ["PRE_TRAVEL", "CANCELLED"],
        "PRE_TRAVEL": ["TREATMENT", "CANCELLED"],
        "TREATMENT": ["POST_CARE"],
        "POST_CARE": ["FOLLOWUP", "COMPLETED"],
        "FOLLOWUP": ["COMPLETED"],
        "CANCELLED": [],
        "COMPLETED": []
    }'::jsonb;
    allowed_states jsonb;
BEGIN
    -- Skip validation on INSERT
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    -- Allow if state hasn't changed
    IF OLD.state = NEW.state THEN
        RETURN NEW;
    END IF;

    -- Get allowed transitions for the old state
    allowed_states := valid_transitions->OLD.state::text;

    -- Check if new state is in allowed transitions
    IF NOT (allowed_states ? NEW.state::text) THEN
        RAISE EXCEPTION 'Invalid state transition from % to %', OLD.state, NEW.state;
    END IF;

    -- Update state tracking fields
    NEW.previous_state := OLD.state;
    NEW.state_entered_at := now();
    NEW.last_updated_at := now();

    RETURN NEW;
END;
$$;

-- Create trigger for state validation
DROP TRIGGER IF EXISTS validate_journey_state_transition_trigger ON public.patient_journey_state;
CREATE TRIGGER validate_journey_state_transition_trigger
    BEFORE UPDATE ON public.patient_journey_state
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_journey_state_transition();

-- ==============================
-- Helper function to get journey state
-- ==============================

CREATE OR REPLACE FUNCTION public.get_journey_state(p_patient_id uuid)
RETURNS TABLE (
    patient_id uuid,
    state journey_state,
    previous_state journey_state,
    state_entered_at timestamptz,
    thread_id text,
    metadata jsonb,
    last_updated_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        pjs.patient_id,
        pjs.state,
        pjs.previous_state,
        pjs.state_entered_at,
        pjs.thread_id,
        pjs.metadata,
        pjs.last_updated_at
    FROM public.patient_journey_state pjs
    WHERE pjs.patient_id = p_patient_id;
$$;

-- ==============================
-- Function to transition state (with validation bypass for coordinators)
-- ==============================

CREATE OR REPLACE FUNCTION public.transition_journey_state(
    p_patient_id uuid,
    p_new_state journey_state,
    p_triggered_by text DEFAULT 'system',
    p_force boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_state journey_state;
    v_result jsonb;
BEGIN
    -- Get current state
    SELECT state INTO v_current_state
    FROM public.patient_journey_state
    WHERE patient_id = p_patient_id;

    -- Create journey state record if doesn't exist
    IF v_current_state IS NULL THEN
        INSERT INTO public.patient_journey_state (patient_id, state, thread_id, current_stage)
        VALUES (p_patient_id, p_new_state, 'thread_' || p_patient_id::text, p_new_state::text);

        RETURN jsonb_build_object(
            'success', true,
            'from_state', null,
            'to_state', p_new_state,
            'patient_id', p_patient_id
        );
    END IF;

    -- If force is true, temporarily disable the trigger
    IF p_force THEN
        ALTER TABLE public.patient_journey_state DISABLE TRIGGER validate_journey_state_transition_trigger;
    END IF;

    -- Update the state
    UPDATE public.patient_journey_state
    SET
        state = p_new_state,
        previous_state = v_current_state,
        state_entered_at = now(),
        last_updated_at = now(),
        current_stage = p_new_state::text,
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
            'last_transition', jsonb_build_object(
                'from', v_current_state,
                'to', p_new_state,
                'triggered_by', p_triggered_by,
                'at', now()
            )
        )
    WHERE patient_id = p_patient_id;

    -- Re-enable trigger if it was disabled
    IF p_force THEN
        ALTER TABLE public.patient_journey_state ENABLE TRIGGER validate_journey_state_transition_trigger;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'from_state', v_current_state,
        'to_state', p_new_state,
        'patient_id', p_patient_id,
        'forced', p_force
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Re-enable trigger on error
        ALTER TABLE public.patient_journey_state ENABLE TRIGGER validate_journey_state_transition_trigger;
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'from_state', v_current_state,
            'to_state', p_new_state,
            'patient_id', p_patient_id
        );
END;
$$;

-- ==============================
-- Row Level Security
-- ==============================

ALTER TABLE public.patient_journey_state ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS journey_state_service_all ON public.patient_journey_state;
CREATE POLICY journey_state_service_all ON public.patient_journey_state
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow anonymous read (for patient dashboard with patient_id)
DROP POLICY IF EXISTS journey_state_public_read ON public.patient_journey_state;
CREATE POLICY journey_state_public_read ON public.patient_journey_state
    FOR SELECT
    USING (true);

-- ==============================
-- End of migration
-- ==============================
