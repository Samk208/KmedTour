-- KmedTour — Chat History Persistence Migration
-- File: supabase/migrations/20260413_chat_histories.sql
-- Apply: Supabase Dashboard → SQL Editor → paste and run
--   OR: supabase db push (if using Supabase CLI)
--
-- COPY THIS FILE TO: supabase/migrations/20260413_chat_histories.sql
-- in the KmedTour Now repo.

-- ─── Create chat_histories table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_histories (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  text        NOT NULL,
  role        text        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     text        NOT NULL,
  metadata    jsonb       DEFAULT '{}'::jsonb,  -- For future: citations, confidence scores
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Fast lookup of all messages in a session (ordered by time)
CREATE INDEX IF NOT EXISTS idx_chat_histories_session
  ON public.chat_histories (session_id, created_at ASC);

-- Fast lookup of a user's sessions
CREATE INDEX IF NOT EXISTS idx_chat_histories_user
  ON public.chat_histories (user_id, created_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.chat_histories ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chat messages
CREATE POLICY "Users can view own chat history"
  ON public.chat_histories
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own chat messages
CREATE POLICY "Users can insert own chat messages"
  ON public.chat_histories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chat history (for privacy / "clear chat")
CREATE POLICY "Users can delete own chat history"
  ON public.chat_histories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass (for server-side inserts from the API route)
-- The API route uses SUPABASE_SERVICE_KEY which bypasses RLS automatically,
-- so no additional policy is needed for server-side writes.

-- ─── Comments ────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.chat_histories IS
  'Stores chat messages between patients and the KmedTour AI concierge. RLS ensures users see only their own history.';

COMMENT ON COLUMN public.chat_histories.session_id IS
  'Client-generated UUID per browser session. Allows grouping messages into conversations.';

COMMENT ON COLUMN public.chat_histories.role IS
  'Either "user" (patient message) or "assistant" (AI response). "system" reserved for internal use.';

COMMENT ON COLUMN public.chat_histories.metadata IS
  'JSON field for future use: RAG citations, confidence scores, model used, response latency.';
