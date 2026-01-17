-- Migration: 002_journey_events.sql
-- Purpose: Create journey events audit log table
-- Date: 2026-01-16

-- ==============================
-- Journey Events Table (Audit Log)
-- ==============================

CREATE TABLE IF NOT EXISTS public.journey_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES public.patient_intakes(id) ON DELETE CASCADE,

    -- Event classification
    event_type text NOT NULL, -- 'state_change' | 'document_upload' | 'quote_created' | 'quote_sent' | 'payment' | 'notification' | 'note' | 'assignment'

    -- State transition tracking (for state_change events)
    from_state journey_state,
    to_state journey_state,

    -- Who/what triggered this event
    triggered_by text NOT NULL, -- 'system' | 'agent' | 'patient' | 'coordinator' | 'webhook'
    agent_id text, -- Which agent triggered this (e.g., 'document_agent', 'triage_agent', 'matching_agent')
    coordinator_id uuid, -- If triggered by coordinator
    coordinator_name text,

    -- Event data
    event_data jsonb NOT NULL DEFAULT '{}',

    -- Error tracking
    error_message text,
    error_stack text,

    -- Metadata
    ip_address inet,
    user_agent text,

    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_journey_events_patient ON public.journey_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_type ON public.journey_events(event_type);
CREATE INDEX IF NOT EXISTS idx_journey_events_created ON public.journey_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_events_state_change ON public.journey_events(patient_id, event_type)
    WHERE event_type = 'state_change';
CREATE INDEX IF NOT EXISTS idx_journey_events_coordinator ON public.journey_events(coordinator_id)
    WHERE coordinator_id IS NOT NULL;

-- ==============================
-- Function to log journey events
-- ==============================

CREATE OR REPLACE FUNCTION public.log_journey_event(
    p_patient_id uuid,
    p_event_type text,
    p_triggered_by text,
    p_event_data jsonb DEFAULT '{}',
    p_from_state journey_state DEFAULT NULL,
    p_to_state journey_state DEFAULT NULL,
    p_agent_id text DEFAULT NULL,
    p_coordinator_id uuid DEFAULT NULL,
    p_coordinator_name text DEFAULT NULL,
    p_error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_event_id uuid;
BEGIN
    INSERT INTO public.journey_events (
        patient_id,
        event_type,
        from_state,
        to_state,
        triggered_by,
        agent_id,
        coordinator_id,
        coordinator_name,
        event_data,
        error_message
    ) VALUES (
        p_patient_id,
        p_event_type,
        p_from_state,
        p_to_state,
        p_triggered_by,
        p_agent_id,
        p_coordinator_id,
        p_coordinator_name,
        p_event_data,
        p_error_message
    )
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$;

-- ==============================
-- Function to get journey timeline
-- ==============================

CREATE OR REPLACE FUNCTION public.get_journey_timeline(
    p_patient_id uuid,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0,
    p_event_types text[] DEFAULT NULL
)
RETURNS TABLE (
    event_id uuid,
    event_type text,
    from_state journey_state,
    to_state journey_state,
    triggered_by text,
    agent_id text,
    coordinator_name text,
    event_data jsonb,
    error_message text,
    created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        je.id as event_id,
        je.event_type,
        je.from_state,
        je.to_state,
        je.triggered_by,
        je.agent_id,
        je.coordinator_name,
        je.event_data,
        je.error_message,
        je.created_at
    FROM public.journey_events je
    WHERE je.patient_id = p_patient_id
      AND (p_event_types IS NULL OR je.event_type = ANY(p_event_types))
    ORDER BY je.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

-- ==============================
-- Trigger to auto-log state changes
-- ==============================

CREATE OR REPLACE FUNCTION public.auto_log_state_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only log if state actually changed
    IF OLD.state IS DISTINCT FROM NEW.state THEN
        PERFORM public.log_journey_event(
            p_patient_id := NEW.patient_id,
            p_event_type := 'state_change',
            p_triggered_by := COALESCE((NEW.metadata->>'last_transition'->>'triggered_by')::text, 'system'),
            p_event_data := jsonb_build_object(
                'thread_id', NEW.thread_id,
                'checkpoint_data_size', CASE WHEN NEW.checkpoint_data IS NOT NULL THEN length(NEW.checkpoint_data::text) ELSE 0 END
            ),
            p_from_state := OLD.state,
            p_to_state := NEW.state
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_log_state_change_trigger ON public.patient_journey_state;
CREATE TRIGGER auto_log_state_change_trigger
    AFTER UPDATE ON public.patient_journey_state
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_log_state_change();

-- ==============================
-- Row Level Security
-- ==============================

ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS journey_events_service_all ON public.journey_events;
CREATE POLICY journey_events_service_all ON public.journey_events
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow public read for patient timeline
DROP POLICY IF EXISTS journey_events_public_read ON public.journey_events;
CREATE POLICY journey_events_public_read ON public.journey_events
    FOR SELECT
    USING (true);

-- ==============================
-- Views for analytics
-- ==============================

CREATE OR REPLACE VIEW public.journey_state_metrics AS
SELECT
    date_trunc('day', je.created_at) as date,
    je.to_state as state,
    COUNT(*) as transitions_count,
    COUNT(DISTINCT je.patient_id) as unique_patients
FROM public.journey_events je
WHERE je.event_type = 'state_change'
GROUP BY date_trunc('day', je.created_at), je.to_state
ORDER BY date DESC, state;

CREATE OR REPLACE VIEW public.journey_funnel AS
SELECT
    state,
    COUNT(DISTINCT patient_id) as patient_count,
    ROUND(
        COUNT(DISTINCT patient_id)::numeric /
        NULLIF((SELECT COUNT(DISTINCT patient_id) FROM public.patient_journey_state), 0) * 100,
        2
    ) as percentage
FROM public.patient_journey_state
GROUP BY state
ORDER BY
    CASE state
        WHEN 'INQUIRY' THEN 1
        WHEN 'SCREENING' THEN 2
        WHEN 'MATCHING' THEN 3
        WHEN 'QUOTE' THEN 4
        WHEN 'BOOKING' THEN 5
        WHEN 'PRE_TRAVEL' THEN 6
        WHEN 'TREATMENT' THEN 7
        WHEN 'POST_CARE' THEN 8
        WHEN 'FOLLOWUP' THEN 9
        WHEN 'COMPLETED' THEN 10
        WHEN 'CANCELLED' THEN 11
    END;

-- ==============================
-- End of migration
-- ==============================
