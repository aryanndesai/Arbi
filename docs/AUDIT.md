# Arbi — Codebase Audit

_Last updated: 2026-07-18. Snapshot of what actually exists vs. the original build prompt's assumptions._

Arbi is a peer-to-peer cross-border shopping marketplace. Travelers post upcoming
trips, buyers attach item requests, travelers earn a courier fee, the platform takes
a cut. The codebase is **much further along** than the original prompt's "known issues
from prior sessions" list implies. Most of those issues are already fixed. This audit
records the real state so the daily plan targets genuine gaps.

## 1.1 Project structure

- **Framework:** Next.js `16.2.4`, App Router. React `19.2.4`. TypeScript `5`.
  - Note: `AGENTS.md` warns this Next.js has breaking changes vs. training data — read
    `node_modules/next/dist/docs/` before writing route/API code.
- **Package manager:** npm (`package-lock.json` present).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), custom utility classes in
  `app/globals.css` (`arbi-input`, `animate-arbi-fade-in`, `arbi-gradient-border`, toast anims).
- **ORM:** Drizzle ORM `0.45.2` over `postgres` (postgres-js driver) → Supabase Postgres.

### Routes under `app/`
| Route | Renders | Data source |
|---|---|---|
| `/` | Hero + globe + How-it-works + open-trips grid | **mock-data** ⚠️ |
| `/trips` | Browse trips, filter by destination | **mock-data** ⚠️ |
| `/trips/[id]` | Trip detail, attached requests, accept/decline | **DB first, mock fallback** ✅ |
| `/dashboard` | My trips / My requests tabs | **real DB** ✅ |
| `/post-trip` | Post-trip form | POST → real DB ✅ |
| `/post-request/[tripId]` | Attach item request form | POST → real DB ✅ |
| `/profile/[id]` | User profile | **mock-data** ⚠️ |
| `/sign-in`, `/sign-up` | Clerk catch-all auth pages | Clerk ✅ |

### API routes under `app/api/`
| Route | Method | Status |
|---|---|---|
| `/api/trips` | GET (public), POST (auth) | Real DB ✅ |
| `/api/trips/[id]` | GET (public) | Real DB ✅ |
| `/api/requests` | GET (auth), POST (auth) | Real DB ✅ |
| `/api/requests/[id]/status` | PATCH (auth, owner-only) | Real DB ✅ (note: path is `/status`, not `/[id]`) |
| `/api/matches` | POST (auth) | **Mock** — returns fake `m_${Date.now()}`, no DB insert ⚠️ |
| `/api/user/[id]` | GET (auth) | Real DB ✅ |
| `/api/webhooks/clerk` | POST | **`user.created` only** — no update/delete ⚠️ |

### Components (all imported/used)
`Navbar`, `ModeToggle`, `HeroSection`, `HowItWorks`, `TripCard`, `TripCardSkeleton`,
`MapWrapper` + `GlobeInner` (react-globe.gl), `ChatWidget`. No obvious orphans.

### `lib/` and `types/`
- `lib/mock-data.ts` — hardcoded 6 users / 6 trips / 3 requests / 1 match. Still the
  source for `/`, `/trips`, `/profile`, and the `/trips/[id]` fallback.
- `lib/use-mode.ts` — localStorage-backed travelling/shopping mode via `useSyncExternalStore`. ✅
- `lib/country-style.ts` — flag + tint/border styling per country.
- `lib/supabase.ts`, `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` — **stubs only**
  (config objects + `throw if missing env`, SDKs not installed). Intentional per prompt.
- `types/index.ts` — app-facing `User`/`Trip`/`ItemRequest`/`Match` with **nested** shape
  (`Trip.traveler: User`, `Trip.requests: ItemRequest[]`, numeric fields).

## 1.2 Database

- **Drizzle:** configured (`drizzle.config.ts`, `db/schema.ts`, `db/index.ts`, `db/queries.ts`).
- **Connection:** `DATABASE_URL` (postgres-js). Throws at import if unset.
- **Tables in schema:** `users`, `trips`, `item_requests`, `matches`, `reviews`.
  - `users.id` is **text** (stores Clerk id like `user_2abc…`), not uuid — good call.
  - Uses `fullName` + `avatarInitials` (not separate first/last/avatar_url).
- **No migrations generated** — `drizzle/` output folder does not exist yet.
  `drizzle-kit generate` / `push` have not been run in this checkout.
- **Mock vs real split is the #1 structural issue** (see 1.6).

### ⚠️ Type reconciliation problem (critical, blocks the mock→DB swap)
`db/queries.getTrips()` returns **flat** rows: `capacityKg` as **string**, a partial
`traveler` (no rating/trips), and **no `requests` array**. But `TripCard` (used on `/`
and `/trips`) reads `trip.traveler.travelerRating.toFixed(1)`, `trip.traveler.tripsCompleted`,
and `trip.requests.length`. Swapping the homepage to `getTrips()` **as-is will crash**
the card. The DB query must be extended (join ratings, aggregate request counts, coerce
numbers) before mock can be removed. This is the single most important prerequisite.

## 1.3 Authentication

- **Clerk** installed (`@clerk/nextjs 7.2.7`), `ClerkProvider` wraps `app/layout.tsx`. ✅
- **`middleware.ts`** protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`,
  `/api/requests`, `/api/matches`, and non-GET `/api/trips`. Public: `/`, `/trips`,
  `/trips/[id]` GET. ✅ Matches the prompt's Priority-7 requirement already.
- **Webhook** at `app/api/webhooks/clerk/route.ts` — svix-verified, inserts a `users`
  row on `user.created`. ⚠️ Missing `user.updated` and `user.deleted` handling.
- `auth()` / `currentUser()` used correctly in server components + API routes.

## 1.4 Core user flows

| Flow | State |
|---|---|
| a) Traveler posts a trip | **Works** — form → POST `/api/trips` → DB. But new trip **won't appear** on `/` or `/trips` because those read mock. |
| b) Buyer browses + attaches request | **Works** — `/trips/[id]` "Request item" → `/post-request/[tripId]` → POST `/api/requests` → DB. |
| c) Traveler accepts/declines | **Works** — owner sees `RequestActions` (optimistic UI, `router.refresh()`) → PATCH `/api/requests/[id]/status` (owner-verified). |
| d) Dashboard | **Works, real DB** — already migrated off mock. |
| e) Mode toggle | **Works** — persists in localStorage, hero + CTA swap between traveller/shopper. |

## 1.5 Third-party services

| Service | SDK installed | Env wired | Actually called |
|---|---|---|---|
| Clerk (auth) | ✅ | needs keys | ✅ layout + middleware + webhook |
| Supabase/Postgres (db) | ✅ (drizzle/postgres) | `DATABASE_URL` | ✅ via Drizzle |
| Stripe (escrow) | ❌ stub | placeholder | ❌ (deferred, intentional) |
| Resend (email) | ❌ stub | placeholder | ❌ (deferred, intentional) |
| PostHog (analytics) | ❌ stub | placeholder | ❌ (deferred; note `@vercel/analytics` **is** wired in layout) |
| svix (webhook verify) | ✅ | `CLERK_WEBHOOK_SECRET` | ✅ |

## 1.6 Known issues from prior sessions — reconciled

1. Homepage doesn't explain concept for buyers → **FIXED.** `HowItWorks` has both sides;
   shopping-mode hero speaks to buyers ("Get anything from anywhere").
2. Mode toggle only changes a label → **FIXED.** Hero text + CTAs actually change.
3. Browse page has no CTA for buyers → **Partially fixed.** Trip cards link to detail;
   detail has "Request item". No inline CTA on the browse grid itself.
4. Trip detail shows no requests / no accept-decline → **FIXED.** Full requests list +
   owner accept/decline.
5. Dashboard pulls from mock → **FIXED.** Now real DB.
6. No notifications → **Still true** (Resend deferred — out of scope for now).

### Real remaining gaps (what the daily plan targets)
- **G1 — Data layer split:** `/`, `/trips`, `/profile` still read `lib/mock-data`. Posted
  trips don't surface. Requires the type reconciliation in 1.2 first.
- **G2 — Homepage missing trust signals + recent-matches section** (prompt Priority 2).
- **G3 — Clerk webhook** missing `user.updated` / `user.deleted`.
- **G4 — Matches** API + queries are mock; `matches` table unused.
- **G5 — No Drizzle migrations** generated/pushed.
- **G6 — No `.env.local`**; env vars undocumented in-repo.
- **G7 — Node modules not installed** in this checkout (blocks build/typecheck until `npm install`).
