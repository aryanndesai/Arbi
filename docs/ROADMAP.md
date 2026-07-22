# Arbi Build Roadmap — Daily Tasks

_Last updated: 2026-07-22_

This breaks the full-stack build prompt into small, shippable daily chunks. Each day is scoped to
be finishable and verifiable on its own. Order reflects **what already exists** (see `AUDIT.md`) so
we build on top of prior sessions instead of redoing them.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done. Keep `CHANGELOG.md` in sync.

---

## Day 1 — Plan + homepage trust & social proof _(this session)_
- [x] Read the whole codebase, write `AUDIT.md`.
- [x] Write `ROADMAP.md`, `UI_GUIDELINES.md`, `CHANGELOG.md`.
- [x] Add a **Trust signals** row to the homepage (Escrow payments, Verified travelers, Money-back guarantee).
- [x] Add a **Recent matches** section (placeholder data, clearly labelled) to show marketplace liveness.
- [x] Add `.env.example` documenting every env var the app reads.
- [x] Verify: `tsc --noEmit` and `next lint` pass.

## Day 2 — Kill the data-source split (public pages → real DB)
- [ ] Add `getFeaturedTrips()` / reuse `getTrips()` and point `/` at the DB.
- [ ] Point `/trips` browse at the DB; derive destination filters from real rows.
- [ ] Add a graceful empty state when the DB has no trips (seed CTA), so a fresh DB doesn't look broken.
- [ ] Keep mock available behind a single dev seed helper, not scattered imports.

## Day 3 — Fix the post-request correctness bug
- [ ] `/post-request/[tripId]` must resolve the trip from the **DB** (UUID), not mock.
- [ ] Guard: only allow requests on trips with `status = open` and not owned by the requester.
- [ ] Verify a real posted trip can receive a real request end to end.

## Day 4 — Trip detail buyer info + profile on real data
- [ ] Extend `getTripById` to join buyer name/initials onto each request.
- [ ] Owner view shows real buyer name/initials (no more "?").
- [ ] Move `/profile/[id]` onto real DB queries + real stats.

## Day 5 — Clerk webhook completeness
- [ ] Handle `user.updated` (update row) and `user.deleted` (soft delete / remove).
- [ ] Confirm signature verification still passes for all three events.
- [ ] Document the exact Clerk dashboard webhook URL + events in `docs/SETUP.md`.

## Day 6 — Matches + dashboard depth
- [ ] Make `/api/matches` persist to the `matches` table.
- [ ] On accept, create a match; surface it on the dashboard.
- [ ] Dashboard "My trips" shows a pending-request count per trip.

## Day 7 — UI polish pass
- [ ] Consistent card/spacing/typography audit against `UI_GUIDELINES.md`.
- [ ] Loading + empty + error states on every data view.
- [ ] Accessibility sweep (focus rings, aria labels, contrast).
- [ ] Mobile pass on every route.

## Backlog (explicitly out of scope for now)
- **Tech debt:** Next 16 build warns that the `middleware.ts` convention is deprecated in favour of
  `proxy`. Migrate deliberately in its own change since it gates auth (see AGENTS.md).
- Stripe / escrow payments.
- Resend transactional email + notifications.
- PostHog analytics.
- Deploy (owner handles git + Vercel).

---

### Working rules
- One day = one coherent, reviewable change set. Commit with a clear message; keep the draft PR updated.
- Never delete existing pages/components without flagging it first.
- No `any`. Every API route keeps try/catch + correct status codes.
- Match existing Tailwind style; see `UI_GUIDELINES.md`.
</content>
