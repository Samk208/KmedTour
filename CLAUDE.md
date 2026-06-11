# KmedTour Now

Medical-tourism platform (Africa → Korea). Next.js 15 App Router + React 19, Tailwind 4 + shadcn/ui, Supabase (self-hosted), TanStack Query, next-intl. Package manager is **pnpm** (Node 20).

## Commands

```
pnpm dev          # dev server on port 3002
pnpm build        # next build
pnpm typecheck    # tsc --noEmit
pnpm lint         # next lint (eslint 8)
pnpm test         # vitest unit tests
pnpm test:e2e     # playwright; auto-starts dev server, reuses anything on 3002
```

E2E against a production build (matches CI exactly):

```
$env:NEXT_PUBLIC_SUPABASE_URL='https://placeholder.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='placeholder-key-for-build'
$env:NEXT_PUBLIC_APP_URL='http://localhost:3002'
npx next build; npx next start --port 3002   # then: npx playwright test
```

## Layout

- `app/[locale]/…` — ALL pages are locale-prefixed (next-intl); bare paths like `/contact` redirect to `/en/contact`
- `components/ui/` — shadcn primitives; `components/<feature>/` — feature components
- `lib/` — supabase clients, api hooks (`lib/api/hooks/`), i18n routing
- `tests/e2e/` — Playwright; `messages/` — i18n strings; `supabase/` — schema/scripts
- Top-level dirs like `Content Hub Data/`, `Deep Tech Improvement/`, `doc/`, `memory/` are working notes, not app code

## Gotchas

- **Concurrent Claude sessions share this checkout.** Another session may commit/push your uncommitted changes or move HEAD under you. Check `git reflog` before diagnosing "impossible" git states; prefer a git worktree for multi-step work; don't leave WIP uncommitted across long waits.
- `middleware.ts` matcher must keep excluding `api`, `_next/static`, `_next/image`, and file-extension paths — locale redirects on those break APIs/assets.
- Forms must use shadcn `Form` components (react-hook-form + zod). Plain `required` attributes never set `aria-invalid`, and E2E specs assert `[aria-invalid="true"]` on failed validation (see `app/[locale]/contact/page.tsx` since 53cca28).
- Live hospital data is read from static TS files, not Supabase.
- Supabase is self-hosted on the Coolify VPS (62.84.185.148, stack `i4wg0o88k884s8o0ogoks84w`). Studio is broken — use `docker exec supabase-db-… psql`. service_role key for server-side writes, anon for reads.
- Windows: killing a backgrounded `next start` task can leave a zombie node holding port 3002 that serves a stale build (all JS chunks 400, pages render but never hydrate). Kill by port: `Get-NetTCPConnection -LocalPort 3002 -State Listen` → `Stop-Process`.
- CI (`.github/workflows/ci.yml`): lint+typecheck, vitest, build, e2e, security audit, then a quality gate that blocks deploy. As of 2026-06-11 the e2e job is red with 7 pre-existing failures (pseo-pages `DYNAMIC_SERVER_USAGE` 500s ×5, patient-intake ×2).
- Deploys: app → Netlify via `deploy.yml` (GitHub Actions); do not deploy the app to the Coolify VPS — that VPS only hosts Supabase.

## Handover files

Rolling state in `memory.md` (repo root); session handovers in `HANDOVER-YYYY-MM-DD.md`; cowork-level notes in `Claude cowork/startups/kmedtour/memory.md`.
