# Arbi Build Roadmap — Daily Tasks

_Last updated: 2026-07-16._

This breaks the work from `docs/AUDIT.md` into small daily chunks. Each day is scoped to be
finishable in one sitting, ends in something you can test, and has an explicit "done when".

**Ground rules (from the project brief):**
- Match existing code style (Tailwind, current import patterns). Proper TypeScript, no `any`.
- Error handling on every API route with correct status codes.
- Do not set up Stripe / Resend / PostHog yet. Do not deploy from here.
- After each day, run the test steps before moving on.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done. Keep this file updated as you go and mirror
notable changes into `docs/CHANGELOG.md`.

---

## Day 1 — Make it run locally
Goal: go from "cannot boot" to "dev server up, DB connected".

- [ ] Create `.env.local` from `docs/ENV.md` with real Clerk keys and `DATABASE_URL`.
- [ ] `npm install`.
- [ ] `npx drizzle-kit generate` then `npx drizzle-kit push` to create the tables in Supabase.
- [ ] `npm run dev` and open `http://localhost:3000`.
- [ ] `npm run build` to confirm a clean production build.

**Done when:** homepage renders, no build errors, tables exist in Supabase.
**Test:** load `/`, `/trips`, `/dashboard` (signed in). Note which pages still show mock data.

---

## Day 2 — Data mapping layer (the unblock for everything else)
Goal: one place that turns DB rows into the UI-facing `Trip`/`User`/`ItemRequest` shapes.

- [ ] Decide the boundary: DB returns flat rows with string decimals and nullable traveler;
      the UI `types/index.ts` interfaces are nested with numeric fields. Write mappers
      (`toTripView`, `toUserView`, `toRequestView`) in `db/queries.ts` or a new `db/adapters.ts`.
- [ ] Extend `getTrips()` so each trip carries its request count (needed by `TripCard`).
- [ ] Add `getDestinationCountries()` backed by the DB (distinct `to_country`).
- [ ] Unit-check the mappers against a couple of rows in a scratch script.

**Done when:** a function returns real trips in the exact shape `TripCard` expects.
**Test:** log the mapped output; confirm ratings are numbers and `requests.length` is correct.

---

## Day 3 — Swap homepage and browse to real data
Goal: `/` and `/trips` read from Postgres, not mock.

- [ ] `app/page.tsx`: replace `getTrips`/`getDestinationCountries` from `lib/mock-data` with the
      real DB versions from Day 2.
- [ ] `app/trips/page.tsx`: same swap; keep the destination filter working.
- [ ] Handle the empty-DB case gracefully (the existing empty states already exist).
- [ ] Keep `lib/mock-data.ts` for now but stop importing it in these two files.

**Done when:** a trip posted via `/post-trip` shows up on `/` and `/trips` after refresh.
**Test:** post a trip, browse to `/trips`, filter by its destination, open it.

---

## Day 4 — Swap profile and post-request context to real data
Goal: no page imports `lib/mock-data` except as an optional dev seed.

- [ ] `app/profile/[id]/page.tsx`: use `getUserById` + `getTripsForUser` + `getRequestsForUser`
      from `db/queries`.
- [ ] `app/post-request/[tripId]/page.tsx`: load the trip via DB so the form header shows the
      real destination/traveler.
- [ ] `app/trips/[id]/page.tsx`: keep DB-first, but confirm the mock fallback only triggers on a
      genuine miss. Decide whether to drop the fallback once the DB is seeded.
- [ ] Grep to confirm: `grep -rl lib/mock-data app` returns only intended files (ideally none).

**Done when:** every user-facing page reflects real DB state.
**Test:** attach a request to a real trip, then view it in the trip owner's view and dashboard.

---

## Day 5 — Finish the Clerk webhook
Goal: user lifecycle stays in sync.

- [ ] Add `user.updated` handling: update email, fullName, initials on the existing row.
- [ ] Add `user.deleted` handling: soft-delete (add a `deleted_at` column) or hard delete.
      Prefer soft delete so trips/requests keep a valid FK; add the column to the schema and
      regenerate.
- [ ] Add an upsert path so `user.created` is idempotent (Clerk retries webhooks).
- [ ] Keep returning 200 for event types you intentionally ignore.

**Done when:** editing a Clerk profile updates the DB row; deleting handles cleanly.
**Test:** trigger events from the Clerk dashboard or a signed replay; check the `users` table.

---

## Day 6 — Persist matches + optional dashboard route
Goal: remove the last fake data path.

- [ ] `app/api/matches/route.ts`: insert into the `matches` table via a new `createMatch` query
      instead of returning an in-memory object. Return the persisted row.
- [ ] Consider auto-creating a match when a request is accepted (in the PATCH status route), so
      "accepted" and "matched" don't drift.
- [ ] Optional: add `GET /api/dashboard` returning `{ trips, requests }` for the current user, and
      point the dashboard page at it (or keep the direct server-component queries).

**Done when:** accepting a request produces a real `matches` row.
**Test:** accept a request, query `matches`, confirm the FK links to request + trip.

---

## Day 7 — Seed script + data hygiene
Goal: a realistic demo without mock imports in app code.

- [ ] Write `db/seed.ts` that inserts the demo users/trips/requests (reuse the mock content) into
      the real DB. Guard it so it only runs against a dev database.
- [ ] Add an npm script `db:seed`.
- [ ] Move `lib/mock-data.ts` to a clearly-labeled dev-only role, or delete it once the seed
      covers the same ground (confirm with the owner before deleting — the brief forbids silent
      deletion).

**Done when:** a fresh dev DB can be populated with one command.
**Test:** wipe, push schema, seed, browse the app.

---

## Day 8 — Mode-awareness beyond the homepage
Goal: the Travelling/Shopping toggle actually reshapes the experience (open item #2).

- [ ] Make `/trips` copy and primary CTA respond to mode (browse-to-buy vs. see-who-needs-carrying).
- [ ] Consider a mode-aware default landing emphasis in the Navbar.
- [ ] Keep it subtle; don't hide functionality, just re-order emphasis.

**Done when:** switching mode visibly changes intent on more than just the hero.
**Test:** toggle mode, navigate `/` -> `/trips`, confirm copy/CTA follow.

---

## Day 9 — UI polish pass 1 (see docs/UI-GUIDELINES.md)
Goal: tighten the highest-traffic screens.

- [ ] Homepage: verify hierarchy (one clear primary action per mode), spacing rhythm, and that
      the globe does not push content below the fold on laptop.
- [ ] Trip cards: consistent height, truncation, and the request-count badge legibility.
- [ ] Loading + empty + error states audited on `/`, `/trips`, `/trips/[id]`, `/dashboard`.

**Done when:** the three core screens feel consistent and intentional.
**Test:** click through at 375px, 768px, 1280px widths.

---

## Day 10 — UI polish pass 2 + accessibility
Goal: forms and feedback.

- [ ] `/post-trip` and `/post-request`: labels tied to inputs, visible focus rings, inline
      validation messages, disabled/submitting states (mostly present — verify).
- [ ] Color contrast on status badges and muted grays meets WCAG AA.
- [ ] Keyboard: tab order, mode toggle as a real tablist (it already uses roles), modal focus trap
      for Clerk buttons.
- [ ] `prefers-reduced-motion`: gate the fade/slide/shimmer animations.

**Done when:** every interactive element is reachable and legible by keyboard and screen reader.
**Test:** navigate the whole app with keyboard only; run an automated a11y check.

---

## Day 11 — Quality gate
Goal: stop regressions.

- [ ] Add a CI workflow (or a local `check` script) running `lint`, `tsc --noEmit`, and `build`.
- [ ] Add smoke coverage for the four core flows (even lightweight route/handler tests).
- [ ] Document env + setup in the README.

**Done when:** one command verifies the app is healthy.
**Test:** break something on purpose and confirm the gate catches it.

---

## Day 12 — Notifications groundwork (open item #6, no external send yet)
Goal: prepare without wiring Resend.

- [ ] Add a `notifications` concept: when a request is attached or its status changes, record an
      event (a table or a log) so a future Resend/PostHog integration has something to send.
- [ ] Surface an in-app indicator (e.g. pending-request count) on the dashboard/nav.
- [ ] Leave the actual email send behind the existing `lib/resend.ts` stub until the owner says go.

**Done when:** the traveler can see "you have N new requests" in-app.
**Test:** attach a request as buyer, confirm the count appears for the traveler.

---

## Backlog (unscheduled)
- Payments/escrow via Stripe Connect (explicitly later).
- Reviews UI (schema exists, no UI).
- Search/sort/pagination on `/trips` as volume grows.
- Image uploads for item requests (`item_image_url` exists, unused).
