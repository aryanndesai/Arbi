# Arbi docs

Planning and reference docs for the Arbi build. Start here.

- **[AUDIT.md](./AUDIT.md)** — what actually exists in the codebase today (read-only snapshot).
- **[ROADMAP.md](./ROADMAP.md)** — the build broken into one-day, testable tasks. Work top to bottom.
- **[UI_GUIDELINES.md](./UI_GUIDELINES.md)** — what good UI means for Arbi + the design system + a done checklist.
- **[CHANGELOG.md](./CHANGELOG.md)** — running log of every change. Add an entry each session.

**TL;DR of the current state:** the app is more complete than expected. The one bug that makes it *feel* broken is the split data layer — some pages read the live DB, some still read mock data. Fix that first (ROADMAP Day 1).
