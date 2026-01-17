# Kmedtour Supabase Notes

## Project

- Self-hosted Supabase instance at your configured URL.
- Frontend env vars (already set):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Schema

Schema for this project is defined in `../supabase-schema.sql` and includes:

- Content tables: `treatments`, `clinics`, `countries`, `articles`, `testimonials`, `africa_regions`.
- Flow tables: `patient_intakes`, `contact_submissions`, `user_favorites`, `clinic_applications`.

Run that SQL once in the Supabase SQL editor to create tables (already done in this environment).

## Runtime Behavior

- If env vars or client creation fail, the app switches to **mock/JSON mode** via `lib/api/client/supabase.ts`.
- Read-only repositories (`lib/api/repositories/*.ts`) always:
  - Prefer Supabase when available.
  - Fall back to JSON + Zod validation if Supabase errors or is unconfigured.
- Write paths (Phase 2):
  - `/api/patient-intake` → inserts into `patient_intakes`, with mock fallback.
  - `/api/contact` → inserts into `contact_submissions`, with mock fallback.

## AI Integration

- AI client is defined in `../lib/ai/client.ts`.
- Provider detection keys (not set yet, safe default):
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `XAI_API_KEY`
  - `ANTHROPIC_API_KEY` (Claude)
- Until keys are provided, `/api/treatment-advisor` always returns deterministic mock suggestions.

## Folder Structure for Database Management

- `migrations/`: SQL migration files (e.g., `deep_tech_migration.sql`). Apply these to update schema.
- `scripts/`: Node.js scripts for seeding and verifying data.
  - `seed_content.js`: Parses local CSVs into `lib/data/*.json`.
  - `seed_db.js`: Pushes `lib/data/*.json` into Supabase.
  - `verify_db.js`: Checks record counts in Supabase.
- `schema.sql`: The full, consolidated schema dump.

## Commands

- **Seed Database**:
  ```bash
  node supabase/scripts/seed_content.js  # 1. Prepare JSONs
  node supabase/scripts/seed_db.js       # 2. Push to DB
  ```

- **Verify Database**:
  ```bash
  node supabase/scripts/verify_db.js
  ```

- **Apply Schema**:
  - Run contents of `migrations/*.sql` in Supabase SQL Editor.
  - Or `schema.sql` for a fresh start.

Use this folder for all database-related assets.
