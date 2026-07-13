# Arbi Daily Roadmap

_A day-by-day plan grounded in the real audit (`docs/AUDIT.md`), ordered so each day
ships one testable thing. Check off tasks as you go. Log every change in
`docs/CHANGELOG.md`._

**How to use this:** work top to bottom. Each day has a **Goal**, **Tasks**, a
**Manual test** (what to click and what should happen), and a **Definition of done**.
Don't start a day until the previous day's manual test passes.

---

## Day 0 — Get it running locally (blocker)

**Goal:** the app boots on your machine and connects to the real DB.

- [ ] `npm install`
- [ ] Create `.env.local` with all vars from `docs/AUDIT.md` §7 (real Clerk + Supabase `DATABASE_URL`).
- [ ] `npx drizzle-kit generate` then `npx drizzle-kit push` — confirm the 5 tables exist in Supabase.
- [ ] `npm run dev`, open `http://localhost:3000`, sign up. Confirm the Clerk webhook created your row in `users` (check Supabase table editor).
  - Local webhooks need a tunnel (ngrok / Clerk's dev instance). If a row doesn't appear, that's expected until Day 4.

**Manual test:** homepage loads, globe renders, you can sign in.
**Done when:** `npm run dev` runs clean and you have a Supabase project with the schema pushed.

---

## Day 1 — Unify data: home + browse read the real DB (top bug)

**Goal:** a trip you post shows up on `/` and `/trips`, not just your dashboard.

- [ ] In `db/queries.ts`, extend `getTrips()` to also return each trip's `requests`
      (or a request count) and coerce numeric/date fields, so the result matches
      what `TripCard` needs.
- [ ] Decide the seam: either (a) make `TripCard` tolerate the DB shape
      (`traveler` possibly null, `capacityKg` as string, `requests` maybe absent),
      or (b) add a mapper `dbTripToCardTrip()` in `db/queries.ts`. **Prefer (b)** —
      one place to reason about the shape.
- [ ] Swap `app/page.tsx` and `app/trips/page.tsx` imports from `@/lib/mock-data`
      to the DB query. Keep `getDestinationCountries()` working off real trips
      (derive distinct `toCountry` from DB rows).
- [ ] Guard the empty case: if the DB has zero trips, show the existing empty
      state instead of a blank grid.

**Watch out:** `TripCard` calls `trip.traveler.travelerRating.toFixed(1)` and
`trip.requests.length`. Real rows can have a null traveler and no `requests`
array — handle both or the page crashes. This is why it's not a one-line swap
(see AUDIT §2).

**Manual test:** post a trip via `/post-trip`; it appears on `/` featured grid and
`/trips`. Filter by its destination country — it shows under that filter only.
**Done when:** no page reads from `lib/mock-data` for trip *listings*. (Trip detail
fallback can stay for now.)

---

## Day 2 — Homepage polish: trust signals + recent matches

**Goal:** finish the homepage the build prompt asked for (P2).

- [ ] Add a **trust signals** row: Escrow payments · Verified travelers · Money-back
      guarantee. Three compact cards/badges, consistent with the `HowItWorks` card style.
- [ ] Add a **recent matches** section (real matches if any exist, else a tasteful
      placeholder like "Recently delivered" using seed data — clearly not fake user PII).
- [ ] Keep it above the "Open trips" grid; respect the max-width and spacing rhythm
      already used on the page.

**Manual test:** homepage now has hero → globe → how it works → trust signals →
recent matches → open trips, reading top to bottom without a visual jolt.
**Done when:** the sections match the existing card/spacing system (see `docs/UI_GUIDELINES.md`).

---

## Day 3 — Browse-page buyer CTA (prior issue #3)

**Goal:** a buyer on `/trips` understands they can attach a request without first
opening a trip.

- [ ] Add a short buyer-oriented sub-header or a per-card affordance that reads as
      "request an item on this trip" (the card already links to detail — make the
      intent explicit for shopping mode).
- [ ] Optionally, in shopping mode, surface a "Can't find your route? Post a request"
      path. Keep it subtle — don't clutter the grid.

**Manual test:** in shopping mode, `/trips` makes the "attach a request" action obvious.
**Done when:** a first-time buyer knows what to do on the browse page.

---

## Day 4 — Complete the Clerk webhook (G2)

**Goal:** profile edits and deletions in Clerk sync to Supabase.

- [ ] Add `user.updated` → update email/full name/initials on the existing row.
- [ ] Add `user.deleted` → soft-delete or remove the row (decide + document).
- [ ] Add the matching query helpers in `db/queries.ts` (`updateUser`, `deleteUser`).
- [ ] Confirm the exact webhook URL + subscribed events for the Clerk dashboard
      (`https://<domain>/api/webhooks/clerk`; events: `user.created`, `user.updated`,
      `user.deleted`).

**Manual test:** change your name in Clerk → row updates. Delete a test user → row
handled per your chosen policy.
**Done when:** all three events are handled and verified.

---

## Day 5 — Persist matches (G4) + reviews wiring (G6)

**Goal:** accepting a request can create a real match; groundwork for reviews.

- [ ] Replace the in-memory stub in `POST /api/matches` with a real insert into
      the `matches` table via a new `createMatch()` query.
- [ ] Decide the trigger: does accepting a request auto-create a match, or is it a
      separate action? Document the choice.
- [ ] Add read helpers for matches/reviews so the profile/dashboard can eventually
      show completed deals and ratings.

**Manual test:** accept a request → a `matches` row exists in Supabase.
**Done when:** `/api/matches` persists and is covered by the same auth/validation
pattern as the other routes.

---

## Day 6 — QA + UI consistency pass

**Goal:** everything looks like one product and nothing is broken.

- [ ] Walk every page in both modes, signed in and out. Note any mock/real seams left.
- [ ] Run the `docs/UI_GUIDELINES.md` checklist against each screen.
- [ ] `npm run build` + `npm run lint` clean. Fix type errors (no `any`).
- [ ] Loading + empty + error states exist for every data-driven view.

**Manual test:** full click-through, both modes, no console errors, no layout shift.
**Done when:** build is green and the QA checklist passes.

---

## Deferred (do NOT build yet — owner's instruction)
- Stripe / escrow payments
- Resend transactional email + the notification system (prior issue #6)
- PostHog analytics

---

## Priority order at a glance
1. **Day 1** — unify data (the actual bug users would hit first)
2. **Day 2** — homepage trust + matches (finishes P2)
3. **Day 4** — webhook completeness (data integrity)
4. **Day 3, 5, 6** — polish, persistence, QA

If you only have one session: do **Day 1**. It's the difference between a demo and
a working marketplace.
