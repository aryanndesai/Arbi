# Arbi — Codebase Audit

_Last updated: 2026-07-19 · Section 1 of the full-stack audit prompt._

This is an honest, file-by-file map of what **actually exists** vs what is
placeholder/mock. The headline finding: **the project is much further along
than the "known issues from prior sessions" list suggests.** Most of the seven
build priorities are already partly or fully implemented. The remaining work is
mostly about cutting the last mock-data cords, tightening a few data joins, and
finishing the homepage trust content.

---

## 1.1 Project structure

| Thing | Value |
| --- | --- |
| Framework | **Next.js 16.2.4**, App Router |
| React | 19.2.4 |
| Package manager | **npm** (only `package-lock.json` present) |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`, `@tailwindcss/postcss`) |
| ORM | **Drizzle ORM 0.45** over `postgres` (postgres-js driver) |
| Auth | **Clerk 7.2** (`@clerk/nextjs`) |
| Webhooks | **svix 1.92** (installed, used) |
| 3D globe | `react-globe.gl` + `three` |
| Analytics | `@vercel/analytics` (wired in layout) |

> ⚠️ `node_modules` is **not** installed in a fresh clone. Run `npm install`
> before `npm run dev` / `lint` / `build`. AGENTS.md requires reading
> `node_modules/next/dist/docs/` before writing Next.js code — that only works
> after install.

### Page routes (`app/`)

| Route | Renders | Data source |
| --- | --- | --- |
| `/` | Hero + globe + How-it-works + featured trips | **mock** (`lib/mock-data`) |
| `/trips` | Browse + country filter | **mock** |
| `/trips/[id]` | Trip detail + attached requests + accept/decline | **DB first, mock fallback** |
| `/dashboard` | My trips / My requests tabs | **real DB** ✅ |
| `/post-trip` | Post-trip form | (form → `POST /api/trips`) |
| `/post-request/[tripId]` | Attach-request form | trip lookup is **mock** |
| `/profile/[id]` | Public profile | **mock** |
| `/sign-in`, `/sign-up` | Clerk catch-all auth pages | Clerk |

### API routes (`app/api/`)

| Route | Methods | Notes |
| --- | --- | --- |
| `/api/trips` | GET (public), POST (auth) | POST validates payload, links to `userId` ✅ |
| `/api/trips/[id]` | GET | single trip + requests |
| `/api/requests` | GET, POST | create request attached to trip |
| `/api/requests/[id]/status` | PATCH | accept/decline, **owner-only check** ✅ |
| `/api/matches` | — | present, review scope |
| `/api/user/[id]` | GET | user lookup |
| `/api/webhooks/clerk` | POST | svix-verified, **user.created only** ⚠️ |

### Components (`components/`) — all imported somewhere

`Navbar`, `HeroSection`, `HowItWorks`, `ModeToggle`, `TripCard`,
`TripCardSkeleton`, `MapWrapper`, `GlobeInner`, `ChatWidget`. No obvious orphans.

### `lib/` and `types/`

- `lib/mock-data.ts` — seed users/trips/requests/matches + async getters (**still imported by 4 pages**).
- `lib/use-mode.ts` — `useSyncExternalStore`-based mode store (localStorage + custom event). Clean ✅.
- `lib/country-style.ts` — country → colour/flag styling for the globe.
- `lib/supabase.ts`, `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` — **config stubs only** (throw if env missing, no SDK installed). Intentional per "what not to do".
- `types/index.ts` — app-facing `User`/`Trip`/`ItemRequest`/`Match` interfaces. **These diverge from Drizzle's inferred types** (nested `traveler`/`buyer` objects and numeric fields vs flat `travelerId` + string decimals). This drift is the reason `trips/[id]/page.tsx` has a `RawTrip` mapping layer.

---

## 1.2 Database

- **Drizzle is fully set up.** `drizzle.config.ts` → `db/schema.ts`, output `./drizzle`, dialect `postgresql`, url from `DATABASE_URL`.
- `db/index.ts` creates the postgres-js client and **throws if `DATABASE_URL` is unset**.
- Schema tables: **`users`, `trips`, `item_requests`, `matches`, `reviews`** (reviews is a bonus beyond the prompt's four).
  - `users.id` is **`text`** holding the Clerk user id (`user_...`), not a uuid — correct choice for Clerk sync.
  - Decimals are stored as strings (Drizzle `decimal`), which is why UI does `Number(...)` coercion.
- `db/queries.ts` has real query fns: `getTrips` (joins traveler), `getTripById` (trip + requests + traveler), `createTrip`, `getTripsForUser`, `getRequestsForTrip`, `createRequest`, `getRequestsForUser`, `getRequestById`, `updateRequestStatus`, `getUserById`, `createUser`.
- **Mock data still lives** and is imported by `/`, `/trips`, `/trips/[id]` (fallback), `/profile/[id]`, `/post-request/[tripId]`.

**Gap:** `getTripById` returns requests **without** buyer name/initials/rating.
The trip-detail page only fills buyer display fields on the **mock** path, so on
real data the accept/decline list shows `?` avatars and no buyer name.

## 1.3 Authentication

- **`ClerkProvider` wraps the app** in `app/layout.tsx` ✅.
- **`middleware.ts` is configured** and protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and **POST-only** on `/api/trips` (GET stays public). This already satisfies Priority 7 ✅.
- **Webhook exists** at `app/api/webhooks/clerk/route.ts`, svix-verified, inserts a `users` row on `user.created`. **Missing `user.updated` and `user.deleted` handling** (Priority 1 asks for both).
- `auth()` / `currentUser()` used in server components (`dashboard`, `trips/[id]`) and API routes ✅.

## 1.4 Core flows

| Flow | State |
| --- | --- |
| a) Traveler posts a trip | **Works** — form → `POST /api/trips` → DB. But it won't show on `/` or `/trips` because those read mock. |
| b) Buyer browses + attaches request | **Partial** — browse is mock; `/post-request/[tripId]` looks up the trip from mock, so a real DB trip id may 404 there. |
| c) Traveler accepts/declines | **Works on real data** — `RequestActions` → `PATCH /api/requests/[id]/status`, owner-checked, optimistic UI. Buyer names missing (see 1.2 gap). |
| d) Dashboard | **Works, real DB** ✅ — but "My Trips" has no per-trip pending-request count (Priority 5 asks for it). |
| e) Mode toggle | **Works** — `ModeToggle` + `useMode` flip hero copy/CTA (`HeroSection`). Persists via localStorage. Other pages don't yet react to mode. |

## 1.5 Third-party services

| Service | SDK installed | Env vars | Called |
| --- | --- | --- | --- |
| Clerk | ✅ `@clerk/nextjs` | needs keys | ✅ everywhere |
| Postgres/Drizzle | ✅ | `DATABASE_URL` | ✅ |
| svix | ✅ | `CLERK_WEBHOOK_SECRET` | ✅ webhook |
| Supabase JS | ❌ stub only | `NEXT_PUBLIC_SUPABASE_*` | stub throws |
| Stripe | ❌ stub only | `STRIPE_SECRET_KEY` | stub (later) |
| Resend | ❌ stub only | `RESEND_API_KEY` | stub (later) |
| PostHog | ❌ stub only | `NEXT_PUBLIC_POSTHOG_KEY` | stub (later) |
| Vercel Analytics | ✅ | — | ✅ layout |

> Note: the app talks to the DB through **Drizzle + postgres-js**, not the
> Supabase JS client. Supabase is only the hosted Postgres. The `lib/supabase.ts`
> stub is currently unused by the data layer.

## 1.6 Prior "known issues" — re-checked

| # | Prior claim | Reality today |
| --- | --- | --- |
| 1 | Homepage unclear for buyers | **Mostly fixed** — `HowItWorks` has both sides; hero flips per mode. Still missing trust-signals row + recent-matches section. |
| 2 | Mode toggle only changes a label | **Fixed** — hero copy + CTAs actually change. |
| 3 | Browse has no buyer CTA | **Fixed** — trip cards + trip-detail "Request item" CTA. |
| 4 | Trip detail lacks requests/accept-decline | **Fixed** — full requests list + owner accept/decline. |
| 5 | Dashboard uses mock | **Fixed** — real DB queries. |
| 6 | No notifications | **Still true** (out of scope for now per "what not to do"). |

---

## Real remaining gaps (the actual to-do list)

1. **Cut mock cords** on `/`, `/trips`, `/post-request/[tripId]`, `/profile/[id]` → real DB. _(biggest item)_
2. **Join buyer info into `getTripById` requests** so accept/decline shows real names.
3. **Webhook:** add `user.updated` + `user.deleted`.
4. **`.env.local`** with all placeholders (see `docs/ENV.md` once created).
5. **Dashboard:** per-trip pending-request count.
6. **`GET /api/dashboard`** consolidated route + pagination on `GET /api/trips`.
7. **Create a `match` row on accept** (matches table is unused).
8. **Reconcile `types/index.ts` with Drizzle inferred types** to drop the `RawTrip` mapping.
9. **Homepage:** trust-signals row + recent-matches section.
10. **Seed script** so a real DB isn't empty in dev (replaces the mock fallback).
