# Arbi — Codebase Audit

_Last updated: 2026-11-08 (after integrating all open branches)_

Arbi is a two-sided marketplace: travellers post trips with spare luggage
capacity, buyers attach item requests to those trips and pay a courier fee.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) + React 19 |
| Styling | Tailwind CSS v4 |
| Auth | Clerk (`@clerk/nextjs` v7) — route protection in `proxy.ts` |
| Database | Postgres (hosted on Supabase) via Drizzle ORM + `postgres-js` |
| User sync | Clerk webhook → `users` table (svix-verified) |
| Globe | `react-globe.gl` / three.js |
| Analytics | Vercel Analytics |
| Not wired yet | Stripe, Resend, PostHog, Supabase JS client — stubs in `lib/` |

## Structure

```
app/
  page.tsx                    Home: hero, globe, how-it-works, trust signals, recent matches, open trips
  trips/page.tsx              Browse + filter by destination
  trips/[id]/page.tsx         Trip detail; owner can accept/decline requests (RequestActions.tsx)
  post-trip/page.tsx          Post a trip (client form → POST /api/trips)
  post-request/[tripId]/      Attach an item request to a trip (→ POST /api/requests)
  dashboard/page.tsx          My trips / my requests
  profile/[id]/page.tsx       Public profile (no email shown)
  sign-in, sign-up            Clerk UI
  api/
    trips                     GET public list · POST create (auth)
    trips/[id]                GET public detail
    requests                  GET mine · POST create (auth)
    requests/[id]/status      PATCH accept/decline (trip owner only) — accepting creates a match
    matches                   POST record a match explicitly (trip owner only)
    user/[id]                 GET public profile + stats (auth)
    webhooks/clerk            user.created / user.updated / user.deleted
components/                   Navbar, HeroSection, GlobeInner/MapWrapper, HowItWorks,
                              TrustSignals, RecentMatches, TripCard(+Skeleton), ModeToggle, ChatWidget
db/                           schema.ts, queries.ts, index.ts (lazy client)
lib/                          validation.ts, user-sync.ts, country-style.ts, use-mode.ts, service stubs
proxy.ts                      Clerk route protection (Next 16 name for middleware)
```

## Data flow

Every page and API route reads and writes the same Postgres database through
`db/queries.ts`. There is no mock data path any more.

- **Users** are created by the Clerk webhook. As a safety net, `ensureUserRecord`
  (`lib/user-sync.ts`) creates the row from the Clerk session the first time a
  signed-in user posts a trip or request, so a missed or unconfigured webhook
  no longer causes foreign-key failures. `createUser` is an upsert, so webhook
  retries and races are harmless.
- **Trips** get their flag emoji derived server-side from the country name.
- **Requests** are rejected if the trip doesn't exist, isn't open, belongs to
  the requester, or the requester already has a request on it.
- **Accept / decline** is one-way: only a `pending` request can change, and
  accepting writes a `matches` row.
- **Emails stay private**: public endpoints and pages use `getPublicUserById`,
  which never selects the email column.
- **Malformed ids** (non-UUID) resolve to "not found" instead of a Postgres error.

## Branch integration (2026-11-08)

All 17 remote branches were reviewed. Code was integrated as follows:

| Branch | What it contributed | How |
|---|---|---|
| `claude/lucid-babbage-je4n2i` | Pages read from the DB instead of `lib/mock-data.ts`; `TripSummary`; buyer info on trip detail; `middleware.ts` → `proxy.ts` | merged |
| `claude/cool-carson-teamly` | Lazy DB client (build no longer needs `DATABASE_URL`); `TrustSignals` + `RecentMatches` on the home page | merged |
| `claude/stoic-fermat-ht5vwe` | Clerk webhook handles `user.updated` / `user.deleted`; `.env.example` | merged |
| `copilot/analyse-code-for-improvements` | Payload validation (http(s)-only URLs, date/number bounds) | ported into `lib/validation.ts`. Its `x-user-id` header auth was **not** taken: any client can forge that header, and main already uses Clerk |
| `claude/stoic-fermat-gi8ipk` | Alternative TrustSignals/RecentMatches | superseded by the `cool-carson-teamly` versions (same idea, SVG icons, "Sample" label) |
| `claude/friendly-maxwell-abWnH` | Earlier globe + Drizzle work | already in main via PR #1 and later commits; its Drizzle layer was replaced by main's |
| `vercel/install-vercel-web-analytics-6r28k8` | Vercel Analytics | already in main |
| the other 10 `claude/*` branches | Documentation only (audits, plans, UI notes) | consolidated into this `docs/` folder |

## Known gaps

- `RecentMatches` shows labelled sample data; switch it to a query on `matches`
  once there is real activity.
- Stripe escrow, Resend email, and PostHog are stubs only.
- `lib/supabase.ts` is unused (Drizzle talks to Postgres directly).
- No automated test suite yet; see `TESTING.md` for the manual checks.
