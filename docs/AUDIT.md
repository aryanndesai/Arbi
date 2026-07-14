# Arbi — Codebase Audit

_Last updated: 2026-07-14. This is a read-only snapshot of what actually exists in the repo, checked file by file. It maps to Section 1 of the build prompt._

Arbi is a peer-to-peer cross-border shopping marketplace: travelers post trips, buyers attach item requests, travelers earn a courier fee, the platform takes a cut.

**Headline:** the app is much further along than the "known issues from prior sessions" suggest. Most of those six issues are already fixed. The real problem now is a **split data layer** — some pages read the live database and others still read hardcoded mock data, so the app looks inconsistent depending on where you are.

---

## 1.1 Project structure

| Thing | Value |
| --- | --- |
| Framework | Next.js **16.2.4**, App Router |
| React | 19.2.4 |
| Package manager | **npm** (package-lock.json present) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Language | TypeScript 5 (strict, path alias `@/*`) |
| ORM | Drizzle ORM 0.45 over `postgres-js` |
| Auth | Clerk `@clerk/nextjs` 7 |
| Analytics | `@vercel/analytics` (installed + wired) |
| 3D globe | `react-globe.gl` + `three` |

### Folders
- `app/` — App Router pages and API routes
- `components/` — shared UI components
- `db/` — Drizzle schema, client, and query functions
- `lib/` — mock data, service stubs, helpers, mode hook
- `types/` — shared TypeScript types
- `public/` — static SVGs

### Page routes under `app/`
| Route | Renders | Data source |
| --- | --- | --- |
| `/` | Home: hero, globe, How-it-works, featured trips | **mock** (`lib/mock-data`) |
| `/trips` | Browse trips with country filter | **mock** |
| `/trips/[id]` | Trip detail + attached requests + accept/decline | **DB first, mock fallback** |
| `/dashboard` | My trips / My requests tabs | **real DB** |
| `/post-trip` | Form to create a trip (POST /api/trips) | writes to **real DB** |
| `/post-request/[tripId]` | Form to attach a request | reads trip from **mock**, posts to DB |
| `/profile/[id]` | Public user profile | **mock** |
| `/sign-in/[[...sign-in]]` | Clerk sign-in | Clerk |
| `/sign-up/[[...sign-up]]` | Clerk sign-up | Clerk |

### API routes under `app/api/`
| Route | Methods | What it does |
| --- | --- | --- |
| `/api/trips` | GET (public), POST (auth) | list trips w/ traveler join; create trip |
| `/api/trips/[id]` | GET | single trip w/ requests |
| `/api/requests` | GET (auth), POST (auth) | user's requests; create request |
| `/api/requests/[id]/status` | PATCH (auth) | accept/decline — owner only, 403 otherwise |
| `/api/matches` | (see file) | matches |
| `/api/user/[id]` | GET | user lookup |
| `/api/webhooks/clerk` | POST | svix-verified Clerk sync |

### Components (all imported / used)
`ChatWidget` (layout), `GlobeInner` + `MapWrapper` + `HeroSection` + `HowItWorks` (home), `ModeToggle` + `Navbar` (global), `TripCard` + `TripCardSkeleton` (grids), `RequestActions` (trip detail).

### lib / types exports
- `lib/mock-data.ts` — seed users/trips/requests/matches + async getters (still used by 4 pages)
- `lib/use-mode.ts` — `useMode()` / `setMode()` via `useSyncExternalStore` + localStorage
- `lib/country-style.ts` — `getCountryFlag()` helper
- `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts`, `lib/supabase.ts` — **stubs** (throw if env missing, no real client)
- `types/index.ts` — `UserMode`, `RequestStatus`, `TripStatus`, `MatchStatus`, `User`, `Trip`, `ItemRequest`, `Match`

### Orphan files
None found. Every component and lib helper is imported somewhere. The four service stubs are intentionally unused (future work).

---

## 1.2 Database

- **Supabase / Postgres:** connected via `DATABASE_URL` and `postgres-js` in `db/index.ts` (throws if the var is missing). Note: the code talks to Postgres **directly through Drizzle**, not through `@supabase/supabase-js` — `lib/supabase.ts` is an unused stub.
- **Drizzle:** set up. `drizzle.config.ts` points at `db/schema.ts`, dialect postgresql, out `./drizzle`.
- **Migrations:** ⚠️ **no `drizzle/` output folder exists** — `drizzle-kit generate` / `push` has not been committed. Schema-to-DB sync is unverified in the repo.

### Tables in `db/schema.ts`
| Table | Key columns |
| --- | --- |
| `users` | id (text = Clerk id), email, fullName, avatarInitials, travelerRating, buyerRating, tripsCompleted, requestsCompleted, createdAt |
| `trips` | id (uuid), travelerId→users, fromCountry, toCountry, fromFlag, toFlag, departureDate, returnDate, capacityKg, status, createdAt |
| `itemRequests` | id (uuid), tripId→trips, buyerId→users, itemName, itemUrl, itemImageUrl, maxBudget, courierFee, status, createdAt |
| `matches` | id (uuid), requestId→itemRequests, tripId→trips, status, agreedPrice, courierFee, createdAt |
| `reviews` | id (uuid), matchId→matches, raterId→users, rateeId→users, rating, comment, createdAt |

**Schema differs from the prompt's Priority 3 spec** (naming, missing columns). See ROADMAP Day 5 for the reconciliation decision — do not blindly rename, existing routes depend on these names.

- `lib/mock-data.ts` holds 6 users, 3 requests, 6 trips, 1 match — still consumed by `/`, `/trips`, `/profile/[id]`, `/post-request/[tripId]`.

---

## 1.3 Authentication

- **Clerk:** `ClerkProvider` wraps the app in `app/layout.tsx`. ✅
- **middleware.ts:** protects `/dashboard`, `/post-trip`, `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and **POST-only** on `/api/trips` (GET stays public for browsing). ✅
- **Webhook:** `app/api/webhooks/clerk/route.ts` exists, verifies signatures with `svix`. ⚠️ **Only handles `user.created`** — `user.updated` and `user.deleted` are ignored (returns 200). Priority 1 in the prompt wants all three.
- **Server-side auth:** `auth()` from Clerk is used in API routes and in `/dashboard` + `/trips/[id]` server components. ✅

---

## 1.4 Core user flows

| Flow | Status | Notes |
| --- | --- | --- |
| a) Traveler posts a trip | ⚠️ **Partial** | Form works, POSTs to DB, redirects to dashboard. But the new trip **does not appear on `/` or `/trips`** because those read mock data. |
| b) Buyer browses + attaches request | ⚠️ **Partial** | Browse works (mock). Request form posts to real DB. But `/post-request/[tripId]` reads the trip from **mock**, so it only works for seeded trip ids, not real ones. |
| c) Traveler accepts/declines | ✅ **Works** | `/trips/[id]` shows `RequestActions` to the owner; PATCH enforces owner-only (403). Optimistic UI, no full reload. |
| d) Dashboard | ✅ **Works** | Reads real DB via `getTripsForUser` / `getRequestsForUser`, two tabs, empty states with CTAs. |
| e) Mode toggle | ✅ **Works** | `ModeToggle` persists to localStorage; `HeroSection` swaps hero copy + CTA for shopping vs travelling; toast confirms. |

---

## 1.5 Third-party services

| Service | SDK installed | Env wired | Actually called |
| --- | --- | --- | --- |
| Clerk | ✅ | needs keys | ✅ everywhere |
| Postgres/Supabase | ✅ (`postgres`, `drizzle-orm`) | `DATABASE_URL` | ✅ via Drizzle |
| `@supabase/supabase-js` | ❌ | stub reads `NEXT_PUBLIC_SUPABASE_*` | ❌ stub only |
| Stripe | ❌ | stub reads `STRIPE_SECRET_KEY` | ❌ stub (later feature) |
| Resend | ❌ | stub reads `RESEND_API_KEY` | ❌ stub (later feature) |
| PostHog | ❌ | stub reads `NEXT_PUBLIC_POSTHOG_KEY` | ❌ stub (later feature) |
| Vercel Analytics | ✅ | none | ✅ in layout |
| svix | ✅ | `CLERK_WEBHOOK_SECRET` | ✅ in webhook |

---

## 1.6 Known issues from prior sessions — current status

1. **Homepage doesn't explain the concept for buyers** — ✅ **Fixed.** `HowItWorks` has separate For-Travelers / For-Buyers columns; shopping-mode hero says "Get anything from anywhere."
2. **Mode toggle only changes a label** — ✅ **Fixed.** Hero copy + CTAs genuinely swap by mode.
3. **Browse page has no clear CTA for buyers** — 🟡 **Partial.** Cards link to detail; the "Request item" CTA lives on the detail page, not the card. Could be stronger.
4. **Trip detail shows no requests / no accept-decline** — ✅ **Fixed.** Full requests list + owner accept/decline.
5. **Dashboard pulls from mock data** — ✅ **Fixed.** Now real DB.
6. **No notification system** — ❌ **Still missing.** Resend is a stub; travelers aren't told when a request arrives.

---

## Top risks, ranked

1. **Split data layer (highest impact).** `/` and `/trips` read mock; `/dashboard` and `/trips/[id]` read the DB. A real posted trip is invisible on the pages buyers actually browse. This makes the core loop look broken to a new user even though each piece works.
2. **`/post-request/[tripId]` reads the trip from mock** — real trip ids 404 or mismatch.
3. **Webhook only handles `user.created`** — profile edits and deletions drift out of sync.
4. **No committed migrations** — DB schema state is unverified; `drizzle-kit generate/push` needs to run.
5. **No `/api/dashboard` route** — the dashboard queries the DB directly in the server component. Works, but diverges from the prompt's Priority 4 (acceptable; document the decision).
6. **Schema naming diverges from the prompt spec** — decide once whether to migrate or keep. Keeping is lower-risk.
