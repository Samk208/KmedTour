# KmedTour

Medical tourism platform connecting African patients with verified Korean clinics.  
Concierge-led access, transparent pricing, KAHF/KOIHA accreditation.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI Agents | Python FastAPI + LangGraph (in `agents/`) |
| Payments | Stripe |
| Email | Resend |
| Monitoring | Sentry |
| Deploy | Netlify (Next.js), separate host for Python agents |
| Testing | Vitest (unit), Playwright (E2E) |

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js App (port 3002)                        │
│  ├── app/                    Pages & API routes │
│  ├── components/             UI components      │
│  └── lib/                    Utils, schemas     │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────▼────────┐      ┌─────────────────┐
         │  Supabase DB   │      │  Python Agents  │
         │  PostgreSQL    │      │  FastAPI :8000  │
         │  + Auth        │      │  + LangGraph    │
         └────────────────┘      └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- A Supabase project (or run locally with `supabase start`)

### 1. Clone and install

```bash
git clone <repo-url>
cd "KmedTour Now"
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your values (see below)
```

**Required variables:**

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings |
| `STRIPE_SECRET_KEY` | Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook settings |
| `RESEND_API_KEY` | Resend dashboard |

**Production-only variables (Netlify environment):**

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Distributed rate limiting (create at upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limiting |
| `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring (create project at sentry.io) |
| `SENTRY_AUTH_TOKEN` | Sentry source map upload |
| `SENTRY_ORG` | Your Sentry org slug |
| `SENTRY_PROJECT` | Your Sentry project slug |

**GitHub Actions Secrets required for CI:**

- `NETLIFY_AUTH_TOKEN` — Netlify personal access token
- `NETLIFY_SITE_ID` — Production site ID
- `NETLIFY_STAGING_SITE_ID` — Staging site ID
- `NEXT_PUBLIC_SUPABASE_URL` — Production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Production Supabase anon key
- `STAGING_SUPABASE_URL` — Staging Supabase URL
- `STAGING_SUPABASE_ANON_KEY` — Staging Supabase anon key
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

### 3. Set up database

Apply the schema and migrations in Supabase SQL editor (or via Supabase CLI):

```bash
# Full schema (fresh setup)
supabase db push --db-url <your-db-url> < supabase/schema.sql

# Migrations (incremental updates)
supabase db push --db-url <your-db-url> < supabase/migrations/001_user_roles.sql
```

### 4. Run development server

```bash
pnpm dev
# → http://localhost:3002
```

## Project Structure

```
app/
├── [city]/[procedure]/    Programmatic SEO pages (city + procedure)
├── api/                   API routes
│   ├── bookings/          Booking CRUD
│   ├── coordinator/       Coordinator-only endpoints (requireRole)
│   ├── journey/           Patient journey state machine
│   ├── payments/          Stripe checkout + webhook
│   └── quotes/            Quote lifecycle
├── coordinator/           Coordinator portal (auth-protected)
├── patient/               Patient portal
│   ├── dashboard/         Patient dashboard (Server Component)
│   └── login/             Magic link auth
├── hospitals/[slug]/      Hospital detail pages
└── procedures/[slug]/     Procedure detail pages

components/
├── coordinator/           Coordinator UI (JourneyDashboardClient)
├── pseo/                  Programmatic SEO components
│   ├── Hero.tsx           Trust-focused hero (Server Component)
│   ├── ClinicList.tsx     Data-driven clinic grid
│   └── TechSpecs.tsx      Procedure specs + city-specific content
├── shared/                Medical disclaimer, shared UI
└── ui/                    shadcn/ui components (97 components)

lib/
├── schemas/               Zod validation schemas
├── stores/                Zustand state (favorites with Supabase sync)
├── supabase/              Supabase client (server, client, middleware)
└── utils/
    ├── api-auth.ts        requireAuth(), requireRole() middleware
    ├── rate-limit.ts      Upstash Redis rate limiting (in-memory fallback)
    └── logger.ts          Structured logging + Sentry

supabase/
├── schema.sql             Full database schema
└── migrations/            Incremental migration files

agents/                    Python FastAPI + LangGraph AI agents
tests/
├── e2e/                   Playwright E2E tests
└── lib/                   Vitest unit + integration tests
```

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server on port 3002 |
| `pnpm build` | Production build |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:coverage` | Unit tests with coverage report |
| `pnpm test:e2e` | Run E2E tests (Playwright, requires running server) |
| `pnpm test:e2e:ui` | Playwright UI mode |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint |
| `pnpm generate:images` | Generate SEO images for pSEO pages |

## Security Architecture

- **Rate limiting**: Upstash Redis sliding window on all API routes (falls back to in-memory for local dev)
- **Authentication**: Supabase magic link auth via `requireAuth()`
- **Authorization**: Role-based access via `requireRole('coordinator' | 'admin')`
- **Input validation**: Zod schemas on all API inputs
- **Security headers**: XSS, CSRF, frame-options via `next.config.mjs`
- **RLS**: Row Level Security enabled on all Supabase tables
- **Error monitoring**: Sentry (client + server + edge)

## Deployment

### Production (main branch)

Push to `main` → CI runs → if all green → auto-deploys to Netlify production.

### Staging (develop branch)

Push to `develop` → CI runs → deploys to Netlify staging site.

### Manual deploy

In GitHub Actions → Deploy to Netlify → Run workflow → choose environment.

### Rolling back

In Netlify dashboard → Deploys → click any previous deploy → "Publish deploy".

## Database Operations

```bash
# Seed content from JSON files
node supabase/scripts/seed_content.js   # 1. Prepare JSONs
node supabase/scripts/seed_db.js        # 2. Push to Supabase

# Verify record counts
node supabase/scripts/verify_db.js

# Apply a new migration
# → Run the SQL file in Supabase SQL editor, OR:
supabase db push --db-url <url> < supabase/migrations/00X_name.sql
```

## User Roles

| Role | Access |
|---|---|
| `patient` | Own dashboard, quotes, bookings |
| `coordinator` | All coordinator routes, patient journey management |
| `admin` | Full access (same as coordinator + future admin panel) |

Roles are stored in `user_roles` table. New users get `patient` role automatically via database trigger.

To promote a user to coordinator, run in Supabase SQL editor:
```sql
UPDATE user_roles SET role = 'coordinator' WHERE user_id = '<uuid>';
```

## AI Agents (Python)

See `agents/README.md` for setup. Key commands:

```bash
cd agents
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Directives

Project architecture decisions are documented in `directives/`:

- `programmatic_seo.md` — pSEO page strategy
- `agentic_orchestration.md` — LangGraph agent architecture
- `tech_stack_rules.md` — Approved tech stack (no drift allowed)
- `manage_content.md` — Content import workflow
- `manage_state.md` — State management decisions
- `implement_feature.md` — Feature implementation checklist
- `implement_voice_agent.md` — Voice agent roadmap
