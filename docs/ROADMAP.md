# Arbi — Daily Build Roadmap

_Last updated: 2026-07-21_

This turns the full build prompt into small, testable daily chunks. Each day is
scoped to roughly one focused session and ends with something you can click and
verify. Do them in order — later days depend on earlier ones.

**Ground rules** (carried from the build prompt):

- Match existing style (Tailwind, flat API routes, Drizzle queries in `db/queries.ts`).
- No `any`. Define interfaces for every API response.
- Every write route checks Clerk auth; every route has try/catch with correct
  status codes (400/401/403/404/500).
- Don't wire Stripe / Resend / PostHog yet. Don't add pages beyond those listed.
- After each day: run the app, do the manual test listed, tick the boxes, and add
  a line to [`CHANGELOG.md`](./CHANGELOG.md).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Day 0 — Environment & safety net _(prereq, ~30 min)_

- [ ] Copy `.env.example` → `.env.local`, fill `DATABASE_URL` + Clerk keys.
- [ ] `npm install`, then `npm run dev` and confirm the app boots.
- [ ] `npx drizzle-kit push` to sync the current schema to the database.
- [ ] Seed one real user by signing up (fires the Clerk webhook → `users` row).

**Test:** app loads at `/`, you can sign up, and a row appears in `users`.

---

## Day 1 — Unify the data layer, part 1: the type contract

_Fixes audit bug #2 (shape mismatch) before anything reads real data._

- [ ] Decide the canonical shape. Recommended: a `TripWithTraveler` /
      `RequestWithBuyer` view type in `types/` that matches what the DB can
      cheaply return (flat trip + a small joined `traveler`, money as `number`
      after coercion).
- [ ] Add mappers in `db/queries.ts` that coerce Drizzle rows (string decimals →
      numbers) into those view types.
- [ ] Update `TripCard` to accept the new type and tolerate optional
      `travelerRating` / `tripsCompleted` (don't call `.toFixed` on `undefined`).

**Test:** `TripCard` renders from a real trip object without runtime errors
(temporarily pass one real trip to it).

---

## Day 2 — Unify the data layer, part 2: swap the pages

_Fixes audit bugs #1 and #3 — the biggest UX win._

- [ ] Extend `getTrips` to join enough traveler fields for the card (rating, trips count).
- [ ] Extend `getTripById` to **join the buyer** onto each request (name + initials).
- [ ] Point `/` and `/trips` at `db/queries` instead of `lib/mock-data`.
- [ ] Keep `lib/mock-data` only as an explicit dev seed (or move it behind a flag).

**Test:** post a trip via `/post-trip` → it now shows on `/trips` and `/`. Open it,
attach a request from a second account → the traveler sees the buyer's real name.

---

## Day 3 — Homepage polish: trust signals + recent matches

_Completes Priority 2 from the prompt._

- [ ] Add a 3-item trust row under `HowItWorks`: **Escrow payments**,
      **Verified travelers**, **Money-back guarantee** (icon + one line each).
- [ ] Add a "Recent matches" strip (real matches if any exist, else a clearly
      labelled sample). Reuse card styling.
- [ ] Confirm the mode toggle still swaps hero copy correctly.

**Test:** homepage shows trust signals + recent matches; toggle flips hero language.

---

## Day 4 — Make mode actually change what you see

_Finishes audit issue #2._

- [ ] On `/trips`, use `useMode()` to reorder/emphasise: shopping mode leads with
      "browse trips + request", travelling mode nudges toward `/post-trip`.
- [ ] Give the browse `TripCard` a mode-aware CTA (shopping: "Request item" deep
      link; travelling: "View"). _Fixes audit issue #3._
- [ ] Persist mode is already global via `localStorage` — verify cross-page.

**Test:** switch to Shopping on `/`, navigate to `/trips`, and the CTAs/emphasis
reflect shopping. Switch back and re-check.

---

## Day 5 — Dashboard depth

_Completes Priority 5._

- [ ] Add a **pending-request count badge** per trip in "My trips".
- [ ] (Optional) introduce `GET /api/dashboard` returning `{ trips, requests }` in
      one typed payload, and have the page consume it — or keep inline queries and
      document the choice.
- [ ] Verify empty states + CTAs for both tabs.

**Test:** a trip with 2 pending requests shows "2 pending"; empty account shows
the post-a-trip / browse CTAs.

---

## Day 6 — Requests API surface & matches

_Cleans up Priority 4 gaps + audit bug #4._

- [ ] Decide: keep `PATCH /api/requests/[id]/status` (current) or move to
      `PATCH /api/requests/[id]` per the prompt. Pick one and make it consistent.
- [ ] Implement `/api/matches` for real: on accept, create a `matches` row linking
      request + trip (+ traveler/buyer). Remove the fabricated object.
- [ ] Add typed response interfaces for every request/match route.

**Test:** accepting a request creates a `matches` row; declining does not.

---

## Day 7 — Webhook completeness & profiles

_Finishes Priority 1 + audit bugs #5 and profile-on-mock._

- [ ] Handle `user.updated` (update row) and `user.deleted` (soft-delete or remove).
- [ ] Point `/profile/[id]` at real `getUserById` + real trips/requests.
- [ ] Re-print the Clerk dashboard webhook URL + the exact events to subscribe to
      (`user.created`, `user.updated`, `user.deleted`) in the CHANGELOG.

**Test:** edit your Clerk profile → the `users` row updates. Visit `/profile/<your-id>`
→ real data.

---

## Day 8 — UI pass & accessibility

_See [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) for the standard._

- [ ] Audit every interactive element for a visible focus ring and `aria-label`.
- [ ] Normalise the input styling (the `/post-request` form uses an inline
      `<style>` `.input`; `/post-trip` uses `.arbi-input` — unify them).
- [ ] Check colour contrast on gray-on-gray text (badges, captions).
- [ ] Loading + error states on every fetch (skeletons already exist — use them
      on `/trips`).
- [ ] Mobile pass at 375px: nav, forms, cards, globe.

**Test:** keyboard-only navigation works end-to-end; Lighthouse a11y ≥ 95.

---

## Later (explicitly deferred by the prompt)

- Stripe / Stripe Connect escrow
- Resend transactional email
- PostHog analytics
- Notifications (in-app + email) when a request is attached

---

## Quick status board

| Day | Theme | Status |
| --- | --- | --- |
| 0 | Env & safety net | [ ] |
| 1 | Type contract | [ ] |
| 2 | Swap pages to real data | [ ] |
| 3 | Homepage trust + matches | [ ] |
| 4 | Mode-aware pages | [ ] |
| 5 | Dashboard depth | [ ] |
| 6 | Requests/matches API | [ ] |
| 7 | Webhook + profiles | [ ] |
| 8 | UI & a11y pass | [ ] |
