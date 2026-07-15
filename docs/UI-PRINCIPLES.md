# Arbi — UI Principles

_Last updated: 2026-07-15_

A working reference for what "good UI" means on this project, plus an honest
review of the current screens against it. Use this before any UI change so the
app stays one coherent system instead of a pile of one-off screens.

---

## What "good UI" actually means (the short version)

Good UI is not decoration. It is **the fastest, calmest path from a user's
intent to the outcome they wanted**, with no surprises. Six things, in order of
how much they matter:

1. **Clarity beats cleverness.** A first-time buyer should understand what Arbi
   is in one sentence and one screen. If a label needs explaining, rewrite the
   label.
2. **One obvious next action per screen.** Every page has a single primary
   button that stands out; everything else is quieter. Two equally-loud CTAs =
   no CTA.
3. **Feedback for every action.** Clicks show a pending state; results show a
   toast, a status change, or navigation. The user is never left wondering "did
   that work?"
4. **Forgiving.** Optimistic updates that roll back on error, inline error
   messages (not alerts), confirm before anything destructive, and empty states
   that tell you what to do next.
5. **Consistent system.** The same spacing scale, radius, type ramp, and color
   meanings everywhere. A green pill means "accepted" on every screen.
6. **Fast + accessible.** Perceived speed (skeletons, optimistic UI), keyboard
   and screen-reader support, and legible contrast are features, not polish.

If a change can't be justified by one of those six, it's probably taste, not UI.

---

## Arbi's design language (the system already in the code)

The codebase has a consistent, tasteful minimal aesthetic. Codifying it so it
stays that way:

**Color**
- Canvas: white (`bg-white`). Ink: near-black (`text-gray-900` / `#171717`).
- Primary action: solid black pill (`bg-black text-white rounded-full`), hover `bg-gray-800`.
- Secondary action: outlined pill (`border border-gray-200 text-gray-700`, hover `bg-gray-50`).
- Muted text: `text-gray-500`; labels: `text-gray-400 uppercase tracking-wide text-xs`.
- Per-country accent tints for trip cards (`lib/country-style.ts`) — subtle, never loud.

**Status colors (fixed meanings — do not reassign)**
| Status | Classes |
| --- | --- |
| pending / open / full | amber (`bg-amber-100 text-amber-800 border-amber-200`) |
| accepted | green (`bg-green-100 text-green-800 border-green-200`) |
| declined | gray (`bg-gray-100 text-gray-700 border-gray-200`) |
| completed | blue (`bg-blue-100 text-blue-800 border-blue-200`) |
| in_transit | purple |

**Shape + space**
- Radius: `rounded-2xl` for cards/containers, `rounded-full` for buttons/pills/badges.
- Page width: `max-w-3xl` (detail/forms) to `max-w-4xl` (grids), centered, `px-6`.
- Cards: hairline border (`border-gray-100`), optional gradient tint, `hover:-translate-y-0.5 hover:shadow-lg`.

**Type**
- Hero: `text-4xl sm:text-5xl font-bold leading-[1.1]`.
- Page title: `text-3xl font-bold`. Section label: `text-sm uppercase tracking-wide text-gray-400`.

**Motion (in `globals.css`, keep it subtle)**
- `animate-arbi-fade-in` on page/section mount.
- `arbi-skeleton` shimmer for loading.
- Toasts slide in/out; mode-toggle thumb slides 300ms.
- Rule: animations are ≤300ms, ease-out, and never block interaction.

**Inputs**
- Use the `.arbi-input` class: rounded-xl, hairline border, black focus ring (`0 0 0 4px rgb(0 0 0 / 0.04)`).

**Accessibility baseline**
- Every icon-only button has `aria-label`. Toggles use `role="tab"`/`aria-selected`. Toasts use `role="status" aria-live="polite"`. Keep it.

---

## Review of current screens

| Screen | Verdict | Notes |
| --- | --- | --- |
| Home `/` | Strong | Clear hero, mode-aware copy, how-it-works for both sides, globe is a nice hook. Trust signals (escrow/verified/guarantee) from the spec are **not yet present** — add them. |
| Browse `/trips` | Good | Clean filter pills + card grid. Missing a direct buyer CTA on cards (issue #3). |
| Trip detail `/trips/[id]` | Strong | Good hierarchy, owner sees accept/decline, non-owner sees a single clear CTA, optimistic updates with rollback. Textbook. |
| Post trip / request | Good | Stepper, inline tips, flag auto-fill, disabled+pending submit. Errors inline. |
| Dashboard | Good | Tabs, status badges, thoughtful empty states. Missing per-trip pending counts (spec). |
| Navbar | Strong | Sticky, active underline, working mode toggle, mobile sheet, Clerk states handled. |
| ChatWidget | Placeholder | Looks right but returns a canned reply. |

**Overall:** the UI is already above the bar for a student/side project — coherent
system, real motion, real empty/loading/error states. The gaps are content
(trust signals, buyer CTA, pending counts), not craft.

---

## Do / Don't

**Do**
- Reuse existing components and the classes above before inventing new ones.
- Give every new async action a pending + error + success state.
- Write empty states that include the next action.
- Keep one primary CTA per view.

**Don't**
- Add a second competing accent color or a new radius scale.
- Use browser `alert()`/`confirm()` — use inline messages and toasts.
- Reassign the status colors.
- Ship an interactive element with no keyboard/aria support.
- Use em dashes in code comments (house rule).
