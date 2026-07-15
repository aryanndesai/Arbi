# Arbi — Codebase Audit

_Last updated: 2026-07-15_

This is an honest, file-by-file assessment of what actually exists in the repo
versus what is placeholder or mock. Read this before touching code.

**Headline:** the project is far more built out than a blank scaffold. Most of
the original build spec (auth, DB schema, API routes, dashboard, accept/decline
flow, working mode toggle) is already implemented. The real gaps are a few
inconsistencies and unfinished stubs, listed at the bottom.

---

## 1. Project structure

- **Framework:** Next.js `16.2.4`, App Router, React `19.2.4`.
- **Package manager:** npm (`package-lock.json` present, no pnpm/yarn lockfile).
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`), Geist font.
- **Language:** TypeScript, strict. `tsc --noEmit` and `eslint` both pass clean.

### Folders
| Folder | Contents |
| --- | --- |
| `app/` | Pages + API routes (App Router) |
| `components/` | 10 shared React components |
| `db/` | Drizzle: `schema.ts`, `queries.ts`, `index.ts` (postgres-js client) |
| `lib/` | Helpers + service stubs (`mock-data`, `country-style`, `use-mode`, service stubs) |
| `types/` | Shared TS interfaces (`index.ts`) |
| `public/` | Static SVGs |

### Page routes (`app/`)
| Route | Renders | Data source |
| --- | --- | --- |
| `/` | Home: hero + globe + how-it-works + featured trips | **mock-data** |
| `/trips` | Browse trips w/ destination filter | **mock-data** |
| `/trips/[id]` | Trip detail + attached requests + accept/decline | **DB, falls back to mock** |
| `/post-trip` | Post-trip form | POST `/api/trips` |
| `/post-request/[tripId]` | Attach-item form | POST `/api/requests` |
| `/dashboard` | My trips / my requests tabs | **DB (real)** |
| `/profile/[id]` | Public profile + stats | **mock-data** |
| `/sign-in`, `/sign-up` | Clerk catch-all auth pages | Clerk |

### API routes (`app/api/`)
| Route | Methods | Notes |
| --- | --- | --- |
| `/api/trips` | GET (public), POST (auth) | Real DB via `db/queries` |
| `/api/trips/[id]` | GET (public) | Real DB |
| `/api/requests` | GET (auth), POST (auth) | Real DB |
| `/api/requests/[id]/status` | PATCH (auth, owner-only) | Real DB, verifies trip ownership |
| `/api/matches` | POST (auth) | **Stub** — returns a fabricated match object, no DB write |
| `/api/user/[id]` | GET (auth) | Real DB |
| `/api/webhooks/clerk` | POST | Clerk→DB sync (see §3) |

### Components — all imported, no orphans
`HeroSection`, `HowItWorks`, `Navbar`, `ModeToggle`, `TripCard`, `TripCardSkeleton`,
`ChatWidget`, `MapWrapper` → `GlobeInner`, `RequestActions` (route-local). All are used.

### Orphan / stale files
- `lib/supabase.ts` — stub, **imported nowhere**. The app uses Drizzle+postgres-js directly, not the Supabase JS client.
- `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` — stubs, imported nowhere (future features).

---

## 2. Database

- **ORM:** Drizzle ORM `0.45.2` + `postgres-js`. Config in `drizzle.config.ts` (dialect `postgresql`, reads `DATABASE_URL`).
- **Not** using `@supabase/supabase-js` — Supabase is only the hosted Postgres. `lib/supabase.ts` is an unused stub.
- **Client:** `db/index.ts` **throws at import time** if `DATABASE_URL` is unset. This is brittle: any page importing `db/queries` (e.g. `/dashboard`) fails to load without the env var.

### Schema (`db/schema.ts`)
| Table | Key columns |
| --- | --- |
| `users` | `id` (text, Clerk ID), `email`, `full_name`, `avatar_initials`, ratings, counts, `created_at` |
| `trips` | `id` (uuid), `traveler_id`→users, `from/to_country`, flags, dates, `capacity_kg`, `status`, `created_at` |
| `item_requests` | `id` (uuid), `trip_id`→trips, `buyer_id`→users, `item_name`, `item_url`, `max_budget`, `courier_fee`, `status`, `created_at` |
| `matches` | `id` (uuid), `request_id`→item_requests, `trip_id`→trips, `status`, `agreed_price`, `courier_fee` |
| `reviews` | `id` (uuid), `match_id`→matches, rater/ratee, `rating`, `comment` |

Schema is close to the spec. Differences from spec: no `notes`/`updated_at` on
trips; `requests` uses `item_requests` naming; statuses are plain `text`, not a
pg enum.

### Mock data (`lib/mock-data.ts`)
Hardcoded 6 users, 3 requests, 6 trips, 1 match, plus a fake "current user"
(`u_1` / Alyssa). Async getters mimic the DB shape. **Still consumed by** `/`,
`/trips`, and `/profile/[id]`.

---

## 3. Authentication

- **Clerk** `7.2.7` installed; `ClerkProvider` wraps the app in `layout.tsx`.
- **`middleware.ts`** protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and non-GET `/api/trips`. GET `/api/trips` and trip browsing stay public. Correct.
- **Webhook** at `/api/webhooks/clerk` verifies svix signatures and syncs users. As of 2026-07-15 it handles **`user.created`, `user.updated`, and `user.deleted`** (delete is FK-safe: keeps the row if the user still owns trips/requests). Requires `CLERK_WEBHOOK_SECRET`.
- `auth()` from Clerk is used in server components (`/dashboard`, `/trips/[id]`) and every write API route.

---

## 4. Core flows

| Flow | Status | Notes |
| --- | --- | --- |
| a) Traveler posts a trip | **Works** (needs DB + user row) | `/post-trip` → POST `/api/trips` → `createTrip` |
| b) Buyer browses + attaches request | **Works** | `/trips` (mock) → `/trips/[id]` (DB) → `/post-request/[id]` → POST `/api/requests` |
| c) Traveler accepts/declines | **Works** | `RequestActions` → PATCH `/api/requests/[id]/status`, owner-verified, optimistic UI |
| d) Dashboard shows activity | **Works, real DB** | tabs + empty states + status badges |
| e) Mode toggle (Travelling/Shopping) | **Works** | `use-mode` (localStorage + `useSyncExternalStore`); `HeroSection` swaps copy/CTA; toast feedback |

Caveat on (b): `/trips` still lists **mock** trips, so their IDs (`t_1`…) won't
resolve against a real DB — `/trips/[id]` then falls back to mock. Browse and
detail are on different data sources.

---

## 5. Third-party services

| Service | SDK installed | Env vars | Actually called |
| --- | --- | --- | --- |
| Clerk (auth) | ✅ `@clerk/nextjs` | `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` | ✅ everywhere |
| Postgres/Drizzle | ✅ `drizzle-orm`, `postgres` | `DATABASE_URL` | ✅ `db/queries` |
| Supabase JS | ❌ stub only | `NEXT_PUBLIC_SUPABASE_*` | ❌ unused |
| Stripe | ❌ stub only | `STRIPE_SECRET_KEY` | ❌ (later) |
| Resend | ❌ stub only | `RESEND_API_KEY` | ❌ (later) |
| PostHog | ❌ stub only | `NEXT_PUBLIC_POSTHOG_KEY` | ❌ (later) |
| Vercel Analytics | ✅ `@vercel/analytics` | none | ✅ wired in `layout.tsx` |
| ChatWidget | n/a | none | Hardcoded canned reply (TODO: Claude API) |

---

## 6. Status of the six "known issues"

1. Homepage doesn't explain the concept for buyers → **Fixed.** `HowItWorks` has both sides; shopping-mode hero speaks to buyers.
2. Mode toggle only changes a label → **Fixed.** `HeroSection` swaps copy + CTA + search on mode.
3. Browse page has no clear buyer CTA → **Partly fixed.** Cards link to detail; detail has a clear "Request item" CTA. No CTA directly on the browse list.
4. Trip detail doesn't show requests / accept-decline → **Fixed.** `RequestActions` on `/trips/[id]` for owners.
5. Dashboard pulls from mock → **Fixed.** `/dashboard` uses `db/queries`.
6. No notification system → **Still open.** No email/in-app notify when a request is attached (Resend is a stub).

---

## Remaining gaps (the real backlog)

1. **Split data layer** — `/`, `/trips`, `/profile/[id]` read mock; the rest read the DB. Pick one source. This is the biggest inconsistency.
2. **`db/index.ts` throws at import** — makes DB-backed pages crash without `DATABASE_URL` instead of degrading gracefully.
3. **`/api/matches` is a stub** — no DB write; no `matches` query helpers exist.
4. **No notifications** (issue #6) — Resend stub only.
5. **ChatWidget** returns a canned reply.
6. **No `.env.example`** — env vars were undocumented. (Added 2026-07-15.)
7. **Service stubs** (`supabase`, `stripe`, `resend`, `posthog`) are unused scaffolding; fine to keep but should be tracked.

See `docs/DAILY-PLAN.md` for how these are sequenced.
