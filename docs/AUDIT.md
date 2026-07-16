# Arbi Codebase Audit

_Last updated: 2026-07-16. Read-only audit. No code was changed to produce this._

Arbi is a peer-to-peer cross-border shopping marketplace. Travelers post trips, buyers
attach item requests, travelers earn a courier fee, the platform takes a cut.

**Headline finding:** the app is much further along than the original brief assumes. Most of
the "features to build" (Section 2 of the brief) were already implemented in a prior session.
The real work left is (a) making the project actually runnable, (b) finishing the mock-to-real
data swap on the pages that still use `lib/mock-data.ts`, and (c) a short list of gaps.

---

## 1.1 Project structure

- **Framework:** Next.js `16.2.4`, App Router. React `19.2.4`. TypeScript `^5`. Tailwind CSS `v4`
  (via `@tailwindcss/postcss`). Note: this is a newer Next than most references assume, so check
  `node_modules/next/dist/docs/` before writing framework code (per `AGENTS.md`).
- **Package manager:** npm (`package-lock.json` present, no `pnpm-lock`/`yarn.lock`).
- **State in this environment:** `node_modules` is NOT installed and there is no `.env.local`.
  So the app cannot run or typecheck cleanly here yet. The TypeScript errors you see are all
  "cannot find module" from missing deps, not real code errors.

### Folders
- `app/` — App Router pages and API routes.
- `components/` — React components (client + server).
- `db/` — Drizzle schema, client, and query helpers (the real data layer).
- `lib/` — mock data, mode hook, country styling, and stub clients for third-party services.
- `types/` — shared TypeScript interfaces.
- `public/` — static SVGs.
- No `drizzle/` migrations folder exists yet (schema has never been generated/pushed).

### Page routes (`app/`)
| Route | Renders | Data source |
|---|---|---|
| `/` | Hero + globe + How it works + featured trips | **mock-data** |
| `/trips` | Browse trips with destination filter | **mock-data** |
| `/trips/[id]` | Trip detail, attached requests, accept/decline | DB first, **mock fallback** |
| `/post-trip` | Traveler posts a trip (client form -> POST /api/trips) | writes to DB |
| `/post-request/[tripId]` | Buyer attaches an item request | page context is **mock**, form writes to DB |
| `/dashboard` | My trips / My requests tabs | **real DB** (`db/queries`) |
| `/profile/[id]` | User profile + stats | **mock-data** |
| `/sign-in`, `/sign-up` | Clerk auth pages | Clerk |

### API routes (`app/api/`)
| Route | Methods | Notes |
|---|---|---|
| `/api/trips` | GET (public), POST (auth) | GET joins traveler; POST validates payload, links to Clerk `userId` |
| `/api/trips/[id]` | GET (public) | Returns trip + requests + traveler |
| `/api/requests` | GET (auth), POST (auth) | GET = my requests; POST attaches request to a trip |
| `/api/requests/[id]/status` | PATCH (auth) | Accept/decline; verifies caller owns the trip (403 otherwise) |
| `/api/matches` | POST (auth) | **Returns a fake in-memory match object, does not persist** |
| `/api/user/[id]` | GET (auth) | User + aggregate stats from DB |
| `/api/webhooks/clerk` | POST | svix-verified; **handles only `user.created`** |

Note: the brief asked for a `GET /api/dashboard` route. It does not exist; the dashboard page
queries the DB directly in a server component instead, which is a valid alternative.

### Components (`components/`) — all are imported/used
`Navbar`, `HeroSection`, `HowItWorks`, `ModeToggle`, `TripCard`, `TripCardSkeleton`,
`MapWrapper`, `GlobeInner` (react-globe.gl), `ChatWidget`. No orphan components.

### lib/ and types/
- `lib/mock-data.ts` — hardcoded 6 users, 6 trips, 3 requests, 1 match; async getters marked
  `// TODO: replace with Supabase query`.
- `lib/use-mode.ts` — travelling/shopping mode via `localStorage` + `useSyncExternalStore`. Works.
- `lib/country-style.ts` — flag + tint styling per country (used by TripCard, post-trip).
- `lib/supabase.ts`, `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` — **all stubs**,
  imported nowhere (0 imports each). Expected: those services are "later".
- `types/index.ts` — `UserMode`, `RequestStatus`, `TripStatus`, `MatchStatus`, and the UI-facing
  `User` / `Trip` / `ItemRequest` / `Match` interfaces (nested objects, numeric fields).

### Orphan files
`lib/supabase.ts`, `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` are unused stubs (by
design, for later). Everything else is wired up.

---

## 1.2 Database

- **Drizzle ORM:** set up. `drizzle.config.ts` points at `db/schema.ts`, dialect postgresql,
  uses `DATABASE_URL`. `db/index.ts` connects via `postgres-js` and throws if `DATABASE_URL`
  is unset.
- **Supabase:** connection is intended to run through Postgres directly (`DATABASE_URL`, i.e. the
  Supabase Postgres connection string). `lib/supabase.ts` is a stub and `@supabase/supabase-js`
  is not installed. So there is no Supabase *client* usage, only Drizzle-over-Postgres.
- **Schema tables:** `users` (id = Clerk text id), `trips`, `item_requests`, `matches`,
  `reviews`. Columns use `decimal` for money/ratings (returned as strings) and `date`/`timestamp`
  for dates. No `drizzle/` migrations generated, so the schema has likely never been pushed.
- **Mock data:** `lib/mock-data.ts` still powers `/`, `/trips`, `/profile/[id]`, the
  `/post-request/[tripId]` page context, and the fallback branch of `/trips/[id]`.

---

## 1.3 Authentication

- **Clerk:** installed (`@clerk/nextjs ^7`). `ClerkProvider` wraps the app in `layout.tsx`.
- **Middleware:** `middleware.ts` uses `clerkMiddleware`. Protects `/dashboard`, `/post-trip`,
  `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and `/api/trips` for non-GET.
  Public: `/`, `/trips`, `/trips/[id]`, and GET `/api/trips`.
- **Webhook:** `app/api/webhooks/clerk/route.ts` exists, verifies signatures with svix, and on
  `user.created` inserts a `users` row (id, email, fullName, initials). **`user.updated` and
  `user.deleted` are ignored** (returns 200 without acting).
- `auth()` from Clerk is used in API routes and the dashboard/trip-detail server components.

---

## 1.4 Core user flows

| Flow | Status | Notes |
|---|---|---|
| a) Traveler posts a trip | **Works** | Form at `/post-trip` -> POST `/api/trips` -> DB insert -> redirect to dashboard |
| b) Buyer browses + attaches request | **Works (mock browse)** | `/trips` lists from mock; detail -> "Request item" -> `/post-request/[id]` -> POST `/api/requests` -> DB |
| c) Traveler accepts/declines | **Works** | Owner sees `RequestActions` on `/trips/[id]`; PATCH updates status; ownership enforced |
| d) Dashboard | **Works (real DB)** | Two tabs, empty states, counts. Uses `db/queries`, not mock |
| e) Mode toggle | **Works** | localStorage-backed; homepage hero + CTA swap by mode. Other pages do not change by mode |

The main inconsistency: browse/homepage read from mock while dashboard/writes go to the real DB.
A trip posted through the form lands in the DB but will not appear on `/` or `/trips` until those
pages are switched to real queries.

---

## 1.5 Third-party services

| Service | SDK installed | Env vars | Actually called |
|---|---|---|---|
| Clerk (auth) | Yes | needs `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` | Yes |
| Postgres/Supabase (DB) | `drizzle-orm` + `postgres` yes; `@supabase/supabase-js` no | needs `DATABASE_URL` | Yes (via Drizzle) |
| Stripe (escrow) | No | `STRIPE_SECRET_KEY` (stub reads it) | No (stub) |
| Resend (email) | No | `RESEND_API_KEY` (stub) | No (stub) |
| PostHog (analytics) | No | `NEXT_PUBLIC_POSTHOG_KEY` (stub) | No (stub) |
| Vercel Analytics | Yes | none | Yes (`<Analytics />` in layout) |
| svix (webhook verify) | Yes | uses `CLERK_WEBHOOK_SECRET` | Yes |
| react-globe.gl / three | Yes | none | Yes (globe on homepage) |

---

## 1.6 Known issues from prior sessions — current status

1. Homepage unclear for buyers -> **FIXED.** `HowItWorks` shows both sides; shopping-mode hero
   uses buyer language ("Get anything from anywhere").
2. Mode toggle only changes a label -> **MOSTLY FIXED.** Homepage hero + CTA change by mode.
   Still open: only the homepage reacts to mode; `/trips` and other pages ignore it.
3. Browse page has no buyer CTA -> **PARTIAL.** Flow works via trip detail's "Request item".
   Trip cards themselves have no direct request CTA.
4. Trip detail has no requests / accept-decline -> **FIXED.** `RequestActions` with optimistic UI.
5. Dashboard pulls from mock -> **FIXED.** Dashboard uses `db/queries`.
6. No notification system -> **STILL OPEN.** No email/in-app notice when a request is attached.

---

## Prioritized gap list (what to actually do)

**P0 — make it runnable**
- Add `.env.local` with real values (see `docs/ENV.md` template once created).
- `npm install`, then `npx drizzle-kit generate` + `npx drizzle-kit push` to create tables.
- Confirm `npm run dev` boots and `npm run build` passes.

**P1 — finish mock-to-real swap** (the core inconsistency)
- Switch `/`, `/trips`, `/profile/[id]`, `/post-request/[tripId]` from `lib/mock-data` to
  `db/queries`. This requires reconciling the DB row shape (flat, string decimals, nullable
  traveler) with the UI `Trip`/`User`/`ItemRequest` interfaces (nested, numeric). Add a mapping
  layer in `db/queries.ts` or an adapter, and decide whether mock stays as a dev seed.

**P2 — close the small gaps**
- Webhook: handle `user.updated` and `user.deleted`.
- `/api/matches` persists to the `matches` table instead of returning a fake object.
- Optionally add `GET /api/dashboard` to match the brief.
- Seed script to load demo data into the real DB (replaces the visual role of mock).

**P3 — later (explicitly out of scope for now)**
- Notifications (Resend), payments/escrow (Stripe), analytics (PostHog). Keep stubs until then.

**Quality**
- No tests and no CI. Add a typecheck/lint/build gate. Consider a smoke test per flow.
