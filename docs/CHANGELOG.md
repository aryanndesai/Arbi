# Arbi — Changelog

Dated entries, most recent first.

---

## 2026-11-08 — Integrate all branches and fix the remaining issues

### Integrated
- **`claude/lucid-babbage-je4n2i`** (merged): home, browse, profile, and post-request pages read
  Postgres instead of `lib/mock-data.ts`, so trips posted through the UI actually appear and can
  receive requests. Added `TripSummary`, `getTripSummaries`, `getTripsForUserSummary`,
  `getDestinationCountries`; buyer details on trip detail; `middleware.ts` → `proxy.ts`.
- **`claude/cool-carson-teamly`** (merged): lazy Drizzle client, so importing `db` no longer throws
  when `DATABASE_URL` is missing; `TrustSignals` and `RecentMatches` home sections.
- **`claude/stoic-fermat-ht5vwe`** (merged): Clerk webhook syncs `user.updated` and `user.deleted`;
  `.env.example`.
- **`copilot/analyse-code-for-improvements`** (ported): its validation rules, adapted to UUID ids
  and Clerk auth, now live in `lib/validation.ts`. Its spoofable `x-user-id` header auth was left out.
- Documentation from the 10 docs-only branches consolidated into `docs/`.

### Fixed
- **Build failure**: `next build` crashed without `DATABASE_URL` (DB client created at import time),
  and the home page was statically prerendered, which would have frozen the trip list at build time.
  Home and browse now render per request (`connection()` / awaited `searchParams`).
- **Trip flags**: `POST /api/trips` never saved `fromFlag` / `toFlag`, so every posted trip showed 🌍.
  Flags are now derived server-side.
- **Users missing from the DB**: posting failed with a foreign-key error whenever the Clerk webhook
  hadn't created the user row. `ensureUserRecord` now creates it from the Clerk session.
- **Webhook retries**: a retried `user.created` hit a duplicate-key error and returned 500, so Clerk
  retried indefinitely. `createUser` is now an upsert.
- **Request rules**: the API accepted requests on non-existent trips (500), on your own trip, on
  closed trips, and duplicates. All are now rejected with a clear 4xx; the post-request page redirects
  in the same cases.
- **Accept/decline**: a resolved request could be flipped again. It's now one-way, and accepting
  creates a `matches` row.
- **`/api/matches`** returned a fake in-memory object; it now validates, checks ownership, and persists.
- **Email exposure**: `GET /api/trips`, `GET /api/trips/[id]`, and `GET /api/user/[id]` returned users'
  email addresses. Public reads now use `getPublicUserById`, which never selects the email column.
- **Malformed ids** (e.g. `/trips/t_1`) caused a Postgres error; they now 404.
- **Trip detail** no longer falls back to mock data on DB errors (which hid outages and showed fake trips).
- **Forms** show the API's error message instead of a generic "Failed to …".
- **Ordering**: trip lists sort by departure date; requests by creation time.
- Removed dead code: `lib/mock-data.ts`, unused `getTrips`/`updateUser` queries, and the old
  mock-shaped interfaces in `types/index.ts`.

### Verified
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` (with no `DATABASE_URL`) all pass.
- Against a local Postgres with seeded data: home, browse, filter, trip detail, profile, and
  post-request render real rows; malformed ids 404; protected API routes return 401 when signed out;
  no email in public API responses.
- A script against the same database exercised validation, idempotent user upsert, duplicate-request
  detection, one-way accept + match creation, ordering, and request counts.
- Not verified: signed-in flows through a browser (needs real Clerk keys).
