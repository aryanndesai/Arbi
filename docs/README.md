# Arbi — Project Docs

Planning and tracking docs for the Arbi marketplace build.

| Doc | What it's for |
|-----|---------------|
| [`AUDIT.md`](./AUDIT.md) | Full read-only audit of what exists vs. what's mock/placeholder. Start here. |
| [`DAILY_PLAN.md`](./DAILY_PLAN.md) | The remaining work broken into day-by-day, testable steps. |
| [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) | What "nice UI" means + Arbi's actual design system and a polish checklist. |
| [`ENV.md`](./ENV.md) | Every environment variable, required vs. deferred, plus a `.env.local` template. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Running log of every change, newest first. |

## The one-paragraph summary
The marketplace is largely built and typechecks/lints clean. Most of the
original brief's "features to build" already exist (auth, schema, API routes,
dashboard, accept/decline, mode toggle, Clerk webhook). The real remaining work
is finishing the **mock-data → real-database migration** — four pages still read
from `lib/mock-data.ts` — and a **UI polish pass**. Work it day by day from
`DAILY_PLAN.md`, hold the bar in `UI_GUIDELINES.md`, and log everything in
`CHANGELOG.md`.
