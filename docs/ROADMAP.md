# Arbi — Daily Roadmap

This breaks the remaining work from `docs/AUDIT.md` into small, single-day chunks. Each day is scoped to be built, tested manually, and committed in one sitting — small enough to review in one sitting too.

**Ground rule carried over from the original build brief:** don't start a day's code until the previous day's change has been tested and explicitly approved. One day = one reviewable change, not a backlog to blast through unattended. Each day ends with a "test this" note — do that before moving on.

Days are ordered by impact: the biggest user-facing gap (fake browse data) comes first, notifications next, then polish and the deferred integrations last.

---

### Day 1 — Kill the mock-data split on the browse surfaces
**Problem:** `/`, `/trips`, and `/profile/[id]` only ever read `lib/mock-data.ts` (audit §1.2). Real trips posted via `/post-trip` are invisible to anyone browsing.

- [ ] Extend `db/queries.ts` with whatever's missing to serve these three pages (e.g. a `getUserPublic(id)` that also returns their trips/requests for the profile page).
- [ ] Swap `app/page.tsx` and `app/trips/page.tsx` from `lib/mock-data` imports to the real `db/queries` functions.
- [ ] Swap `app/profile/[id]/page.tsx` the same way.
- [ ] Resolve the `types/index.ts` vs `db/schema.ts` shape mismatch (audit, "Additional issues" #1) — either adapt at the query layer (return the nested `traveler`/`buyer` shape `TripCard` already expects) or update `TripCard`/`HeroSection`/etc. to take flat DB rows. Pick one direction, don't do both.
- [ ] Decide what happens when the DB has zero real trips (fresh environment) — an empty state, not a crash.
- [ ] Fix the module-load-time throw in `db/index.ts` (audit, "Additional issues" #2) so a missing `DATABASE_URL` degrades gracefully instead of hard-crashing every DB-backed route.

**Test:** post a trip as user A while signed in. Sign out (or open an incognito window), load `/` and `/trips` — the trip you just posted should be visible without needing the direct link. Load `/profile/[id]` for user A and confirm their real trip shows up there too.

---

### Day 2 — Minimal in-app notification for incoming requests
**Problem:** a traveler has no way to know a request landed on their trip except by manually revisiting `/trips/[id]` (audit §1.6, issue #6). Resend/email is explicitly deferred — this day is about the smallest useful in-app signal, not email.

- [ ] Add a lightweight "pending requests" count somewhere always-visible for signed-in travelers — simplest version: a badge on the "Dashboard" nav link / `UserButton` menu item showing the count of `pending` requests across all their trips.
- [ ] Compute that count server-side in `Navbar` (or wherever it's cheapest) via a single query against `item_requests` joined to `trips` for the current user.
- [ ] On `/dashboard`, make the pending count per-trip actually visible in the "My trips" list (right now the dashboard shows trip status but not a live pending-requests count next to each trip).

**Test:** as buyer, attach a request to traveler A's trip. Sign in as traveler A — a badge/count should appear without them needing to already know which trip to check.

---

### Day 3 — Discoverability on `/trips`
**Problem:** the browse list itself has no way to act on a trip besides opening it (audit §1.6, issue #3 — partially open).

- [ ] Decide deliberately: does `/trips` get an inline "Request item" affordance per card, or does opening the trip stay the required step? (Recommendation: keep opening the trip as the step — it's where the traveler's rating and request list live — but make the `TripCard` CTA say "View & request" instead of the generic "View" so the action is explicit.)
- [ ] While in `TripCard`/`app/trips/page.tsx`: add a way to sort/filter by departure date, not just destination country, since real trips won't all be evenly spread across 6 hardcoded countries anymore.

**Test:** as a signed-out visitor, load `/trips`, filter by a country, and confirm the CTA on each card clearly signals what happens next.

---

### Day 4 — Clerk webhook completeness
**Problem:** only `user.created` is handled; `user.updated` and `user.deleted` are explicitly ignored (audit §1.3).

- [ ] Add a `user.updated` handler: update `email`/`fullName`/`avatarInitials` on the matching `users` row.
- [ ] Add a `user.deleted` handler: soft-delete (add a `deleted_at` column) rather than hard-delete, since `trips`/`item_requests`/`matches`/`reviews` all foreign-key into `users` and a hard delete would orphan or cascade-fail those rows.
- [ ] Update the Clerk dashboard webhook subscription to include `user.updated` and `user.deleted` (this is a dashboard config change, not code — note it in the PR description so whoever has Clerk dashboard access does it).
- [ ] Add a committed `.env.example` listing every env var the app reads (`DATABASE_URL`, `CLERK_WEBHOOK_SECRET`, Clerk's own `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY`, and the currently-unused `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY` — with a comment marking the last four as "not wired up yet").

**Test:** change your name in the Clerk-hosted account settings, confirm the `users` row updates. This one is hard to test without a real webhook endpoint reachable from Clerk — document the manual Clerk-dashboard steps needed to verify in a real deployment.

---

### Day 5 — `matches` and `reviews`: finish or remove
**Problem:** `/api/matches` fabricates a response and never writes to the DB; the `reviews` table has zero code touching it (audit, "Additional issues" #3–4). Half-built, uncalled code is worse than no code — it looks finished from the schema but silently isn't.

- [ ] Decide: is a `matches` row meant to be created automatically the moment a request is `accepted` (most likely, given the flow), or does it need its own explicit user action? Wire `PATCH /api/requests/[id]/status` to insert into `matches` on acceptance if that's the answer.
- [ ] Either build a minimal review flow (rate the other party after a match completes) or explicitly park it — if parking it, delete the unused `/api/matches` stub rather than leaving a fake endpoint, and note in `AGENTS.md`/this roadmap that `reviews` is intentionally not started yet.

**Test:** accept a request, confirm a real `matches` row now exists in the DB (`select * from matches`), tied to the right `request_id`/`trip_id`.

---

### Day 6 — Homepage trust & clarity pass
**Problem:** audit §1.6 issue #1 — buyer-side homepage clarity is improved but not complete; the original brief's trust-signal and recent-matches sections were never added.

- [ ] Add a small trust-signals row below the hero (escrow payments, verified travelers, money-back guarantee) — but only word it honestly: escrow/Stripe isn't live yet, so phrase this as "coming soon" or reframe around what's actually true today (real accept/decline flow, Clerk-verified accounts) rather than promising an escrow system that doesn't exist. Overpromising here is worse than a shorter, honest section.
- [ ] Add a "recent activity" section using real data now that Day 1 is done (e.g. last N accepted requests) instead of placeholder data — Day 1's DB wiring makes this straightforward.

**Test:** load `/` in both modes, confirm nothing on the page claims a capability (escrow, guarantees) that isn't actually implemented yet.

---

### Day 7 — UI consistency & accessibility pass
Use `docs/UI_GUIDELINES.md` as the checklist. Concretely:

- [ ] Run the full click-through test plan in `docs/UI_GUIDELINES.md` §"Test plan" and fix anything that fails.
- [ ] Fix color-contrast and focus-visible gaps called out there.
- [ ] Make loading states consistent — `trips/loading.tsx` has a skeleton, `/dashboard` and `/trips/[id]` don't.

**Test:** the test plan in `docs/UI_GUIDELINES.md`, end to end, in an actual browser — not just a code read.

---

### Day 8+ — Deferred integrations (do not start early)
Per the original brief, these stay explicitly out of scope until called for separately:
- Stripe / Stripe Connect (escrow, payouts)
- Resend (transactional email — request received, request accepted/declined, trip reminders)
- PostHog (analytics)
- A real LLM backing `ChatWidget` (currently a hardcoded canned reply)

When one of these gets greenlit, give it its own day using the same shape as above — don't fold it into a polish day.

---

## Definition of done, every day

1. The feature works end to end against the real DB (not mock data), in both signed-in and signed-out states where relevant.
2. `npm run lint` is clean.
3. `docs/CHANGELOG.md` (repo root: `CHANGELOG.md`) gets a new entry.
4. The day's "Test" note above has actually been run, not just read.
