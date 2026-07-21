# Arbi — Codebase Audit

_Last updated: 2026-07-21_

This is a read-only snapshot of what actually exists in the repo today, traced
from the source. It maps what works, what half-works, and what is still a stub,
so the roadmap in [`ROADMAP.md`](./ROADMAP.md) can be built on facts instead of
assumptions.

> **Headline:** the project is much further along than a "greenfield" read would
> suggest. Auth, the Drizzle schema, most API routes, the trip-detail
> accept/decline flow, the dashboard, and the mode toggle are all real. The main
> gap is a **split data layer**: some pages read from Postgres (Drizzle) while
> others still read from `lib/mock-data.ts`, and the two use **incompatible
> shapes**. That split is the single most important thing to fix.

---

## 1.1 Project structure

| Thing | Value |
| --- | --- |
| Framework | **Next.js 16.2.4**, App Router |
| React | 19.2.4 |
| Package manager | **npm** (only `package-lock.json` present) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Language | TypeScript 5, strict JSX |
| ORM | Drizzle ORM 0.45 over `postgres` (postgres-js driver) |
| Auth | Clerk (`@clerk/nextjs` 7.2.7) |
| Analytics | `@vercel/analytics` (wired), PostHog (stub only) |
| 3D globe | `react-globe.gl` + `three` |

> ⚠️ **`AGENTS.md` warns this is Next.js 16 with breaking changes** vs older
> mental models. Read `node_modules/next/dist/docs/` before touching routing,
> `params`/`searchParams` (now Promises — already handled correctly across the
> codebase), or middleware.

### Folder map

- `app/` — App Router pages and API routes (see route tables below)
- `components/` — presentational + client components
- `lib/` — service clients (mostly stubs), mock data, mode hook, country styling
- `db/` — Drizzle client, schema, query functions (the **real** data layer)
- `types/` — shared TypeScript interfaces
- `public/` — static SVGs

### Page routes (`app/`)

| Route | Renders | Data source |
| --- | --- | --- |
| `/` | Hero + globe + "How it works" + featured trips | **mock** (`lib/mock-data`) |
| `/trips` | Browse + country filter | **mock** |
| `/trips/[id]` | Trip detail, requests, accept/decline | **DB first, mock fallback** |
| `/post-trip` | Trip creation form | posts to real API |
| `/post-request/[tripId]` | Item request form | page reads **mock**, form posts to real API |
| `/dashboard` | My trips / my requests tabs | **DB** (Drizzle) |
| `/profile/[id]` | Public user profile | **mock** |
| `/sign-in`, `/sign-up` | Clerk catch-all auth pages | Clerk |

### API routes (`app/api/`)

| Route | Method | Auth | Backing | Status |
| --- | --- | --- | --- | --- |
| `/api/trips` | GET | public | Drizzle `getTrips` | ✅ real |
| `/api/trips` | POST | Clerk | Drizzle `createTrip` | ✅ real |
| `/api/trips/[id]` | GET | public | Drizzle `getTripById` | ✅ real |
| `/api/requests` | GET | Clerk | Drizzle `getRequestsForUser` | ✅ real |
| `/api/requests` | POST | Clerk | Drizzle `createRequest` | ✅ real |
| `/api/requests/[id]/status` | PATCH | Clerk + owner check | Drizzle `updateRequestStatus` | ✅ real |
| `/api/matches` | POST | Clerk | **none — returns a fake object** | ⚠️ stub |
| `/api/user/[id]` | GET | Clerk | Drizzle | ✅ real |
| `/api/webhooks/clerk` | POST | svix sig | Drizzle `createUser` | ⚠️ partial (only `user.created`) |

### Components (`components/`) — all are imported

`HeroSection`, `GlobeInner`, `Navbar`, `HowItWorks`, `TripCard`,
`ModeToggle`, `ChatWidget`, `TripCardSkeleton`, `MapWrapper`. No obvious orphans.

### `lib/` and `types/`

- `lib/mock-data.ts` — hardcoded users/trips/requests/matches + async getters (still used by `/`, `/trips`, `/profile`, `/post-request`)
- `lib/use-mode.ts` — `useMode()` / `setMode()` via `localStorage` + `useSyncExternalStore` (real, works)
- `lib/country-style.ts` — flag + tint styling helpers
- `lib/supabase.ts`, `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` — **all stubs** (env-var placeholder pattern, no SDK installed)
- `types/index.ts` — `User`, `Trip`, `ItemRequest`, `Match`, `UserMode`, status unions

---

## 1.2 Database

- **Drizzle is the real data layer**, not the Supabase JS client. `db/index.ts`
  connects with the `postgres` driver using **`DATABASE_URL`** (this would be the
  Supabase Postgres connection string in production).
- `lib/supabase.ts` is a **stub** — `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are read but never used by any real query.
- `drizzle.config.ts` points at `db/schema.ts`, dialect `postgresql`, out `./drizzle`.
- **No migrations folder is committed** (`drizzle/` is gitignored). Schema has
  never been version-controlled as SQL.
- **No `.env.local` / `.env` exists.** `db/index.ts` throws on import if
  `DATABASE_URL` is unset, so any DB-backed route or build step fails without it.

### Schema (`db/schema.ts`)

| Table | Key columns |
| --- | --- |
| `users` | `id` (text = Clerk id), `email`, `full_name`, `avatar_initials`, ratings, counts, `created_at` |
| `trips` | `id` (uuid), `traveler_id`→users, `from_country`, `to_country`, flags, `departure_date`, `return_date`, `capacity_kg`, `status` (text), `created_at` |
| `item_requests` | `id` (uuid), `trip_id`→trips, `buyer_id`→users, `item_name`, `item_url`, `item_image_url`, `max_budget`, `courier_fee`, `status` (text), `created_at` |
| `matches` | `id`, `request_id`, `trip_id`, `status`, `agreed_price`, `courier_fee`, `created_at` |
| `reviews` | `id`, `match_id`, `rater_id`, `ratee_id`, `rating`, `comment`, `created_at` |

**Deltas vs the spec in the build prompt** (not bugs, just divergences to reconcile):

- Table is `item_requests`, spec says `requests`.
- Field is `courier_fee`, spec says `offered_fee`. No `item_description`.
- `status` columns are **plain `text`**, not Postgres enums.
- No `updated_at` on any table. `trips` has no `notes` field.
- `matches` links to `trip_id` rather than `traveler_id`/`buyer_id`.

---

## 1.3 Authentication

- ✅ `ClerkProvider` wraps the app in `app/layout.tsx`.
- ✅ `middleware.ts` protects `/dashboard`, `/post-trip`, `/post-request`,
  `/profile`, `/api/requests`, `/api/matches`, and **POST** `/api/trips` (GET stays public).
- ✅ Webhook at `app/api/webhooks/clerk/route.ts` verifies the svix signature and
  inserts a `users` row on `user.created`.
- ⚠️ Webhook **ignores `user.updated` and `user.deleted`** (returns 200 without
  syncing). Profile edits and deletions never reach Postgres.
- ✅ `auth()` from Clerk is used in every write route and in server components
  (`/dashboard`, `/trips/[id]`).

---

## 1.4 Core user flows

| Flow | Status | Notes |
| --- | --- | --- |
| **a) Traveler posts a trip** | ✅ works | `/post-trip` → `POST /api/trips` (auth) → `createTrip` (Drizzle) → redirect `/dashboard`. But the new trip will **not appear on `/trips`** because that page reads mock data. |
| **b) Buyer browses + attaches** | ⚠️ partial | `/trips` list is **mock**. `/trips/[id]` reads DB (mock fallback). Request form posts to real `POST /api/requests`. So you can request against a *real* trip only by knowing its id/URL — the browse grid never shows real trips. |
| **c) Traveler accepts/declines** | ✅ works | Owner-only `RequestActions` → `PATCH /api/requests/[id]/status`; optimistic UI + `router.refresh()`. Owner check enforced server-side (403 otherwise). |
| **d) Dashboard** | ✅ works (real DB) | `/dashboard` calls Drizzle directly (`getTripsForUser`, `getRequestsForUser`). Note: it does **not** go through a `GET /api/dashboard` route — it queries inline. Pending-request counts per trip are **not** shown yet. |
| **e) Mode toggle** | ⚠️ partial | `ModeToggle` persists to `localStorage`; `HeroSection` swaps hero copy/CTA for shopping vs travelling. **Only the homepage hero reacts** — `/trips`, `/dashboard`, etc. ignore mode. |

---

## 1.5 Third-party services

| Service | SDK installed | Env vars | Actually called | State |
| --- | --- | --- | --- | --- |
| Clerk | ✅ | Clerk keys + `CLERK_WEBHOOK_SECRET` | yes | **live** |
| Postgres/Drizzle | ✅ | `DATABASE_URL` | yes | **live** |
| Supabase JS | ❌ | `NEXT_PUBLIC_SUPABASE_*` | no | stub |
| Stripe | ❌ | `STRIPE_SECRET_KEY` | no | stub (out of scope) |
| Resend | ❌ | `RESEND_API_KEY` | no | stub (out of scope) |
| PostHog | ❌ | `NEXT_PUBLIC_POSTHOG_KEY` | no | stub (out of scope) |
| Vercel Analytics | ✅ | — | yes (`layout.tsx`) | live |

---

## 1.6 Status of previously-known issues

| # | Issue | Status |
| --- | --- | --- |
| 1 | Homepage didn't explain the concept for buyers | ✅ **fixed** — `HowItWorks` has For-Travellers + For-Buyers; shopping-mode hero speaks to buyers |
| 2 | Mode toggle changed a label only | ⚠️ **partial** — homepage hero changes; other pages don't |
| 3 | Browse page had no CTA to attach a request | ⚠️ **partial** — CTA lives on trip *detail*; the browse grid card only says "View" |
| 4 | Trip detail didn't show requests / accept-decline | ✅ **fixed** |
| 5 | Dashboard pulled from mock data | ✅ **fixed** — now real Drizzle queries |
| 6 | No notification system | ❌ **still missing** (intentionally out of scope for now) |

---

## Bugs & inconsistencies found (the real backlog)

1. **Split data layer.** `/`, `/trips`, `/profile`, `/post-request` read
   `lib/mock-data`; `/dashboard` and `/trips/[id]` read Postgres. A trip you post
   is invisible on the browse grid. **Highest-impact fix.**
2. **Type shape mismatch.** `types/Trip` (and `TripCard`) expect a **nested**
   `trip.traveler` object with `travelerRating` / `tripsCompleted` and **numeric**
   money fields. Drizzle's `getTrips` returns a **flat** row with a partial
   `traveler` (only id/email/fullName/avatarInitials) and **string** decimals.
   Swapping `/trips` to real data **as-is will crash `TripCard`** at
   `trip.traveler.travelerRating.toFixed(...)`. The shapes must be reconciled
   before the data swap.
3. **Buyer info missing on real requests.** `getTripById` doesn't join the buyer,
   so real requests render "?" initials and no buyer name on `/trips/[id]` (the
   mock path does populate these).
4. **`/api/matches` is a stub** — returns a fabricated object, writes nothing. The
   `matches` table is unused.
5. **Webhook is create-only** — `user.updated` / `user.deleted` unhandled.
6. **No `/api/dashboard` route** — dashboard queries inline (works, but diverges
   from the intended API surface; fine to keep, just note it).
7. **Trust signals + recent-matches section** requested for the homepage are
   **not present**.
8. **No `.env.local` / `.env.example`** — nothing documents required env vars, and
   the app can't boot without `DATABASE_URL`. See `.env.example` added in this PR.

---

## Environment variables needed

| Var | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `db/index.ts` | Postgres/Supabase connection string. **App won't boot without it.** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | required |
| `CLERK_SECRET_KEY` | Clerk | required |
| `CLERK_WEBHOOK_SECRET` | webhook | required for user sync |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | `lib/supabase.ts` | stub only, optional today |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` | stub, out of scope |
| `RESEND_API_KEY` | `lib/resend.ts` | stub, out of scope |
| `NEXT_PUBLIC_POSTHOG_KEY` | `lib/posthog.ts` | stub, out of scope |

See [`.env.example`](../.env.example) for the copy-paste template.
