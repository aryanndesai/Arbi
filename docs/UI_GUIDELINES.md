# Arbi — UI Guidelines

_Last updated: 2026-07-21_

The goal of this doc is to answer "what does good UI mean **for Arbi**" concretely,
so every screen feels like one product. It's descriptive of the good instincts
already in the codebase, plus a few rules to keep it consistent as it grows.

---

## What "good UI" means here

Not "pretty." Good UI for a two-sided marketplace means a first-time visitor
understands **who it's for, what they get, and what to do next** within a few
seconds — and then never has to guess. Five principles:

1. **Clarity over cleverness.** The hero says what you get in plain words
   ("Turn your spare luggage into cash"). Keep copy that concrete everywhere.
2. **One primary action per screen.** Every page should have exactly one obvious
   dark "pill" button that is the thing to do here. Everything else is secondary
   (outline) or a text link.
3. **Both sides always addressed.** Arbi has travellers *and* buyers. If a screen
   only speaks to one, ask whether the other is stranded (this is why the mode
   toggle and the two-column "How it works" exist).
4. **Trust is a feature.** Ratings, verified badges, escrow, money-back — surface
   them, because handing a stranger money and a shopping list is scary.
5. **Feedback for every action.** Optimistic updates, toasts, loading skeletons,
   and clear error text. The user should never wonder if a click worked.

---

## The design system already in the code

Extracted from the current components so new work matches without guesswork.

### Colour

- **Canvas:** white (`bg-white`). Sections separated by whitespace, not boxes.
- **Ink:** `text-gray-900` for headings, `text-gray-500` for body/captions,
  `text-gray-400` for eyebrow labels.
- **Primary action:** solid black (`bg-black` / `bg-gray-900`), white text,
  hover `bg-gray-800`.
- **Borders/tints:** `border-gray-100`/`gray-200`; soft gradients
  (`from-gray-50/50 to-white`) for empty states and cards.
- **Status badges** (be consistent — these are the canonical mappings):
  - pending → `amber-100 / amber-800`
  - accepted → `green-100 / green-800`
  - declined → `gray-100 / gray-700`
  - completed → `blue-100 / blue-800`

> Keep status colours identical across `dashboard/page.tsx`,
> `trips/[id]/page.tsx`, and `RequestActions.tsx`. They currently agree — don't
> let them drift.

### Shape & spacing

- **Buttons & pills:** `rounded-full`. This is Arbi's signature — buttons, filter
  chips, badges, the mode toggle are all fully rounded.
- **Cards & containers:** `rounded-2xl`, thin `border-gray-100`.
- **Page width:** `max-w-3xl` for reading/detail, `max-w-4xl` for grids. Center
  with `mx-auto px-6`.
- **Grids:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.

### Type

- Font: Geist (sans + mono) via `next/font`.
- Hero: `text-4xl sm:text-5xl font-bold leading-[1.1]`.
- Page title: `text-3xl font-bold`.
- Eyebrow label: `text-sm font-medium text-gray-400 uppercase tracking-wide`.

### Motion

- `animate-arbi-fade-in` on section mount.
- Hover: `hover:-translate-y-0.5 hover:shadow-lg` on cards; `active:scale-[0.98]`
  on the primary button. Keep motion subtle (150–300ms) and purposeful.
- Toasts slide from top (`animate-arbi-toast-in/out`) — reuse for future
  confirmations instead of inventing a new pattern.

---

## Rules to hold the line

- **One primary button per view.** If you need two dark buttons, one of them is
  probably secondary — make it an outline (`border border-gray-200`).
- **Never `.toFixed()` a possibly-undefined number.** Real DB rows may lack
  ratings; guard first (this is a live bug risk — see audit bug #2).
- **Every input** gets a `<label>`, a helpful one-line tip where non-obvious
  (the `/post-trip` form does this well — copy that pattern), and a visible focus
  state.
- **Unify input styling.** `/post-trip` uses `.arbi-input`; `/post-request` uses
  an inline `<style>` `.input`. Pick one class and delete the other.
- **Empty states are UI, not errors.** Every list has a friendly empty state with
  an emoji, one sentence, and a CTA (the dashboard and trips pages already model
  this — match it).
- **Accessibility is not optional:** `aria-label` on icon-only buttons (the mobile
  menu and mode toggle already do this), `role`/`aria-selected` on tab-like
  controls, `aria-live` on toasts, and keyboard-reachable focus rings everywhere.

---

## Per-screen checklist (use during the Day 8 UI pass)

- [ ] Exactly one primary action, obvious within 2 seconds.
- [ ] Both traveller and buyer are considered (or intentionally not).
- [ ] Loading state (skeleton) + error state present for any async data.
- [ ] Empty state with a CTA for any list.
- [ ] All text meets contrast (avoid `gray-400` on white for anything you must read).
- [ ] Works at 375px wide with no horizontal scroll.
- [ ] Every interactive element is keyboard-focusable with a visible ring.
- [ ] Status colours match the canonical mapping above.

---

## Concrete UI upgrades on the backlog

Mapped to roadmap days so the "make it nice" work is scheduled, not vibes:

| Upgrade | Why it's good UI | Day |
| --- | --- | --- |
| Trust-signal row (escrow / verified / money-back) | Principle 4 — reduces first-purchase fear | 3 |
| Recent-matches strip | Social proof; shows the marketplace is alive | 3 |
| Mode-aware CTAs on browse cards | Principle 2 — the right next action per audience | 4 |
| Pending-request count badges on dashboard trips | At-a-glance status; fewer clicks | 5 |
| Unified input styling + focus rings | Consistency + accessibility | 8 |
| Real buyer names/avatars on trip detail | Trust; avoids the "?" placeholder | 2 |
