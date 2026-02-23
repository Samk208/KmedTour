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

-- 2. Patient Journey State Machine
-- Tracks patient journey through: INQUIRY → TRIAGE → MATCHING → QUOTED → BOOKED → TRAVELING → COMPLETED
create table if not exists public.patient_journey_state (
    id uuid primary key default uuid_generate_v4(),
    patient_intake_id uuid not null references public.patient_intakes(id),
    current_state text not null default 'INQUIRY',
    state_data jsonb default '{}',
    state_history jsonb default '[]',
    assigned_coordinator_id uuid, -- future link to auth.users (coordinator)
    thread_id text, -- LangGraph thread ID (optional, for AI-assisted journeys)
    checkpoint_data jsonb, -- Serialized LangGraph state
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_journey_state_patient on public.patient_journey_state (patient_intake_id);
create index if not exists idx_journey_state_current on public.patient_journey_state (current_state);
create index if not exists idx_journey_state_coordinator on public.patient_journey_state (assigned_coordinator_id);

-- 3. Quotes — itemized treatment cost breakdowns
create table if not exists public.quotes (
    id uuid primary key default uuid_generate_v4(),
    journey_id uuid references public.patient_journey_state(id),
    hospital_id uuid references public.clinics(id),
    treatment_id uuid references public.treatments(id),
    treatment_cost numeric not null default 0,
    accommodation_cost numeric not null default 0,
    transport_cost numeric not null default 0,
    misc_cost numeric not null default 0,
    total_amount numeric not null default 0,
    currency text not null default 'USD',
    status text not null default 'DRAFT', -- 'DRAFT' | 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED'
    version integer not null default 1,
    valid_until timestamptz,
    payment_schedule jsonb, -- [{amount, dueDate, description}]
    notes text,
    pdf_url text,
    stripe_payment_link text,
    breakdown jsonb, -- legacy / additional breakdown data
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_quotes_journey on public.quotes (journey_id);
create index if not exists idx_quotes_status on public.quotes (status);
create index if not exists idx_quotes_hospital on public.quotes (hospital_id);

-- 4. Bookings — confirmed patient bookings from accepted quotes
create table if not exists public.bookings (
    id uuid primary key default uuid_generate_v4(),
    journey_id uuid references public.patient_journey_state(id),
    quote_id uuid references public.quotes(id),
    hospital_id uuid references public.clinics(id),
    treatment_id uuid references public.treatments(id),
    status text not null default 'PENDING_PAYMENT',
      -- 'PENDING_PAYMENT' | 'DEPOSIT_PAID' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    total_amount numeric not null default 0,
    amount_paid numeric not null default 0,
    currency text not null default 'USD',
    payment_schedule jsonb,
    stripe_payment_id text,
    scheduled_date date,
    travel_dates jsonb, -- {arrival, departure}
    metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_journey on public.bookings (journey_id);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_hospital on public.bookings (hospital_id);

-- 5. Journey Events — audit log for all journey state changes
create table if not exists public.journey_events (
    id uuid primary key default uuid_generate_v4(),
    journey_id uuid not null references public.patient_journey_state(id),
    event_type text not null,
      -- 'JOURNEY_STARTED' | 'STATE_TRANSITION' | 'QUOTE_CREATED' | 'QUOTE_SENT' | 'QUOTE_ACCEPTED'
      -- 'BOOKING_CREATED' | 'PAYMENT_COMPLETED' | 'COORDINATOR_ASSIGNED' | ...
    actor_type text not null default 'system', -- 'system' | 'coordinator' | 'patient'
    actor_id uuid, -- future link to auth.users
    event_data jsonb default '{}',
    created_at timestamptz not null default now()
);

create index if not exists idx_journey_events_journey on public.journey_events (journey_id);
create index if not exists idx_journey_events_type on public.journey_events (event_type);
create index if not exists idx_journey_events_created on public.journey_events (created_at desc);

-- 6. Notifications — queued notifications for email/SMS/WhatsApp
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    journey_id uuid references public.patient_journey_state(id),
    template_name text not null,
    channel text not null default 'email', -- 'email' | 'sms' | 'whatsapp'
    priority text not null default 'normal', -- 'low' | 'normal' | 'high' | 'urgent'
    status text not null default 'pending', -- 'pending' | 'sent' | 'failed' | 'cancelled'
    data jsonb default '{}',
    sent_at timestamptz,
    error_message text,
    retry_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_notifications_journey on public.notifications (journey_id);
create index if not exists idx_notifications_status on public.notifications (status);
create index if not exists idx_notifications_channel on public.notifications (channel, status);

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

-- ==============================
-- Row Level Security (RLS) Policies
-- ==============================
-- Strategy:
--   • Content tables (treatments, clinics, countries, articles, testimonials, africa_regions)
--     → Public read, service_role write
--   • User interaction tables (patient_intakes, contact_submissions, user_favorites, clinic_applications)
--     → Authenticated users read their own data, anonymous insert for forms, service_role full access
--   • Journey/operational tables (patient_journey_state, quotes, bookings, journey_events, notifications)
--     → Authenticated users (patients) read their own, coordinators read assigned, service_role full access

-- -------------------------------------------------------
-- Content tables: public read, service_role write
-- -------------------------------------------------------

alter table public.treatments enable row level security;
drop policy if exists treatments_public_read on public.treatments;
create policy treatments_public_read on public.treatments for select using (true);
drop policy if exists treatments_service_write on public.treatments;
create policy treatments_service_write on public.treatments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table public.clinics enable row level security;
drop policy if exists clinics_public_read on public.clinics;
create policy clinics_public_read on public.clinics for select using (true);
drop policy if exists clinics_service_write on public.clinics;
create policy clinics_service_write on public.clinics for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table public.countries enable row level security;
drop policy if exists countries_public_read on public.countries;
create policy countries_public_read on public.countries for select using (true);
drop policy if exists countries_service_write on public.countries;
create policy countries_service_write on public.countries for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table public.articles enable row level security;
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles for select using (true);
drop policy if exists articles_service_write on public.articles;
create policy articles_service_write on public.articles for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table public.testimonials enable row level security;
drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials for select using (true);
drop policy if exists testimonials_service_write on public.testimonials;
create policy testimonials_service_write on public.testimonials for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table public.africa_regions enable row level security;
drop policy if exists africa_regions_public_read on public.africa_regions;
create policy africa_regions_public_read on public.africa_regions for select using (true);
drop policy if exists africa_regions_service_write on public.africa_regions;
create policy africa_regions_service_write on public.africa_regions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -------------------------------------------------------
-- Patient Intakes: anonymous insert, users read own, service_role full
-- -------------------------------------------------------

alter table public.patient_intakes enable row level security;

-- Anyone can submit an intake form (anonymous insert)
drop policy if exists patient_intakes_anon_insert on public.patient_intakes;
create policy patient_intakes_anon_insert on public.patient_intakes for insert
  with check (true);

-- Authenticated patients can read their own intakes (matched by patient_id → auth.uid)
drop policy if exists patient_intakes_user_read on public.patient_intakes;
create policy patient_intakes_user_read on public.patient_intakes for select
  using (
    auth.role() = 'service_role'
    or patient_id = auth.uid()
  );

-- Service role can do everything (coordinators use service_role via server-side API)
drop policy if exists patient_intakes_service_all on public.patient_intakes;
create policy patient_intakes_service_all on public.patient_intakes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -------------------------------------------------------
-- Contact Submissions: anonymous insert, service_role read
-- -------------------------------------------------------

alter table public.contact_submissions enable row level security;

drop policy if exists contact_anon_insert on public.contact_submissions;
create policy contact_anon_insert on public.contact_submissions for insert
  with check (true);

drop policy if exists contact_service_all on public.contact_submissions;
create policy contact_service_all on public.contact_submissions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -------------------------------------------------------
-- User Favorites: users CRUD own, service_role full
-- -------------------------------------------------------

alter table public.user_favorites enable row level security;

-- Authenticated users manage their own favorites
drop policy if exists favorites_user_select on public.user_favorites;
create policy favorites_user_select on public.user_favorites for select
  using (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or (user_id is null and anonymous_id is not null) -- anonymous favorites are readable by anyone who has the anonymous_id
  );

drop policy if exists favorites_user_insert on public.user_favorites;
create policy favorites_user_insert on public.user_favorites for insert
  with check (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or (user_id is null and anonymous_id is not null)
  );

drop policy if exists favorites_user_delete on public.user_favorites;
create policy favorites_user_delete on public.user_favorites for delete
  using (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or (user_id is null and anonymous_id is not null)
  );

drop policy if exists favorites_service_all on public.user_favorites;
create policy favorites_service_all on public.user_favorites for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -------------------------------------------------------
-- Clinic Applications: anonymous insert, service_role full
-- -------------------------------------------------------

alter table public.clinic_applications enable row level security;

drop policy if exists clinic_apps_anon_insert on public.clinic_applications;
create policy clinic_apps_anon_insert on public.clinic_applications for insert
  with check (true);

drop policy if exists clinic_apps_service_all on public.clinic_applications;
create policy clinic_apps_service_all on public.clinic_applications for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -------------------------------------------------------
-- Patient Journey State: service_role full (all API access is server-side)
-- Patients read their own journeys via linked patient_intake_id
-- -------------------------------------------------------

alter table public.patient_journey_state enable row level security;

drop policy if exists journey_state_service_all on public.patient_journey_state;
create policy journey_state_service_all on public.patient_journey_state for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists journey_state_patient_read on public.patient_journey_state;
create policy journey_state_patient_read on public.patient_journey_state for select
  using (
    exists (
      select 1 from public.patient_intakes pi
      where pi.id = patient_journey_state.patient_intake_id
        and pi.patient_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- Quotes: service_role full, patients read their own journey's quotes
-- -------------------------------------------------------

alter table public.quotes enable row level security;

drop policy if exists quotes_service_all on public.quotes;
create policy quotes_service_all on public.quotes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists quotes_patient_read on public.quotes;
create policy quotes_patient_read on public.quotes for select
  using (
    exists (
      select 1 from public.patient_journey_state pjs
      join public.patient_intakes pi on pi.id = pjs.patient_intake_id
      where pjs.id = quotes.journey_id
        and pi.patient_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- Bookings: service_role full, patients read their own
-- -------------------------------------------------------

alter table public.bookings enable row level security;

drop policy if exists bookings_service_all on public.bookings;
create policy bookings_service_all on public.bookings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists bookings_patient_read on public.bookings;
create policy bookings_patient_read on public.bookings for select
  using (
    exists (
      select 1 from public.patient_journey_state pjs
      join public.patient_intakes pi on pi.id = pjs.patient_intake_id
      where pjs.id = bookings.journey_id
        and pi.patient_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- Journey Events: service_role full, patients read their own timeline
-- -------------------------------------------------------

alter table public.journey_events enable row level security;

drop policy if exists journey_events_service_all on public.journey_events;
create policy journey_events_service_all on public.journey_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists journey_events_patient_read on public.journey_events;
create policy journey_events_patient_read on public.journey_events for select
  using (
    exists (
      select 1 from public.patient_journey_state pjs
      join public.patient_intakes pi on pi.id = pjs.patient_intake_id
      where pjs.id = journey_events.journey_id
        and pi.patient_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- Notifications: service_role full, patients read their own
-- -------------------------------------------------------

alter table public.notifications enable row level security;

drop policy if exists notifications_service_all on public.notifications;
create policy notifications_service_all on public.notifications for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists notifications_patient_read on public.notifications;
create policy notifications_patient_read on public.notifications for select
  using (
    exists (
      select 1 from public.patient_journey_state pjs
      join public.patient_intakes pi on pi.id = pjs.patient_intake_id
      where pjs.id = notifications.journey_id
        and pi.patient_id = auth.uid()
    )
  );

-- ==============================
-- End of RLS Policies
-- ==============================