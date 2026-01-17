-- Migration: 003_bookings.sql
-- Purpose: Create full booking management table
-- Date: 2026-01-16

-- ==============================
-- Booking Status Enum
-- ==============================

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'PENDING',
        'AWAITING_HOSPITAL',
        'CONFIRMED',
        'DEPOSIT_PAID',
        'FULLY_PAID',
        'CANCELLED',
        'RESCHEDULED',
        'IN_PROGRESS',
        'COMPLETED',
        'NO_SHOW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================
-- Bookings Table
-- ==============================

CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES public.patient_intakes(id) ON DELETE RESTRICT,
    quote_id uuid REFERENCES public.quotes(id),
    hospital_id uuid NOT NULL REFERENCES public.clinics(id),

    -- Booking status
    status booking_status NOT NULL DEFAULT 'PENDING',
    status_updated_at timestamptz NOT NULL DEFAULT now(),
    status_notes text,

    -- Procedure details
    procedure_name text NOT NULL,
    procedure_date date,
    procedure_time time,
    estimated_duration_days integer,
    actual_procedure_date date,

    -- Hospital coordinator info
    coordinator_name text,
    coordinator_email text,
    coordinator_phone text,
    hospital_reference_number text,
    hospital_confirmation_data jsonb,

    -- Travel details
    arrival_date date,
    arrival_flight text,
    arrival_time time,
    departure_date date,
    departure_flight text,

    -- Accommodation
    accommodation_type text, -- 'hospital_arranged' | 'self_arranged' | 'platform_arranged'
    accommodation_name text,
    accommodation_address text,
    accommodation_check_in date,
    accommodation_check_out date,
    accommodation_details jsonb,

    -- Transfers
    airport_pickup_arranged boolean DEFAULT false,
    airport_pickup_details jsonb,
    airport_dropoff_arranged boolean DEFAULT false,
    airport_dropoff_details jsonb,

    -- Financial
    total_amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    deposit_amount numeric,
    deposit_due_date date,
    deposit_paid_at timestamptz,
    balance_amount numeric,
    balance_due_date date,
    balance_paid_at timestamptz,
    fully_paid_at timestamptz,

    -- Stripe integration
    stripe_customer_id text,
    stripe_payment_intent_ids text[],
    stripe_checkout_session_ids text[],

    -- Breakdown
    cost_breakdown jsonb DEFAULT '{}', -- { procedure: 5000, hospital_stay: 1200, medication: 300, ... }

    -- Patient requirements
    special_requirements text,
    dietary_requirements text,
    mobility_requirements text,
    medical_equipment_needed text[],

    -- Documents
    visa_letter_url text,
    visa_letter_generated_at timestamptz,
    medical_summary_url text,
    travel_itinerary_url text,
    booking_confirmation_pdf_url text,

    -- Communication preferences
    preferred_contact_method text DEFAULT 'whatsapp', -- 'email' | 'whatsapp' | 'phone'
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relation text,

    -- Notes
    internal_notes text, -- For coordinators
    patient_notes text, -- From patient

    -- Metadata
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_patient ON public.bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hospital ON public.bookings(hospital_id);
CREATE INDEX IF NOT EXISTS idx_bookings_quote ON public.bookings(quote_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_procedure_date ON public.bookings(procedure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming ON public.bookings(procedure_date)
    WHERE status IN ('CONFIRMED', 'DEPOSIT_PAID', 'FULLY_PAID');

-- ==============================
-- Booking status update trigger
-- ==============================

CREATE OR REPLACE FUNCTION public.update_booking_status_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.status_updated_at := now();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_booking_status_trigger ON public.bookings;
CREATE TRIGGER update_booking_status_trigger
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_booking_status_timestamp();

-- ==============================
-- Function to create booking from quote
-- ==============================

CREATE OR REPLACE FUNCTION public.create_booking_from_quote(
    p_quote_id uuid,
    p_procedure_date date DEFAULT NULL,
    p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_quote record;
    v_booking_id uuid;
    v_treatment_title text;
BEGIN
    -- Get quote details
    SELECT q.*, c.name as hospital_name
    INTO v_quote
    FROM public.quotes q
    JOIN public.clinics c ON c.id = q.hospital_id
    WHERE q.id = p_quote_id;

    IF v_quote IS NULL THEN
        RAISE EXCEPTION 'Quote not found: %', p_quote_id;
    END IF;

    -- Get treatment name from patient intake
    SELECT t.title INTO v_treatment_title
    FROM public.patient_intakes pi
    JOIN public.treatments t ON t.slug = pi.treatment_type_slug
    WHERE pi.id = v_quote.patient_id;

    -- Create booking
    INSERT INTO public.bookings (
        patient_id,
        quote_id,
        hospital_id,
        status,
        procedure_name,
        procedure_date,
        total_amount,
        currency,
        deposit_amount,
        cost_breakdown,
        internal_notes
    ) VALUES (
        v_quote.patient_id,
        p_quote_id,
        v_quote.hospital_id,
        'PENDING',
        COALESCE(v_treatment_title, 'Medical Procedure'),
        p_procedure_date,
        v_quote.total_amount,
        v_quote.currency,
        COALESCE((v_quote.breakdown->>'consultation')::numeric, v_quote.total_amount * 0.3),
        v_quote.breakdown,
        p_notes
    )
    RETURNING id INTO v_booking_id;

    -- Update quote status
    UPDATE public.quotes
    SET status = 'PAID'
    WHERE id = p_quote_id;

    -- Log event
    PERFORM public.log_journey_event(
        p_patient_id := v_quote.patient_id,
        p_event_type := 'booking_created',
        p_triggered_by := 'system',
        p_event_data := jsonb_build_object(
            'booking_id', v_booking_id,
            'quote_id', p_quote_id,
            'hospital_id', v_quote.hospital_id,
            'total_amount', v_quote.total_amount
        )
    );

    RETURN v_booking_id;
END;
$$;

-- ==============================
-- Function to get booking details
-- ==============================

CREATE OR REPLACE FUNCTION public.get_booking_details(p_booking_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
    SELECT jsonb_build_object(
        'booking', to_jsonb(b.*),
        'patient', to_jsonb(pi.*),
        'hospital', to_jsonb(c.*),
        'quote', to_jsonb(q.*),
        'journey_state', to_jsonb(pjs.*)
    )
    FROM public.bookings b
    JOIN public.patient_intakes pi ON pi.id = b.patient_id
    JOIN public.clinics c ON c.id = b.hospital_id
    LEFT JOIN public.quotes q ON q.id = b.quote_id
    LEFT JOIN public.patient_journey_state pjs ON pjs.patient_id = b.patient_id
    WHERE b.id = p_booking_id;
$$;

-- ==============================
-- View for coordinator dashboard
-- ==============================

CREATE OR REPLACE VIEW public.bookings_dashboard AS
SELECT
    b.id,
    b.status,
    b.procedure_name,
    b.procedure_date,
    b.total_amount,
    b.currency,
    b.deposit_paid_at IS NOT NULL as deposit_paid,
    b.fully_paid_at IS NOT NULL as fully_paid,
    pi.full_name as patient_name,
    pi.email as patient_email,
    pi.phone as patient_phone,
    pi.country_of_residence as patient_country,
    c.name as hospital_name,
    c.location as hospital_location,
    b.coordinator_name,
    pjs.state as journey_state,
    b.arrival_date,
    b.departure_date,
    b.created_at,
    b.updated_at
FROM public.bookings b
JOIN public.patient_intakes pi ON pi.id = b.patient_id
JOIN public.clinics c ON c.id = b.hospital_id
LEFT JOIN public.patient_journey_state pjs ON pjs.patient_id = b.patient_id
ORDER BY
    CASE b.status
        WHEN 'PENDING' THEN 1
        WHEN 'AWAITING_HOSPITAL' THEN 2
        WHEN 'CONFIRMED' THEN 3
        WHEN 'DEPOSIT_PAID' THEN 4
        WHEN 'FULLY_PAID' THEN 5
        WHEN 'IN_PROGRESS' THEN 6
        ELSE 10
    END,
    b.procedure_date ASC NULLS LAST;

-- ==============================
-- View for upcoming bookings
-- ==============================

CREATE OR REPLACE VIEW public.upcoming_bookings AS
SELECT
    b.*,
    pi.full_name as patient_name,
    pi.email as patient_email,
    c.name as hospital_name,
    b.procedure_date - CURRENT_DATE as days_until_procedure
FROM public.bookings b
JOIN public.patient_intakes pi ON pi.id = b.patient_id
JOIN public.clinics c ON c.id = b.hospital_id
WHERE b.status IN ('CONFIRMED', 'DEPOSIT_PAID', 'FULLY_PAID')
  AND b.procedure_date >= CURRENT_DATE
ORDER BY b.procedure_date ASC;

-- ==============================
-- Row Level Security
-- ==============================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS bookings_service_all ON public.bookings;
CREATE POLICY bookings_service_all ON public.bookings
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Public read (for patient dashboard with patient_id filter in app)
DROP POLICY IF EXISTS bookings_public_read ON public.bookings;
CREATE POLICY bookings_public_read ON public.bookings
    FOR SELECT
    USING (true);

-- ==============================
-- End of migration
-- ==============================
