# Arbi — Change Log

_Running log of what changed, why, and what was tested. Newest first. Add an entry every working session so the history stays honest — code, docs, and decisions all belong here._

Format:
```
## YYYY-MM-DD — short title
**What:** the change
**Why:** the reason
**Tested:** how it was verified (or "not yet")
**Roadmap:** which Day/task this covers
```

---

## 2026-07-14 — Planning docs + full codebase audit

**What:** Read the entire codebase file by file and added a `docs/` set:
- `AUDIT.md` — honest snapshot of what exists vs the build prompt's Section 1.
- `ROADMAP.md` — the big prompt broken into one-day-sized, testable chunks.
- `UI_GUIDELINES.md` — what "good UI" means for Arbi + the extracted design system + a done checklist.
- `CHANGELOG.md` — this file.

**Why:** The task asked to break the audit-and-build prompt into daily actionable steps, define what good UI means, and track all changes in markdown. No feature code was touched — the prompt's Section 2 explicitly says to wait for a go-ahead before building.

**Key findings (see AUDIT.md for detail):**
- The app is far more complete than the "known issues" implied — 4 of 6 are already fixed.
- The real problem is a **split data layer**: `/` and `/trips` read mock data while `/dashboard` and `/trips/[id]` read the live DB, so a newly posted trip never appears where buyers browse. This is Roadmap Day 1.
- `/post-request/[tripId]` also reads the trip from mock, so real trip ids don't resolve.
- The Clerk webhook only handles `user.created` (missing `user.updated` / `user.deleted`).
- No `drizzle/` migrations folder is committed.

**Tested:** N/A — documentation only. Audit claims verified by reading source (schema, queries, routes, pages, components).

**Roadmap:** pre-Day-1 groundwork.

---

<!-- Next entry goes here. Copy the format block at the top. -->
