# Arbi — Change Log

Track every meaningful change here, newest first. One line per change:
`YYYY-MM-DD — what changed — why`. Keep it honest; note things that were
skipped or partially done, not just wins.

---

## 2026-07-23
- **Added `docs/` planning suite** (audit, daily plan, UI guidelines, env, this changelog) — to break the full-stack build brief into daily, testable steps and set a UI quality bar. No application code changed.
- **Audit findings recorded** in `docs/AUDIT.md` — the app is much further along than the brief assumed; the real remaining work is the mock → real-database migration. `tsc --noEmit` and `eslint` both pass clean.

---

## How to use this file
- Add an entry the moment you finish a change, before you move on.
- When you complete a `docs/DAILY_PLAN.md` item, check its box there **and** log it here.
- If you revert something, log the revert too — the history should never lie.
