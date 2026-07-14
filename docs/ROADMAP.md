# Arbi — Daily Roadmap

_Actionable, one-day-sized chunks. Work top to bottom. Each day has a goal, concrete tasks, a "done when" check, and a manual test. Check off boxes as you go and log the result in `CHANGELOG.md`._

**Ordering principle:** fix the data layer first (it's what makes the app look broken), then close the auth/webhook gap, then polish UI, then layer on later features. This reorders the prompt's priorities to front-load the highest-impact fix.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Day 1 — Unify the data layer (kills the biggest bug)

**Goal:** the trip you post shows up everywhere a buyer looks.

- [ ] Point `/` (`app/page.tsx`) at `getTrips()` from `@/db/queries` instead of `@/lib/mock-data`.
- [ ] Point `/trips` (`app/trips/page.tsx`) at the DB `getTrips()` too; derive the country filter list from the returned rows.
- [ ] Point `/post-request/[tripId]` at `getTripById()` from `@/db/queries` so real trip ids resolve.
- [ ] Point `/profile/[id]` at `getUserById()` from `@/db/queries`.
- [ ] Keep `lib/mock-data.ts` as a **seed script**, not a runtime source. Add a `db/seed.ts` that inserts the mock rows so local/dev has data.
- [ ] Handle the empty-DB case: every list page needs a friendly empty state (the dashboard and trip-detail already have good ones — reuse that pattern).

**Done when:** posting a trip via `/post-trip` makes it appear on `/` and `/trips` without touching mock data.

**Test:** sign in → post a trip → land on dashboard → open `/` and `/trips`, confirm the new trip is listed → open it → attach a request from a second account → confirm it shows on the traveler's `/trips/[id]`.

---

## Day 2 — Seed data + verify migrations

**Goal:** a clean database can be populated in one command, and the schema is provably in sync.

- [ ] Run `npx drizzle-kit generate` and commit the `drizzle/` folder.
- [ ] Run `npx drizzle-kit push` against the dev database; note the outcome in the changelog.
- [ ] Finish `db/seed.ts` (from Day 1) and add an npm script `"seed": "tsx db/seed.ts"` (or node loader equivalent).
- [ ] Document required env vars in `docs/ENV.md` (see the ENV section below) and confirm `.env.local` exists locally (it is gitignored — never commit it).

**Done when:** `npm run seed` on an empty DB fills it with the six demo trips and they render on `/`.

**Test:** wipe local tables → `npm run seed` → `/` shows six trips.

---

## Day 3 — Complete the Clerk webhook (Priority 1)

**Goal:** Clerk is the source of truth for users; the DB never drifts.

- [ ] Add `updateUser()` and `deleteUser()` (soft delete preferred) to `db/queries.ts`.
- [ ] Handle `user.updated` in `app/api/webhooks/clerk/route.ts` (email, name, initials).
- [ ] Handle `user.deleted` (soft-delete: set a `deletedAt`, or hard-delete if no FK rows depend on it).
- [ ] Add `updatedAt` (and optional `deletedAt`) columns to `users` if you go the soft-delete route; regenerate migration.
- [ ] Keep returning 200 for unhandled event types so Clerk doesn't retry.

**Done when:** editing your name in Clerk updates the `users` row; deleting the Clerk user removes/soft-deletes it.

**Test:** in the Clerk dashboard, edit your profile → confirm the DB row changes → delete the test user → confirm the row is gone/flagged.

**Clerk dashboard setup (record in changelog once done):**
- Endpoint URL: `https://<your-domain>/api/webhooks/clerk`
- Events to subscribe: `user.created`, `user.updated`, `user.deleted`
- Copy the signing secret into `CLERK_WEBHOOK_SECRET`.

---

## Day 4 — API completeness + error handling (Priority 4)

**Goal:** every write is authed, every route returns the right status code.

- [ ] Add `GET /api/dashboard` returning `{ trips, requests }` for the authed user in one call (or explicitly document that the server component covers this and skip).
- [ ] Add pagination to `GET /api/trips` (`?limit`&`?offset`, default 20).
- [ ] Audit each route for the 400/401/403/404/500 matrix. `requests/[id]/status` is the gold standard — match it.
- [ ] Add a `POST /api/trips` input guard for dates (departure not in the past, return after departure).

**Done when:** hitting each route unauthenticated returns 401, bad input returns 400, and a not-found id returns 404 — not a blanket 500.

**Test:** curl each endpoint with (a) no auth, (b) garbage body, (c) a fake id, and confirm the status codes.

---

## Day 5 — Schema reconciliation decision

**Goal:** stop the schema drifting from the product intent, without breaking existing routes.

- [ ] Compare `db/schema.ts` against the prompt's Priority 3 spec (see AUDIT 1.2). Decide **keep-existing-names** (recommended, low risk) vs migrate.
- [ ] If keeping: add only the genuinely missing, useful columns — `updatedAt` on `trips`/`itemRequests`, an `itemDescription` on `itemRequests`. Regenerate migration.
- [ ] Make the `status` columns real Postgres enums (or a checked text) so bad values can't be written.
- [ ] Write the decision + rationale into `docs/DECISIONS.md`.

**Done when:** the schema has `updatedAt` everywhere and statuses are constrained; migration committed.

**Test:** try to insert an invalid status → DB rejects it.

---

## Day 6 — UI polish pass (see UI_GUIDELINES.md)

**Goal:** the app feels like one considered product, light and dark, on phone and desktop.

- [ ] Add a "Request this item" affordance on `TripCard` so buyers act from the grid, not just the detail page (fixes known-issue #3).
- [ ] Add a `matches` / "recent matches" strip to the homepage using real data (fall back to a tasteful placeholder if empty).
- [ ] Add trust signals to the homepage: escrow, verified travelers, money-back — as a compact three-up row.
- [ ] Dark mode: `globals.css` only defines light tokens. Add `prefers-color-scheme: dark` tokens and audit the hardcoded `bg-white` / `text-gray-900` usages.
- [ ] Loading + skeleton coverage: `/trips` has `loading.tsx` + `TripCardSkeleton`; add the same to `/dashboard` and `/trips/[id]`.

**Done when:** the UI checklist in `UI_GUIDELINES.md` passes.

**Test:** walk the full flow on a 375px viewport and in dark mode; nothing overflows, nothing is invisible.

---

## Day 7 — Notifications groundwork (Priority 6, later feature)

_Only after the above. The prompt says don't fully build Resend yet — do the groundwork so it's a small step later._

- [ ] Add an in-app signal first: a pending-requests count badge on the traveler's dashboard "My trips" tab (data already available).
- [ ] Add a `notifications` table to the schema (userId, type, payload, readAt, createdAt) for future use.
- [ ] Leave `lib/resend.ts` as a stub; note the trigger points (request created, request accepted/declined) in `docs/DECISIONS.md`.

**Done when:** a traveler can see, in-app, how many requests are waiting — without email.

**Test:** attach a request → traveler's dashboard shows a count without a page reload after refresh.

---

## Backlog (not scheduled)
- Stripe Connect escrow (explicitly deferred by the prompt)
- Resend transactional email (deferred)
- PostHog analytics (deferred)
- Real avatar images (currently initials only)
- Search/sort on `/trips` beyond the country filter

---

## Env vars needed (summary — full detail in `docs/ENV.md`)
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
# Database (Supabase Postgres connection string)
DATABASE_URL=
# Stubs (not needed until their feature is built)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
```
