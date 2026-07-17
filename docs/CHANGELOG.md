# Changelog

Every change to Arbi gets a dated entry here. Newest first. This is the running record
the routine keeps so progress is auditable without reading the git log.

---

## 2026-07-17 - Day 1: audit, docs, homepage trust + social proof

### Added
- `docs/AUDIT.md` - honest file-by-file audit of the whole codebase.
- `docs/ROADMAP.md` - the brief broken into small daily, testable tasks.
- `docs/UI_GUIDELINES.md` - what good UI means + Arbi's design system and checklist.
- `docs/ENV.md` - documents every environment variable (there was no `.env.example`).
- `docs/CHANGELOG.md` - this file.
- `components/TrustSignals.tsx` - homepage row: escrow payments, verified travelers,
  money-back guarantee. Completes a missing piece of the homepage brief.
- `components/RecentMatches.tsx` - homepage social-proof row of recent deliveries with
  buyer savings and traveler earnings. Uses a clearly-marked placeholder seed until the
  `matches` table has real activity.

### Changed
- `app/page.tsx` - render `TrustSignals` and `RecentMatches` between How-it-works and the
  open-trips grid.

### Verified
- `npm run build`, `eslint`, and `tsc --noEmit` all pass.
- Rendered the new sections against the real compiled Tailwind CSS and confirmed they
  match the existing design system (rounded-2xl cards, gradient tints, status badge
  colours).

### Notes
- Could not screenshot the full running app end to end because Clerk requires a real
  instance (dev handshake redirects to the Clerk FAPI, prod middleware 500s on a fake
  secret). This is an auth-environment limitation, not a code issue; the change was
  verified via server-rendered HTML plus a compiled-CSS visual preview.
- Biggest open item going forward: the data-source split (some pages still read
  `lib/mock-data`). Scheduled for Day 3-4 in the roadmap.
