# Changelog

All notable changes to Arbi are tracked here, newest first. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

Each entry should say what changed, why, and — for anything touching a user flow — what was manually tested (per `docs/UI_GUIDELINES.md`'s test plan and `docs/ROADMAP.md`'s per-day "Test" notes). A code change without a corresponding test note here isn't done yet.

## [Unreleased]

### Added
- `docs/AUDIT.md` — full read-every-file audit of the codebase: project structure, database (Drizzle schema vs. mock data usage per page), auth/Clerk wiring, all five core user flows traced end to end, third-party service status, and a scored list of which previously-identified issues are actually fixed vs. still open.
- `docs/ROADMAP.md` — the remaining work broken into 7+ single-day increments, ordered by user-facing impact (real trip data on the browse pages first, then notifications, then polish, then the explicitly-deferred integrations last).
- `docs/UI_GUIDELINES.md` — what "good UI" means for this project specifically, a review of what the current implementation already does well vs. what needs fixing (shared status-badge helper, missing loading states, a mislabeled CTA link, focus/contrast gaps), and a manual browser test plan to run before shipping UI changes.
- This file.

### Notes
- No application code changed in this pass — this was an audit-and-planning session per the original build brief's instruction to complete a full audit and wait for go-ahead before writing feature code.
- Live browser testing was not possible this session (no `DATABASE_URL`/Clerk keys available, dependencies not installed) — `docs/UI_GUIDELINES.md`'s test plan is written for the next session that has real credentials to actually run it.

<!--
Template for future entries:

## [YYYY-MM-DD] — <day / feature from docs/ROADMAP.md>

### Added / Changed / Fixed
- What changed and why (not just what).

### Tested
- Which items from docs/UI_GUIDELINES.md's test plan (or the day's own "Test" note) were run, and the result.
-->
