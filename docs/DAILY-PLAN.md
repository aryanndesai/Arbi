# Arbi — Daily Build Plan

_Last updated: 2026-07-15_

The original build spec assumed a near-empty scaffold. The audit
(`docs/AUDIT.md`) shows most of it is already built. This plan re-sequences the
**actual remaining work** into small daily units. Each day is scoped to be
finishable and testable in one sitting.

**Ground rules**
- One day = one focused, shippable change. Verify (`npx tsc --noEmit` + `npm run lint`, and manual test where a DB is available) before moving on.
- Never delete existing pages/components without a note in `CHANGELOG.md`.
- Log every change in `docs/CHANGELOG.md` the same day.
- UI work follows `docs/UI-PRINCIPLES.md`.

Legend: ✅ done · 🔜 NEXT · ⬜ todo

---

## Day 1 — Audit + docs + finish the Clerk webhook ✅
- ✅ Full codebase audit → `docs/AUDIT.md`.
- ✅ This plan + `UI-PRINCIPLES.md` + `CHANGELOG.md`.
- ✅ `.env.example` documenting every env var.
- ✅ Complete Priority 1: webhook now handles `user.updated` and `user.deleted` (FK-safe delete), plus `updateUser`/`deleteUser` query helpers.
- ✅ Verified: `tsc --noEmit` clean, `eslint` clean.

**Clerk dashboard setup (for the human):**
- Endpoint URL: `https://<your-domain>/api/webhooks/clerk`
- Subscribe to events: `user.created`, `user.updated`, `user.deleted`
- Copy the signing secret into `CLERK_WEBHOOK_SECRET`.

---

## Day 2 — Unify the data layer (read path) 🔜 NEXT
The single biggest inconsistency. Home, browse, and profile read mock data
while everything else reads the DB.
- ⬜ Make `db/index.ts` degrade gracefully instead of throwing at import (lazy client, or return `null` and let callers fall back).
- ⬜ Add a `USE_MOCK_DATA` toggle (env or a `lib/data-source.ts` shim) so `/`, `/trips`, `/profile/[id]` can flip to the DB without a rewrite.
- ⬜ Point `/trips` and `/` at `getTrips()` from `db/queries` behind that shim.
- ⬜ Keep mock as the seed/demo fallback when the DB is empty.
- **Test:** browse → click a trip → detail loads the same trip from the same source.

## Day 3 — Seed script + profile on real data ⬜
- ⬜ Write `db/seed.ts` that inserts the mock users/trips/requests into Postgres (idempotent).
- ⬜ Repoint `/profile/[id]` at `db/queries` (add `getUserById` usage already exists in queries).
- ⬜ Document `npm run seed` in the README.
- **Test:** after seeding, `/trips`, `/dashboard`, `/profile/[id]` all show the same records.

## Day 4 — Matches API + accept creates a match ⬜
- ⬜ Add `createMatch`/`getMatchesForUser` to `db/queries` and wire `/api/matches` to write to the DB.
- ⬜ On accept (PATCH status → accepted), create a `matches` row with the agreed price + fee.
- **Test:** accept a request → a match row exists → shows on both users' dashboards.

## Day 5 — Dashboard polish + pending-request counts ⬜
- ⬜ Show a per-trip pending-request count on the "My trips" tab (spec item, currently missing).
- ⬜ Add a match/deal summary to the dashboard.
- ⬜ Loading + empty states audited against `UI-PRINCIPLES.md`.

## Day 6 — Browse-page buyer CTA + filters ⬜
- ⬜ Add an explicit "Request an item on this trip" affordance on the browse cards (issue #3).
- ⬜ Add "from country" filter and date sort alongside the existing destination filter.
- **Test:** a buyer can go from `/trips` to a submitted request in the fewest clicks.

## Day 7 — Notifications (issue #6) ⬜
- ⬜ Install + wire Resend. On new request attached, email the traveler; on accept/decline, email the buyer.
- ⬜ Add an in-app unread indicator (simple `notifications` table or derived from request status changes).
- **Test:** attach a request → traveler receives an email.

## Backlog (unscheduled)
- Stripe Connect escrow (explicitly deferred by the spec).
- ChatWidget → real Claude API.
- `updated_at` columns + status pg-enums migration.
- Remove or finish the unused service stubs (`lib/supabase.ts` especially).

---

## Daily checklist (copy per day)
```
- [ ] Pulled latest, re-read AUDIT + this plan
- [ ] Scoped today to ONE change
- [ ] Built the change
- [ ] tsc --noEmit clean
- [ ] eslint clean
- [ ] Manually tested the flow (note what/how)
- [ ] Logged it in CHANGELOG.md
- [ ] Committed + pushed to the feature branch
```
