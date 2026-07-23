# Arbi — Daily Build Plan

_A day-by-day breakdown of the remaining work, ordered so each day ends with
something testable. "Day" = one focused work session, not a calendar day —
move at your own pace and check the boxes as you go._

Grounded in `docs/AUDIT.md`. The headline: the marketplace is largely built.
The remaining work is **finishing the mock → real-database migration** and
**polishing the UI** (`docs/UI_GUIDELINES.md`). Log every change in
`docs/CHANGELOG.md` as you go.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Week 1 — Make the data real

### Day 1 — Environment + safety net
- [ ] Write `.env.local` from `docs/ENV.md` (Clerk keys, `DATABASE_URL`, `CLERK_WEBHOOK_SECRET`).
- [ ] Confirm `npm run dev` boots and the homepage renders.
- [ ] Run `drizzle-kit generate` then `drizzle-kit push` against the real database; confirm all five tables exist.
- [ ] Seed the database with a few rows (mirror `lib/mock-data.ts`) so real queries return something.
- **Test:** `/dashboard` loads without error while signed in; `GET /api/trips` returns JSON from the DB.

### Day 2 — Normalization layer (the keystone)
- [ ] Add a mapping helper (e.g. `db/serializers.ts`) that converts raw Drizzle rows into the `types/index.ts` shapes: strings → numbers for `capacity_kg`, `max_budget`, `courier_fee`, ratings; null traveler → a safe placeholder.
- [ ] Harden `TripCard` so it never assumes `traveler` is present or that ratings are numbers.
- **Why first:** every page below depends on this. Skipping it re-introduces the runtime crash flagged in the audit (issue #2).
- **Test:** feed a real DB trip (with a null traveler and string ratings) into `TripCard` in isolation — no crash.

### Day 3 — Homepage + browse on real data
- [ ] Swap `app/page.tsx` and `app/trips/page.tsx` from `lib/mock-data` to `db/queries` (through the Day 2 serializer).
- [ ] Keep the destination-filter list working from real distinct destinations.
- [ ] Empty states already exist — verify they show when the DB is empty.
- **Test:** post a trip via `/post-trip`; it now appears on both `/` and `/trips`.

### Day 4 — Close the post-request loop
- [ ] Move the trip lookup in `app/post-request/[tripId]/page.tsx` to `getTripById` (real DB).
- [ ] Verify the "Request item" button on a real trip detail page reaches a working request form (no more 404 on real UUIDs).
- [ ] After submitting, confirm the request shows on the trip owner's `/trips/[id]` and in the buyer's dashboard.
- **Test:** full round trip — buyer requests, traveler sees it, accepts, buyer sees "Accepted".

### Day 5 — Profile page + wire up the unused API
- [ ] Point `app/profile/[id]/page.tsx` at `db/queries` (or consume the existing `GET /api/user/[id]`).
- [ ] Show real trips/requests and real stats.
- **Test:** click a traveler's name on a trip → their profile shows their real trips.

---

## Week 2 — Fill the gaps + polish

### Day 6 — Dashboard depth
- [ ] Add per-trip **pending request count** on the My Trips tab (Priority 5 in the original spec).
- [ ] Make sure request statuses render correctly from real data.
- **Test:** a trip with 2 pending requests shows "2 pending".

### Day 7 — Webhook completeness
- [ ] Handle `user.updated` (update the row) and `user.deleted` (soft-delete or remove) in `app/api/webhooks/clerk/route.ts`.
- [ ] Add an `updated_at` column to `users` if you want update tracking.
- **Test:** change your name in Clerk → the `users` row updates.

### Day 8 — Mode toggle reaches the whole site
- [ ] Decide what "Shopping" vs "Travelling" changes beyond the hero (nav order, default CTA, which empty-state copy shows).
- [ ] Apply consistently on `/trips` and `/dashboard`.
- **Test:** switch to Shopping mode → buyer-focused language persists across pages and reloads.

### Day 9 — UI polish pass (see `docs/UI_GUIDELINES.md`)
- [ ] Audit spacing, focus states, and mobile layout against the checklist.
- [ ] Replace `<style>` blocks (e.g. in `PostRequestForm`) with the shared `arbi-input` class for consistency.
- [ ] Verify keyboard navigation and visible focus rings on every interactive element.
- **Test:** tab through every page; run the mobile-width check at 375px.

### Day 10 — Reliability + housekeeping
- [ ] Consider self-hosting the globe textures (or lazy-loading below the fold) to remove the unpkg dependency.
- [ ] Remove or clearly mark dead code (`/api/matches` stub, unused matches/reviews) so it does not mislead.
- [ ] Final `tsc --noEmit` + `eslint` + `next build` in CI.
- **Test:** clean build, no console errors on any route.

---

## Explicitly out of scope (per the original brief — do NOT start these yet)
- Stripe / escrow payments.
- Resend / email notifications.
- PostHog / analytics.
- Real Claude API for the chat widget (currently a hardcoded reply).
- Deploying (handled separately via Vercel).

---

## Definition of done for the migration
1. No page imports from `lib/mock-data.ts`. (`grep -r "mock-data" app components` returns nothing.)
2. A trip created through the UI is visible everywhere a trip should appear.
3. `tsc`, `eslint`, and `next build` all pass.
4. Every interactive element is keyboard-reachable with a visible focus state.
