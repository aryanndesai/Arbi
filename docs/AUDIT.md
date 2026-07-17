# Arbi Codebase Audit

Last updated: 2026-07-17

This is an honest, file-by-file snapshot of what actually exists in the repo, what
works end to end, and what is still a stub. It is the source of truth that
`ROADMAP.md` breaks into daily tasks.

Headline: the project is much further along than the original brief assumed. Most
of the "known issues from prior sessions" are already fixed. The remaining work is
mostly about making the data layer consistent (some pages still read mock data) and
finishing a few half-built pieces (the Clerk webhook, the matches API).

Baseline health on this date: `npm run build` passes, `eslint` passes, `tsc --noEmit`
passes.

---

## 1.1 Project structure

- **Framework:** Next.js `16.2.4`, App Router. React `19.2.4`.
  - Note: this is a newer Next than most training data. Read
    `node_modules/next/dist/docs/` before touching routing, params, or config.
    Route handler `params` are async (`Promise<{ id: string }>`) and already
    awaited across the codebase.
- **Package manager:** npm (there is a `package-lock.json`, no pnpm/yarn lockfile).
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`), plus custom keyframes
  and helper classes in `app/globals.css`.
- **ORM:** Drizzle (`drizzle-orm` + `postgres` driver). `drizzle-kit` for migrations.
- **Auth:** Clerk (`@clerk/nextjs` v7).
- **3D:** `react-globe.gl` + `three` for the homepage globe.

### Folders
- `app/` - App Router pages and API routes.
- `components/` - shared React components.
- `db/` - Drizzle client, schema, and query helpers.
- `lib/` - mock data, mode hook, and service-client stubs (supabase/stripe/resend/posthog).
- `types/` - shared TypeScript interfaces.
- `public/` - static SVGs from the create-next-app template.

### Page routes (`app/`)
| Route | Renders | Data source |
|---|---|---|
| `/` | Hero, globe, How-it-works, trust signals, recent matches, open trips | **mock** (`lib/mock-data`) |
| `/trips` | Browse trips with country filter | **mock** |
| `/trips/[id]` | Trip detail, attached requests, accept/decline | **real DB** with mock fallback |
| `/dashboard` | My trips / My requests tabs | **real DB** |
| `/post-trip` | Form to create a trip | posts to real API |
| `/post-request/[tripId]` | Form to attach a request | reads trip from **mock**, posts to real API |
| `/profile/[id]` | Public profile with trips/requests | **mock** |
| `/sign-in`, `/sign-up` | Clerk catch-all auth pages | Clerk |

### API routes (`app/api/`)
| Route | Methods | Status |
|---|---|---|
| `/api/trips` | GET (public), POST (auth) | works, hits real DB |
| `/api/trips/[id]` | GET (public) | works |
| `/api/requests` | GET (auth), POST (auth) | works |
| `/api/requests/[id]/status` | PATCH (auth, owner-only) | works, owner check present |
| `/api/user/[id]` | GET (auth) | works, returns user + stats |
| `/api/matches` | POST (auth) | **stub** - returns a fake object, no DB write |
| `/api/webhooks/clerk` | POST | **partial** - only `user.created` |

### Components (all imported somewhere)
`Navbar`, `ModeToggle`, `HeroSection`, `HowItWorks`, `TrustSignals` (new),
`RecentMatches` (new), `TripCard`, `TripCardSkeleton`, `MapWrapper`, `GlobeInner`,
`ChatWidget`. No orphan components.

### `lib/` and `types/`
- `lib/mock-data.ts` - hardcoded users/trips/requests/matches + async getters. Still
  the data source for `/`, `/trips`, `/profile`, and the `/post-request` trip lookup.
- `lib/use-mode.ts` - `useSyncExternalStore`-backed travelling/shopping mode, persisted
  to `localStorage`. Solid.
- `lib/country-style.ts` - maps a country to flag + tint/border classes.
- `lib/supabase.ts`, `lib/stripe.ts`, `lib/resend.ts`, `lib/posthog.ts` - **stubs**.
  Note: the app talks to Postgres through Drizzle directly, so `lib/supabase.ts` is
  effectively unused (Supabase is the hosting for the DB, not a client dependency).
- `types/index.ts` - `User`, `Trip`, `ItemRequest`, `Match`, plus `UserMode` and the
  status string unions. These describe the mock shape (nested `traveler`/`buyer`
  objects), which differs from the flat Drizzle row shape - see the mismatch note below.

### Orphan / dead code
- `lib/supabase.ts` is imported nowhere meaningful (the real client is Drizzle).
- `app/api/matches/route.ts` is not wired to any UI yet.

---

## 1.2 Database

- **Supabase:** used as the Postgres host. Connection is via `DATABASE_URL` and the
  `postgres` driver in `db/index.ts`, not the `@supabase/supabase-js` client. There is
  **no `.env` / `.env.local` committed** (correct), but also no `.env.example`, so the
  required vars are undocumented until now (see `docs/ENV.md`).
- **Drizzle:** configured (`drizzle.config.ts`, `db/schema.ts`). There is **no
  generated `drizzle/` migrations folder yet** - schema has never been pushed from this
  repo state.
- **Tables in schema:** `users` (id is Clerk text id), `trips`, `item_requests`,
  `matches`, `reviews`. This already exceeds the brief's minimum.
- **Mock vs real:** `db/queries.ts` (real) is used by `/dashboard` and `/trips/[id]`.
  `lib/mock-data.ts` (fake) is used by `/`, `/trips`, `/profile`, `/post-request`.

### Type-shape mismatch (important)
`types/index.ts` models nested objects (`Trip.traveler`, `ItemRequest.buyer`) with
numeric fields, matching the mock data. The Drizzle rows are flat (`travelerId`,
decimals returned as strings). `TripCard` and `/profile` currently rely on the nested
mock shape, so swapping them to real queries needs a mapping layer, not a find/replace.

---

## 1.3 Authentication

- **Clerk:** `ClerkProvider` wraps the app in `app/layout.tsx`. `SignInButton`,
  `SignUpButton`, `UserButton`, and `Show` are used in the Navbar.
- **Middleware:** `middleware.ts` uses `clerkMiddleware`. Protects `/dashboard`,
  `/post-trip`, `/post-request`, `/profile`, `/api/requests`, `/api/matches`, and POST
  (but not GET) on `/api/trips`. Matches the brief.
- **Webhook:** `app/api/webhooks/clerk/route.ts` exists, verifies signatures with svix,
  and inserts a `users` row on `user.created`. **`user.updated` and `user.deleted` are
  not handled** (returns 200 and ignores them).
- **currentUser/auth usage:** `auth()` is used in server components (`/dashboard`,
  `/trips/[id]`) and every write API route.

---

## 1.4 Core user flows

- **a) Traveler posts a trip:** WORKS. `/post-trip` form -> `POST /api/trips` -> Drizzle
  insert -> redirect to `/dashboard`. `/dashboard` reads real DB, so it will show up.
  (`/trips` reads mock, so a newly posted trip will NOT appear on Browse yet.)
- **b) Buyer attaches a request:** PARTIAL. Browse and trip detail are reachable. The
  "Request item" CTA on `/trips/[id]` links to `/post-request/[tripId]`, which posts to
  `POST /api/requests` (real DB). But `/post-request` looks the trip up from **mock**, so
  it only resolves for the seeded mock trip ids.
- **c) Traveler accepts/declines:** WORKS. On `/trips/[id]` the owner sees `RequestActions`
  (Accept/Decline) which call `PATCH /api/requests/[id]/status` with an owner check, then
  `router.refresh()`.
- **d) Dashboard:** WORKS and uses real Supabase data (not mock). Two tabs, empty states,
  clickable trip rows.
- **e) Mode toggle:** WORKS. `ModeToggle` writes to `localStorage`; `HeroSection`
  re-renders buyer vs traveler hero copy/CTA via `useMode()`. Currently only the hero
  reacts; other pages do not change with mode (acceptable, documented as a future task).

---

## 1.5 Third-party services

| Service | SDK installed | Env vars | Actually called |
|---|---|---|---|
| Clerk | yes | needs keys | yes (provider, middleware, webhook) |
| Supabase (as Postgres host) | via `postgres` driver | `DATABASE_URL` | yes (Drizzle) |
| Stripe | no | `STRIPE_SECRET_KEY` (stub) | no - stub only |
| Resend | no | `RESEND_API_KEY` (stub) | no - stub only |
| PostHog | no | `NEXT_PUBLIC_POSTHOG_KEY` (stub) | no - stub only |
| Vercel Analytics | yes | none | yes (`<Analytics/>` in layout) |
| svix | yes | `CLERK_WEBHOOK_SECRET` | yes (webhook verify) |

Per the brief, Stripe/Resend/PostHog are intentionally deferred.

---

## 1.6 Status of the six "known issues"

1. Homepage does not explain the concept for buyers - **FIXED.** `HowItWorks` has a
   dedicated buyer column; trust signals + recent matches added 2026-07-17.
2. Mode toggle only changes a label - **FIXED.** Hero copy and CTA change with mode.
3. Browse page has no clear CTA for buyers - **PARTIAL.** Trip detail has a clear
   "Request item" CTA; the browse grid itself relies on card click-through.
4. Trip detail does not show requests / accept-decline - **FIXED.**
5. Dashboard pulls from mock data - **FIXED.** Dashboard uses real DB.
6. No notification system - **STILL OPEN.** Deferred (needs Resend, out of current scope).

---

## Top remaining gaps (feeds the roadmap)

1. **Data-source split.** `/`, `/trips`, `/profile`, `/post-request` still read mock
   data while `/dashboard` and `/trips/[id]` read the real DB. This is the single
   biggest inconsistency. Needs a mock->DB migration plus a row->view mapping layer.
2. **Clerk webhook is incomplete** (`user.updated` / `user.deleted` missing).
3. **No generated migrations** and no documented env vars (added `docs/ENV.md`).
4. **`/api/matches` is a stub** that returns fake data.
5. **`lib/supabase.ts` is dead code** given the Drizzle setup - decide keep or remove.
6. **Notifications** (issue 6) remain out of scope until Resend is added.
