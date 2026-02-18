# GitHub Actions – Robustness Review

## Summary

The CI and Deploy workflows are **production-grade** with broad coverage. Below are strengths, risks, and applied improvements.

---

## Strengths

| Area | Detail |
|------|--------|
| **Concurrency** | CI cancels in-progress runs for the same ref; deploy can be given the same. |
| **Caching** | pnpm cache used consistently; Node/pnpm setup aligned across jobs. |
| **Gating** | Quality gate depends on all 13 jobs; no `continue-on-error` on critical steps. |
| **Security** | CodeQL, TruffleHog, Snyk (optional), dual npm audit (moderate + high). |
| **Scope** | Lint, typecheck, build, security, deps, Supabase, AI, a11y, env, API security. |
| **Deploy** | Netlify CLI `--build --prod`; env from secrets; timeout 15 min. |

---

## Risks & Improvements Applied

### 1. **Action version pinning**
- **Risk:** `trufflesecurity/trufflehog@main` and `snyk/actions/node@master` are unpinned; changes can break CI.
- **Applied:** Pinned TruffleHog to a tag. Snyk kept conditional on `SNYK_TOKEN`; pin to a tag when you adopt it.

### 2. **Snyk job missing dependencies**
- **Risk:** `security-advanced` runs Snyk without `node_modules`; `snyk test` needs them.
- **Applied:** Added checkout + pnpm install before the Snyk step so the scan runs on the real dependency tree.

### 3. **Env validation not failing**
- **Risk:** Required vars in `.env.example` were only warned; missing vars didn’t fail the job.
- **Applied:** Env-validation now exits 1 if any required var is missing from `.env.example`.

### 4. **Deploy workflow concurrency**
- **Risk:** Multiple deploys for the same branch could overlap.
- **Applied:** Concurrency group added so the latest run wins and in-progress deploys are cancelled.

### 5. **Python pip cache**
- **Risk:** `cache: 'pip'` may not invalidate when `agents/requirements.txt` changes.
- **Applied:** Custom cache key that includes hash of `agents/requirements.txt` for better invalidation.

---

## Optional / Future Improvements

| Item | Suggestion |
|------|------------|
| **Duplicate build** | `build` and `performance` both run `pnpm build`. Consider uploading `.next` from `build` and reusing it in `performance` to save ~2–5 min. |
| **Bundle analyzer** | `npx next-bundle-analyzer` is not in package.json; add as devDependency and run via `pnpm run` for reproducibility. |
| **Netlify CLI** | Add `netlify-cli` to devDependencies and use `pnpm exec netlify deploy ...` for a pinned version. |
| **Supabase RLS** | Supabase job only warns when no RLS is found; consider failing the job if `schema.sql` exists but has no `CREATE POLICY`. |
| **Deploy on CI success** | To deploy only when CI passes, make deploy workflow `workflow_run` after CI success, or call it from the quality-gate job. |
| **Secrets in PRs** | Deploy doesn’t run on PRs; ensure Netlify preview deploys (e.g. via Netlify’s “Deploy Previews”) use the right env. |

---

## Required Secrets

| Secret | Used in | Purpose |
|--------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Deploy, CI build | Next.js build / deploy |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Deploy, CI build | Next.js build / deploy |
| `NETLIFY_AUTH_TOKEN` | Deploy | Netlify CLI auth |
| `NETLIFY_SITE_ID` | Deploy | Target site |
| `SNYK_TOKEN` | CI (optional) | Snyk scan in security-advanced |

---

## Quality gate dependency graph (main only)

```
quality → build → performance
    ↓         ↓
security   deployment-check
    ↓              ↓
security-advanced   quality-gate
dependencies
supabase
ai-features
python-tests
accessibility
env-validation
api-security
```

All listed jobs must succeed for the quality gate to pass on `main`.
