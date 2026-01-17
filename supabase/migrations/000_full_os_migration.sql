-- ============================================================================
-- KmedTour Medical Tourism Operating System - Full Migration
-- ============================================================================
--
-- This file combines all OS migrations into a single file for easy execution.
-- Run this in Supabase SQL Editor: https://supabase.kmedtour.com/project/default/sql
--
-- Migrations included:
--   001_journey_state_machine.sql
--   002_journey_events.sql
--   003_bookings.sql
--   004_notifications.sql
--   005_enhanced_quotes.sql
--
-- Date: 2026-01-16
-- ============================================================================

-- ============================================================================
-- PART 1: Journey State Machine
-- ============================================================================

-- Journey State Enum
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

-- Enhanced patient_journey_state table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journey_state_state ON public.patient_journey_state(state);
CREATE INDEX IF NOT EXISTS idx_journey_state_updated ON public.patient_journey_state(last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_state_coordinator ON public.patient_journey_state(assigned_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_journey_state_entered ON public.patient_journey_state(state_entered_at DESC);

-- State transition validation function
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
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    IF OLD.state = NEW.state THEN
        RETURN NEW;
    END IF;
    allowed_states := valid_transitions->OLD.state::text;
    IF NOT (allowed_states ? NEW.state::text) THEN
        RAISE EXCEPTION 'Invalid state transition from % to %', OLD.state, NEW.state;
    END IF;
    NEW.previous_state := OLD.state;
    NEW.state_entered_at := now();
    NEW.last_updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_journey_state_transition_trigger ON public.patient_journey_state;
CREATE TRIGGER validate_journey_state_transition_trigger
    BEFORE UPDATE ON public.patient_journey_state
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_journey_state_transition();

-- Helper function to get journey state
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

-- RLS for patient_journey_state
ALTER TABLE public.patient_journey_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS journey_state_service_all ON public.patient_journey_state;
CREATE POLICY journey_state_service_all ON public.patient_journey_state
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS journey_state_public_read ON public.patient_journey_state;
CREATE POLICY journey_state_public_read ON public.patient_journey_state
    FOR SELECT USING (true);

-- ============================================================================
-- PART 2: Journey Events (Audit Log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.journey_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES public.patient_intakes(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    from_state journey_state,
    to_state journey_state,
    triggered_by text NOT NULL,
    agent_id text,
    coordinator_id uuid,
    coordinator_name text,
    event_data jsonb NOT NULL DEFAULT '{}',
    error_message text,
    error_stack text,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journey_events_patient ON public.journey_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_type ON public.journey_events(event_type);
CREATE INDEX IF NOT EXISTS idx_journey_events_created ON public.journey_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_events_state_change ON public.journey_events(patient_id, event_type)
    WHERE event_type = 'state_change';

-- Function to log journey events
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
        patient_id, event_type, from_state, to_state, triggered_by,
        agent_id, coordinator_id, coordinator_name, event_data, error_message
    ) VALUES (
        p_patient_id, p_event_type, p_from_state, p_to_state, p_triggered_by,
        p_agent_id, p_coordinator_id, p_coordinator_name, p_event_data, p_error_message
    )
    RETURNING id INTO v_event_id;
    RETURN v_event_id;
END;
$$;

-- Function to get journey timeline
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
        je.id as event_id, je.event_type, je.from_state, je.to_state,
        je.triggered_by, je.agent_id, je.coordinator_name,
        je.event_data, je.error_message, je.created_at
    FROM public.journey_events je
    WHERE je.patient_id = p_patient_id
      AND (p_event_types IS NULL OR je.event_type = ANY(p_event_types))
    ORDER BY je.created_at DESC
    LIMIT p_limit OFFSET p_offset;
$$;

-- RLS for journey_events
ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS journey_events_service_all ON public.journey_events;
CREATE POLICY journey_events_service_all ON public.journey_events
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS journey_events_public_read ON public.journey_events;
CREATE POLICY journey_events_public_read ON public.journey_events
    FOR SELECT USING (true);

-- ============================================================================
-- PART 3: Bookings Table
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'PENDING', 'AWAITING_HOSPITAL', 'CONFIRMED', 'DEPOSIT_PAID',
        'FULLY_PAID', 'CANCELLED', 'RESCHEDULED', 'IN_PROGRESS',
        'COMPLETED', 'NO_SHOW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES public.patient_intakes(id) ON DELETE RESTRICT,
    quote_id uuid REFERENCES public.quotes(id),
    hospital_id uuid NOT NULL REFERENCES public.clinics(id),
    status booking_status NOT NULL DEFAULT 'PENDING',
    status_updated_at timestamptz NOT NULL DEFAULT now(),
    status_notes text,
    procedure_name text NOT NULL,
    procedure_date date,
    procedure_time time,
    estimated_duration_days integer,
    actual_procedure_date date,
    coordinator_name text,
    coordinator_email text,
    coordinator_phone text,
    hospital_reference_number text,
    hospital_confirmation_data jsonb,
    arrival_date date,
    arrival_flight text,
    arrival_time time,
    departure_date date,
    departure_flight text,
    accommodation_type text,
    accommodation_name text,
    accommodation_address text,
    accommodation_check_in date,
    accommodation_check_out date,
    accommodation_details jsonb,
    airport_pickup_arranged boolean DEFAULT false,
    airport_pickup_details jsonb,
    airport_dropoff_arranged boolean DEFAULT false,
    airport_dropoff_details jsonb,
    total_amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    deposit_amount numeric,
    deposit_due_date date,
    deposit_paid_at timestamptz,
    balance_amount numeric,
    balance_due_date date,
    balance_paid_at timestamptz,
    fully_paid_at timestamptz,
    stripe_customer_id text,
    stripe_payment_intent_ids text[],
    stripe_checkout_session_ids text[],
    cost_breakdown jsonb DEFAULT '{}',
    special_requirements text,
    dietary_requirements text,
    mobility_requirements text,
    medical_equipment_needed text[],
    visa_letter_url text,
    visa_letter_generated_at timestamptz,
    medical_summary_url text,
    travel_itinerary_url text,
    booking_confirmation_pdf_url text,
    preferred_contact_method text DEFAULT 'whatsapp',
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relation text,
    internal_notes text,
    patient_notes text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_patient ON public.bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hospital ON public.bookings(hospital_id);
CREATE INDEX IF NOT EXISTS idx_bookings_quote ON public.bookings(quote_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_procedure_date ON public.bookings(procedure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON public.bookings(created_at DESC);

-- RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bookings_service_all ON public.bookings;
CREATE POLICY bookings_service_all ON public.bookings
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS bookings_public_read ON public.bookings;
CREATE POLICY bookings_public_read ON public.bookings
    FOR SELECT USING (true);

-- ============================================================================
-- PART 4: Notifications System
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'PUSH', 'IN_APP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM (
        'PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.notification_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    category text,
    email_subject text,
    email_body_html text,
    email_body_text text,
    whatsapp_template_name text,
    whatsapp_template_language text DEFAULT 'en',
    whatsapp_body_template text,
    sms_body text,
    push_title text,
    push_body text,
    in_app_title text,
    in_app_body text,
    in_app_action_url text,
    required_variables text[],
    default_channels notification_channel[] DEFAULT ARRAY['EMAIL']::notification_channel[],
    priority notification_priority DEFAULT 'NORMAL',
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default templates
INSERT INTO public.notification_templates (template_id, name, description, category, email_subject, whatsapp_template_name, required_variables, default_channels) VALUES
    ('welcome', 'Welcome Email', 'Sent after patient intake', 'journey', 'Welcome to KmedTour', NULL, ARRAY['patient_name'], ARRAY['EMAIL']::notification_channel[]),
    ('quote_ready', 'Quote Ready', 'Sent when quote is ready', 'journey', 'Your Quote is Ready', 'quote_notification', ARRAY['patient_name', 'hospital_name', 'total_amount'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('booking_confirmed', 'Booking Confirmed', 'Sent when booking confirmed', 'journey', 'Booking Confirmed!', 'booking_confirmation', ARRAY['patient_name', 'hospital_name', 'procedure_date'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('payment_received', 'Payment Received', 'Sent after payment', 'payment', 'Payment Confirmed', 'payment_confirmation', ARRAY['patient_name', 'amount'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('reminder_24h', '24 Hour Reminder', 'Sent 24h before', 'reminder', 'Your Procedure is Tomorrow', 'appointment_reminder', ARRAY['patient_name', 'hospital_name'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[])
ON CONFLICT (template_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid REFERENCES public.patient_intakes(id) ON DELETE SET NULL,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    recipient_email text,
    recipient_phone text,
    channel notification_channel NOT NULL,
    status notification_status NOT NULL DEFAULT 'PENDING',
    priority notification_priority NOT NULL DEFAULT 'NORMAL',
    template_id text REFERENCES public.notification_templates(template_id),
    subject text,
    body text NOT NULL,
    body_html text,
    variables jsonb DEFAULT '{}',
    external_id text,
    provider text,
    scheduled_for timestamptz,
    queued_at timestamptz,
    sent_at timestamptz,
    delivered_at timestamptz,
    read_at timestamptz,
    failed_at timestamptz,
    error_message text,
    error_code text,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    last_retry_at timestamptz,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_patient ON public.notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON public.notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_templates_public_read ON public.notification_templates;
CREATE POLICY notification_templates_public_read ON public.notification_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS notifications_service_all ON public.notifications;
CREATE POLICY notifications_service_all ON public.notifications
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS notifications_public_read ON public.notifications;
CREATE POLICY notifications_public_read ON public.notifications FOR SELECT USING (true);

-- ============================================================================
-- PART 5: Enhanced Quotes
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM (
        'DRAFT', 'PENDING_HOSPITAL', 'READY', 'SENT', 'VIEWED',
        'ACCEPTED', 'REJECTED', 'EXPIRED', 'SUPERSEDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS quote_status quote_status DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_quote_id uuid REFERENCES public.quotes(id),
ADD COLUMN IF NOT EXISTS valid_until timestamptz,
ADD COLUMN IF NOT EXISTS viewed_at timestamptz,
ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS hospital_response_data jsonb,
ADD COLUMN IF NOT EXISTS hospital_response_at timestamptz,
ADD COLUMN IF NOT EXISTS payment_schedule jsonb,
ADD COLUMN IF NOT EXISTS notes_for_patient text,
ADD COLUMN IF NOT EXISTS internal_notes text,
ADD COLUMN IF NOT EXISTS coordinator_id uuid,
ADD COLUMN IF NOT EXISTS coordinator_name text,
ADD COLUMN IF NOT EXISTS includes jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS excludes jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS terms_and_conditions text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_quotes_patient ON public.quotes(patient_id);
CREATE INDEX IF NOT EXISTS idx_quotes_hospital ON public.quotes(hospital_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_status ON public.quotes(quote_status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON public.quotes(created_at DESC);

-- RLS for quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quotes_service_all ON public.quotes;
CREATE POLICY quotes_service_all ON public.quotes
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS quotes_public_read ON public.quotes;
CREATE POLICY quotes_public_read ON public.quotes FOR SELECT USING (true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Tables created/modified:
--   - patient_journey_state (enhanced with state machine)
--   - journey_events (new - audit log)
--   - bookings (new - full booking management)
--   - notification_templates (new - email/whatsapp templates)
--   - notifications (new - multi-channel notifications)
--   - quotes (enhanced with versioning, status tracking)
--
-- Enums created:
--   - journey_state
--   - booking_status
--   - notification_channel
--   - notification_status
--   - notification_priority
--   - quote_status
--
-- Functions created:
--   - validate_journey_state_transition()
--   - get_journey_state()
--   - log_journey_event()
--   - get_journey_timeline()
--
-- ============================================================================
