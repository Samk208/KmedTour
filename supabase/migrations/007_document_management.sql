-- ============================================================================
-- PART 7: Document Management System
-- ============================================================================

-- Create a table to track patient documents (metadata)
CREATE TABLE IF NOT EXISTS public.patient_documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES public.patient_intakes(id) ON DELETE CASCADE,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    file_name text NOT NULL,
    file_path text NOT NULL, -- Path in Supabase Storage
    file_type text, -- MIME type
    file_size integer, -- In bytes
    document_category text DEFAULT 'general', -- medical_record, passport, visa, receipt, etc.
    description text,
    is_verified boolean DEFAULT false,
    verified_at timestamptz,
    verified_by uuid,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_patient ON public.patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_booking ON public.patient_documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.patient_documents(document_category);

-- RLS for patient_documents
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can view their own documents
DROP POLICY IF EXISTS patient_view_own_documents ON public.patient_documents;
CREATE POLICY patient_view_own_documents ON public.patient_documents
    FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM public.patient_intakes WHERE user_id = auth.uid()
        )
    );

-- Policy: Patients can insert their own documents
DROP POLICY IF EXISTS patient_insert_own_documents ON public.patient_documents;
CREATE POLICY patient_insert_own_documents ON public.patient_documents
    FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM public.patient_intakes WHERE user_id = auth.uid()
        )
    );

-- Policy: Service Role full access
DROP POLICY IF EXISTS service_manage_documents ON public.patient_documents;
CREATE POLICY service_manage_documents ON public.patient_documents
    FOR ALL
    USING (auth.role() = 'service_role');


-- STORAGE BUCKET CONFIGURATION
-- Note: Bucket creation is usually idempotent via API, but good to have script just in case.
-- We will rely on the dashboard/API to actually "create" the bucket if it doesn't exist, 
-- but we can INSERT into storage.buckets if we have permissions (often restricted in SQL Editor).
-- Instead, we will define the POLICIES for the bucket 'patient-records'.
-- Assuming the bucket 'patient-records' exists (User must create it in Dashboard manually or we use CLI).

-- We will output a comment to remind the user to create the bucket 'patient-records' public: false.

-- Storage Policies for 'patient-records' bucket

-- Policy: Give patients access to their own folder: user_id/filename OR patient_id/filename
-- Let's use `patient_id` as the folder root to keep it organized by business entity not auth user.
-- Path Structure: `{patient_id}/{category}/{filename}`

-- Allow Select (Download)
-- Note: 'storage.objects' is the system table. 
-- We verify against our patient_intakes mapping.

-- Complex RLS for Storage is tricky. 
-- Simplest approach: authenticated users can upload to `waiting_room/` folder? 
-- No, let's try to secure it properly.

-- Policy: "Patient Upload"
-- Allow upload if the path starts with their patient_id.
-- (We'll implement the logic in the SQL policy, but it requires joining patient_intakes)

-- Since joining in Storage RLS can be slow/complex or limited, 
-- many people use a custom claim or just rely on a signed URL for uploads.
-- However, for the Portal, standard authenticated upload is best.

-- Let's define the instruction for the USER to create the bucket in the Supabase Dashboard
-- because creating buckets via SQL is not always reliable across all Supabase versions/setups.
