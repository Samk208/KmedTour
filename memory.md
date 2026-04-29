# KmedTour — Rolling State of Truth

**Last updated:** 2026-04-29 morning (production-readiness pass deployed; RAG seed live; embed model fix shipped)
**Latest handover:** [`HANDOVER-2026-04-28.md`](HANDOVER-2026-04-28.md) — §6.0/6.2 are now DONE; §6.1/6.3/6.4 still open
**Previous handover:** [`HANDOVER-2026-04-27.md`](HANDOVER-2026-04-27.md) — RLS section SUPERSEDED by 2026-04-28

## 🟢 Incoming editor — start here

The 2026-04-28 production-readiness pass is **deployed and verified live** (commits `39d957f`, `ece9052`, `58de4e2`). RAG store is **seeded** (146 docs, 161 chunks). Hospital detail 500 is fixed. Form APIs fail-closed with `errorId`. Embed pipeline now uses `gemini-embedding-001` end to end.

What's left for full chat to answer users:
1. **AI agent deploy via Coolify** (60 min) — chat returns `route: 'rag'` with citations populated, but `answer: 'Service unavailable.'` because `callPythonAgent()` can't reach `PYTHON_AGENT_URL`. Plan: HANDOVER-2026-04-28.md §6.1.
2. **Audit SECURITY DEFINER functions** (30 min) — closes the 2026-04-27 anon-INSERT mystery; §6.3.
3. **Migrate `lib/supabase/middleware.ts` to `@supabase/ssr`** (60-90 min) — §6.4.
4. **Reconcile migrations vs reality** (multi-hour) — §6.5. Schema drift confirmed on `rag_documents` (no `content_hash`, no `is_active`, has `source_id`); seed_rag.js was adapted to reality, but migration files still misrepresent the schema.

Do NOT touch any of these without first invoking `supabase:supabase` and `superpowers:systematic-debugging` skills. The 2026-04-27 session burned hours skipping skills, and the 2026-04-29 session burned ~30 minutes guessing at a Netlify build failure before doing what should have been the first move (reproducing the failure locally with the same env conditions).

This is the single source of truth for "where is the project right now". Do NOT diff through HANDOVER-* files to figure out current state — read this file first.

---

## Production stack

| Layer | Where | Status | Notes |
|---|---|---|---|
| Frontend | https://kmedtour.netlify.app (Netlify) | ✅ live | Next.js 15, PWA installable |
| Patient intake API | `/api/patient-intake` | ✅ working | Fixed 2026-04-28 — now uses service_role. Verified 3+ rows in DB. |
| Contact / quotes / journey / payments / coordinator APIs | `/api/contact`, `/api/quotes/*`, `/api/journey/*`, `/api/payments/*`, `/api/coordinator/*` | ✅ working | Fixed 2026-04-28 — sweep applied (commit de39014). 16 routes now use service_role. |
| Public reads (hospitals, treatments, articles, etc.) | repository pattern | ✅ live data | Tables seeded 2026-04-28 — repos flip from JSON fallback to DB |
| Chat / RAG API | `/api/rag/chat` (Next.js proxy) | ⚠️ retrieval works, generation pending | 2026-04-29: embed model fixed (gemini-embedding-001 with outputDimensionality:768). Live smoke `POST /api/rag/chat` returns `route:'rag'` with 8 citations and similarity scores up to 0.799. `answer:'Service unavailable.'` until Python agent is deployed at PYTHON_AGENT_URL. |
| Database | self-hosted Supabase at supabase.kmedtour.com | ✅ running, seeded | 19 public tables. 2026-04-28 content seed: clinics 30, treatments 113, countries 4, articles 3, testimonials 6, africa_regions 10. 2026-04-29 RAG seed: rag_documents 146 (source_type='seed'), rag_chunks 161 (768-dim Gemini embeddings). |
| AI agent (Python) | (PLANNED) agent.kmedtour.com | ⏳ not deployed | Built, Dockerfile ready, env-vars known. Coolify Application path. DNS A record `agent.kmedtour.com → 62.84.185.148` not yet added. Post-travel. |

## VPS topology

- **Host:** `62.84.185.148` (Contabo) — 11GB RAM, 6 cores, Ubuntu 24.04
- **Orchestrator:** Coolify (NOT a clean Docker host) — manages everything via traefik proxy on 80/443
- **Three Supabase stacks:**
  - `i4wg0o88k884s8o0ogoks84w` ← **KmedTour** (verified in Coolify "KmedTour" project label)
  - `r8g80g0kwo0ggw80004wskcg` ← unknown (3 weeks old)
  - `t4kc0so4ss444o8cco0ks04w` ← wonlink/SoulRank (per auto-memory)
- **Direct DB access:** `docker exec supabase-db-i4wg0o88k884s8o0ogoks84w psql -U postgres -d postgres -c "..."`
- **Supabase Studio is broken** for this project. Always go via psql.
- **DNS pointing here:** `kmedtour.com`, `supabase.kmedtour.com`. `agent.kmedtour.com` not added yet.

## Keys and credentials

- All keys live in `.env.local` (laptop) and Coolify env vars (server). Never commit `.env.local` (it's gitignored).
- **Supabase keys** were drift-corrected today (1-char truncation in middle of signature). Current correct keys:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 169 chars, suffix `yIEDF8bPhw`, role: `anon`
  - `SUPABASE_SERVICE_ROLE_KEY` — 180 chars, suffix `etleKmo2rs`, role: `service_role`
  - `JWT_SECRET` (in Kong, not in app) — 32 chars, suffix `h7drWcn1`
- To re-grab from VPS: `docker exec supabase-kong-i4wg0o88k884s8o0ogoks84w printenv SUPABASE_ANON_KEY` (and `SUPABASE_SERVICE_KEY`)

## Open critical issues

| # | Issue | Severity | Plan |
|---|---|---|---|
| ~~1~~ | ~~RLS blocks anon INSERT~~ | ✅ RESOLVED 2026-04-28 | Option A landed (commit 0913b0b). Form working. |
| ~~2~~ | ~~patient_intakes 0 rows~~ | ✅ RESOLVED 2026-04-28 | Form writes verified end-to-end. |
| ~~3~~ | ~~Other write routes broken~~ | ✅ RESOLVED 2026-04-28 | Sweep landed (commit de39014). 16 routes on admin context. |
| ~~4~~ | ~~Local production-readiness pass not committed/deployed~~ | ✅ RESOLVED 2026-04-29 | Deployed in commits 39d957f → ece9052 (env-validation fix) → 58de4e2 (RAG embed fix). Hospital detail 200, /clinics 308 redirect, /api/health new shape, form POSTs all live and verified. |
| ~~6~~ | ~~RAG rag_chunks/rag_documents empty~~ | ✅ RESOLVED 2026-04-29 | Seeded 146 docs / 161 chunks. Live retrieval verified at sim=0.799 on top match. |
| 5 | AI agent not deployed | 🟠 post-pitch | Coolify Application path. ~30-60 min when ready. Until then chat returns "Service unavailable" with citations populated. |
| 7 | `agent.kmedtour.com` DNS not added | 🟡 deploy prereq | Add A record at registrar before agent deploy. |
| 8 | 2 SECURITY DEFINER functions in `public` schema (`claim_patient_intake`, `handle_new_user_role`) | 🟠 security smell per supabase skill | Audit bodies; relocate to private schema. Likely culprit for original 2026-04-27 anon-INSERT mystery. |
| 9 | `lib/supabase/middleware.ts` uses cookie-presence-only auth on `/coordinator/*` | 🟠 auth bypass surface | Migrate to `@supabase/ssr` for real session validation. Academic until users sign up. |
| 10 | Migration files drift from production reality (`rag_documents` is one example: file declares `content_hash`/`is_active`, prod has neither but has `source_id` not in file) | 🟠 future drift risk | Reconcile migrations + initialize proper Supabase CLI project. Multi-hour cleanup. handover §6.5. |
| 11 | GH Actions Quality Gate has been failing on every commit since 2026-04-27 | 🟡 CI hygiene | Two causes: lint env-validation fix landed in ece9052 and pnpm audit critical (Next.js < 15.2.3, CVE-2025-29927). Bump Next to ≥15.2.3 to clear it. |
| 12 | Python agent (`/agents/`) has fragile bits: keyword-based router, hardcoded "healthy" health endpoint, no startup env validation, `text-embedding-004` mention in code that's now 404 for current Gemini key | 🟡 quality before deploy | Tighten before §6.1 deploy. The seed and chat route now pin to gemini-embedding-001:768 — agent retrieval logic should match if/when it does its own embedding. |

## Recent decisions

- **2026-04-29:** Production-readiness pass deployed in three commits:
  - `39d957f` (initial push) — failed Netlify build (state=error). Root cause: new env-validation block in next.config.mjs listed `NEXT_PUBLIC_APP_URL` as required even though the same file falls back to `http://localhost:3002`, AND fired during `next lint` (no NEXT_PHASE gate). Diagnosis: ran `node -e require('dotenv').config(...); process.env.NETLIFY='true'; ...; await import('./next.config.mjs')` locally — reproduced exact failure.
  - `ece9052` — TDD fix: extracted validation into `lib/config/env-validation.mjs`, wrote 9 vitest cases, gated on `NEXT_PHASE === 'phase-production-build'`, dropped NEXT_PUBLIC_APP_URL from required list, accept `GOOGLE_API_KEY` in lieu of `GEMINI_API_KEY`. Build state=ready in ~3 min.
  - `58de4e2` — RAG fix: `text-embedding-004` is 404 on Gemini v1beta for the current API key; the only embedContent-capable models are `gemini-embedding-001` and `gemini-embedding-2*`. Pinned both `seed_rag.js` and `/api/rag/chat` `geminiEmbed()` to `gemini-embedding-001` with `outputDimensionality:768`. Also adapted `seed_rag.js` to the actual `rag_documents` schema (no `content_hash`/`is_active`, has `source_id`) — verified via PostgREST `/rest/v1/?select=` introspection, not by trusting the migration file.
- **2026-04-29:** RAG seed run successfully against production: 146 `rag_documents` (source_type='seed') + 161 `rag_chunks` (768-dim Gemini embeddings). Live smoke verified `POST /api/rag/chat {message:'What plastic surgery clinics in Korea specialize in rhinoplasty?'}` returns `route:'rag'`, 8 citations, top match `Rhinoplasty` at sim=0.799. Answer is `'Service unavailable.'` because the Python agent at `PYTHON_AGENT_URL` is not deployed yet (callPythonAgent throws → caught at chat route → buildSuccessResponse still runs with retrieved chunks).
- **2026-04-28 late:** Production-readiness pass originally implemented locally — see commit `39d957f` for full diff. Verification passed locally: `pnpm typecheck`, `pnpm test` (74 tests), `node --check supabase/scripts/seed_rag.js`, `pnpm build`, `git diff --check`.
- **2026-04-28:** Server-side write API sweep complete (commit de39014). 16 routes use admin context; GET/read paths stay on anon for RLS-based per-user scoping. Pattern documented in commit message.
- **2026-04-28:** Tables seeded from `lib/data/*.json` via `supabase/scripts/seed_db.js` + new `supabase/scripts/seed_extra.js`. Repositories will flip from JSON fallback to DB read transparently.
- **2026-04-28:** Yesterday's "orphaned role OID" RLS hypothesis was WRONG. `polroles={0}` raw_oids = PUBLIC pseudo-role; the `regrole[]` cast displays it as `{-}`. The actual cause of the original anon-INSERT 42501 is unidentified; suspected to be the SECURITY DEFINER `claim_patient_intake` trigger. Service_role bypasses the trap entirely so the fix works regardless.
- **2026-04-27:** Pivot from `agents/deploy-contabo.sh` to Coolify Application — VPS is Coolify-managed, can't bypass
- **2026-04-27:** Server-side APIs should use `SUPABASE_SERVICE_ROLE_KEY`, not anon key — this is tomorrow's refactor
- **2026-04-27:** GSAT 2026 pitch deck v2 delivered (`C:\Users\Lenovo\Desktop\GSPT\KmedTour_GSAT2026_PITCH_v2.pptx`)

## Architecture decisions to remember

- Public repositories now try Supabase first and fall back to static JSON only if DB is unavailable or empty. Supabase was seeded 2026-04-28; do not assume JSON is the only source anymore.
- `supabase_migrations.schema_migrations` doesn't exist — schema was hand-built, not via `supabase db push`. Don't naively run migrations.
- Middleware has been buggy in production. Always check the matcher excludes `api`, `_next/static`, `_next/image`, `_vercel`, file-extensions.

## Files NOT to commit

- `.env.local` (gitignored, has live keys)
- `agents/.env` (gitignored, would have prod keys when populated)
- Anything starting with `HANDOVER-` (per `.gitignore`?) — check before pushing

## Where to look next session

1. **FIRST: invoke skills before touching anything** — `supabase:supabase` and `superpowers:systematic-debugging`.
2. **Then read:** [`HANDOVER-2026-04-28.md`](HANDOVER-2026-04-28.md) (current handover — full editor handoff context)
3. **Then update:** this `memory.md` file at the END of your session (Session Log table at bottom)
4. **Then execute:** pick a task from §6 of the handover. Confirm with Sam (or whoever is driving) before touching code.

## How to debug Supabase issues without guessing

Tomorrow's pattern (so we don't repeat 2026-04-27's mistakes):

1. Invoke `supabase:supabase` skill — gives Supabase-specific patterns (e.g. "server-side writes use service_role")
2. Invoke `superpowers:systematic-debugging` — enforces investigate → hypothesize → test → fix discipline
3. Test if Supabase MCP tools work with self-hosted (`mcp__12717a60-...__list_tables`) — if yes, `get_advisors` would auto-detect RLS problems
4. Direct `docker exec ... psql` for raw queries (Supabase Studio at supabase.kmedtour.com is broken)

---

## Session log (most recent first)

| Date | Focus | Outcome | Handover |
|---|---|---|---|
| 2026-04-29 | Deploy + harden production-readiness pass + RAG end-to-end | Three commits landed live: 39d957f → ece9052 (TDD env-validation fix, 9 new vitest cases) → 58de4e2 (gemini-embedding-001@768 + rag_documents schema-drift fix). Hospital detail 200 ✅ · /clinics 308 redirect ✅ · /api/health new shape ✅ · form POSTs ✅ · RAG retrieval live (sim=0.799 on relevant query) ✅ · 146 docs / 161 chunks seeded ✅. Chat answer still pending Python agent deploy. | (this memory.md) |
| 2026-04-28 late | Local production-readiness pass | Hospital detail 500 fix path implemented · `/clinics/[slug]` redirect added · form APIs fail closed · Sentry/Next config updated · WebP images added · RAG seed script added · typecheck/test/build pass · **not deployed** | [HANDOVER-2026-04-28.md](HANDOVER-2026-04-28.md) §1e/§6.0 |
| 2026-04-28 | Pre-travel demo prep — Supabase fix + sweep + seed | Form ✅ · 16 write routes swept to admin context ✅ · 6 tables seeded (166 rows) ✅ · Site is now genuinely DB-driven for tomorrow's GSAT demo | (no separate handover; this memory.md is the source of truth) |
| 2026-04-27 | GSAT pitch deck + production debug | Deck shipped ✅ · Supabase keys + middleware fixed ✅ · RLS issue blocked 🔴 | [HANDOVER-2026-04-27.md](HANDOVER-2026-04-27.md) |
| 2026-04-19 | PWA + i18n cleanup + TypeScript fixes | PWA live ✅ | [HANDOVER-2026-04-19.md](HANDOVER-2026-04-19.md) |
| 2026-04-18 | Patient intake API hardening | Improved API deployed ✅ (but middleware bug masked it — discovered 04-27) | [HANDOVER-2026-04-18.md](HANDOVER-2026-04-18.md) |
| 2026-04-14 | Image migration + landing copy | Real photos live ✅ | [HANDOVER-2026-04-14.md](HANDOVER-2026-04-14.md) |
