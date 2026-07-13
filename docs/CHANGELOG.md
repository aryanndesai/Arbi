# Arbi Changelog

_Track every meaningful change here, newest first. One entry per working session or
feature. Keep it honest — note what was tested and what wasn't._

Format:
```
## YYYY-MM-DD — short title
- what changed (files touched)
- why
- tested: how you verified it (or "not tested — reason")
- follow-ups / known issues
```

---

## 2026-07-13 — Audit + planning docs
- Added `docs/AUDIT.md`, `docs/ROADMAP.md`, `docs/UI_GUIDELINES.md`, `docs/CHANGELOG.md`.
- Read the full codebase and recorded the real state: the app is ~85% built; most
  build-prompt "priorities" already exist (webhook sync, dashboard on real DB,
  trip-detail accept/decline, working mode toggle, HowItWorks).
- Documented the top bug: home (`app/page.tsx`) and browse (`app/trips/page.tsx`)
  still read `lib/mock-data.ts`, so posted trips never appear there, and `TripCard`
  expects a different shape than `getTrips()` returns (blocks a naive import swap).
- No code behavior changed in this session — docs only.
- tested: not run. `node_modules` not installed and no `.env.local`/`DATABASE_URL`
  in this environment, so `npm run build` and Drizzle push could not be executed.
  Build health is unverified and is Day 0 in the roadmap.
- follow-ups: see `docs/ROADMAP.md`. Start with Day 1 (unify data layer).

<!-- Add new entries above this line -->
