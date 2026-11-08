<<<<<<< HEAD
# Arbi — Codebase Audit

Last updated: 2026-08-03
Scope: full read-through of every file in the repo (no mock/placeholder assumed without checking).

This audit follows the same checklist structure as the original build brief so it's easy to compare against what was asked for. Read this before picking up any task in `DAILY_TASKS.md`.

## 1.1 Project structure

- **Framework**: Next.js 16.2.4, App Router, Turbopack. React 19.2.4. TypeScript 5. Tailwind CSS v4.
- **Package manager**: npm (`package-lock.json` is the lockfile in use).
- **Important version note**: this Next.js version has already deprecated the `middleware.ts` file convention in favor of `proxy.ts` (same behavior, new name/location). The repo was still on `middleware.ts` — migrated today, see CHANGELOG.

### Folders
- `app/` — routes (see below) + `layout.tsx` + `globals.css`.
- `app/api/` — route handlers (see 1.1 API list).
- `components/` — shared UI components.
- `db/` — Drizzle schema, client, and query functions. This is the real data layer.
- `lib/` — small utility modules, mixed real (`use-mode.ts`, `country-style.ts`) and stubbed (`stripe.ts`, `resend.ts`, `posthog.ts`, `supabase.ts`) third-party wrappers, plus `mock-data.ts`.
- `types/` — shared TypeScript interfaces used across pages and components.
- `public/` — static assets (default Next.js icons, unused beyond favicon).

### Page routes (`app/`)
| Route | Renders |
|---|---|
| `/` | Homepage — hero (mode-aware), globe, "How it works", open trips grid |
| `/trips` | Browse trips, filterable by destination country |
| `/trips/[id]` | Trip detail — stats, traveler card, attached requests, accept/decline (owner) or request CTA (non-owner) |
| `/trips/loading.tsx` | Skeleton loading state for `/trips` (uses `TripCardSkeleton`) |
| `/post-trip` | Traveler's "post a trip" form |
| `/post-request/[tripId]` | Buyer's "request an item" form, scoped to one trip |
| `/dashboard` | Signed-in user's own trips + requests, tabbed |
| `/profile/[id]` | Public profile — ratings, recent trips, recent requests |
| `/sign-in`, `/sign-up` | Clerk catch-all auth pages |

No page-level `loading.tsx`/`error.tsx` exists for `/`, `/dashboard`, `/trips/[id]`, or `/profile/[id]` — only `/trips` has one. Minor UX gap noted in `UI_GUIDELINES.md`.

### API routes (`app/api/`)
| Route | Method | Does |
|---|---|---|
| `/api/trips` | GET | Public — list all trips (now returns the same `TripSummary` shape used by the UI) |
| `/api/trips` | POST | Auth required — create a trip for the signed-in user |
| `/api/trips/[id]` | GET | Public — fetch one trip with its requests + traveler |
| `/api/requests` | GET | Auth required — the signed-in user's own requests |
| `/api/requests` | POST | Auth required — create a request on a trip |
| `/api/requests/[id]/status` | PATCH | Auth required, trip-owner-only — accept/decline a request |
| `/api/matches` | POST | Auth required — creates an in-memory match object; **does not persist to the DB** (no `matches` table write despite the schema having one) |
| `/api/user/[id]` | GET | Auth required — a user's public stats |
| `/api/webhooks/clerk` | POST | Verifies Clerk webhook via svix; only handles `user.created` |

### Components (`components/`) — all imported and in active use
`Navbar`, `ModeToggle`, `HeroSection`, `HowItWorks`, `TripCard`, `TripCardSkeleton` (via `trips/loading.tsx`), `ChatWidget` (mounted globally in `layout.tsx`), `MapWrapper` → `GlobeInner` (dynamic import, no SSR), `RequestActions` (client component inside `trips/[id]/page.tsx`), `PostRequestForm` (client component inside `post-request/[tripId]/page.tsx`).

No orphan components — everything in `components/` is imported from somewhere.

### `lib/` and `types/`
- `lib/use-mode.ts` — real, working localStorage-backed mode state (`useSyncExternalStore`).
- `lib/country-style.ts` — real, a lookup table of flag/tint/border per country, with a sane fallback.
- `lib/mock-data.ts` — **as of today, fully orphaned**. Nothing imports it anymore (see 1.2). Kept in place pending your confirmation to delete (per your no-unilateral-delete instruction).
- `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` — stub files only (a config object + a function that throws if the env var is missing). Not called from anywhere else in the app. This matches the brief's "don't build these yet" instruction, so leaving them as placeholders is correct for now.
- `lib/supabase.ts` — also stub-only, **and also uncalled from anywhere**. Notably, this is a different situation from the three above: the app doesn't actually need a Supabase JS client, because `db/index.ts` talks to Postgres directly through Drizzle (see 1.2). This file is dead scaffolding, not a "not yet built" feature — worth a decision (see `DAILY_TASKS.md` Day 5).
- `types/index.ts` — `User`, `Trip`, `ItemRequest`, `Match`, plus a new `TripSummary` (added today) for list views.

## 1.2 Database

- **Supabase JS client**: not actually wired in. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are only referenced inside the unused `lib/supabase.ts` stub.
- **Real data layer**: Drizzle ORM over a raw Postgres connection (`postgres` package) via `DATABASE_URL`, in `db/index.ts`. If your Postgres instance happens to be hosted on Supabase's infrastructure, that's fine — it's just Postgres — but there's no `supabase-js` client anywhere in the request path.
- **Drizzle schema** (`db/schema.ts`) — 5 tables, richer than the minimum the brief asked for:
  - `users` — id (Clerk id, text PK), email, full_name, avatar_initials, traveler_rating, buyer_rating, trips_completed, requests_completed, created_at.
  - `trips` — id (uuid), traveler_id → users, from/to_country, from/to_flag, departure_date, return_date, capacity_kg, status, created_at.
  - `item_requests` — id (uuid), trip_id → trips, buyer_id → users, item_name, item_url, item_image_url, max_budget, courier_fee, status, created_at.
  - `matches` — id (uuid), request_id → item_requests, trip_id → trips, status, agreed_price, courier_fee, created_at. **Not written to by any code path** — `/api/matches` builds a plain object and returns it without an insert.
  - `reviews` — id (uuid), match_id → matches, rater_id / ratee_id → users, rating, comment, created_at. No UI or API touches this table yet.
- **`lib/mock-data.ts`** — hardcoded users/trips/requests/matches, previously imported by four pages (see below). As of today, no longer imported anywhere.
- **Pages/components: real DB vs. mock, before vs. after today's fix**:

  | Page | Before | After |
  |---|---|---|
  | `/` (home) | mock only | real DB (`db/queries.getTripSummaries` + `getDestinationCountries`) |
  | `/trips` (browse) | mock only | real DB |
  | `/trips/[id]` | DB with silent mock fallback on error; DB path was missing buyer names/traveler rating | DB path now joins buyer info and traveler rating; mock fallback kept only as a dev/demo safety net |
  | `/post-request/[tripId]` | mock only — **404'd for any trip actually created through the real UI** | real DB |
  | `/profile/[id]` | mock only | real DB |
  | `/dashboard` | already real DB | unchanged |
  | API routes (`/api/trips`, `/api/requests`, etc.) | already real DB | unchanged |

## 1.3 Authentication

- Clerk is installed (`@clerk/nextjs`), `ClerkProvider` wraps the app in `layout.tsx`, and `Navbar` uses `SignInButton`/`SignUpButton`/`UserButton` correctly gated by `<Show when="signed-in|signed-out">`.
- `proxy.ts` (migrated today from `middleware.ts`) protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and `POST /api/trips`. `GET /api/trips` and viewing `/trips/[id]` are public, as intended.
- Clerk → Postgres webhook exists at `app/api/webhooks/clerk/route.ts`: verifies the signature with `svix`, and on `user.created` inserts a row into `users`. **`user.updated` and `user.deleted` are not handled** — they're silently ignored (200 OK, no-op) so Clerk won't retry, but the local `users` row never gets updated or removed. Open task, see `DAILY_TASKS.md` Day 1.
- `auth()` from `@clerk/nextjs/server` is used correctly in every API route that needs the signed-in user, and in `app/dashboard/page.tsx` / `app/trips/[id]/page.tsx` for ownership checks.

## 1.4 Core user flows — traced end to end

**a) Traveler posts a new trip** — ✅ works. `/post-trip` form → `POST /api/trips` (auth required) → `createTrip` (Drizzle insert) → now appears on `/trips` and `/` immediately (previously broken, fixed today).

**b) Buyer browses trips and attaches a request** — ✅ works, fixed today. Buyer sees real trips on `/trips`, clicks into `/trips/[id]`, sees a "Request item" button (hidder if they've already requested on that trip), which links to `/post-request/[tripId]`. That page previously only recognized mock trip IDs and would 404 for anything created through the real form — fixed today.

**c) Traveler sees incoming requests and accepts/declines** — ✅ works. `/trips/[id]` shows an "Attached requests" section; if the signed-in user is the trip owner, each pending request gets Accept/Decline buttons (`RequestActions.tsx`, a client component) that `PATCH /api/requests/[id]/status`, which checks trip ownership server-side before updating. The page refreshes via `router.refresh()` without a full reload. Buyer name/rating now shows correctly for DB-backed requests (previously blank — fixed today).

**d) Dashboard shows the user's activity** — ✅ already worked before today. `/dashboard` calls `auth()`, redirects to `/sign-in` if signed out, then reads real trips/requests via Drizzle (`getTripsForUser`, `getRequestsForUser`). This directly contradicts "known issue #5" in the original brief — that issue no longer exists in the current code.

**e) Mode toggle (Travelling/Shopping)** — ✅ already worked before today. State lives in `localStorage` via `useSyncExternalStore` (`lib/use-mode.ts`), and `HeroSection` genuinely renders different headline/copy/CTAs per mode, not just a label change. This contradicts "known issue #2" — already resolved.

## 1.5 Third-party services

| Service | SDK installed? | Env vars referenced? | Actually called? |
|---|---|---|---|
| Clerk | ✅ `@clerk/nextjs` | yes | ✅ throughout |
| Drizzle/Postgres | ✅ `drizzle-orm`, `postgres` | `DATABASE_URL` | ✅ throughout |
| Vercel Analytics | ✅ `@vercel/analytics` | — | ✅ in `layout.tsx` (not mentioned in the original brief, but live) |
| svix | ✅ | — | ✅ in the Clerk webhook |
| Supabase (`supabase-js`) | ❌ not installed | referenced in stub only | ❌ never called |
| Stripe | ❌ not installed | referenced in stub only | ❌ never called (correct — deferred per instructions) |
| Resend | ❌ not installed | referenced in stub only | ❌ never called (correct — deferred) |
| PostHog | ❌ not installed | referenced in stub only | ❌ never called (correct — deferred) |

## 1.6 Known issues from the original brief — re-checked today

1. **Homepage unclear for buyers** — partially addressed already: `HowItWorks` has separate "For Travelers"/"For Buyers" columns, and the mode toggle changes hero copy. Could still be sharper; see `UI_GUIDELINES.md` and Day 3 of the roadmap.
2. **Mode toggle cosmetic only** — ❌ not true anymore. Resolved before today's session; it's functionally wired.
3. **Browse trips has no clear buyer CTA** — still a minor gap: `TripCard` links to the detail page but there's no "attach a request" affordance directly on the grid. Backlog item.
4. **Trip detail missing requests/accept-decline** — ❌ not true anymore. Resolved before today; buyer-name display bug fixed today.
5. **Dashboard pulls from mock data** — ❌ not true. Dashboard was already on real Drizzle queries before today.
6. **No notification system** — still true. Left alone deliberately — the original brief says not to build notifications yet.

## New findings from today's read-through (not in the original list)

- **mock-data/real-DB split-brain** — the single most impactful bug found. Fixed today (see CHANGELOG). Trips created through the real UI previously vanished from the homepage and browse page, and requesting an item on one of them 404'd.
- **Trip detail buyer info missing for real requests** — fixed today via a join in `getTripById`.
- **`middleware.ts` → `proxy.ts`** — mechanical migration for a genuine Next.js 16 breaking change, done today.
- **`/api/matches` doesn't persist** — builds an object and returns it, never inserts into the `matches` table. Not in scope for the current daily plan (matches/escrow is a later phase per your instructions), but worth knowing it's currently a no-op.
- **`lib/mock-data.ts` is now fully orphaned.** Recommend deleting once you confirm — not deleted unilaterally.
- **`lib/supabase.ts` is dead scaffolding**, not a "not yet built" placeholder like the Stripe/Resend/PostHog stubs — the app doesn't route through Supabase's client at all. Worth a decision on whether to keep it for future Supabase Auth/Storage use.
=======
# Arbi Codebase Audit

_Last updated: 2026-07-22_

Arbi is a peer-to-peer cross-border shopping marketplace. Travelers post trips,
buyers attach item requests, travelers earn a courier fee, the platform takes a
cut. This document is the honest state of the code as read end to end.

## 1.1 Project structure

- **Framework:** Next.js `16.2.4`, App Router. React `19.2.4`.
- **Package manager:** npm (only `package-lock.json` present).
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`), Geist fonts.
- **ORM / DB client:** Drizzle ORM (`drizzle-orm`) over `postgres` (postgres-js). The DB is
  reached through `DATABASE_URL` (a Supabase Postgres connection string), **not** the
  `@supabase/supabase-js` client — that package is not installed.
- **Auth:** Clerk (`@clerk/nextjs`), with `svix` for webhook verification.
- **3D:** `three` + `react-globe.gl` for the hero globe.

### Folder map

| Path | Contents |
|------|----------|
| `app/` | App Router pages + API routes |
| `components/` | Shared UI (Navbar, HeroSection, HowItWorks, ModeToggle, TripCard, globe, ChatWidget) |
| `db/` | Drizzle: `schema.ts`, `queries.ts`, `index.ts` (client) |
| `lib/` | `mock-data.ts`, service stubs (`supabase`, `stripe`, `resend`, `posthog`), `use-mode.ts`, `country-style.ts` |
| `types/` | Shared TypeScript interfaces |
| `public/` | Static SVGs |

### Page routes

| Route | Renders | Data source |
|-------|---------|-------------|
| `/` | Home: hero, globe, how-it-works, featured trips | **mock-data** |
| `/trips` | Browse trips + country filter | **mock-data** |
| `/trips/[id]` | Trip detail + attached requests + accept/decline | **DB first, mock fallback** |
| `/dashboard` | My trips / my requests tabs | **real DB** (`db/queries`) |
| `/post-trip` | Post-a-trip form | posts to real API |
| `/post-request/[tripId]` | Attach item request form | header from **mock-data**, posts to real API |
| `/profile/[id]` | Public profile | **mock-data** |
| `/sign-in`, `/sign-up` | Clerk auth pages | Clerk |

### API routes

| Route | Method | Status |
|-------|--------|--------|
| `/api/trips` | GET (public), POST (auth) | Real DB, validated, try/catch ✅ |
| `/api/trips/[id]` | GET (public) | Real DB ✅ |
| `/api/requests` | GET (auth), POST (auth) | Real DB, validated ✅ |
| `/api/requests/[id]/status` | PATCH (auth, owner-only) | Real DB, ownership check ✅ |
| `/api/user/[id]` | GET (auth) | Real DB ✅ |
| `/api/matches` | POST (auth) | **Stub** — builds an object, does not persist ❌ |
| `/api/webhooks/clerk` | POST | Verifies svix, handles **only `user.created`** ⚠️ |

### Orphans / dead code

- `lib/supabase.ts`, `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` — config stubs, not
  wired into any real flow (expected; those services are out of scope for now).
- `getMatches` / `getCurrentUserId` in `lib/mock-data.ts` — not imported anywhere.

## 1.2 Database

- **Drizzle set up:** yes. `drizzle.config.ts` → `db/schema.ts`, dialect postgresql, `DATABASE_URL`.
- **No generated migrations** — there is no `drizzle/` output dir; schema has not been pushed
  from this checkout.
- **Tables in schema:** `users` (Clerk id as text PK), `trips`, `item_requests`, `matches`,
  `reviews`. Covers the marketplace domain well.
- **Mock data:** `lib/mock-data.ts` holds 6 users, 6 trips, 3 requests, 1 match, plus async
  getters marked `// TODO: replace with Supabase query`.

### Real DB vs mock — the split that matters

- Real DB: `/dashboard`, all `/api/*` (except matches), trip detail when a row exists.
- Mock: `/`, `/trips`, `/profile/[id]`, and the **header** of `/post-request/[tripId]`.

## 1.3 Authentication

- `ClerkProvider` wraps the app in `app/layout.tsx` ✅.
- `middleware.ts` protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`,
  `/api/requests`, `/api/matches`, and POST-only on `/api/trips`. Public: `/`, `/trips`,
  `/trips/[id]` ✅.
- Webhook at `app/api/webhooks/clerk/route.ts` inserts a `users` row on `user.created` ✅ but
  does **not** handle `user.updated` or `user.deleted` ⚠️.
- `auth()` / server auth is used correctly in server components and routes ✅.

## 1.4 Core flows

| Flow | State |
|------|-------|
| a) Traveler posts a trip | **Works** — form → `/api/trips` POST → DB → `/dashboard`. |
| b) Buyer browses + attaches request | **Partially broken** — browse is mock; trip IDs on `/trips` are mock (`t_1`), and `/post-request/[tripId]` looks the trip up in mock, so a **real** trip UUID 404s there. |
| c) Traveler accepts/declines | **Works** — owner sees `RequestActions`, PATCH updates status, page refreshes. |
| d) Dashboard | **Works** — real DB, two tabs, empty states with CTAs. |
| e) Mode toggle | **Works** — `ModeToggle` + `use-mode` (localStorage + `useSyncExternalStore`); `HeroSection` swaps copy/CTA by mode. |

## 1.5 Third-party services

| Service | SDK installed | Called |
|---------|---------------|--------|
| Clerk | yes | yes (provider, middleware, webhook, `auth()`) |
| Supabase (as Postgres via Drizzle) | `postgres` + `drizzle-orm` | yes |
| `@supabase/supabase-js` | **no** | stub only |
| Stripe | no | stub only |
| Resend | no | stub only |
| PostHog | no | stub only |
| Vercel Analytics | yes | mounted in layout |

## 1.6 Known issues from prior sessions — current status

1. Homepage unclear for buyers → **mostly fixed** (`HowItWorks` explains both sides; mode-aware hero). Still missing trust signals + recent matches.
2. Mode toggle only changed a label → **fixed** (hero content changes).
3. Browse page no CTA for buyers → **partially fixed** (trip cards link to detail; detail has "Request item"). Browse page itself still has no per-card request affordance.
4. Trip detail no requests / accept-decline → **fixed**.
5. Dashboard pulls mock → **fixed** (real DB).
6. No notification system → **still absent** (out of scope for now — Resend later).

## Net assessment

The skeleton is solid and most Priority 4–6 API/flow work from the build prompt already exists.
The biggest real problems are **data-source inconsistency** (public pages on mock, authed pages
on DB) and one **correctness bug** (`/post-request/[tripId]` can't resolve real trips). The most
visible polish gaps are the **missing trust signals and recent-matches** sections on the homepage.
</content>
</invoke>
>>>>>>> origin/claude/cool-carson-teamly
