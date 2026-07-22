# Changelog

All notable changes to Arbi, tracked per working session. Newest first.

The format is loosely [Keep a Changelog](https://keepachangelog.com/). This project is pre-1.0;
dates are the working day.

## 2026-07-22 — Day 1: planning + homepage trust & social proof

### Added
- `docs/AUDIT.md` — full end-to-end audit of the codebase (structure, DB, auth, flows, services).
- `docs/ROADMAP.md` — the build prompt broken into shippable daily tasks.
- `docs/UI_GUIDELINES.md` — the design language written down ("what good UI means for Arbi").
- `docs/CHANGELOG.md` — this file.
- `.env.example` — documents every environment variable the app reads.
- Homepage **Trust signals** row: escrow payments, verified travelers, money-back guarantee.
- Homepage **Recent matches** section (clearly labelled sample data) as social proof.
- `components/TrustSignals.tsx` and `components/RecentMatches.tsx`.

### Fixed
- `db/index.ts` no longer throws at module-evaluation time when `DATABASE_URL` is unset. The
  Drizzle client is now created lazily on first query via a proxy. This was crashing `next build`
  (and the Vercel deploy) during "collect page data", since importing a DB route evaluated the
  client immediately. DB routes are all dynamic and only need a connection at request time.

### Notes
- No existing pages/components deleted.
- Public homepage/browse still read from `lib/mock-data.ts`; migrating them to the real DB is
  scheduled for Day 2 (see `ROADMAP.md`).
</content>
