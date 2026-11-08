# Arbi — Roadmap

_Last updated: 2026-11-08_

Consolidated from the daily plans written on the individual `claude/*`
branches (`ROADMAP.md`, `DAILY_TASKS.md`, `DAILY-PLAN.md`). Each block is meant
to be one reviewable change. Log finished work in `CHANGELOG.md`.

Legend: `[ ]` todo · `[x]` done

## Done

- [x] Codebase audit (`AUDIT.md`), UI guidelines, `.env.example`
- [x] One data source: every page reads Postgres via `db/queries.ts`; `lib/mock-data.ts` removed
- [x] Trip detail shows real buyer name / initials / rating on each request
- [x] `middleware.ts` → `proxy.ts` (Next 16 convention)
- [x] `next build` works without `DATABASE_URL` (lazy DB client; home and browse render per request)
- [x] Home page trust signals + recent matches (sample data, labelled)
- [x] Clerk webhook handles `user.created`, `user.updated`, `user.deleted`; idempotent user upsert
- [x] Signed-in users without a `users` row are created on demand (`ensureUserRecord`)
- [x] Shared payload validation for trips, requests, matches (`lib/validation.ts`)
- [x] Request guards: trip must exist and be open, not your own trip, one request per trip
- [x] Accepting a request is one-way and records a `matches` row
- [x] Emails no longer exposed by public endpoints or pages
- [x] Forms show the server's error message

## Next

### Dashboard depth
- [ ] Show pending-request count per trip on "My trips" (`getTripsForUserSummary` already returns `requestCount`)
- [ ] Show matches (accepted requests) for both sides, with the counterpart's name
- [ ] "Days until departure" on trip rows

### Real social proof
- [ ] Replace `RecentMatches` sample data with a query over `matches` ⨝ `item_requests` ⨝ `trips` once there is activity; hide the section when empty

### Browse
- [ ] "Request item" affordance directly on `TripCard`
- [ ] Pagination for `GET /api/trips` (`page` / `limit`, capped)
- [ ] Hide or de-emphasise trips whose departure date has passed

### Trip lifecycle
- [ ] Traveller can mark a trip `full` / `in_transit` / `completed`
- [ ] Buyer can withdraw a pending request
- [ ] Match status updates (`delivered`, `completed`) and ratings via the `reviews` table

### Quality
- [ ] Automated tests for `lib/validation.ts` and the API routes
- [ ] Loading, empty, and error states on every data view (`error.tsx` for DB outages)
- [ ] Accessibility pass (focus rings, labels, contrast) and a mobile pass on every route

## Backlog (needs an explicit go-ahead)

- Stripe Connect escrow (`lib/stripe.ts`)
- Resend transactional email + notifications (`lib/resend.ts`)
- PostHog analytics (`lib/posthog.ts`)
- Decide whether to delete `lib/supabase.ts` (unused) or keep it for Supabase Storage
- Claude-powered `ChatWidget` (currently canned replies)
