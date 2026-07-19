# Arbi — Daily Build Plan

_A sequenced, testable breakdown of the seven build priorities into day-sized
chunks. Each day is small enough to finish, ends in something you can click,
and has an explicit "Test" and "Done when" so nothing is hand-wavy._

Legend: ☐ not started · ◐ in progress · ☑ done
Update the boxes as you go and log every change in `docs/CHANGELOG.md`.

> Reality check: much of the original prompt is already built (see
> `docs/AUDIT.md`). This plan focuses on the **real** remaining gaps and orders
> them so each day builds on the last. Days 1–2 unblock everything by making the
> app run on real data.

---

## Day 0 — Environment & guardrails (½ day)

- ☐ `npm install` and confirm `npm run dev` boots.
- ☐ Create `.env.local` from `docs/ENV.md` (real Clerk + `DATABASE_URL`, placeholders for the rest).
- ☐ `npx drizzle-kit push` to sync schema to the Postgres/Supabase DB.
- ☐ Read `node_modules/next/dist/docs/` for App Router + route-handler conventions (AGENTS.md rule).
- **Test:** home page loads, `/dashboard` redirects to sign-in when signed out.
- **Done when:** app runs locally against a real DB with no thrown env errors.

## Day 1 — Seed the DB, retire the mock fallback on trip detail

- ☐ Write `db/seed.ts` that inserts a handful of users + trips + requests (mirror `lib/mock-data.ts` so demos still look full).
- ☐ Add `getTripById` buyer join: return `buyerName` / `buyerInitials` / `buyerRating` alongside each request (fixes the `?` avatars).
- ☐ Remove the mock fallback branch in `app/trips/[id]/page.tsx` once seed data exists (keep it behind a check if you want dev safety).
- **Test:** open a seeded trip as its owner → requests list shows real buyer names + working Accept/Decline.
- **Done when:** trip detail is 100% real-DB with correct buyer display.

## Day 2 — Cut the remaining mock cords

- ☐ `/` homepage: replace `getTrips`/`getDestinationCountries` from `lib/mock-data` with `db/queries` equivalents (add `getDestinationCountries` to queries).
- ☐ `/trips`: same swap + keep the country filter working against DB rows.
- ☐ `/post-request/[tripId]`: look the trip up from the DB, not mock (fixes 404 on real trip ids).
- ☐ `/profile/[id]`: pull the user + their trips/requests from DB.
- **Test:** post a brand-new trip via `/post-trip`, then find it on `/` and `/trips`, open it, attach a request.
- **Done when:** nothing imports `lib/mock-data` except the optional seed script. `grep -r mock-data app` is empty.

## Day 3 — Webhook completeness + user sync

- ☐ `app/api/webhooks/clerk/route.ts`: handle `user.updated` (update email/name/initials) and `user.deleted` (soft delete or remove).
- ☐ Add `updateUser` / `deleteUser` to `db/queries.ts`.
- ☐ Print the webhook URL + event list to paste into the Clerk dashboard (see bottom of this file).
- **Test:** edit your Clerk profile → row updates; delete a test user → row handled.
- **Done when:** all three Clerk lifecycle events sync correctly.

## Day 4 — API consolidation & pagination

- ☐ `GET /api/dashboard` — one call returning the auth user's trips (with pending-request counts) + requests.
- ☐ `GET /api/trips` — add `?page`/`?limit` pagination + traveler join (already joined).
- ☐ Confirm every write route has try/catch + correct status codes (400/401/403/404/500). Most already do — audit the two that don't return granular codes.
- **Test:** hit each endpoint with curl signed-in and signed-out; verify status codes.
- **Done when:** dashboard data comes from one endpoint; trips list paginates.

## Day 5 — Dashboard polish

- ☐ "My Trips" tab: show a **pending-request count badge** per trip (needs the count from Day 4).
- ☐ Make trip rows visibly clickable (they already link) + add hover affordance already present.
- ☐ Empty states already exist — verify copy matches mode.
- **Test:** a trip with 2 pending requests shows "2 pending".
- **Done when:** dashboard reflects real activity counts.

## Day 6 — Accept flow creates a match

- ☐ On accept in `PATCH /api/requests/[id]/status`, insert a `matches` row (request + trip, `agreedPrice`, `courierFee`, status `active`).
- ☐ Surface matches somewhere minimal (dashboard "Active" or trip detail).
- **Test:** accept a request → a `matches` row exists.
- **Done when:** accepting produces a match; matches table is no longer dead.

## Day 7 — Homepage trust + recent matches (UI day)

- ☐ Add a **trust-signals row**: Escrow payments · Verified travelers · Money-back guarantee (icon + label + one line each).
- ☐ Add a **recent matches** strip (seeded/placeholder is fine): "Alyssa brought a Tabi flat from Paris 🇫🇷 → 🇸🇬".
- ☐ Make `/trips` react to mode (shopping vs travelling framing) for consistency.
- **Test:** homepage tells a buyer and a traveler, at a glance, what Arbi is and why it's safe.
- **Done when:** the "known issue #1" is fully closed. Follow `docs/UI_GUIDELINES.md`.

## Day 8 — Type reconciliation & cleanup (tech debt)

- ☐ Align `types/index.ts` with Drizzle inferred types (or split "DB row" vs "view model" explicitly) to remove the `RawTrip` mapping in trip detail.
- ☐ Delete `lib/mock-data.ts` (or move to `db/seed.ts`) once nothing imports it.
- ☐ Run `npm run build` clean; fix any `any` leaks.
- **Done when:** build is green, no `any`, mock file gone.

---

## Clerk dashboard setup (needed on Day 0/3)

**Webhook endpoint URL** (Clerk → Webhooks → Add Endpoint):

```
https://<your-domain>/api/webhooks/clerk
```

For local testing use an ngrok/Clerk-provided tunnel:
`https://<tunnel>.ngrok.app/api/webhooks/clerk`

**Events to subscribe to:**

- `user.created`
- `user.updated`
- `user.deleted`

Copy the endpoint's **Signing Secret** into `.env.local` as
`CLERK_WEBHOOK_SECRET`.

---

## Working rules (from the prompt's coding rules)

- Match existing style: Tailwind, `@/` imports, server components by default.
- **No `any`.** Define interfaces for API responses.
- Human-sounding comments. **No em dashes in code comments.**
- Don't install packages that already exist; don't add Stripe/Resend/PostHog yet.
- Every API write route: try/catch + proper HTTP codes.
- After each day, note what to test manually + expected behaviour (done above).
