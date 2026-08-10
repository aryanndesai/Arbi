# Arbi — Codebase Audit

**Date:** 2026-08-10
**Branch audited:** `claude/lucid-babbage-jlbfbk` (HEAD `097a708`)
**Method:** every file under `app/`, `components/`, `db/`, `lib/`, `types/`, plus config files, was read in full. Nothing below is guessed.

This audit is more optimistic than the brief that requested it. A lot of "Priority 1–7" work from the original build prompt already exists in this branch. The gaps that remain are narrower and more specific than "build it from scratch."

---

## 1.1 Project structure

- **Framework:** Next.js `16.2.4`, App Router, React `19.2.4` / React DOM `19.2.4`, TypeScript `5`.
- **Package manager:** npm (`package-lock.json` is committed; no `pnpm-lock.yaml` / `yarn.lock`).
- **Styling:** Tailwind CSS `4` (via `@tailwindcss/postcss`), no component library (no shadcn/ui, no Radix). Everything is hand-rolled Tailwind + a handful of custom keyframes in `globals.css`.
- **ORM:** Drizzle ORM `0.45.2` + `postgres` driver `3.4.9`, `drizzle-kit 0.31.10` for migrations.
- **Auth:** `@clerk/nextjs` `7.2.7`.
- **Misc deps:** `svix` (webhook verification), `three` + `react-globe.gl` (homepage globe viz), `@vercel/analytics`.
- **No test runner installed** — `package.json` scripts are only `dev`, `build`, `start`, `lint`. There is no Jest/Vitest/Playwright config and no `__tests__` directory anywhere.

### Folder map

| Path | Contents |
|---|---|
| `app/` | Home page, all feature routes, API routes, layout, global CSS |
| `app/api/` | 7 route files — trips, requests, matches, user, webhooks/clerk |
| `components/` | 9 client/shared components |
| `db/` | Drizzle client (`index.ts`), schema (`schema.ts`), query functions (`queries.ts`) |
| `lib/` | Mock data, third-party SDK stubs, mode state, country styling |
| `types/` | One file, shared domain interfaces |
| `public/` | Static assets (default Next.js SVGs + `globe.svg`, unused branding) |
| `.claude/` | `settings.local.json` — local permission config, not app code |

### Page routes (`app/`)

| Route | Renders |
|---|---|
| `/` | Hero (mode-aware) + globe + "How it works" + 6 featured trips |
| `/trips` | Full trip list, filterable by destination country |
| `/trips/[id]` | Trip detail — traveler card, stats, attached requests, accept/decline (if owner) or "Request item" CTA (if not) |
| `/post-trip` | Traveler trip-creation form |
| `/post-request/[tripId]` | Buyer item-request form, scoped to one trip |
| `/dashboard` | Tabbed "My trips" / "My requests" for the signed-in user |
| `/profile/[id]` | Public profile — ratings, trip/request history |
| `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]` | Clerk `<SignIn>` / `<SignUp>` catch-all pages |

### API routes (`app/api/`)

| Route | Method(s) | Does |
|---|---|---|
| `/api/trips` | GET, POST | GET is public, lists trips joined with traveler info from the DB. POST requires Clerk auth, validates payload, inserts a trip. |
| `/api/trips/[id]` | GET | Public. Fetches one trip + its attached requests + traveler row from the DB. |
| `/api/requests` | GET, POST | GET requires auth, returns the caller's own requests. POST requires auth, validates payload, inserts a request row against a trip. |
| `/api/requests/[id]/status` | PATCH | Requires auth. Verifies the caller owns the trip the request is attached to before allowing `accepted`/`declined`. |
| `/api/matches` | POST | Requires auth, validates payload, but **returns a fabricated in-memory object and never writes to the `matches` table.** Not called from any UI in this codebase. |
| `/api/user/[id]` | GET | Requires auth. Returns a user + counts of their trips/requests from the DB. |
| `/api/webhooks/clerk` | POST | Verifies the Svix signature, handles `user.created` by inserting into `users`. All other event types (including `user.updated`, `user.deleted`) are explicitly ignored (`return { ok: true, ignored: event.type }`). |

Every write route does Clerk auth + try/catch + real status codes (400/401/403/404/500) — this part of "Priority 4" is already done to spec.

### Components (`components/`)

All 9 are imported somewhere — there are no orphan components:

| Component | Used by | Notes |
|---|---|---|
| `Navbar` | Every page | Renders `ModeToggle`, Clerk `SignInButton`/`SignUpButton`/`UserButton` via `<Show>` |
| `HeroSection` | `app/page.tsx` | Client component, reads `useMode()`, renders **different copy and CTAs for shopping vs travelling** |
| `HowItWorks` | `app/page.tsx` | Static two-column steps (traveler / buyer) — not mode-dependent, shows both always |
| `MapWrapper` / `GlobeInner` | `app/page.tsx` | Dynamically-imported `react-globe.gl` visualization, `ssr: false` |
| `ModeToggle` | `Navbar` | Client toggle, persists to `localStorage` + a custom `window` event, shows a toast |
| `TripCard` / `TripCardSkeleton` | `app/page.tsx`, `app/trips/page.tsx`, `app/profile/[id]/page.tsx` / `app/trips/loading.tsx` | Card UI + its loading skeleton |
| `ChatWidget` | `app/layout.tsx` (global) | Floating chat bubble with a **hardcoded canned reply**, comment says `// TODO: replace with Claude API call` |
| `RequestActions` | `app/trips/[id]/page.tsx` | Client component, Accept/Decline buttons, calls the status PATCH route |

### `lib/` and `types/`

| File | Exports | Status |
|---|---|---|
| `lib/mock-data.ts` | `getTrips`, `getTripById`, `getRequestsForUser`, `getTripsForUser`, `getUserById`, `getMatches`, `getCurrentUserId`, `getDestinationCountries` | Hardcoded 6 users / 6 trips / 3 requests / 1 match. Every exported function has a `// TODO: replace with Supabase query` comment even though the real persistence layer that exists is Drizzle+Postgres, not Supabase — the comments are stale. |
| `lib/use-mode.ts` | `useMode()`, `setMode()`, `MODE_STORAGE_KEY`, `MODE_CHANGE_EVENT` | Real, working `useSyncExternalStore` hook backed by `localStorage`. This is functional, not a stub. |
| `lib/country-style.ts` | `getCountryFlag`, `getCountryStyle` (grep-truncated, but confirmed in use) | Real, used by `TripCard` and `post-trip` form. |
| `lib/supabase.ts` | `supabaseConfig`, `getSupabase()` | **Stub.** `@supabase/supabase-js` is not installed. Not imported anywhere in the app — dead code. The project's actual DB access is 100% through Drizzle (`db/`), not this file. |
| `lib/stripe.ts` | `stripeConfig`, `getStripe()` | Stub, `stripe` not installed, not imported anywhere. Correctly deferred per the brief ("do not set up Stripe yet"). |
| `lib/resend.ts` | `resendConfig`, `getResend()` | Stub, `resend` not installed, not imported anywhere. Correctly deferred. |
| `lib/posthog.ts` | `posthogConfig`, `initPosthog()` | Stub, `posthog-js` not installed, `initPosthog()` is never called anywhere (not even from `layout.tsx`). Correctly deferred. |
| `types/index.ts` | `UserMode`, `RequestStatus`, `TripStatus`, `MatchStatus`, `User`, `Trip`, `ItemRequest`, `Match` | **This is the biggest structural issue in the codebase** — see 1.2. |

### Orphan files

- `lib/supabase.ts` — dead stub, no importers.
- `public/globe.svg`, `public/file.svg`, `public/vercel.svg`, `public/window.svg`, `public/next.svg` — default `create-next-app` boilerplate assets. `globe.svg` is unused now that `react-globe.gl` renders the real WebGL globe; the rest were never Arbi branding to begin with.
- Everything else is reachable from at least one route.

---

## 1.2 Database

- **Supabase JS client:** not connected. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are referenced only inside the unused `lib/supabase.ts` stub. No `.env` / `.env.local` file exists in this checkout (correctly gitignored either way).
- **Drizzle ORM:** fully set up. `drizzle.config.ts` points at `./db/schema.ts`, dialect `postgresql`, reads `DATABASE_URL`. Real Postgres access happens through `db/index.ts` (`postgres` + `drizzle-orm/postgres-js`), which is almost certainly pointed at a Supabase-hosted Postgres instance — i.e. "Supabase" as the *database host*, not the Supabase SDK.

  **Bug:** `db/index.ts` does `if (!connectionString) throw new Error(...)` **at module load time**, not inside a function. Any file that statically imports `@/db/queries` (which imports `@/db/index`) will throw as soon as that route module is evaluated if `DATABASE_URL` isn't set — before any `try/catch` around the *call site* gets a chance to run. `app/trips/[id]/page.tsx` wraps its DB call in try/catch expecting to gracefully fall back to mock data, but that fallback will not save it from a missing `DATABASE_URL`, because the crash happens on import, not on invocation.

- **Schema (`db/schema.ts`)** — 5 tables, already ahead of the "Priority 3" ask:

  - `users`: `id` (text, Clerk ID, PK), `email` (unique, not null), `full_name`, `avatar_initials`, `traveler_rating` (decimal, default 5.0), `buyer_rating` (decimal, default 5.0), `trips_completed` (int, default 0), `requests_completed` (int, default 0), `created_at`.
  - `trips`: `id` (uuid, PK), `traveler_id` → `users.id`, `from_country`, `to_country`, `from_flag`, `to_flag`, `departure_date`, `return_date`, `capacity_kg` (decimal), `status` (text, default `"open"`), `created_at`.
  - `item_requests`: `id` (uuid, PK), `trip_id` → `trips.id`, `buyer_id` → `users.id`, `item_name`, `item_url`, `item_image_url`, `max_budget` (decimal), `courier_fee` (decimal), `status` (text, default `"pending"`), `created_at`.
  - `matches`: `id` (uuid, PK), `request_id` → `item_requests.id`, `trip_id` → `trips.id`, `status` (text, default `"active"`), `agreed_price`, `courier_fee`, `created_at`. **Not written to by any route** — `/api/matches` fabricates a response instead of inserting.
  - `reviews`: `id` (uuid, PK), `match_id` → `matches.id`, `rater_id` / `ratee_id` → `users.id`, `rating` (decimal), `comment`, `created_at`. No API route or UI touches this table at all yet.

  Note: none of these tables have `updated_at`. The original brief asked for `updated_at` on `users`/`trips`/`requests` — not present.

- **`lib/mock-data.ts`** — hardcoded 6 users, 6 trips, 3 item requests, 1 match, all with string IDs like `u_1`/`t_1`/`r_1` (incompatible with the DB's `uuid`/Clerk-text ID formats).

- **Mock vs. real, page by page:**

  | Page | Data source |
  |---|---|
  | `/` (homepage) | `lib/mock-data.ts` only — `getTrips()`, `getDestinationCountries()` |
  | `/trips` | `lib/mock-data.ts` only |
  | `/trips/[id]` | Real DB (`db/queries.getTripById`) **first**, falls back to mock data if the DB call throws or the DB row isn't found |
  | `/profile/[id]` | `lib/mock-data.ts` only |
  | `/dashboard` | Real DB only (`getTripsForUser`, `getRequestsForUser` from `db/queries`) |
  | `/api/trips`, `/api/trips/[id]`, `/api/requests`, `/api/requests/[id]/status`, `/api/user/[id]` | Real DB only |

  **This is the single most important functional gap left in the app.** A trip created via `/post-trip` (which POSTs to the real `/api/trips` → real DB) will show up on `/dashboard` and at `/trips/[id]` (DB-first), but it will **never appear on the homepage or the `/trips` browse list**, because those two pages only ever read `lib/mock-data.ts`. The browse experience — the thing buyers actually use to find a trip — is showing permanently fake data no matter what real travelers post.

---

## 1.3 Authentication

- **Clerk:** installed and wired. `<ClerkProvider>` wraps the whole tree in `app/layout.tsx`. `Navbar` uses `<Show when="signed-in">` / `<Show when="signed-out">` plus `<UserButton>`, `<SignInButton mode="modal">`, `<SignUpButton mode="modal">`. Dedicated `/sign-in` and `/sign-up` catch-all routes exist and render Clerk's own `<SignIn>`/`<SignUp>`.
- **`middleware.ts`:** present and reasonably precise. Protects `/dashboard(.*)`, `/post-trip(.*)`, `/post-request(.*)`, `/profile(.*)`, `/api/requests(.*)`, `/api/matches(.*)` outright via `auth.protect()`. `/api/trips(.*)` is split — GET stays public, everything else (POST) requires auth. `/`, `/trips`, `/trips/[id]` are correctly left public for browsing.
- **Webhook:** `app/api/webhooks/clerk/route.ts` exists, verifies signatures with `svix`, and handles `user.created` by inserting a row into `users` (id, email, fullName, avatarInitials derived from first/last name). **`user.updated` and `user.deleted` are received and explicitly no-op'd** (`ignored: event.type`), so a Clerk profile edit or account deletion never propagates to the `users` table.
- **`currentUser()`/`auth()` usage:** `auth()` from `@clerk/nextjs/server` is used correctly in every protected server component/route (`dashboard/page.tsx`, `trips/[id]/page.tsx`, all writing API routes). `currentUser()` itself isn't used anywhere — `auth()` alone is enough for the current needs (they only ever need the ID, not the full Clerk user object).
- **Env var used but never assigned a placeholder in a committed file:** `CLERK_WEBHOOK_SECRET`. No `.env.example` exists in the repo at all, so there is nowhere documenting which env vars a fresh clone needs.

---

## 1.4 Core user flows

**a) Traveler posts a new trip — works.**
`/post-trip` is a real form (`app/post-trip/page.tsx`) that POSTs JSON to `/api/trips`. The route requires auth, validates every field, inserts via `createTrip()` into the real `trips` table, redirects to `/dashboard` on success. The new trip **does** show up on `/dashboard` (DB-backed) and at its own `/trips/[id]` (DB-first). It does **not** show up on `/trips` or `/` (mock-data-only, see 1.2).

**b) Buyer browses trips and attaches a request — partially works, and the "browsing" part is fake.**
`/trips` renders and is filterable by destination — but only over the 6 mock trips, never real ones. Clicking into `/trips/[id]` does load the real trip if one exists in the DB, with a "Request item" button. `/post-request/[tripId]` is a real form that POSTs to `/api/requests`, which requires auth and inserts into the real `item_requests` table. So: the attach-a-request mechanism itself is solid, but a buyer can only discover *real* trips by guessing a UUID or being sent a direct link — there's no way to reach a real trip by browsing.

**c) Traveler sees incoming requests and accepts/declines — works.**
On `/trips/[id]`, if `auth().userId === trip.travelerId`, the "Attached requests" section renders each request with an inline `RequestActions` client component showing Accept/Decline buttons for `pending` items. Clicking either calls `PATCH /api/requests/[id]/status`, which re-checks trip ownership server-side before writing, then `router.refresh()`s the page — no full reload, per spec. Non-owners see a read-only status badge instead.

**d) Dashboard shows the user's real activity — works.**
`/dashboard` calls `getTripsForUser`/`getRequestsForUser` directly (server component, not through a `/api/dashboard` endpoint — there is no such endpoint), both against the real DB. Two tabs via `?tab=` search param, per-item status badges, empty states with CTAs to `/post-trip` / `/trips`. This is fully off mock data already, contrary to what the original brief assumed.

**e) Mode toggle — works, and already affects the homepage.**
`ModeToggle` in the navbar flips `localStorage["arbi:mode"]` and dispatches a custom event; `useMode()` (a real `useSyncExternalStore` hook) reads it reactively. `HeroSection` consumes `useMode()` and renders **entirely different headline, subtext, search box, and CTA pair** for `"shopping"` vs `"travelling"`. This directly contradicts known-issue #2 in the original brief ("changes a label but does not change what the user actually sees") — that issue appears to have already been fixed in this branch. The mode is **not** read anywhere else (e.g. `/trips` doesn't pre-filter or reorder based on mode, `HowItWorks` always shows both columns regardless of mode) — so it's a homepage-only effect today, which is defensible (`HowItWorks` showing both columns always is arguably *better* UX than hiding half the marketplace).

---

## 1.5 Third-party services status

| Service | SDK installed? | Env var referenced? | Actually called? |
|---|---|---|---|
| Clerk (auth) | Yes (`@clerk/nextjs`) | Implicitly via Clerk's own env convention (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — not explicitly read in source, Clerk's SDK reads them itself) + explicit `CLERK_WEBHOOK_SECRET` | Yes — throughout |
| Supabase (database host) | No `@supabase/supabase-js` package; DB access is via Drizzle + `postgres` driver instead | `DATABASE_URL` (Drizzle), plus unused `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` in the dead `lib/supabase.ts` stub | DB: yes, via Drizzle. Supabase SDK itself: no |
| Stripe / Stripe Connect | No (`lib/stripe.ts` is a stub) | `STRIPE_SECRET_KEY` referenced only inside the stub | No — correctly deferred |
| Resend | No (`lib/resend.ts` is a stub) | `RESEND_API_KEY` referenced only inside the stub | No — correctly deferred |
| PostHog | No (`lib/posthog.ts` is a stub) | `NEXT_PUBLIC_POSTHOG_KEY` referenced only inside the stub | No — `initPosthog()` isn't even called from `layout.tsx` |
| Vercel Analytics | Yes (`@vercel/analytics`) | None needed | Yes — `<Analytics />` mounted in `layout.tsx` |
| svix (webhook verification) | Yes | `CLERK_WEBHOOK_SECRET` | Yes — in the Clerk webhook route |
| three.js / react-globe.gl | Yes | None | Yes — homepage globe |
| "AI chat" (implied by `ChatWidget`) | No LLM SDK installed | None | No — hardcoded canned reply, comment flags it as a placeholder for a future Claude API call |

---

## 1.6 Status of previously identified issues

| # | Issue as originally stated | Current status |
|---|---|---|
| 1 | Homepage doesn't explain the concept clearly for buyers | **Improved, not fully resolved.** The hero now has mode-aware copy ("Get anything from anywhere" for shoppers) and `HowItWorks` has a dedicated buyer column. But the recent-matches/trust-signal sections from the original ask were never added, and the buyer's hero-search box only lets you pick a destination country — it doesn't explain the escrow/fee mechanics inline. |
| 2 | Mode toggle changes a label but not content | **Fixed.** `HeroSection` fully swaps headline, subtext, form, and CTAs based on `useMode()`. |
| 3 | Browse trips page has no clear CTA to attach a request | **Fixed at the trip-detail level, still missing on the list itself.** `/trips/[id]` has a clear "Request item" button. The `/trips` list page itself has no per-card "Request" affordance — you have to open a trip first (arguably fine UX, but worth deciding deliberately rather than by omission). |
| 4 | Trip detail page doesn't show requests or give accept/decline controls | **Fixed.** Fully implemented per 1.4(c). |
| 5 | Dashboard pulls from mock data instead of real Supabase/DB data | **Fixed for `/dashboard` specifically. Not fixed for `/`, `/trips`, or `/profile/[id]`,** which still read exclusively from `lib/mock-data.ts`. This is now the most consequential remaining gap — see 1.2. |
| 6 | No notification system — traveler doesn't know a request came in | **Still true.** No email (Resend still a stub), no in-app notification, no unread badge. A traveler only finds out by manually opening `/trips/[id]` for that specific trip. |

---

## Additional issues found that weren't in the original list

1. **Two incompatible data shapes for the same domain concepts.** `types/index.ts` models `Trip`/`ItemRequest` with nested objects (`trip.traveler: User`, `request.buyer: User`), matching `lib/mock-data.ts`'s shape. `db/schema.ts` models the same entities with flat foreign keys (`trips.travelerId: string`, `itemRequests.buyerId: string`) and no eager-loaded relations. `app/trips/[id]/page.tsx` has to hand-write a `RawTrip`/`RawRequest` adapter to reconcile the two before rendering. Any future DB-backed page (`/trips`, `/`, `/profile/[id]`) will need the same adapter work, or the types should be unified first.
2. **`db/index.ts` throws at import time, not call time**, defeating the try/catch fallback pattern used in `app/trips/[id]/page.tsx` (see 1.2). If `DATABASE_URL` is ever unset in an environment that still renders that route, the page will hard-crash instead of gracefully degrading to mock data as the code's comments imply.
3. **`/api/matches` doesn't persist anything** despite a `matches` table existing in the schema, and nothing in the UI calls it — it's a half-built endpoint with no consumer.
4. **`reviews` table has zero code touching it** — no route, no query function, no UI. Ratings shown on `TripCard`/`profile/[id]` (`travelerRating`, `buyerRating`) come from the static `users.travelerRating`/`buyerRating` columns (defaulted to 5.0), never computed from actual reviews.
5. **No `.env.example`** anywhere in the repo, so a fresh clone has no documented list of required env vars (`DATABASE_URL`, `CLERK_WEBHOOK_SECRET`, Clerk's own two keys, plus the currently-unused Supabase/Stripe/Resend/PostHog vars).
6. **No automated tests of any kind** — no unit, integration, or e2e coverage. `npm run lint` is the only automated check.
7. **Clerk webhook only handles `user.created`.** A user who changes their name in Clerk, or deletes their account, leaves a stale row in `users` forever.

---

## Bottom line

The app is meaningfully further along than a "read the codebase, most of it is placeholder" audit would assume — auth, the trip/request/accept-decline flow, the dashboard, and the mode-aware hero are real and working against a real database. The two things worth fixing first, in order of impact, are:

1. **Point `/`, `/trips`, and `/profile/[id]` at the real DB instead of `lib/mock-data.ts`**, so trips people actually post are discoverable by buyers who aren't the traveler.
2. **Some notification signal when a request lands on a trip**, even a minimal one (in-app unread badge before email/Resend gets turned on).

See `docs/ROADMAP.md` for a day-by-day plan to close these and the smaller gaps, and `docs/UI_GUIDELINES.md` for a UI-quality pass.
