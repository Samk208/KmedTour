# KmedTour — Master TODO

**Last updated:** 2026-04-14
**Conference deadline:** ~10 days

---

## SAM MUST DO (Manual — Cannot Be Automated)

- [ ] **Add 9 GitHub Secrets** — see HANDOVER-2026-04-14.md for exact values
- [ ] **Push Supabase migrations** — `npx supabase db push --project-ref YOUR_REF`
- [ ] **Set Netlify env vars** — SUPABASE_SERVICE_ROLE_KEY, STRIPE keys, RESEND, GEMINI, SENTRY
- [ ] **Test Stripe payment** — use test card 4242 4242 4242 4242
- [ ] **Set up Google Analytics** + Search Console
- [ ] **Create Sentry project** — get DSN for error monitoring
- [ ] **Prepare 2-min demo script** — intake -> matching -> quote -> accept flow
- [ ] **Review downloaded images** — spot-check `public/images/*.jpg` for quality
- [ ] **Assign coordinator role** — `INSERT INTO user_roles (user_id, role) VALUES ('<uid>', 'coordinator')`

---

## CLAUDE CAN DO (Scheduled Sessions 4-5)

### Session 4 — Apr 15 (Demo Polish)
- [ ] Update image refs across codebase (.png -> .jpg)
- [ ] Commit all uncommitted changes from Apr 14 session
- [ ] Remove font-mono dev styling from remaining treatment card elements
- [ ] Test homepage renders correctly with new copy + images
- [ ] Conference outreach materials (one-pager, email template)
- [ ] Demo page polish (loading states, error messages)

### Session 5 — Apr 16 (Final Hardening)
- [ ] Cross-browser test (Chrome, Safari, Firefox, mobile viewport)
- [ ] Lighthouse audit on key pages (homepage, treatments, intake form)
- [ ] Security check — no exposed keys, no console.log in prod code
- [ ] Verify all 23 API endpoints return proper error codes
- [ ] Generate demo rehearsal notes (click-through script)
- [ ] Final commit + tag release

---

## DONE (This Session — Apr 14)

- [x] Full project audit (227 TS files, 23 APIs, 30 routes, 71 tests)
- [x] Landing page copy overhaul — 6 components, all tech jargon replaced
- [x] Fix mock submission ID bug (patient-intake API)
- [x] Build Pexels image sourcing script
- [x] Download 86 real photos (54 procedures + 31 hospitals + 1 hero)
- [x] Verify TypeScript + ESLint + icon imports clean
- [x] Update handover note
- [x] Create this TODO

---

## POST-CONFERENCE (Park These)

- [ ] Deploy Python agent to VPS (Docker)
- [ ] Add SMS notifications (Twilio)
- [ ] Enable RLS policies on all Supabase tables
- [ ] Video consultation integration
- [ ] Add more testimonials (currently 6, need 15+)
- [ ] Expand blog content (currently 3 articles)
- [ ] pSEO content for remaining 98 procedures (15 done)
- [ ] City-specific intro content
- [ ] Distributed rate limiting (Upstash Redis in prod)
- [ ] Patient portal auth end-to-end wiring
- [ ] Coordinator dashboard full implementation
