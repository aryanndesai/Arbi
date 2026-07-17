# Arbi Build Roadmap - Daily Tasks

Last updated: 2026-07-17

This turns the full audit-and-build brief into small, single-sitting tasks, ordered so
each day ships one testable thing. Check items off as they land. Every day ends with the
three gates: `npm run build`, `eslint`, `tsc --noEmit` all green, plus a manual test note.

Legend: `[x]` done, `[~]` partially done, `[ ]` not started.

Because much of the original brief was already built in prior sessions (see `AUDIT.md`),
the early priorities are mostly verification. The real net-new work starts around Day 3.

---

## Day 1 - Audit, docs, and homepage polish  ✅ (2026-07-17)
- [x] Read the entire codebase, map every route/component/lib file
- [x] Install deps and confirm baseline: build + lint + typecheck all pass
- [x] Write `docs/AUDIT.md` (honest state of the project)
- [x] Write `docs/ROADMAP.md` (this file)
- [x] Write `docs/UI_GUIDELINES.md` (what good UI means, applied to Arbi)
- [x] Write `docs/ENV.md` and `docs/CHANGELOG.md`
- [x] Homepage: add `TrustSignals` (escrow / verified / money-back)
- [x] Homepage: add `RecentMatches` (placeholder seed, clearly marked)
- [x] Visually verify new sections render with the real compiled CSS
- Manual test: load `/`, confirm the three trust cards and three match cards appear
  under How-it-works, styling consistent with the rest of the page.

## Day 2 - Environment + database sync (no code risk)
- [ ] Create a real `.env.local` from `docs/ENV.md` (local only, never committed)
- [ ] `npx drizzle-kit generate` then `npx drizzle-kit push` against the Supabase DB
- [ ] Confirm the five tables exist in Supabase
- [ ] Seed one real user/trip via SQL or the Clerk webhook to test live reads
- Manual test: `/dashboard` shows the seeded trip after signing in.

## Day 3 - Unify the data layer, part 1 (trips read path)
- [ ] Add a mapper in `db/queries.ts` (or a new `lib/serializers.ts`) that turns a flat
      Drizzle trip row + traveler join into the `Trip` view shape used by `TripCard`
      (nested `traveler`, numbers not decimal strings). Keep types strict, no `any`.
- [ ] Switch `/trips` and `/` open-trips grid from `lib/mock-data` to the real query
- [ ] Handle the empty state gracefully (no trips yet -> show the existing empty CTA)
- Manual test: post a trip, see it appear on both `/` and `/trips`.

## Day 4 - Unify the data layer, part 2 (request + profile read paths)
- [ ] `/post-request/[tripId]`: look the trip up from the real DB, not mock
- [ ] `/profile/[id]`: read the real DB (map rows to the profile view shape)
- [ ] Remove the mock fallback branch in `/trips/[id]` once real data is reliable
- [ ] Decide on `lib/mock-data.ts`: keep only as an explicit seed script, or delete
- Manual test: full buyer flow (browse -> open trip -> request item -> see it on dashboard).

## Day 5 - Finish the Clerk webhook
- [ ] Handle `user.updated` (update email / name / initials)
- [ ] Handle `user.deleted` (soft delete or remove row; pick one and document it)
- [ ] Add an `updatedAt` column to `users` if we go the update route
- [ ] Print the exact webhook URL + event list to subscribe to in the Clerk dashboard
- Manual test: change a name in Clerk, confirm the `users` row updates.

## Day 6 - Dashboard depth
- [ ] Add a per-trip "pending requests" count on the My Trips tab
- [ ] Make sure request status badges match `/trips/[id]` exactly (shared helper)
- [ ] Empty states already exist - verify copy and CTAs
- Manual test: a trip with 2 pending requests shows "2 pending" on the dashboard.

## Day 7 - Matches (real)
- [ ] Decide the match trigger (accepting a request creates a `matches` row)
- [ ] Replace the `/api/matches` stub with a real Drizzle insert
- [ ] Wire `RecentMatches` on the homepage to the real `matches` table (fall back to the
      placeholder seed only when there are none)
- Manual test: accept a request, confirm a match row is created.

## Day 8 - Accessibility + responsive pass
- [ ] Keyboard-test every interactive control (toggle, accept/decline, forms)
- [ ] Check focus states are visible on dark buttons
- [ ] Test at 360px, 768px, 1280px; fix any horizontal scroll
- [ ] Run through the UI checklist in `docs/UI_GUIDELINES.md`
- Manual test: tab through `/` and `/trips/[id]` with no mouse.

## Day 9 - Empty/loading/error polish
- [ ] Ensure every list route has a loading skeleton (trips already has `loading.tsx`)
- [ ] Add error boundaries / friendly error states for failed fetches
- [ ] Confirm every API route returns correct status codes (400/401/403/404/500)
- Manual test: kill the DB connection, confirm the app degrades gracefully.

## Backlog (explicitly out of current scope)
- Notifications (issue 6) - needs Resend.
- Payments / escrow - needs Stripe Connect.
- Analytics - needs PostHog.
- Mode toggle affecting pages beyond the hero.
- Reviews UI (the `reviews` table exists but has no screen).

---

## How this routine works day to day
This roadmap is designed to be picked up one day at a time. Each run should:
1. Read `AUDIT.md` + this file to find the next unchecked day.
2. Do that day's tasks only (small, testable).
3. Run the three gates and one manual test.
4. Append a dated entry to `docs/CHANGELOG.md`.
5. Commit and push to the working branch.
