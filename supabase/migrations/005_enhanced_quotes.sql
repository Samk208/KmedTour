-- Migration: 005_enhanced_quotes.sql
-- Purpose: Enhance quotes table with versioning, payment schedules, and hospital responses
-- Date: 2026-01-16

-- ==============================
-- Quote Status Enum (if not exists)
-- ==============================

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM (
        'DRAFT',
        'PENDING_HOSPITAL',
        'READY',
        'SENT',
        'VIEWED',
        'ACCEPTED',
        'REJECTED',
        'EXPIRED',
        'SUPERSEDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================
-- Enhanced Quotes Table
-- ==============================

-- Add new columns to existing quotes table
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
ADD COLUMN IF NOT EXISTS includes jsonb DEFAULT '[]', -- List of what's included
ADD COLUMN IF NOT EXISTS excludes jsonb DEFAULT '[]', -- List of what's not included
ADD COLUMN IF NOT EXISTS terms_and_conditions text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Migrate existing status to new enum
UPDATE public.quotes
SET quote_status = CASE status
    WHEN 'DRAFT' THEN 'DRAFT'::quote_status
    WHEN 'SENT' THEN 'SENT'::quote_status
    WHEN 'PAID' THEN 'ACCEPTED'::quote_status
    WHEN 'EXPIRED' THEN 'EXPIRED'::quote_status
    ELSE 'DRAFT'::quote_status
END
WHERE quote_status IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotes_patient ON public.quotes(patient_id);
CREATE INDEX IF NOT EXISTS idx_quotes_hospital ON public.quotes(hospital_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_status ON public.quotes(quote_status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON public.quotes(valid_until)
    WHERE quote_status IN ('READY', 'SENT', 'VIEWED');
CREATE INDEX IF NOT EXISTS idx_quotes_parent ON public.quotes(parent_quote_id)
    WHERE parent_quote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_created ON public.quotes(created_at DESC);

-- ==============================
-- Function to create quote
-- ==============================

CREATE OR REPLACE FUNCTION public.create_quote(
    p_patient_id uuid,
    p_hospital_id uuid,
    p_total_amount numeric,
    p_currency text DEFAULT 'USD',
    p_breakdown jsonb DEFAULT '{}',
    p_valid_days integer DEFAULT 30,
    p_includes jsonb DEFAULT '[]',
    p_excludes jsonb DEFAULT '[]',
    p_notes_for_patient text DEFAULT NULL,
    p_coordinator_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_quote_id uuid;
    v_deposit_amount numeric;
BEGIN
    -- Calculate deposit (30% of total)
    v_deposit_amount := p_total_amount * 0.3;

    -- Create quote
    INSERT INTO public.quotes (
        patient_id,
        hospital_id,
        total_amount,
        currency,
        breakdown,
        quote_status,
        valid_until,
        includes,
        excludes,
        notes_for_patient,
        coordinator_name,
        payment_schedule
    ) VALUES (
        p_patient_id,
        p_hospital_id,
        p_total_amount,
        p_currency,
        p_breakdown,
        'READY',
        now() + (p_valid_days || ' days')::interval,
        p_includes,
        p_excludes,
        p_notes_for_patient,
        p_coordinator_name,
        jsonb_build_array(
            jsonb_build_object(
                'type', 'deposit',
                'amount', v_deposit_amount,
                'percentage', 30,
                'due', 'On acceptance',
                'status', 'pending'
            ),
            jsonb_build_object(
                'type', 'balance',
                'amount', p_total_amount - v_deposit_amount,
                'percentage', 70,
                'due', '7 days before procedure',
                'status', 'pending'
            )
        )
    )
    RETURNING id INTO v_quote_id;

    -- Log event
    PERFORM public.log_journey_event(
        p_patient_id := p_patient_id,
        p_event_type := 'quote_created',
        p_triggered_by := 'coordinator',
        p_event_data := jsonb_build_object(
            'quote_id', v_quote_id,
            'hospital_id', p_hospital_id,
            'total_amount', p_total_amount,
            'currency', p_currency
        )
    );

    RETURN v_quote_id;
END;
$$;

-- ==============================
-- Function to create quote revision
-- ==============================

CREATE OR REPLACE FUNCTION public.create_quote_revision(
    p_original_quote_id uuid,
    p_total_amount numeric,
    p_breakdown jsonb DEFAULT NULL,
    p_reason text DEFAULT 'Updated pricing'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_original_quote record;
    v_new_quote_id uuid;
    v_new_version integer;
BEGIN
    -- Get original quote
    SELECT * INTO v_original_quote
    FROM public.quotes
    WHERE id = p_original_quote_id;

    IF v_original_quote IS NULL THEN
        RAISE EXCEPTION 'Quote not found: %', p_original_quote_id;
    END IF;

    -- Get next version number
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_new_version
    FROM public.quotes
    WHERE patient_id = v_original_quote.patient_id
      AND hospital_id = v_original_quote.hospital_id;

    -- Mark original as superseded
    UPDATE public.quotes
    SET quote_status = 'SUPERSEDED', updated_at = now()
    WHERE id = p_original_quote_id;

    -- Create new quote
    INSERT INTO public.quotes (
        patient_id,
        hospital_id,
        total_amount,
        currency,
        breakdown,
        quote_status,
        version,
        parent_quote_id,
        valid_until,
        includes,
        excludes,
        notes_for_patient,
        coordinator_name,
        payment_schedule,
        internal_notes
    ) VALUES (
        v_original_quote.patient_id,
        v_original_quote.hospital_id,
        p_total_amount,
        v_original_quote.currency,
        COALESCE(p_breakdown, v_original_quote.breakdown),
        'READY',
        v_new_version,
        p_original_quote_id,
        now() + interval '30 days',
        v_original_quote.includes,
        v_original_quote.excludes,
        v_original_quote.notes_for_patient,
        v_original_quote.coordinator_name,
        v_original_quote.payment_schedule,
        p_reason
    )
    RETURNING id INTO v_new_quote_id;

    -- Log event
    PERFORM public.log_journey_event(
        p_patient_id := v_original_quote.patient_id,
        p_event_type := 'quote_revised',
        p_triggered_by := 'coordinator',
        p_event_data := jsonb_build_object(
            'original_quote_id', p_original_quote_id,
            'new_quote_id', v_new_quote_id,
            'version', v_new_version,
            'reason', p_reason,
            'old_amount', v_original_quote.total_amount,
            'new_amount', p_total_amount
        )
    );

    RETURN v_new_quote_id;
END;
$$;

-- ==============================
-- Function to accept quote
-- ==============================

CREATE OR REPLACE FUNCTION public.accept_quote(
    p_quote_id uuid,
    p_accepted_by text DEFAULT 'patient'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_quote record;
    v_booking_id uuid;
BEGIN
    -- Get and lock quote
    SELECT * INTO v_quote
    FROM public.quotes
    WHERE id = p_quote_id
    FOR UPDATE;

    IF v_quote IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quote not found');
    END IF;

    IF v_quote.quote_status NOT IN ('READY', 'SENT', 'VIEWED') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quote cannot be accepted in current status: ' || v_quote.quote_status);
    END IF;

    IF v_quote.valid_until < now() THEN
        UPDATE public.quotes SET quote_status = 'EXPIRED' WHERE id = p_quote_id;
        RETURN jsonb_build_object('success', false, 'error', 'Quote has expired');
    END IF;

    -- Update quote status
    UPDATE public.quotes
    SET
        quote_status = 'ACCEPTED',
        accepted_at = now(),
        status = 'PAID', -- Legacy field
        updated_at = now()
    WHERE id = p_quote_id;

    -- Create booking
    v_booking_id := public.create_booking_from_quote(p_quote_id);

    -- Update journey state
    PERFORM public.transition_journey_state(
        p_patient_id := v_quote.patient_id,
        p_new_state := 'BOOKING',
        p_triggered_by := p_accepted_by
    );

    -- Log event
    PERFORM public.log_journey_event(
        p_patient_id := v_quote.patient_id,
        p_event_type := 'quote_accepted',
        p_triggered_by := p_accepted_by,
        p_event_data := jsonb_build_object(
            'quote_id', p_quote_id,
            'booking_id', v_booking_id,
            'total_amount', v_quote.total_amount
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'quote_id', p_quote_id,
        'booking_id', v_booking_id
    );
END;
$$;

-- ==============================
-- Function to reject quote
-- ==============================

CREATE OR REPLACE FUNCTION public.reject_quote(
    p_quote_id uuid,
    p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_quote record;
BEGIN
    SELECT * INTO v_quote
    FROM public.quotes
    WHERE id = p_quote_id;

    IF v_quote IS NULL THEN
        RETURN false;
    END IF;

    UPDATE public.quotes
    SET
        quote_status = 'REJECTED',
        rejected_at = now(),
        rejection_reason = p_reason,
        updated_at = now()
    WHERE id = p_quote_id;

    -- Log event
    PERFORM public.log_journey_event(
        p_patient_id := v_quote.patient_id,
        p_event_type := 'quote_rejected',
        p_triggered_by := 'patient',
        p_event_data := jsonb_build_object(
            'quote_id', p_quote_id,
            'reason', p_reason
        )
    );

    RETURN true;
END;
$$;

-- ==============================
-- Function to mark quote as viewed
-- ==============================

CREATE OR REPLACE FUNCTION public.mark_quote_viewed(p_quote_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_quote record;
BEGIN
    SELECT * INTO v_quote
    FROM public.quotes
    WHERE id = p_quote_id;

    IF v_quote IS NULL OR v_quote.viewed_at IS NOT NULL THEN
        RETURN false;
    END IF;

    UPDATE public.quotes
    SET
        quote_status = CASE WHEN quote_status = 'SENT' THEN 'VIEWED' ELSE quote_status END,
        viewed_at = now(),
        updated_at = now()
    WHERE id = p_quote_id;

    -- Log event
    PERFORM public.log_journey_event(
        p_patient_id := v_quote.patient_id,
        p_event_type := 'quote_viewed',
        p_triggered_by := 'patient',
        p_event_data := jsonb_build_object('quote_id', p_quote_id)
    );

    RETURN true;
END;
$$;

-- ==============================
-- View for quote comparison
-- ==============================

CREATE OR REPLACE VIEW public.patient_quotes AS
SELECT
    q.id,
    q.patient_id,
    q.hospital_id,
    c.name as hospital_name,
    c.location as hospital_location,
    c.rating as hospital_rating,
    c.accreditations as hospital_accreditations,
    q.total_amount,
    q.currency,
    q.breakdown,
    q.quote_status,
    q.version,
    q.valid_until,
    q.valid_until > now() as is_valid,
    q.includes,
    q.excludes,
    q.notes_for_patient,
    q.payment_schedule,
    q.created_at,
    q.viewed_at,
    q.accepted_at,
    q.rejected_at
FROM public.quotes q
JOIN public.clinics c ON c.id = q.hospital_id
WHERE q.quote_status NOT IN ('SUPERSEDED', 'DRAFT')
ORDER BY q.patient_id, q.created_at DESC;

-- ==============================
-- Update trigger for quotes
-- ==============================

CREATE OR REPLACE FUNCTION public.update_quote_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_quote_timestamp_trigger ON public.quotes;
CREATE TRIGGER update_quote_timestamp_trigger
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_quote_timestamp();

-- ==============================
-- Row Level Security (already enabled in schema.sql)
-- ==============================

-- Ensure RLS is enabled
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS quotes_service_all ON public.quotes;
CREATE POLICY quotes_service_all ON public.quotes
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Public read
DROP POLICY IF EXISTS quotes_public_read ON public.quotes;
CREATE POLICY quotes_public_read ON public.quotes
    FOR SELECT
    USING (true);

-- ==============================
-- End of migration
-- ==============================
