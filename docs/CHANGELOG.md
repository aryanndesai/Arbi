# Arbi — Changelog

Track every change here, newest first. Keep entries short: what changed, why,
and which files. Group by date. This is the running record the daily plan refers
to.

Format:

```
## YYYY-MM-DD
### Added / Changed / Fixed / Removed
- <what> — <why> (`path/to/file`)
```

---

## 2026-07-19

### Added
- `docs/` planning set to break the full-stack audit + build prompt into
  trackable work:
  - `docs/AUDIT.md` — honest, file-by-file Section 1 audit. Key finding: the app
    is far more complete than the prior "known issues" list implied; most of the
    seven priorities are already partly/fully built.
  - `docs/DAILY_PLAN.md` — the real remaining gaps sequenced into day-sized,
    testable chunks (Day 0–8), each with a Test and Done-when.
  - `docs/UI_GUIDELINES.md` — what "good UI" means (6 principles + 5 test
    methods) and Arbi's design system formalized from the existing tokens, plus
    a prioritized list of concrete UI improvements.
  - `docs/ENV.md` — full environment variable reference and where each is read.
  - `docs/README.md` — index for the docs folder.

### Notes
- No application code changed in this entry. Docs only. Feature work begins with
  Day 0 in `docs/DAILY_PLAN.md`.
- Verified a clean clone needs `npm install` (node_modules absent) before
  dev/lint/build.

<!--
## 2026-07-20
### Fixed
- ...
-->
