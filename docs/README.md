# Arbi — Project Docs

Planning and tracking docs for building out Arbi, the peer-to-peer cross-border
shopping marketplace (travelers carry items for buyers, earn a courier fee,
platform takes a cut).

## Start here

| Doc | What it's for |
| --- | --- |
| [`AUDIT.md`](./AUDIT.md) | Honest, file-by-file snapshot of what exists vs mock/placeholder. Read this first. |
| [`DAILY_PLAN.md`](./DAILY_PLAN.md) | The remaining work broken into day-sized, testable tasks (Day 0–8). Your daily driver. |
| [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) | What good UI means + Arbi's design system + prioritized UI fixes. |
| [`ENV.md`](./ENV.md) | Every environment variable and where it's read. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Running record of every change, newest first. |

## The one-paragraph status

The app runs on **Next.js 16 (App Router) + Tailwind v4 + Clerk + Drizzle over
Postgres**. Auth, middleware protection, the Clerk→DB webhook, the dashboard,
and the trip-detail accept/decline flow are **already built on real data**. The
main remaining work is **cutting the last mock-data cords** (homepage, browse,
post-request, profile still read `lib/mock-data`), **finishing the webhook**
(user.updated/deleted), and **closing the homepage trust/social-proof gap**.
Full detail in `AUDIT.md`; sequenced work in `DAILY_PLAN.md`.

## Working agreement

- Match existing style (Tailwind, `@/` imports, server components by default).
- No `any`; define response interfaces.
- Human-sounding comments, no em dashes in code comments.
- Don't add Stripe / Resend / PostHog yet (stubs stay stubs).
- Every change gets a `CHANGELOG.md` entry.
