# Arbi Changelog

Track every notable change here, newest first. One entry per working session or per shipped
Roadmap day. Keep it short: what changed, why, and how it was verified.

Format:
```
## YYYY-MM-DD — short title
- change (file/area) — why
Verified: how you tested it.
```

---

## 2026-07-16 — Audit + planning docs
- Added `docs/AUDIT.md` — full read-only audit of structure, DB, auth, flows, services, and a
  prioritized gap list. Key finding: most brief "features to build" were already implemented in a
  prior session; real gaps are runnability, the mock-to-real data swap, webhook completeness, and
  a fake matches route.
- Added `docs/ROADMAP.md` — work broken into 12 daily tasks, each with a "done when" and test.
- Added `docs/UI-GUIDELINES.md` — principles of good UI plus Arbi's concrete design system and a
  polish checklist.
- Added `docs/ENV.md` — `.env.local` template and Clerk webhook setup steps.
- Added `docs/CHANGELOG.md` — this file.
No application code changed. Docs only.
Verified: files created under `docs/`; audit facts cross-checked by reading every route,
component, lib, and schema file. Confirmed `node_modules` absent and no `.env.local` present,
which explains the "cannot find module" typecheck output (not real code errors).
