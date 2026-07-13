# Arbi Codebase Audit

_Last updated: 2026-07-13. Reflects the actual code on branch `claude/stoic-fermat-klwa27`, not assumptions._

## TL;DR

Arbi is **much further along than a first read of the build prompt suggests**. The
data layer, auth, webhook sync, dashboard, trip detail accept/decline flow, mode
toggle, and "how it works" section already exist and are wired to real Drizzle
queries. The remaining work is a short list of **real, specific gaps**, not a
ground-up build.

The single most important bug: **the homepage and browse page still read from
`lib/mock-data.ts`**, while everything a signed-in user does (post trip, request
item, dashboard, trip detail) reads/writes the **real database**. So a trip you
post never appears on the homepage or `/trips` — it only shows in your dashboard
and on its own detail page. Fixing that seam is Day 1.

---

## 1. Project structure

| Thing | Value |
|---|---|
| Framework | Next.js **16.2.4**, App Router |
| React | 19.2.4 |
| Package manager | **npm** (`package-lock.json` present) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| ORM | Drizzle ORM 0.45 over `postgres` (postgres-js driver) |
| Auth | Clerk (`@clerk/nextjs` 7.2.7) |
| Webhooks | `svix` 1.92 (Clerk signature verification) |
| 3D globe | `react-globe.gl` + `three` |
| Analytics | `@vercel/analytics` (wired in `layout.tsx`) |

### Routes that render pages (`app/`)
- `/` — home. Hero (mode-aware), globe, How-it-works, featured trips grid. **Reads mock data.**
- `/trips` — browse + destination filter. **Reads mock data.**
- `/trips/[id]` — trip detail. **Reads DB first, falls back to mock.** Owner sees accept/decline; others see "Request item".
- `/dashboard` — My Trips / My Requests tabs. **Reads DB.** Auth-gated.
- `/post-trip` — traveler posts a trip (client form → `POST /api/trips`).
- `/post-request/[tripId]` — buyer attaches a request (client form → `POST /api/requests`).
- `/profile/[id]` — public profile (not yet read in this audit; wired to `/api/user/[id]`).
- `/sign-in`, `/sign-up` — Clerk catch-all pages.

### API routes (`app/api/`)
- `GET /api/trips` — all trips + traveler join (DB). Public.
- `POST /api/trips` — create trip, Clerk-auth required. Validates payload.
- `GET /api/trips/[id]` — single trip + requests (DB). Public.
- `GET/POST /api/requests` — list my requests / create request. Auth required.
- `PATCH /api/requests/[id]/status` — accept/decline, **owner-only check enforced**.
- `GET /api/user/[id]` — user profile + stats (DB). Auth required.
- `POST /api/matches` — **STUB.** Returns an in-memory object, does not persist.
- `POST /api/webhooks/clerk` — svix-verified. **Handles `user.created` only.**

### Components (`components/`) — all imported and in use
`Navbar`, `HeroSection`, `HowItWorks`, `ModeToggle`, `TripCard`, `TripCardSkeleton`,
`MapWrapper` → `GlobeInner`, `ChatWidget` (in root layout). No orphans found.

### `lib/`
- `mock-data.ts` — seed users/trips/requests/matches + async getters. **Still the source for home + browse.**
- `use-mode.ts` — `useMode()` / `setMode()` via `useSyncExternalStore` + localStorage + custom event. Real, working.
- `country-style.ts` — flag + tint/border styling per country.
- `supabase.ts`, `stripe.ts`, `resend.ts`, `posthog.ts` — **stubs** (expected; later features).

### `db/`
- `schema.ts` — Drizzle schema: `users, trips, item_requests, matches, reviews`.
- `queries.ts` — typed query functions (trips, requests, users). No matches/reviews queries yet.
- `index.ts` — postgres-js client. **Throws at import if `DATABASE_URL` is unset.**

---

## 2. Database

- Drizzle is fully set up: `drizzle.config.ts` → `postgresql`, schema at `db/schema.ts`, out dir `./drizzle`.
- **No `drizzle/` migrations folder is committed** and `node_modules` is not installed here, so I could not confirm the schema was pushed to Supabase. Verifying `drizzle-kit push` ran is an explicit task.
- Schema uses `users.id` as **text** (Clerk IDs like `user_2abc`), not uuid — correct for Clerk sync.
- Column naming differs from the build prompt (`travelerId`/`fromCountry`/`capacityKg` vs `user_id`/`origin_country`/`available_weight_kg`). The existing names are fine and consistent; **do not rename** — just note the mapping.
- `matches` and `reviews` tables exist in schema but have **no query helpers** and no UI.

### Mock vs real — the seam
| Surface | Source |
|---|---|
| Home `/` featured trips | mock |
| Browse `/trips` | mock |
| Trip detail `/trips/[id]` | **DB, mock fallback** |
| Dashboard | **DB** |
| Post trip / request | **DB (write)** |

**Consequence:** real and mock data live in two worlds that never meet on the two
highest-traffic pages. This is the top fix.

### Data-shape mismatch (important)
`TripCard` expects the **mock `Trip` shape**: nested `traveler` object with
`avatarInitials`/`travelerRating`/`tripsCompleted`, numeric `capacityKg`, and a
`requests[]` array. But `getTrips()` in `db/queries.ts` returns `capacityKg` as a
**string**, `traveler` possibly **null**, and **no `requests` array at all**. So
you cannot just swap the import — `trip.requests.length` and
`trip.traveler.travelerRating.toFixed()` will throw on real rows. Day 1 needs an
**adapter/query change**, not a one-line import swap.

---

## 3. Authentication

- `ClerkProvider` wraps the app in `layout.tsx`. ✅
- `middleware.ts` protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and **non-GET** `/api/trips`. Public: `/`, `/trips`, `/trips/[id]` (GET). ✅ Matches the intended policy.
- Webhook at `app/api/webhooks/clerk/route.ts` verifies signatures with svix and inserts a `users` row on `user.created`. ✅
- **Gap:** `user.updated` and `user.deleted` are ignored (returns 200, no-op). Profile edits and deletions won't sync.
- `auth()` is used correctly in server components (`dashboard`, `trips/[id]`) and every write API route.

---

## 4. Core flows — end-to-end status

| Flow | Status | Notes |
|---|---|---|
| a) Traveler posts a trip | ✅ works | Form → `POST /api/trips` → DB → redirect to dashboard. |
| b) Buyer attaches a request | ✅ works | Form → `POST /api/requests` → DB, linked to trip + buyer. |
| c) Traveler accepts/declines | ✅ works | Owner sees `RequestActions`; PATCH enforces owner-only; optimistic UI + `router.refresh()`. |
| d) Dashboard shows my activity | ✅ works | Real DB queries, two tabs, empty states with CTAs. |
| e) Mode toggle | ✅ works | Persists to localStorage, hero + copy swap between traveller/shopping. |
| **Posted trip appears on home/browse** | ❌ **broken** | Home + browse read mock data; real trips never surface there. |

---

## 5. Third-party services

| Service | SDK installed | Wired up |
|---|---|---|
| Clerk | ✅ | ✅ provider, middleware, webhook (partial) |
| Supabase (Postgres via Drizzle) | ✅ (`postgres`, `drizzle-orm`) | ✅ for authed flows; `lib/supabase.ts` client is a stub (unused) |
| Stripe / escrow | ❌ | stub only — **do not build yet** |
| Resend (email) | ❌ | stub only — **do not build yet** |
| PostHog | ❌ | stub only. Vercel Analytics is the only live analytics. |

---

## 6. Prior-session issues — current state

1. Homepage doesn't explain the concept for buyers → **RESOLVED.** `HowItWorks` has traveller + buyer columns; mode-aware hero.
2. Mode toggle only changes a label → **RESOLVED.** Hero content + CTAs genuinely swap.
3. Browse has no CTA for buyers → **PARTIAL.** Trip cards link to detail where "Request item" lives; no request CTA on the browse list itself.
4. Trip detail shows no requests / no accept-decline → **RESOLVED.** Full requests list + owner accept/decline.
5. Dashboard uses mock data → **RESOLVED.** Real DB.
6. No notifications → **STILL OPEN.** Out of scope for now (Resend deferred).

### Net-new gaps found this audit
- G1. Home + browse still on mock data (+ `TripCard` shape mismatch blocks a naive swap). **Top priority.**
- G2. Webhook missing `user.updated` / `user.deleted`.
- G3. Homepage missing trust signals + "recent matches" section (prompt P2).
- G4. `POST /api/matches` is a non-persisting stub.
- G5. No committed Drizzle migrations; push-to-Supabase unverified.
- G6. `matches`/`reviews` tables have no queries or UI.

---

## 7. Environment variables needed

```
# Database (Supabase Postgres connection string — used by Drizzle/postgres-js)
DATABASE_URL=

# Supabase (only if lib/supabase.ts client is ever used client-side)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
```

No `.env.local` exists in the repo (correct — it's gitignored). These must be set
in Vercel and locally for the app to boot; `db/index.ts` throws without `DATABASE_URL`.
