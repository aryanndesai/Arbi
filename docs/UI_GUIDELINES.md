# Arbi — UI Guidelines ("what good UI means here")

Arbi already has a coherent visual language: clean, editorial, black-on-white with
rounded shapes and restrained motion. "Good UI" for this project means **staying
consistent with that system** rather than importing a new one. This doc captures the
rules so every new screen looks like it belongs.

## The house style (derived from the existing code)
- **Surface:** white background, near-black text (`text-gray-900`), gray hierarchy
  (`text-gray-500` body, `text-gray-400` labels).
- **One accent:** black (`bg-black` / `bg-gray-900`) for primary actions. Do not add a
  second brand color. Status is the *only* place color is allowed (see below).
- **Shape:** `rounded-full` for pills/buttons/toggles, `rounded-2xl` for cards and
  containers. Borders are light (`border-gray-100/200`), not heavy.
- **Type:** Geist Sans (body) + Geist Mono (loaded). Big bold hero (`text-4xl/5xl
  font-bold`), small uppercase tracked labels for section headers
  (`text-sm font-medium uppercase tracking-wide text-gray-400`).
- **Motion:** subtle only — `animate-arbi-fade-in` on page sections, hover lifts
  (`hover:-translate-y-0.5 hover:shadow-lg`), 200–300ms easing. No bounce, no spinners
  where a skeleton will do (`TripCardSkeleton` exists — use it).
- **Spacing:** generous. Sections use `max-w-3xl/4xl mx-auto px-6`, vertical rhythm in
  `pt-12 pb-20`. Keep to Tailwind's spacing scale; avoid arbitrary pixel values unless
  matching an existing one.

## Status color system (the one exception to "one accent")
Reuse the existing badge palette everywhere so status reads instantly:
| Status | Classes |
|---|---|
| pending / open | `bg-amber-100 text-amber-800 border-amber-200` |
| accepted | `bg-green-100 text-green-800 border-green-200` |
| declined | `bg-gray-100 text-gray-700 border-gray-200` |
| completed | `bg-blue-100 text-blue-800 border-blue-200` |
| in_transit | `bg-purple-100 text-purple-800 border-purple-200` |

## The 10-point checklist for any new screen
1. **Consistent primitives** — pills, cards, inputs (`arbi-input`) match existing ones.
2. **One primary action** per view, styled `bg-black text-white rounded-full`. Secondary
   is outlined (`border border-gray-200`).
3. **Empty states are designed, not blank** — emoji + title + one-line body + a CTA.
   (Pattern already used in dashboard/trips — copy it.)
4. **Loading states** — use skeletons (`TripCardSkeleton`, `trips/loading.tsx`), never a
   raw spinner on content grids.
5. **Optimistic + reversible** — like `RequestActions`: update UI immediately, roll back
   on error, show an inline error, then `router.refresh()`.
6. **Mobile first** — everything must work at 375px. Grids collapse to 1 col; the Navbar
   already has a mobile sheet. No horizontal body scroll.
7. **Focus & keyboard** — every interactive element has a visible focus ring and is
   reachable by Tab. The mode toggle uses proper `role="tab"`/`aria-selected` — match that.
8. **Contrast** — body/label text must pass WCAG AA. Watch `text-gray-400` on white for
   anything users must read (it's fine for decorative labels only).
9. **Copy that speaks to both sides** — traveller vs shopper framing. Reuse the mode
   context so the same page can address whoever's looking.
10. **Trust cues where money is involved** — escrow / verified / guarantee language near
    any commitment step. Never invent fake reviews or counts; label placeholders as examples.

## Component conventions
- Server components fetch data; mark interactive leaves `"use client"` (as done for
  `HeroSection`, `ModeToggle`, `RequestActions`, forms).
- Keep presentational sub-components (`Field`, `FlagInput`, `Stat`, `EmptyState`,
  `StepRow`, `Card`) local to their file when only used there — the codebase already does this.
- New shared UI goes in `components/`; only extract when used in 2+ places.

## Anti-patterns to avoid
- A second accent color, gradients as primary surfaces, drop shadows everywhere.
- Modal-stacking; prefer inline flows and dedicated routes (`/post-request/[tripId]`).
- Blocking the whole page on the globe — it's lazy-wrapped (`MapWrapper`); keep it that way.
- `any` types in props. Define an interface for every component's props.
- Robotic comments and em dashes in code comments (repo rule).

## Reference implementations already in the repo
- Cards & hover: `components/TripCard.tsx`
- Empty state: `EmptyState` in `app/dashboard/page.tsx`
- Optimistic action: `app/trips/[id]/RequestActions.tsx`
- Form + inline validation: `app/post-trip/page.tsx`
- Accessible toggle + toast: `components/ModeToggle.tsx`
