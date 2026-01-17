-- Supabase schema for Kmedtour
-- Generated to mirror current lib/data/*.json shapes and planned backend entities
-- Tables:
--   treatments, clinics, countries, articles, testimonials, africa_regions
--   patient_intakes, contact_submissions, user_favorites, clinic_applications

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- ==============================
-- Core content tables
-- ==============================

create table if not exists public.treatments (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  -- from treatments.json
  external_id text not null, -- original "id" field (e.g. "ivf")
  title text not null,
  short_description text not null,
  description text not null,
  price_range text,
  price_note text,
  duration text,
  success_rate text,
  category text,
  image_url text,
  highlights text[] default '{}',

-- SEO / AI extension fields


seo_title text,
  seo_description text,
  tags text[],
  ai_metadata jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_treatments_category on public.treatments (category);

create table if not exists public.clinics (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  -- from clinics.json
  external_id text not null, -- original "id" field
  name text not null,
  short_description text,
  description text,
  location text,
  address text,
  specialties text[] default '{}',
  accreditations text[] default '{}',
  year_established integer,
  international_patients text,
  languages_supported text[] default '{}',
  price_range text,
  rating numeric,
  review_count integer,
  success_rate text,
  image_url text,
  logo_url text,
  highlights text[] default '{}',
  facilities text[] default '{}',
  doctors jsonb, -- array of doctor objects

-- SEO / AI


seo_title text,
  seo_description text,
  tags text[],
  ai_metadata jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clinics_location on public.clinics (location);

create table if not exists public.countries (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  -- from countries.json
  external_id text not null, -- original "id" field (e.g. "nigeria")
  name text not null,
  region text,
  flag text,
  visa_info jsonb,    -- { required, type, processingTime, cost, notes }
  travel_info jsonb,  -- { directFlights, airlines, flightDuration, averageFlightCost }
  medical_tourism_notes text,
  common_treatments text[] default '{}',

-- SEO / AI


seo_title text,
  seo_description text,
  tags text[],
  ai_metadata jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_countries_region on public.countries (region);

create table if not exists public.articles (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  -- from articles.json
  external_id text not null,
  title text not null,
  excerpt text,
  content text,
  category text,
  author text,
  published_at date,
  image_url text,
  tags text[] default '{}',

-- SEO / AI


seo_title text,
  seo_description text,
  ai_metadata jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_category on public.articles (category);

create index if not exists idx_articles_published_at on public.articles (published_at desc);

create table if not exists public.testimonials (
    id uuid primary key default uuid_generate_v4 (),
    -- from testimonials.json
    external_id text not null, -- original string id ("1", "2", ...)
    name text not null,
    country text,
    country_code text,
    treatment text,
    quote text,
    rating integer,
    date text, -- keep as simple string (e.g. "2024-11")
    created_at timestamptz not null default now()
);

create index if not exists idx_testimonials_country_code on public.testimonials (country_code);

create table if not exists public.africa_regions (
    id uuid primary key default uuid_generate_v4 (),
    country_name text not null,
    country_code text not null,
    region text,
    tips jsonb, -- { visa, flights, currency, languages, travel }
    created_at timestamptz not null default now()
);

create index if not exists idx_africa_regions_region on public.africa_regions (region);

create index if not exists idx_africa_regions_country_code on public.africa_regions (country_code);

-- ==============================
-- User interactions & forms
-- ==============================

create table if not exists public.patient_intakes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),

-- Core identity / contact (from Zod schema in lib/schemas/patient-intake.ts)
full_name text not null,
email text not null,
phone text,
country_of_residence text not null,
preferred_language text not null,

-- Medical / treatment info
treatment_type_slug text not null,
treatment_details text not null,
has_previous_treatment_abroad boolean,
previous_treatments text,

-- Budget & timing
budget_range text, target_month text, travel_dates_flexible boolean,

-- Other details
accommodation_preference text,
additional_notes text,
agreed_to_terms boolean not null,

-- Relationships / metadata


patient_id uuid, -- future link to auth.users
  source_page text,
  ai_suggestions jsonb,
  ai_score numeric,

  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_intakes_email on public.patient_intakes (email);

create index if not exists idx_patient_intakes_country on public.patient_intakes (country_of_residence);

create index if not exists idx_patient_intakes_treatment_type on public.patient_intakes (treatment_type_slug);

create table if not exists public.contact_submissions (
    id uuid primary key default uuid_generate_v4 (),
    created_at timestamptz not null default now(),
    type text not null, -- e.g. 'patient_contact' | 'clinic_partner' | 'general'
    full_name text not null,
    email text not null,
    phone text,
    message text not null,
    metadata jsonb,
    source_page text,
    updated_at timestamptz not null default now()
);

create index if not exists idx_contact_submissions_type on public.contact_submissions (type);

create index if not exists idx_contact_submissions_email on public.contact_submissions (email);

create table if not exists public.user_favorites (
    id uuid primary key default uuid_generate_v4 (),
    created_at timestamptz not null default now(),
    user_id uuid,
    anonymous_id text,
    item_type text not null, -- 'clinic' | 'treatment' | 'article'
    item_id uuid not null,
    item_slug text not null,
    metadata jsonb
);

create unique index if not exists idx_user_favorites_unique_user_item on public.user_favorites (
    coalesce(
        user_id,
        '00000000-0000-0000-0000-000000000000'::uuid
    ),
    coalesce(anonymous_id, ''),
    item_type,
    item_id
);

create index if not exists idx_user_favorites_user_id on public.user_favorites (user_id);

create index if not exists idx_user_favorites_anonymous_id on public.user_favorites (anonymous_id);

create index if not exists idx_user_favorites_item on public.user_favorites (item_type, item_slug);

create table if not exists public.clinic_applications (
    id uuid primary key default uuid_generate_v4 (),
    created_at timestamptz not null default now(),
    clinic_name text not null,
    contact_name text not null,
    email text not null,
    phone text,
    website text,
    country text,
    city text,
    specialties text [] default '{}',
    message text,
    status text not null default 'new', -- 'new' | 'reviewing' | 'approved' | 'rejected'
    metadata jsonb,
    updated_at timestamptz not null default now()
);

create index if not exists idx_clinic_applications_status on public.clinic_applications (status);

create index if not exists idx_clinic_applications_country on public.clinic_applications (country);

-- ==============================
-- End of Kmedtour Supabase schema
-- ==============================

-- ==============================
-- Deep Tech Extensions (2026 Strategy)
-- ==============================

-- 1. Enhanced Hospital capabilities
alter table public.clinics 
add column if not exists api_integration_level text default 'NONE', -- 'NONE' | 'WEBHOOK' | 'FULL_API'
add column if not exists survival_rates jsonb, -- e.g. {"ivf": 0.65, "cardiac": 0.98}
add column if not exists booking_webhook_url text;

-- 2. LangGraph Persistence (Checkpoints)
create table if not exists public.patient_journey_state (
    patient_id uuid primary key references public.patient_intakes(id),
    current_stage text not null, -- 'INTAKE' | 'TRIAGE' | 'MATCHING' | 'QUOTE' | 'BOOKING'
    thread_id text not null, -- LangGraph thread ID
    checkpoint_data jsonb, -- Serialized graph state
    last_updated_at timestamptz not null default now()
);

-- 3. Payment / Quote Transactions
create table if not exists public.quotes (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references public.patient_intakes(id),
    hospital_id uuid references public.clinics(id),
    total_amount numeric,
    currency text default 'USD',
    status text default 'DRAFT', -- 'DRAFT' | 'SENT' | 'PAID' | 'EXPIRED'
    pdf_url text,
    stripe_payment_link text,
    breakdown jsonb, -- {procedure: 5000, hotel: 1200, flight: 800}
    created_at timestamptz not null default now()
);

-- ==============================
-- End of Deep Tech Extensions
-- ==============================

-- ==============================
-- RAG / Vector search (pgvector)
-- ==============================

create extension if not exists vector;

create table if not exists public.rag_documents (
    id uuid primary key default uuid_generate_v4 (),
    source_type text not null,
    source_id text not null,
    title text not null,
    source_url text,
    metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (source_type, source_id)
);

create index if not exists idx_rag_documents_source on public.rag_documents (source_type, source_id);

create table if not exists public.rag_chunks (
    id uuid primary key default uuid_generate_v4 (),
    document_id uuid not null references public.rag_documents (id) on delete cascade,
    chunk_index integer not null,
    content text not null,
    embedding vector (768) not null,
    metadata jsonb,
    created_at timestamptz not null default now(),
    unique (document_id, chunk_index)
);

create index if not exists idx_rag_chunks_document_id on public.rag_chunks (document_id);

create index if not exists idx_rag_chunks_embedding_hnsw on public.rag_chunks using hnsw (embedding vector_cosine_ops);

alter table public.rag_documents enable row level security;

alter table public.rag_chunks enable row level security;

drop policy if exists rag_documents_public_read on public.rag_documents;

create policy rag_documents_public_read on public.rag_documents for
select using (true);

drop policy if exists rag_chunks_public_read on public.rag_chunks;

create policy rag_chunks_public_read on public.rag_chunks for
select using (true);

drop policy if exists rag_documents_service_write on public.rag_documents;

create policy rag_documents_service_write on public.rag_documents for all using (auth.role () = 'service_role')
with
    check (auth.role () = 'service_role');

drop policy if exists rag_chunks_service_write on public.rag_chunks;

create policy rag_chunks_service_write on public.rag_chunks for all using (auth.role () = 'service_role')
with
    check (auth.role () = 'service_role');

create or replace function public.match_rag_chunks(
  query_embedding vector(768),
  match_count integer default 8,
  min_similarity real default 0.2
)
returns table (
  chunk_id uuid,
  document_id uuid,
  title text,
  source_url text,
  content text,
  similarity real,
  metadata jsonb
)
language sql
stable
as $$
  select
    c.id as chunk_id,
    c.document_id,
    d.title,
    d.source_url,
    c.content,
    (1 - (c.embedding <=> query_embedding))::real as similarity,
    c.metadata
  from public.rag_chunks c
  join public.rag_documents d on d.id = c.document_id
  where (1 - (c.embedding <=> query_embedding)) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;