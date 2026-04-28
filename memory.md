# KmedTour — Rolling State of Truth

**Last updated:** 2026-04-28 evening (pre-travel session)
**Latest handover:** [`HANDOVER-2026-04-27.md`](HANDOVER-2026-04-27.md) — note RLS section is SUPERSEDED, see below

This is the single source of truth for "where is the project right now". Do NOT diff through HANDOVER-* files to figure out current state — read this file first.

---

## Production stack

| Layer | Where | Status | Notes |
|---|---|---|---|
| Frontend | https://kmedtour.netlify.app (Netlify) | ✅ live | Next.js 15, PWA installable |
| Patient intake API | `/api/patient-intake` | ✅ working | Fixed 2026-04-28 — now uses service_role. Verified 3+ rows in DB. |
| Contact / quotes / journey / payments / coordinator APIs | `/api/contact`, `/api/quotes/*`, `/api/journey/*`, `/api/payments/*`, `/api/coordinator/*` | ✅ working | Fixed 2026-04-28 — sweep applied (commit de39014). 16 routes now use service_role. |
| Public reads (hospitals, treatments, articles, etc.) | repository pattern | ✅ live data | Tables seeded 2026-04-28 — repos flip from JSON fallback to DB |
| Chat / RAG API | `/api/rag/chat` (Next.js proxy) | ⚠️ partial | Code path now on admin context, but `PYTHON_AGENT_URL` still unset → falls back to OpenAI inline. RAG empty (rag_chunks 0 rows). |
| Database | self-hosted Supabase at supabase.kmedtour.com | ✅ running, seeded | 19 public tables, 166+ content rows seeded (clinics 30, treatments 113, countries 4, articles 3, testimonials 6, africa_regions 10) + live form data |
| AI agent (Python) | (PLANNED) agent.kmedtour.com | ⏳ not deployed | Built, Dockerfile ready, env-vars known. Coolify Application path. Post-travel. |

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
| 4 | AI agent not deployed | 🟠 post-pitch | Coolify Application path. ~30-60 min when ready. |
| 5 | RAG `rag_chunks`/`rag_documents` empty | 🟡 functional gap | ETL from static content. Needed for AI agent to be useful. |
| 6 | `agent.kmedtour.com` DNS not added | 🟡 deploy prereq | Add A record at registrar before agent deploy |
| 7 | 2 SECURITY DEFINER functions in `public` schema (`claim_patient_intake`, `handle_new_user_role`) | 🟠 security smell per supabase skill | Audit bodies; relocate to private schema. Likely culprit for original 2026-04-27 anon-INSERT mystery. |
| 8 | `lib/supabase/middleware.ts` uses cookie-presence-only auth on `/coordinator/*` | 🟠 auth bypass surface | Migrate to `@supabase/ssr` for real session validation. Academic until users sign up. |
| 9 | Migration files have 4 double-declared tables (`journey_events`, `bookings`, `notifications`, `notification_templates`) and no `supabase_migrations.schema_migrations` tracking table | 🟠 future drift risk | Reconcile migrations + initialize proper Supabase CLI project. Multi-hour cleanup. |

## Recent decisions

- **2026-04-28:** Server-side write API sweep complete (commit de39014). 16 routes use admin context; GET/read paths stay on anon for RLS-based per-user scoping. Pattern documented in commit message.
- **2026-04-28:** Tables seeded from `lib/data/*.json` via `supabase/scripts/seed_db.js` + new `supabase/scripts/seed_extra.js`. Repositories will flip from JSON fallback to DB read transparently.
- **2026-04-28:** Yesterday's "orphaned role OID" RLS hypothesis was WRONG. `polroles={0}` raw_oids = PUBLIC pseudo-role; the `regrole[]` cast displays it as `{-}`. The actual cause of the original anon-INSERT 42501 is unidentified; suspected to be the SECURITY DEFINER `claim_patient_intake` trigger. Service_role bypasses the trap entirely so the fix works regardless.
- **2026-04-27:** Pivot from `agents/deploy-contabo.sh` to Coolify Application — VPS is Coolify-managed, can't bypass
- **2026-04-27:** Server-side APIs should use `SUPABASE_SERVICE_ROLE_KEY`, not anon key — this is tomorrow's refactor
- **2026-04-27:** GSAT 2026 pitch deck v2 delivered (`C:\Users\Lenovo\Desktop\GSPT\KmedTour_GSAT2026_PITCH_v2.pptx`)

## Architecture decisions to remember

- The live Netlify site shows hospital data from **static TS/JSON files in the repo**, not from Supabase. Don't assume "site works" means "Supabase has data". Today's discovery: Supabase has 0 rows.
- `supabase_migrations.schema_migrations` doesn't exist — schema was hand-built, not via `supabase db push`. Don't naively run migrations.
- Middleware has been buggy in production. Always check the matcher excludes `api`, `_next/static`, `_next/image`, `_vercel`, file-extensions.

## Files NOT to commit

- `.env.local` (gitignored, has live keys)
- `agents/.env` (gitignored, would have prod keys when populated)
- Anything starting with `HANDOVER-` (per `.gitignore`?) — check before pushing

## Where to look next session

1. **FIRST: invoke skills before touching anything** — `supabase:supabase` and `superpowers:systematic-debugging`. Today's session burned hours doing guess-driven debugging. The skills exist for exactly this kind of work — use them.
2. **Then read:** `HANDOVER-2026-04-27.md` (this session's full detail) — note especially the "SKILL GATE" section at the top
3. **Then update:** this `memory.md` file (replace what's stale at the end of session)
4. **Then execute:** the "Tomorrow's plan" Option A from the handover

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
| 2026-04-28 | Pre-travel demo prep — Supabase fix + sweep + seed | Form ✅ · 16 write routes swept to admin context ✅ · 6 tables seeded (166 rows) ✅ · Site is now genuinely DB-driven for tomorrow's GSAT demo | (no separate handover; this memory.md is the source of truth) |
| 2026-04-27 | GSAT pitch deck + production debug | Deck shipped ✅ · Supabase keys + middleware fixed ✅ · RLS issue blocked 🔴 | [HANDOVER-2026-04-27.md](HANDOVER-2026-04-27.md) |
| 2026-04-19 | PWA + i18n cleanup + TypeScript fixes | PWA live ✅ | [HANDOVER-2026-04-19.md](HANDOVER-2026-04-19.md) |
| 2026-04-18 | Patient intake API hardening | Improved API deployed ✅ (but middleware bug masked it — discovered 04-27) | [HANDOVER-2026-04-18.md](HANDOVER-2026-04-18.md) |
| 2026-04-14 | Image migration + landing copy | Real photos live ✅ | [HANDOVER-2026-04-14.md](HANDOVER-2026-04-14.md) |
