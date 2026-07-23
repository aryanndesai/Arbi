# Arbi — Codebase Audit

_Last updated: 2026-07-23. Read-only audit. Nothing was changed to produce this._

## TL;DR

The project is **much further along than a blank slate**. Most of what the
original build prompt lists under "features to build" already exists and
typechecks cleanly (`tsc --noEmit` and `eslint` both pass with zero errors).

The real remaining work is not "build the marketplace" — it is **finish the
migration from mock data to the real database** and **harden the seams** where
the two currently disagree. The dashboard and the trip-detail page already read
from Postgres via Drizzle; the homepage, browse page, post-request page, and
profile page still read from `lib/mock-data.ts`. That split is the single
biggest source of "it works in the demo but breaks on real data" risk.

---

## 1.1 Project structure

- **Framework:** Next.js `16.2.4`, App Router, React `19.2.4`. TypeScript strict mode on.
- **Package manager:** npm (only `package-lock.json` present).
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`), plus custom keyframes in `app/globals.css`.
- **Fonts:** Geist Sans + Geist Mono via `next/font/google`.

### Folders

| Folder | Contents |
|--------|----------|
| `app/` | Routes (pages + API). App Router. |
| `components/` | 9 client/server components (Navbar, Hero, globe, cards, chat, etc.). |
| `db/` | Drizzle schema, client, and query helpers. **Real database layer.** |
| `lib/` | Mock data + service stubs (Supabase/Stripe/Resend/PostHog) + helpers. |
| `types/` | Shared TS interfaces (`User`, `Trip`, `ItemRequest`, `Match`, mode/status enums). |
| `public/` | Default Next.js SVGs. |

### Page routes under `app/`

| Route | Renders | Data source |
|-------|---------|-------------|
| `/` (`page.tsx`) | Hero + globe + How-it-works + featured trips | **mock** (`lib/mock-data`) |
| `/trips` | Browse trips with destination filter | **mock** |
| `/trips/[id]` | Trip detail, requests, accept/decline | **real DB** (falls back to mock if DB throws) |
| `/dashboard` | My Trips / My Requests tabs | **real DB** |
| `/post-trip` | Form to create a trip | posts to real API |
| `/post-request/[tripId]` | Form to attach a request | trip lookup is **mock**; posts to real API |
| `/profile/[id]` | Public profile with trips/requests | **mock** |
| `/sign-in`, `/sign-up` | Clerk catch-all auth pages | Clerk |

### API routes under `app/api/`

| Route | Method | Behaviour |
|-------|--------|-----------|
| `/api/trips` | GET | Public. Real DB, joins traveler. |
| `/api/trips` | POST | Auth required. Inserts trip for the signed-in user. |
| `/api/trips/[id]` | GET | Public. Real DB, returns trip + requests. |
| `/api/requests` | GET | Auth required. Requests made by the user. |
| `/api/requests` | POST | Auth required. Attaches a request to a trip. |
| `/api/requests/[id]/status` | PATCH | Auth + ownership check. Accept/decline. |
| `/api/matches` | POST | Auth required. **Stub — returns a fake match, does not persist.** |
| `/api/user/[id]` | GET | Auth required. Real DB. User + stats. **Not called by any page yet.** |
| `/api/webhooks/clerk` | POST | Svix-verified. Handles `user.created` only. |

### Components — import status

All 9 components are imported and used. No orphans:

- `Navbar`, `HeroSection`, `HowItWorks`, `ModeToggle`, `TripCard`, `TripCardSkeleton`, `MapWrapper` → `GlobeInner`, `ChatWidget`.

### Orphan / dead code

- `app/api/user/[id]/route.ts` — fully built but **no page fetches it**. The profile page uses mock helpers directly instead.
- `app/api/matches/route.ts` — stub; nothing calls it and it does not touch the DB.
- `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts`, `lib/supabase.ts` — all stubs, intentionally not wired up.
- `matches` and `reviews` tables exist in the schema but have no queries and no UI.

---

## 1.2 Database

- **Drizzle:** yes. `drizzle.config.ts` → `db/schema.ts`, dialect `postgresql`, driver `postgres-js`. Connects via `DATABASE_URL`.
- **Supabase client:** only a **stub** in `lib/supabase.ts`. The app talks to Postgres directly through Drizzle, not the Supabase JS SDK. `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` are referenced but unused at runtime.
- **Mock data:** `lib/mock-data.ts` holds 6 users, 6 trips, 3 requests, 1 match, all hardcoded, with async wrappers that mimic the DB API.

### Schema tables

| Table | Key columns |
|-------|-------------|
| `users` | `id` (text = Clerk id), `email`, `full_name`, `avatar_initials`, `traveler_rating`, `buyer_rating`, `trips_completed`, `requests_completed`, `created_at` |
| `trips` | `id` (uuid), `traveler_id`→users, `from_country`, `to_country`, `from_flag`, `to_flag`, `departure_date`, `return_date`, `capacity_kg`, `status`, `created_at` |
| `item_requests` | `id`, `trip_id`→trips, `buyer_id`→users, `item_name`, `item_url`, `item_image_url`, `max_budget`, `courier_fee`, `status`, `created_at` |
| `matches` | `id`, `request_id`→requests, `trip_id`→trips, `status`, `agreed_price`, `courier_fee`, `created_at` |
| `reviews` | `id`, `match_id`→matches, `rater_id`→users, `ratee_id`→users, `rating`, `comment`, `created_at` |

> The schema is **richer** than the original prompt's minimum. It already exceeds Priority 3's list. Do not recreate it.

### Which pages use real vs mock

- **Real DB:** `/dashboard`, `/trips/[id]` (mock only as a catch fallback), and every `/api/*` route except `matches`.
- **Mock:** `/`, `/trips`, `/post-request/[tripId]`, `/profile/[id]`.

---

## 1.3 Authentication

- **Clerk:** installed (`@clerk/nextjs ^7.2.7`), `ClerkProvider` wraps the app in `app/layout.tsx`.
- **Middleware:** `middleware.ts` protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and non-GET `/api/trips`. Public: `/`, `/trips`, `/trips/[id]` (GET).
- **Webhook:** `app/api/webhooks/clerk/route.ts` exists, verifies with svix, and inserts a `users` row on `user.created`. **`user.updated` and `user.deleted` are not handled** (they return `200 ignored`).
- **`auth()` usage:** used correctly in every write API route and in the dashboard/trip-detail server components.

---

## 1.4 Core flow status

| Flow | Status | Notes |
|------|--------|-------|
| a) Traveler posts a trip | **Works** | Form → `POST /api/trips` → DB. Redirects to dashboard. But new trip only shows on `/trips` once that page moves off mock data. |
| b) Buyer browses + attaches request | **Partially** | Browse is mock; the request form posts to the real API. Trip lookup on the request page is mock, so a real (DB) trip id would 404 there. |
| c) Traveler accepts/declines | **Works** | `/trips/[id]` shows requests to the owner with working Accept/Decline (optimistic UI + `router.refresh()`). Ownership enforced server-side. |
| d) Dashboard | **Works (real DB)** | Two tabs, empty states, real queries. Missing: per-trip pending-request **count** (Priority 5 asks for it). |
| e) Mode toggle | **Works** | `ModeToggle` persists to `localStorage` via `useSyncExternalStore`; the hero swaps copy/CTA by mode. Only the homepage hero reacts today. |

---

## 1.5 Third-party services

| Service | SDK installed | Env referenced | Actually called |
|---------|---------------|----------------|-----------------|
| Clerk | ✅ | ✅ | ✅ everywhere |
| Postgres / Drizzle | ✅ | `DATABASE_URL` | ✅ |
| Supabase JS | ❌ (stub only) | ✅ (unused) | ❌ |
| Stripe | ❌ (stub) | `STRIPE_SECRET_KEY` | ❌ (intentional) |
| Resend | ❌ (stub) | `RESEND_API_KEY` | ❌ (intentional) |
| PostHog | ❌ (stub) | `NEXT_PUBLIC_POSTHOG_KEY` | ❌ (intentional) |
| Vercel Analytics | ✅ | — | ✅ (`<Analytics />` in layout) |
| svix | ✅ | `CLERK_WEBHOOK_SECRET` | ✅ (webhook) |
| react-globe.gl / three | ✅ | — | ✅ (homepage globe) |

---

## 1.6 Known issues from prior sessions — current status

1. **Homepage unclear for buyers** — **Resolved.** `HowItWorks` has both traveler and buyer columns; shopping mode rewrites the hero for buyers.
2. **Mode toggle only changes a label** — **Mostly resolved.** It changes the homepage hero copy and CTA. It does **not** yet re-order or re-theme `/trips` or the rest of the site.
3. **Browse page has no clear CTA to attach a request** — **Partially.** The CTA lives on the trip-detail page ("Request item"), not on the browse cards. Reasonable, but worth revisiting.
4. **Trip detail shows no requests / no accept-decline** — **Resolved.** Fully built.
5. **Dashboard pulls from mock** — **Resolved.** Dashboard is real DB.
6. **No notifications** — **Still true.** Out of scope for now (Resend is deferred).

---

## New issues found in this audit (not in the prior list)

1. **Mock/real split is the core risk.** `/`, `/trips`, `/post-request/[tripId]`, `/profile/[id]` still read mock data. A trip created through the real flow will not appear on the homepage or browse page, and its detail-page "Request item" button links to `/post-request/[realUuid]`, which then 404s because that page looks the id up in mock data.
2. **Latent type mismatch: Drizzle decimals are strings.** `db/queries.getTrips()` returns `traveler_rating`, `capacity_kg`, etc. as **strings** (postgres numeric → string in drizzle), and the joined `traveler` can be **null**. `TripCard` is typed against `types/index.ts` where `travelerRating` is a `number` and calls `trip.traveler.travelerRating.toFixed(1)`. Feeding real rows straight into `TripCard` will throw at runtime. A mapping/normalization layer is needed before browse/home switch to the DB.
3. **`/api/user/[id]` and the matches/reviews tables are dead ends** — built or scaffolded but unused.
4. **Webhook only handles `user.created`** — `user.updated` / `user.deleted` are ignored, so profile edits and deletions in Clerk never reach Postgres.
5. **Globe textures load from `unpkg.com`** — three external CDN fetches on the landing page. Fine for a demo; a risk for reliability/performance and offline/blocked networks.
6. **No committed env template.** There is no `.env.example`. A new contributor cannot boot the app without reverse-engineering the required vars (see `docs/ENV.md`).

---

## Verification performed

- `npm install` — clean (451 packages).
- `npx tsc --noEmit` — **0 errors.**
- `npx eslint .` — **0 errors.**
- Full manual read of every file under `app/`, `components/`, `db/`, `lib/`, `types/`, plus config.

_A production `next build` was not run here because it requires a live `DATABASE_URL` (the db client throws on import without one). That belongs in CI with secrets, not in this audit._
