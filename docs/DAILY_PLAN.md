# Arbi — Daily Build Plan

_A day-by-day, actionable breakdown of the full-stack build. Each day is scoped to
~one focused session and ends in a testable, committable state. Check off tasks as you
go and log every change in `docs/CHANGELOG.md`._

Ordering follows dependencies, not the original prompt's numbering: the data layer must
be reconciled **before** the homepage can be moved off mock data. Days are sized so you
can stop, test manually, and resume the next day.

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Day 0 — Environment & baseline (foundations)
Goal: a running dev server against a real database, and a documented env surface.

- [ ] `npm install` (done in this checkout) and confirm `npm run dev` boots.
- [ ] Create `.env.local` from the template below; fill Clerk + Supabase keys.
- [ ] `npx drizzle-kit generate` then `npx drizzle-kit push` to sync schema → Supabase (G5).
- [ ] Seed a couple of real rows (one user, one trip) so DB-backed pages aren't empty.
- [ ] Run `npm run lint` and `npx tsc --noEmit`; record the baseline in the changelog.

**Env template (`.env.local`):**
```
DATABASE_URL=postgresql://...            # Supabase connection string (pooled)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...           # from Clerk dashboard → Webhooks
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co   # only if using supabase-js later
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                    # only if using supabase-js later
# Deferred (stubs only for now): STRIPE_SECRET_KEY, RESEND_API_KEY, NEXT_PUBLIC_POSTHOG_KEY
```
> **Known blocker (confirmed):** `next build` and Vercel deploys currently **fail** with
> `DATABASE_URL environment variable is not set` — `db/index.ts` throws at module load, and
> `/api/requests/[id]/status` imports it during page-data collection. Set `DATABASE_URL` (and
> Clerk keys) in Vercel's project settings to unblock. Optional code fix: make the DB client
> lazy so it only throws on first query, not at import (greenlight required — it's app code).

**Test:** dev server loads `/`; `/dashboard` redirects to sign-in when signed out.

---

## Day 1 — Reconcile the data layer (unblocks everything) — Gap G1 prerequisite
Goal: make `db/queries.getTrips()` return rows the existing `TripCard`/`Trip` type can render,
so the homepage swap in Day 2 doesn't crash.

- [ ] Extend `getTrips()` to also select traveler `travelerRating`, `tripsCompleted`,
      `avatarInitials`, and a per-trip request **count** (subquery or left-join + group).
- [ ] Add a `mapDbTripToView()` helper (in `db/queries.ts` or a new `lib/adapters.ts`)
      that coerces `capacityKg`/ratings from string→number and shapes rows to the app
      `Trip` type (nested `traveler`, `requests` as `[]` or count-only).
- [ ] Decide the card contract: give `TripCard` a `requestCount: number` prop instead of
      requiring the full `requests` array (cleaner than hydrating every request on a grid).
- [ ] Keep `lib/mock-data.ts` in place for now (fallback/dev seed) — do **not** delete yet.

**Test:** call `getTrips()` in a scratch route or `console.log`; confirm shape matches
what `TripCard` reads. No UI change shipped this day.

---

## Day 2 — Homepage: move off mock + trust signals + recent matches — Gaps G1, G2
Goal: `/` and `/trips` render real DB data and the homepage tells both sides the story.

- [ ] Swap `app/page.tsx` and `app/trips/page.tsx` imports from `@/lib/mock-data` to the
      reconciled `db/queries`. Handle empty state (no trips yet) gracefully.
- [ ] Add a **Trust signals** row under How-it-works: Escrow payments · Verified travelers ·
      Money-back guarantee (3 small icon+label cards, matching the rounded-2xl card style).
- [ ] Add a **Recent matches** section (real matches if any, else a tasteful placeholder
      strip — clearly labeled as examples, not fake social proof).
- [ ] Verify mode toggle still swaps hero copy after the data swap.

**Test:** post a trip via `/post-trip`, then confirm it appears on `/` and `/trips`
(the flow the audit flagged as broken). Trust signals + recent matches visible.

---

## Day 3 — Clerk → Supabase webhook: full lifecycle — Gap G3
Goal: user rows stay in sync on create/update/delete.

- [ ] Add `updateUser()` and `deleteUser()` (soft-delete preferred: add a `deletedAt`
      column, or hard-delete if simpler for now) to `db/queries.ts`.
- [ ] Extend `app/api/webhooks/clerk/route.ts` to handle `user.updated` (upsert name/
      email/initials) and `user.deleted` (soft/hard delete).
- [ ] Keep the svix verification path unchanged.
- [ ] Document the exact dashboard steps (endpoint URL + events) in `docs/CHANGELOG.md`.

**Clerk dashboard config to record:**
- Endpoint URL: `https://<your-domain>/api/webhooks/clerk`
- Events to subscribe: `user.created`, `user.updated`, `user.deleted`

**Test:** update your Clerk profile name → row updates. Delete test user → row removed/flagged.

---

## Day 4 — Matches: real persistence — Gap G4
Goal: accepting a request can create a real `matches` row; matches table stops being dead.

- [ ] Add `createMatch()` / `getMatchesForUser()` to `db/queries.ts` against the existing
      `matches` table.
- [ ] Rewrite `app/api/matches/route.ts` POST to insert a real row (drop the `m_${Date.now()}`
      stub). Validate `requestId`/`tripId` exist and the caller owns the trip.
- [ ] Optional: when a request is **accepted** in `/api/requests/[id]/status`, create the
      match in the same transaction so accept == match.

**Test:** accept a request → a `matches` row exists with `agreedPrice`/`courierFee`.

---

## Day 5 — Dashboard polish + `/api/dashboard` — prompt Priority 4/5
Goal: single dashboard endpoint + pending-request counts per trip.

- [ ] Add `GET /api/dashboard` returning `{ trips, requests }` for the authed user in one
      call (the page currently queries DB directly — keep that working, add the route for
      client use / parity with the prompt).
- [ ] Show a **pending-requests count** badge per trip in the "My trips" tab.
- [ ] Confirm empty states + CTAs (already present) still look right.

**Test:** `/dashboard` shows accurate counts; `GET /api/dashboard` returns matching JSON.

---

## Day 6 — `/profile/[id]` off mock + verification badge groundwork
Goal: remove the last mock-data reads; make profiles real.

- [ ] Swap `app/profile/[id]/page.tsx` to `db/queries.getUserById` + real stats
      (`/api/user/[id]` already returns these).
- [ ] Add a "Verified" pill placeholder tied to a future `users.verified` flag.
- [ ] Once `/`, `/trips`, `/profile`, and `/trips/[id]` fallback are all real, **plan**
      mock-data removal (do it only after DB reliably has data — keep as dev seed otherwise).

**Test:** visit a real user's `/profile/[id]`; stats match dashboard.

---

## Day 7 — QA, accessibility & UI consistency pass
Goal: the whole thing feels like one product. See `docs/UI_GUIDELINES.md`.

- [ ] Walk every page against the UI checklist (spacing scale, one accent, focus states,
      empty states, loading skeletons, mobile widths).
- [ ] Keyboard + screen-reader pass on the mode toggle, forms, and accept/decline buttons.
- [ ] Lighthouse / manual perf check on the globe (it's heavy — lazy-load, already wrapped).
- [ ] Fix contrast on the many `text-gray-400/500` labels where they fail AA.

**Test:** tab through each page; every interactive element is reachable and visibly focused.

---

## Backlog (explicitly deferred — do NOT start without a green light)
- Stripe Connect escrow (payments) — `lib/stripe.ts` stub in place.
- Resend transactional email + in-app notifications (Gap #6) — `lib/resend.ts` stub.
- PostHog analytics — `lib/posthog.ts` stub.
- Reviews UI (table exists, no UI).

---

### How to work this plan daily
1. Pick the top unchecked day. Read `docs/AUDIT.md` for context.
2. Before coding, skim the relevant `node_modules/next/dist/docs/` guide (AGENTS.md rule).
3. Make the change on branch `claude/stoic-fermat-o6i0jr`.
4. Manually test the "Test:" line for that day.
5. Append a dated entry to `docs/CHANGELOG.md`. Check the boxes here.
6. Commit with a clear message. Stop and let a human test before the next day.
