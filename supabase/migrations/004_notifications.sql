-- Migration: 004_notifications.sql
-- Purpose: Create multi-channel notification tracking system
-- Date: 2026-01-16

-- ==============================
-- Notification Enums
-- ==============================

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM (
        'EMAIL',
        'WHATSAPP',
        'SMS',
        'PUSH',
        'IN_APP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM (
        'PENDING',
        'QUEUED',
        'SENT',
        'DELIVERED',
        'READ',
        'FAILED',
        'BOUNCED',
        'UNSUBSCRIBED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM (
        'LOW',
        'NORMAL',
        'HIGH',
        'URGENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================
-- Notification Templates Table
-- ==============================

CREATE TABLE IF NOT EXISTS public.notification_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id text NOT NULL UNIQUE, -- e.g., 'quote_ready', 'booking_confirmed'

    -- Template details
    name text NOT NULL,
    description text,
    category text, -- 'journey' | 'payment' | 'reminder' | 'marketing'

    -- Channel-specific content
    email_subject text,
    email_body_html text,
    email_body_text text,

    whatsapp_template_name text, -- Pre-approved WhatsApp template name
    whatsapp_template_language text DEFAULT 'en',
    whatsapp_body_template text, -- Template with {{variables}}

    sms_body text,

    push_title text,
    push_body text,

    in_app_title text,
    in_app_body text,
    in_app_action_url text,

    -- Variables this template expects
    required_variables text[], -- e.g., ['patient_name', 'quote_amount', 'hospital_name']

    -- Settings
    default_channels notification_channel[] DEFAULT ARRAY['EMAIL']::notification_channel[],
    priority notification_priority DEFAULT 'NORMAL',
    is_active boolean DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default templates
INSERT INTO public.notification_templates (template_id, name, description, category, email_subject, whatsapp_template_name, required_variables, default_channels) VALUES
    ('welcome', 'Welcome Email', 'Sent after patient intake submission', 'journey', 'Welcome to KmedTour - Your Medical Journey Begins', NULL, ARRAY['patient_name', 'treatment_type'], ARRAY['EMAIL']::notification_channel[]),
    ('quote_ready', 'Quote Ready', 'Sent when quote is generated', 'journey', 'Your Medical Quote is Ready - KmedTour', 'quote_notification', ARRAY['patient_name', 'hospital_name', 'total_amount', 'quote_url'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('booking_confirmed', 'Booking Confirmed', 'Sent when hospital confirms booking', 'journey', 'Booking Confirmed! - KmedTour', 'booking_confirmation', ARRAY['patient_name', 'hospital_name', 'procedure_date', 'booking_reference'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('payment_received', 'Payment Received', 'Sent after successful payment', 'payment', 'Payment Confirmed - KmedTour', 'payment_confirmation', ARRAY['patient_name', 'amount', 'payment_type'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('reminder_7d', '7 Day Reminder', 'Sent 7 days before procedure', 'reminder', 'Your Procedure is in 7 Days - KmedTour', 'appointment_reminder', ARRAY['patient_name', 'hospital_name', 'procedure_date'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('reminder_24h', '24 Hour Reminder', 'Sent 24 hours before procedure', 'reminder', 'Your Procedure is Tomorrow - KmedTour', 'appointment_reminder', ARRAY['patient_name', 'hospital_name', 'procedure_time'], ARRAY['EMAIL', 'WHATSAPP']::notification_channel[]),
    ('pre_travel_checklist', 'Pre-Travel Checklist', 'Sent before departure', 'journey', 'Pre-Travel Checklist - KmedTour', NULL, ARRAY['patient_name', 'departure_date', 'checklist_items'], ARRAY['EMAIL']::notification_channel[]),
    ('post_care_instructions', 'Post-Care Instructions', 'Sent after treatment completion', 'journey', 'Your Post-Care Instructions - KmedTour', NULL, ARRAY['patient_name', 'procedure_name', 'instructions'], ARRAY['EMAIL']::notification_channel[]),
    ('followup_survey', 'Follow-up Survey', 'Sent for outcome tracking', 'journey', 'How Was Your Experience? - KmedTour', NULL, ARRAY['patient_name', 'survey_url'], ARRAY['EMAIL']::notification_channel[])
ON CONFLICT (template_id) DO NOTHING;

-- ==============================
-- Notifications Table
-- ==============================

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Recipients
    patient_id uuid REFERENCES public.patient_intakes(id) ON DELETE SET NULL,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    recipient_email text,
    recipient_phone text, -- For SMS/WhatsApp

    -- Notification details
    channel notification_channel NOT NULL,
    status notification_status NOT NULL DEFAULT 'PENDING',
    priority notification_priority NOT NULL DEFAULT 'NORMAL',
    template_id text REFERENCES public.notification_templates(template_id),

    -- Content (rendered from template or custom)
    subject text,
    body text NOT NULL,
    body_html text,
    variables jsonb DEFAULT '{}', -- Variables used to render template

    -- Delivery tracking
    external_id text, -- Resend message ID, WhatsApp message ID, etc.
    provider text, -- 'resend' | 'whatsapp' | 'twilio' | 'firebase'

    -- Timestamps
    scheduled_for timestamptz, -- For scheduled notifications
    queued_at timestamptz,
    sent_at timestamptz,
    delivered_at timestamptz,
    read_at timestamptz,
    failed_at timestamptz,

    -- Error tracking
    error_message text,
    error_code text,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    last_retry_at timestamptz,

    -- Metadata
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON public.notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_booking ON public.notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON public.notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_template ON public.notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.notifications(scheduled_for)
    WHERE status = 'PENDING' AND scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_pending ON public.notifications(created_at)
    WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_notifications_failed_retry ON public.notifications(last_retry_at)
    WHERE status = 'FAILED' AND retry_count < max_retries;

-- ==============================
-- Function to queue notification
-- ==============================

CREATE OR REPLACE FUNCTION public.queue_notification(
    p_patient_id uuid,
    p_template_id text,
    p_variables jsonb,
    p_channels notification_channel[] DEFAULT NULL,
    p_booking_id uuid DEFAULT NULL,
    p_scheduled_for timestamptz DEFAULT NULL,
    p_priority notification_priority DEFAULT 'NORMAL'
)
RETURNS uuid[]
LANGUAGE plpgsql
AS $$
DECLARE
    v_template record;
    v_patient record;
    v_notification_ids uuid[] := ARRAY[]::uuid[];
    v_notification_id uuid;
    v_channel notification_channel;
    v_channels notification_channel[];
    v_subject text;
    v_body text;
BEGIN
    -- Get template
    SELECT * INTO v_template
    FROM public.notification_templates
    WHERE template_id = p_template_id AND is_active = true;

    IF v_template IS NULL THEN
        RAISE EXCEPTION 'Template not found or inactive: %', p_template_id;
    END IF;

    -- Get patient info
    SELECT full_name, email, phone INTO v_patient
    FROM public.patient_intakes
    WHERE id = p_patient_id;

    -- Use provided channels or default from template
    v_channels := COALESCE(p_channels, v_template.default_channels);

    -- Create notification for each channel
    FOREACH v_channel IN ARRAY v_channels
    LOOP
        -- Determine subject and body based on channel
        CASE v_channel
            WHEN 'EMAIL' THEN
                v_subject := v_template.email_subject;
                v_body := COALESCE(v_template.email_body_text, v_template.name);
            WHEN 'WHATSAPP' THEN
                v_subject := NULL;
                v_body := COALESCE(v_template.whatsapp_body_template, v_template.name);
            WHEN 'SMS' THEN
                v_subject := NULL;
                v_body := COALESCE(v_template.sms_body, v_template.name);
            WHEN 'PUSH' THEN
                v_subject := v_template.push_title;
                v_body := COALESCE(v_template.push_body, v_template.name);
            WHEN 'IN_APP' THEN
                v_subject := v_template.in_app_title;
                v_body := COALESCE(v_template.in_app_body, v_template.name);
        END CASE;

        -- Insert notification
        INSERT INTO public.notifications (
            patient_id,
            booking_id,
            recipient_email,
            recipient_phone,
            channel,
            status,
            priority,
            template_id,
            subject,
            body,
            body_html,
            variables,
            scheduled_for
        ) VALUES (
            p_patient_id,
            p_booking_id,
            v_patient.email,
            v_patient.phone,
            v_channel,
            CASE WHEN p_scheduled_for IS NOT NULL THEN 'PENDING' ELSE 'QUEUED' END,
            p_priority,
            p_template_id,
            v_subject,
            v_body,
            CASE WHEN v_channel = 'EMAIL' THEN v_template.email_body_html ELSE NULL END,
            p_variables,
            p_scheduled_for
        )
        RETURNING id INTO v_notification_id;

        v_notification_ids := v_notification_ids || v_notification_id;
    END LOOP;

    -- Log event
    PERFORM public.log_journey_event(
        p_patient_id := p_patient_id,
        p_event_type := 'notification',
        p_triggered_by := 'system',
        p_event_data := jsonb_build_object(
            'template_id', p_template_id,
            'channels', v_channels,
            'notification_ids', v_notification_ids,
            'scheduled_for', p_scheduled_for
        )
    );

    RETURN v_notification_ids;
END;
$$;

-- ==============================
-- Function to update notification status
-- ==============================

CREATE OR REPLACE FUNCTION public.update_notification_status(
    p_notification_id uuid,
    p_status notification_status,
    p_external_id text DEFAULT NULL,
    p_error_message text DEFAULT NULL,
    p_error_code text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.notifications
    SET
        status = p_status,
        external_id = COALESCE(p_external_id, external_id),
        error_message = p_error_message,
        error_code = p_error_code,
        sent_at = CASE WHEN p_status = 'SENT' THEN now() ELSE sent_at END,
        delivered_at = CASE WHEN p_status = 'DELIVERED' THEN now() ELSE delivered_at END,
        read_at = CASE WHEN p_status = 'READ' THEN now() ELSE read_at END,
        failed_at = CASE WHEN p_status = 'FAILED' THEN now() ELSE failed_at END,
        queued_at = CASE WHEN p_status = 'QUEUED' THEN now() ELSE queued_at END,
        retry_count = CASE WHEN p_status = 'FAILED' THEN retry_count + 1 ELSE retry_count END,
        last_retry_at = CASE WHEN p_status = 'FAILED' THEN now() ELSE last_retry_at END
    WHERE id = p_notification_id;

    RETURN FOUND;
END;
$$;

-- ==============================
-- Function to get pending notifications for processing
-- ==============================

CREATE OR REPLACE FUNCTION public.get_pending_notifications(
    p_channel notification_channel DEFAULT NULL,
    p_limit integer DEFAULT 100
)
RETURNS TABLE (
    notification_id uuid,
    patient_id uuid,
    channel notification_channel,
    recipient_email text,
    recipient_phone text,
    template_id text,
    subject text,
    body text,
    body_html text,
    variables jsonb,
    priority notification_priority
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        n.id as notification_id,
        n.patient_id,
        n.channel,
        n.recipient_email,
        n.recipient_phone,
        n.template_id,
        n.subject,
        n.body,
        n.body_html,
        n.variables,
        n.priority
    FROM public.notifications n
    WHERE n.status = 'QUEUED'
      AND (p_channel IS NULL OR n.channel = p_channel)
      AND (n.scheduled_for IS NULL OR n.scheduled_for <= now())
    ORDER BY
        CASE n.priority
            WHEN 'URGENT' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'NORMAL' THEN 3
            WHEN 'LOW' THEN 4
        END,
        n.created_at ASC
    LIMIT p_limit;
$$;

-- ==============================
-- View for notification analytics
-- ==============================

CREATE OR REPLACE VIEW public.notification_stats AS
SELECT
    date_trunc('day', created_at) as date,
    channel,
    template_id,
    status,
    COUNT(*) as count
FROM public.notifications
GROUP BY date_trunc('day', created_at), channel, template_id, status
ORDER BY date DESC, channel, template_id;

-- ==============================
-- Row Level Security
-- ==============================

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Templates: public read, service write
DROP POLICY IF EXISTS notification_templates_public_read ON public.notification_templates;
CREATE POLICY notification_templates_public_read ON public.notification_templates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS notification_templates_service_write ON public.notification_templates;
CREATE POLICY notification_templates_service_write ON public.notification_templates
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Notifications: service role full access, public read own
DROP POLICY IF EXISTS notifications_service_all ON public.notifications;
CREATE POLICY notifications_service_all ON public.notifications
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS notifications_public_read ON public.notifications;
CREATE POLICY notifications_public_read ON public.notifications
    FOR SELECT USING (true);

-- ==============================
-- End of migration
-- ==============================
