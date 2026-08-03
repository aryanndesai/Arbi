# Arbi — Change Log

Dated entries, most recent first. This is the running record `DAILY_TASKS.md` refers back to — log here before moving to the next day's block.

---

## 2026-08-03 — Day 0: Audit + mock-data/DB split-brain fix

**Audit**: full read-through of the codebase, written up in `docs/AUDIT.md`. Headline finding: several "known issues" listed in the original build brief (dashboard on mock data, mode toggle being cosmetic-only, trip detail missing accept/decline) had already been fixed in earlier sessions and no longer apply. The actual highest-impact bug was different: several pages read from `lib/mock-data.ts` while the write path (posting a trip, submitting a request) went to the real Postgres database — so anything created through the real UI was invisible to buyers and broke the request flow.

**Fixed**:
- `app/page.tsx`, `app/trips/page.tsx`, `app/profile/[id]/page.tsx`, `app/post-request/[tripId]/page.tsx` — switched from `lib/mock-data.ts` to real Drizzle queries (`db/queries.ts`). Previously, requesting an item on a trip created through `/post-trip` would 404 on `/post-request/[tripId]` because that page only recognized mock trip IDs.
- `db/queries.ts` — added `getTripSummaries()` (real trip list with per-trip request counts, replacing the mock `getTrips()`/`getTripById()` combo used for list views), `getTripsForUserSummary()`, and `getDestinationCountries()`. Updated `getTripById()` to join buyer info (`users`) onto each attached request — previously the trip-detail page's real-DB code path left buyer name/initials/rating blank for every request, only the mock fallback path populated them.
- `types/index.ts` — added `TripSummary`, a lighter type for list views (trip + traveler summary + a request count) instead of requiring the full nested request array `Trip` needs.
- `components/TripCard.tsx` — updated to the `TripSummary` type; the "N requests" badge now reads a `requestCount` field instead of `requests.length`.
- `app/trips/[id]/page.tsx` — DB code path now carries buyer name/initials/rating and traveler rating/trips-completed through to the page, matching what the mock fallback path already did.
- `middleware.ts` → `proxy.ts` — Next.js 16 renamed this file convention (same behavior, confirmed via the bundled docs in `node_modules/next/dist/docs/`). Mechanical rename, no logic change.
- `.gitignore` — Next/Clerk dev tooling added a `.clerk/` ignore entry automatically while testing locally; kept it since local Clerk dev keys shouldn't be committed.

**Verified**:
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- Spun up a throwaway local Postgres, pushed the Drizzle schema, seeded a real trip + request, and confirmed via `curl` against a running dev server that: the homepage lists the seeded trip, `/trips` lists it, `/trips/[id]` shows the buyer's name/item, and `/post-request/[tripId]` loads (no more 404) for that real trip ID.
- Full `next build` succeeds end to end against a real database connection.
- Local Postgres instance and `.env.local` were only used for this verification and are not part of the commit (`.env.local` is gitignored).

**Not touched** (explicitly out of scope for today, see `DAILY_TASKS.md`):
- Clerk webhook still only handles `user.created` (Day 1).
- Stripe/Resend/PostHog remain stub-only, as instructed.
- `lib/mock-data.ts` left in place, unused, pending your confirmation to delete.
