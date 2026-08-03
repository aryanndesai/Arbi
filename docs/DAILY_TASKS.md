# Arbi — Daily Task Plan

This breaks the full build brief into small, one-sitting chunks. Each day is scoped to be reviewable in a single pass — build it, test it, move on. Check items off as they land; leave a one-line note if a day's scope changed.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Day 0 — 2026-08-03 — Audit + the one bug that actually breaks the app — **DONE**

- [x] Full codebase read-through, no assumptions (see `AUDIT.md`)
- [x] Fix mock-data/real-DB split-brain: `/`, `/trips`, `/post-request/[tripId]`, `/profile/[id]` now read real Drizzle data instead of `lib/mock-data.ts`
- [x] Fix trip-detail page: buyer name/rating now shows for real DB-backed requests (was silently blank)
- [x] Migrate `middleware.ts` → `proxy.ts` (Next.js 16 renamed the convention; same behavior)
- [x] Verified against a real local Postgres instance (seeded a trip + request, confirmed all four pages render it) and a full `next build`
- [x] Typecheck + lint clean

**Why this went first**: everything else in the original brief assumes the app already round-trips through the database correctly. It didn't — a trip posted through the real UI was invisible on the pages buyers actually use to find it, and attaching a request to it 404'd. No other feature is worth building on top of that.

---

## Day 1 — Clerk webhook completeness

- [ ] Handle `user.updated` in `app/api/webhooks/clerk/route.ts` — update the matching `users` row (name, email, avatar initials)
- [ ] Handle `user.deleted` — decide soft-delete vs. hard delete (hard delete will cascade-null `trips.traveler_id`/`item_requests.buyer_id` per the current schema's `references()` — confirm that's acceptable before choosing)
- [ ] Add `updateUser` / `deleteUser` (or `deactivateUser`) to `db/queries.ts`
- [ ] Manual test: use Clerk's dashboard "Testing" tab (or the svix CLI) to fire `user.updated`/`user.deleted` at the webhook and confirm the DB row changes

## Day 2 — Homepage polish (finishing Priority 2)

- [ ] Add three trust signals below "How it works" (Escrow payments, Verified travelers, Money-back guarantee) — placeholder copy is fine, no Stripe wiring yet
- [ ] Add a "Recent matches" section — real data if any `matches` rows exist by then, otherwise clearly-labeled placeholder
- [ ] Re-read the hero/how-it-works copy against `UI_GUIDELINES.md` and sharpen anything that reads traveler-first when in Shopping mode

## Day 3 — Browse page CTA + API pagination

- [ ] Add an explicit "Attach a request" affordance directly on `TripCard` (or the browse grid) so buyers don't have to open the detail page first to see it's possible
- [ ] Add pagination to `GET /api/trips` (the brief's Priority 4 ask) — page/limit query params, capped page size
- [ ] Note in `AUDIT.md`/API docs that the route's response shape is now `TripSummary[]`, matching what the pages render

## Day 4 — Dashboard richness

- [ ] Show a pending-request count per trip on the "My Trips" tab (data's already available via `getTripsForUserSummary`'s `requestCount` — dashboard just needs to switch to it or fetch counts alongside the raw rows it already loads)
- [ ] Consider a "days until departure" indicator on trip rows

## Day 5 — Decide the fate of dead scaffolding (needs your sign-off, not a unilateral delete)

- [ ] Confirm: delete `lib/mock-data.ts`? Nothing imports it anymore as of Day 0.
- [ ] Confirm: keep or remove `lib/supabase.ts`? It's unused — Drizzle talks to Postgres directly — so it's not "not built yet" scaffolding like the Stripe/Resend/PostHog stubs, it's just dead code, unless you want it reserved for future Supabase Auth/Storage use.

## Day 6 — Testing pass

- [ ] Smoke test every flow in `TESTING.md` against a disposable local Postgres + Clerk's dev keyless mode
- [ ] Record pass/fail per flow, file follow-up tasks for anything broken

---

## Backlog — explicitly deferred, do not start without an explicit go-ahead

Per the original brief's "what not to do" list, these stay out of scope until you ask for them:

- Stripe / Stripe Connect escrow (the `matches` table exists but nothing writes to it yet — that's expected until this phase starts)
- Resend transactional email
- PostHog analytics
- A real notification system (buyers/travelers currently have no way to know about new requests/accepts short of refreshing the dashboard)

## How to resume this plan

If you're picking this up on a new day: read `AUDIT.md` first for the current state of the codebase, then come here and start at the first `[ ]` item. Log what you did in `CHANGELOG.md` with today's date before moving to the next day's block.
