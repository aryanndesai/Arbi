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
