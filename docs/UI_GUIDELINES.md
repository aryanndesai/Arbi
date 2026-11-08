# Arbi — UI Guidelines

Arbi already has a consistent visual system. The goal of this doc isn't to invent a new one — it's to write down the one that's already there, so new work matches it instead of drifting. Skim `app/globals.css`, `components/TripCard.tsx`, and `app/dashboard/page.tsx` alongside this if anything is ambiguous — they're the clearest examples of the pattern in practice.

## What "good UI" means for this project, specifically

Not: trendy, flashy, novel. For a two-sided marketplace MVP, good UI means:

1. **The buyer and traveler always know what to do next.** Every screen should have exactly one obvious primary action (a black pill button), and secondary actions should visibly defer to it (outlined/gray).
2. **Nothing looks broken while it's loading or empty.** A blank white screen or a raw `0 results` reads as broken. Every list has a skeleton and an empty state (see below) — no exceptions when you add a new one.
3. **Status is always legible at a glance.** Pending/accepted/declined/completed/open/full all have one fixed color mapping used everywhere (see below) — never invent a new color for a status.
4. **Consistency beats cleverness.** Reuse an existing component/class before writing a new one. If you're about to write a new empty-state pattern, a new button style, or a new spacing rhythm — stop and check whether one already exists first.

## The existing system

### Layout rhythm
- Page containers: `max-w-3xl` (post-trip, post-request, trip detail hero) or `max-w-4xl` (trips list, dashboard, profile). Pick based on whether the content is a single-column form/detail (3xl) or a grid/list (4xl).
- Horizontal padding is always `px-6`.
- Page header section: `pt-12 pb-6` (or `pt-6 sm:pt-8 pb-8` for the homepage hero specifically). Content sections: `pb-20` at the very bottom of the page.
- Cards/panels: `rounded-2xl`, `border border-gray-100`, sometimes `bg-gradient-to-br from-gray-50/50 to-white` for a very subtle lift.

### Color — monochrome base + one semantic status system
- Base palette is black/white/gray. Primary actions are `bg-black text-white`, hover `bg-gray-800`. Secondary actions are `border border-gray-200 text-gray-700`, hover `bg-gray-50`.
- Status colors are fixed and reused verbatim in `app/dashboard/page.tsx`, `app/trips/[id]/page.tsx`, and `RequestActions.tsx` — copy this exact mapping for any new status badge instead of picking new colors:
  - `pending` → amber (`bg-amber-100 text-amber-800 border-amber-200`)
  - `accepted` → green (`bg-green-100 text-green-800 border-green-200`)
  - `declined` → gray (`bg-gray-100 text-gray-700 border-gray-200`)
  - `completed` → blue (`bg-blue-100 text-blue-800 border-blue-200`)
  - `open`/`full` (trip status) → amber, same as pending
- Destination country cards get a very light per-country tint (`lib/country-style.ts`) — a nice touch that makes the browse grid scannable. Extend that map rather than adding ad hoc colors if you add a country that isn't there yet.

### Motion — reuse the existing keyframes, don't add new ones casually
Defined once in `globals.css`, applied as utility classes:
- `animate-arbi-fade-in` — page/section entrance (used on nearly every page's first section).
- `animate-arbi-slide-up` — modal/panel entrance (used by `ChatWidget`).
- `animate-arbi-toast-in` / `animate-arbi-toast-out` — toast enter/exit (used by `ModeToggle`).
- `arbi-skeleton` (+ `arbi-shimmer` keyframe) — shimmering loading placeholder (used by `TripCardSkeleton`).
- Micro-interactions: `hover:-translate-y-0.5` + `hover:shadow-lg` on cards, `active:scale-[0.98]` on primary buttons, `group-hover:scale-110` on the "View" pill inside `TripCard`.

### Empty states — one pattern, reused everywhere
`border border-dashed border-gray-200 rounded-2xl p-10 (or p-12) text-center bg-gradient-to-br from-gray-50/50 to-white`, with a large emoji, a bold one-line title, a short gray body line, and — when relevant — a black pill CTA. See `DashboardPage`'s `EmptyState` component and the inline empty states in `trips/page.tsx` and `trips/[id]/page.tsx`. If you need a new empty state, copy one of these rather than freehanding a new layout.

### Forms
- Inputs use the shared `.arbi-input` class (defined in `globals.css`) or the local `.input` style in `PostRequestForm` — these should probably be unified at some point (small inconsistency, not urgent).
- Labels: `text-sm font-medium text-gray-800 mb-1.5` (or `text-xs font-medium text-gray-600 mb-1.5` in the request form — same minor inconsistency).
- Errors: a single line, `text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2`, placed right above the submit button.
- Submit buttons show a pending-state label change ("Posting…", "Submitting…") and get `disabled` + `disabled:opacity-60` while in flight — don't ship a submit button that doesn't do this.

### Accessibility patterns already in place — keep following them
- Icon-only buttons get `aria-label` (see the mobile menu toggle and `ChatWidget`'s open/close/send buttons).
- `ModeToggle` uses `role="tablist"`/`role="tab"`/`aria-selected` correctly — copy this pattern for any future segmented control.
- Toasts use `role="status"` + `aria-live="polite"`.
- One thing worth checking, not yet verified: `text-gray-400` on white (used for section eyebrows like "OPEN TRIPS") is close to the AA contrast floor for small text. Worth a contrast check before leaning on it for anything that isn't purely decorative labeling.

## A quick checklist before shipping any new UI

- [ ] Does it fit the existing spacing/container scale (3xl vs 4xl, `px-6`, the standard section padding)?
- [ ] Does every status it shows reuse the fixed color mapping above?
- [ ] Does it have both a loading state (skeleton, matching `arbi-skeleton`) and an empty state (the dashed-border pattern)?
- [ ] Is every icon-only control labeled, and every custom interactive widget given the right ARIA role?
- [ ] Does it work down to a narrow mobile viewport (the codebase leans on `sm:`/`lg:` breakpoints, not custom media queries)?
- [ ] Did you reuse an existing component/class before writing a new one?

## Known small inconsistencies (not urgent, fix opportunistically)

- Two slightly different input/label styles exist (`arbi-input`/global vs. the scoped `.input` in `PostRequestForm`) — worth unifying next time either form is touched.
- Only `/trips` has a `loading.tsx`; `/`, `/dashboard`, `/trips/[id]`, and `/profile/[id]` fall back to Next.js's default (blank) loading behavior. Worth adding matching skeletons if those pages start feeling slow in production.
