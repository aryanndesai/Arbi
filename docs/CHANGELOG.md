# Arbi — Change Log

A running log of what changed and why. Add a dated entry per working session.
Newest first. Keep entries short: what changed, which files, and the test result.

---

## 2026-07-21 — Audit & planning docs

**Added planning/documentation only. No application code was changed.**

- Read the entire codebase and produced [`docs/AUDIT.md`](./AUDIT.md): a
  file-traced snapshot of what works, what half-works, and what's still a stub.
- Broke the full build prompt into daily, testable chunks in
  [`docs/ROADMAP.md`](./ROADMAP.md) (Day 0–8 + deferred items).
- Wrote [`docs/UI_GUIDELINES.md`](./UI_GUIDELINES.md) defining what "good UI"
  means for Arbi and documenting the existing design system.
- Added [`.env.example`](../.env.example) — the first record of required env vars
  (the app can't boot without `DATABASE_URL`).

**Key findings:** the project is far more complete than assumed. Auth, the Drizzle
schema, most API routes, accept/decline, dashboard, and the mode toggle are real.
The main gap is a **split data layer** — `/`, `/trips`, `/profile`, `/post-request`
still read `lib/mock-data`, while `/dashboard` and `/trips/[id]` read Postgres, and
the two use **incompatible shapes**. Swapping browse pages to real data before
reconciling the `Trip` type will crash `TripCard`. That reconciliation is Day 1–2.

**Not done (needs go-ahead):** no feature code was written. Section 2 of the build
prompt (webhook completeness, homepage trust signals, data-layer unification, API
cleanup, dashboard depth, accept/decline matches, middleware) is scheduled in the
roadmap and awaits the go-ahead to start building.

**Test result:** docs only — nothing to run. `node_modules` is not installed in
this environment, so no build/typecheck was executed.

---

<!-- Template for future entries:

## YYYY-MM-DD — <short title>

- What changed (files touched)
- Why
- **Test:** <manual test + result>

-->
