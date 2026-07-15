# Arbi — Changelog

Human-readable log of every change made through the daily build process. Newest
first. Keep entries short: what changed, why, and how it was verified.

---

## 2026-07-15 — Day 1: audit, docs, and Clerk webhook completion

**Docs (new)**
- `docs/AUDIT.md` — full file-by-file audit. Key finding: the app is ~90% built; real gaps are a split data layer, a stubbed matches API, and no notifications.
- `docs/DAILY-PLAN.md` — remaining work re-sequenced into finishable daily units (Days 2–7 + backlog).
- `docs/UI-PRINCIPLES.md` — definition of "good UI" for this project + the existing design system + a screen-by-screen review.
- `docs/CHANGELOG.md` — this file.
- `.env.example` — documents every environment variable the app reads (no secrets).

**Code**
- `app/api/webhooks/clerk/route.ts` — completed Priority 1. Was `user.created` only; now handles:
  - `user.created` → insert user row (unchanged behavior).
  - `user.updated` → update email/name/initials; falls back to insert if the row is missing.
  - `user.deleted` → delete the row; if the user still owns trips/requests (Postgres FK 23503) the row is kept and Clerk is not asked to retry.
  - Refactored the email/name/initials extraction into a shared `toUserRow` helper.
- `db/queries.ts` — added `updateUser(id, profile)` and `deleteUser(id)`.

**Verification**
- `npx tsc --noEmit` — clean.
- `npm run lint` (eslint) — clean.
- No DB available in this environment, so the webhook DB writes were not exercised live; logic is type-checked and the delete path is guarded against FK errors.

**Notes for the human**
- Clerk dashboard: point the webhook at `https://<domain>/api/webhooks/clerk` and subscribe to `user.created`, `user.updated`, `user.deleted`. Put the signing secret in `CLERK_WEBHOOK_SECRET`.
- Nothing was deleted. No new product pages were added. No PR opened.
