-- RAG query log — feeds the cowork corpus-gap feedback loop.
-- RLS enabled with NO policies: only the service_role key (used by the API route
-- and the daily-ops routine) can read/write. No anon/authenticated access.
create table if not exists public.rag_query_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  question text not null,
  route text not null check (route in ('rag', 'fallback')),
  top_similarity double precision,
  num_results integer not null default 0,
  citations jsonb not null default '[]'::jsonb
);

create index if not exists rag_query_log_created_at_idx on public.rag_query_log (created_at desc);
create index if not exists rag_query_log_route_idx on public.rag_query_log (route);

alter table public.rag_query_log enable row level security;
-- Intentionally no policies: service_role bypasses RLS; everyone else is denied.
