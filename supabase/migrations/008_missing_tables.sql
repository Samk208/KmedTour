-- ============================================================================
-- KmedTour Missing Tables Migration
-- Migration: 008_missing_tables.sql
-- Date: 2026-01-19
-- Run on: https://supabase.kmedtour.com/project/default/sql
-- ============================================================================
--
-- This migration adds the 4 missing tables identified in the database audit:
--   1. rag_documents - RAG system document storage
--   2. rag_chunks - RAG system with vector embeddings (for /api/rag/chat)
--   3. review_queue - Medical Safety Layer persistence
--   4. patient_portal_users - Patient authentication
--
-- ============================================================================

-- Enable pgvector extension (required for vector embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 1. RAG SYSTEM (Required for /api/rag/chat to work)
-- ============================================================================

-- RAG Documents table - stores source documents
CREATE TABLE IF NOT EXISTS public.rag_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    source_url text,
    source_type text DEFAULT 'manual', -- 'manual', 'web_scrape', 'pdf', 'api'
    content_hash text, -- For deduplication
    metadata jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- RAG Chunks table - stores document chunks with vector embeddings
-- Gemini text-embedding-004 uses 768 dimensions
CREATE TABLE IF NOT EXISTS public.rag_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    embedding vector(768), -- Gemini text-embedding-004 = 768 dimensions
    token_count integer,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for RAG system
CREATE INDEX IF NOT EXISTS idx_rag_documents_active ON public.rag_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_rag_documents_created ON public.rag_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_document ON public.rag_chunks(document_id);

-- Vector similarity index (IVFFlat for fast approximate nearest neighbor search)
-- Note: This index works best with 100+ vectors. For smaller datasets, exact search is used.
CREATE INDEX IF NOT EXISTS idx_rag_chunks_embedding ON public.rag_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Vector similarity search function (called by /api/rag/chat route)
CREATE OR REPLACE FUNCTION public.match_rag_chunks(
    query_embedding vector(768),
    match_count integer DEFAULT 5,
    min_similarity float DEFAULT 0.5
)
RETURNS TABLE (
    chunk_id uuid,
    document_id uuid,
    title text,
    source_url text,
    content text,
    similarity float,
    metadata jsonb
)
LANGUAGE sql STABLE
AS $$
    SELECT
        c.id AS chunk_id,
        c.document_id,
        d.title,
        d.source_url,
        c.content,
        1 - (c.embedding <=> query_embedding) AS similarity,
        c.metadata
    FROM public.rag_chunks c
    JOIN public.rag_documents d ON d.id = c.document_id
    WHERE d.is_active = true
      AND 1 - (c.embedding <=> query_embedding) > min_similarity
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- RLS Policies for RAG tables
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rag_documents_public_read ON public.rag_documents;
CREATE POLICY rag_documents_public_read ON public.rag_documents
    FOR SELECT USING (true);

DROP POLICY IF EXISTS rag_documents_service_write ON public.rag_documents;
CREATE POLICY rag_documents_service_write ON public.rag_documents
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS rag_chunks_public_read ON public.rag_chunks;
CREATE POLICY rag_chunks_public_read ON public.rag_chunks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS rag_chunks_service_write ON public.rag_chunks;
CREATE POLICY rag_chunks_service_write ON public.rag_chunks
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.rag_documents TO anon, authenticated;
GRANT SELECT ON public.rag_chunks TO anon, authenticated;
GRANT ALL ON public.rag_documents TO service_role;
GRANT ALL ON public.rag_chunks TO service_role;

-- ============================================================================
-- 2. REVIEW QUEUE (Required for Medical Safety Layer to persist flagged responses)
-- ============================================================================

-- Review Queue table - stores AI responses flagged by MedicalSafetyLayer
CREATE TABLE IF NOT EXISTS public.review_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Status tracking
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'escalated'

    -- Violation details from MedicalSafetyLayer
    violations jsonb NOT NULL DEFAULT '[]',
    unsafe_response text NOT NULL,

    -- Context
    context jsonb DEFAULT '[]', -- Previous messages in conversation
    query_type text, -- 'faq', 'medical_info', 'emergency', 'human'

    -- Patient linkage (optional)
    patient_id uuid REFERENCES public.patient_intakes(id) ON DELETE SET NULL,
    session_id text,

    -- Review metadata
    reviewed_by uuid,
    reviewed_at timestamptz,
    review_notes text,

    -- Additional data
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for Review Queue
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON public.review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_created ON public.review_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_queue_patient ON public.review_queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_review_queue_session ON public.review_queue(session_id);

-- RLS Policies for Review Queue
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS review_queue_service_all ON public.review_queue;
CREATE POLICY review_queue_service_all ON public.review_queue
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS review_queue_public_read ON public.review_queue;
CREATE POLICY review_queue_public_read ON public.review_queue
    FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON public.review_queue TO anon, authenticated;
GRANT ALL ON public.review_queue TO service_role;

-- ============================================================================
-- 3. PATIENT PORTAL USERS (For Patient Authentication & Login)
-- ============================================================================

-- Patient Portal Users table - links Supabase Auth to patient records
CREATE TABLE IF NOT EXISTS public.patient_portal_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auth linkage
    auth_user_id uuid UNIQUE, -- Links to auth.users(id) if using Supabase Auth
    patient_intake_id uuid UNIQUE REFERENCES public.patient_intakes(id) ON DELETE SET NULL,

    -- Profile info
    email text NOT NULL,
    full_name text,
    phone text,
    preferred_language text DEFAULT 'en',

    -- Preferences
    notification_preferences jsonb DEFAULT '{"email": true, "whatsapp": true, "sms": false}',

    -- Status
    last_login_at timestamptz,
    is_verified boolean DEFAULT false,

    -- Additional data
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for Patient Portal Users
CREATE INDEX IF NOT EXISTS idx_portal_users_auth ON public.patient_portal_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_portal_users_email ON public.patient_portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_intake ON public.patient_portal_users(patient_intake_id);

-- RLS Policies for Patient Portal Users
ALTER TABLE public.patient_portal_users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own record
DROP POLICY IF EXISTS portal_users_own_read ON public.patient_portal_users;
CREATE POLICY portal_users_own_read ON public.patient_portal_users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can only update their own record
DROP POLICY IF EXISTS portal_users_own_update ON public.patient_portal_users;
CREATE POLICY portal_users_own_update ON public.patient_portal_users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Service role can do everything
DROP POLICY IF EXISTS portal_users_service_all ON public.patient_portal_users;
CREATE POLICY portal_users_service_all ON public.patient_portal_users
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, UPDATE ON public.patient_portal_users TO authenticated;
GRANT ALL ON public.patient_portal_users TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Tables created:
--   ✅ rag_documents - RAG system document storage
--   ✅ rag_chunks - RAG chunks with vector(768) embeddings
--   ✅ review_queue - Medical Safety Layer flagged responses
--   ✅ patient_portal_users - Patient authentication
--
-- Functions created:
--   ✅ match_rag_chunks(query_embedding, match_count, min_similarity)
--
-- Indexes created:
--   ✅ idx_rag_documents_active
--   ✅ idx_rag_documents_created
--   ✅ idx_rag_chunks_document
--   ✅ idx_rag_chunks_embedding (IVFFlat vector index)
--   ✅ idx_review_queue_status
--   ✅ idx_review_queue_created
--   ✅ idx_review_queue_patient
--   ✅ idx_review_queue_session
--   ✅ idx_portal_users_auth
--   ✅ idx_portal_users_email
--   ✅ idx_portal_users_intake
--
-- RLS Policies:
--   ✅ All tables have RLS enabled with appropriate policies
--
-- Next Steps:
--   1. Run this migration in Supabase SQL Editor
--   2. Verify tables exist: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--   3. Test match_rag_chunks function works
--   4. Update ReviewQueue Python class to persist to Supabase
--
-- ============================================================================
