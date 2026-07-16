# Arbi UI Guidelines — What Good UI Means Here

_Last updated: 2026-07-16._

This is both a short theory of "good UI" and a concrete style guide for Arbi. Use it as the
checklist during the polish days in `docs/ROADMAP.md`.

---

## Part 1: What "good UI" actually means

Good UI is not decoration. It is the set of decisions that let a person accomplish a goal with
the least friction and doubt. Seven principles, roughly in order of impact:

1. **Clarity of purpose.** Every screen answers "what is this and what do I do next?" within a
   second. One primary action per screen, stated in the user's language, not the system's.
2. **Visual hierarchy.** Size, weight, color, and spacing guide the eye from most to least
   important. If everything is bold, nothing is. Arbi's most important thing on any screen is the
   single primary button.
3. **Consistency.** The same thing looks and behaves the same everywhere. One button style, one
   card style, one way to show status. Consistency is what makes an interface feel trustworthy,
   which matters doubly for a product that handles other people's money.
4. **Feedback.** Every action gets an immediate, visible response: loading, success, error. Users
   should never wonder whether a click registered. Optimistic UI (like Arbi's accept/decline)
   is good, but it must roll back visibly on failure.
5. **Forgiveness.** Prevent errors before they happen (sensible defaults, input constraints), and
   when they happen, explain them in plain language next to where they occurred.
6. **Accessibility.** Good UI works for keyboard users, screen readers, low-vision users, and
   people on slow connections. AA contrast, focus states, semantic markup, and reduced-motion
   support are baseline, not extras.
7. **Restraint.** Whitespace, a small type scale, and a limited palette read as premium and calm.
   Every added element competes for attention. Remove before you add.

A simple test for any screen: can a first-time user state the purpose, find the primary action,
and recover from a mistake without help? If yes, the UI is doing its job.

---

## Part 2: Arbi's design system (as it exists today)

The codebase already has a coherent, restrained aesthetic. Keep it. Do not introduce new colors,
fonts, or component patterns without a reason.

**Typography**
- Font: Geist (sans) and Geist Mono, loaded via `next/font`.
- Scale in use: `text-3xl`/`text-4xl`/`text-5xl` for headings, `text-sm` body, `text-xs` meta,
  `text-[10px]` uppercase labels. Stay on this scale.
- Weight: `font-bold`/`font-extrabold` for headings, `font-medium`/`font-semibold` for emphasis.

**Color**
- Monochrome core: white background, near-black text (`text-gray-900`), gray-500 for secondary,
  gray-400 for muted labels, gray-100/200 for borders and fills.
- Black (`bg-black` / `bg-gray-900`) is the single primary-action color. Do not add a second
  brand color for buttons.
- Status colors (keep these fixed meanings):
  - amber (`bg-amber-100 text-amber-800`) = pending / open
  - green = accepted
  - gray = declined
  - blue = completed
  - purple = in transit
- Accent surfaces use faint gradients (`from-gray-50/30 to-white`) and per-country tints from
  `lib/country-style.ts`. Keep these low-contrast.

**Shape and depth**
- Radius: `rounded-full` for buttons/pills/badges, `rounded-2xl` for cards and panels,
  `rounded-xl` for inline messages. Be consistent per element type.
- Borders over shadows for structure (`border-gray-100/200`). Shadows are reserved for hover
  lift (`hover:shadow-lg hover:-translate-y-0.5`) and the mode-toggle knob.

**Motion**
- Defined in `globals.css`: `arbi-fade-in`, `arbi-toast-in/out`, `arbi-slide-up`, `arbi-shimmer`.
- Durations are short (200-280ms) and easing is standard. Keep motion subtle and purposeful.
- TODO (Day 10): wrap these in `@media (prefers-reduced-motion: reduce)`.

**Components to reuse (don't reinvent)**
- Buttons: primary = `px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800`;
  secondary = same shape with `border border-gray-200 text-gray-700 hover:bg-gray-50`.
- Inputs: `arbi-input` class (in globals.css) or the local `.input` in PostRequestForm — unify
  these two into one during polish.
- Status badge: `text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border`
  plus the status color pair.
- Empty state: dashed border, `rounded-2xl`, emoji, title, body, one CTA. Already used in three
  places; keep the pattern identical.

---

## Part 3: Arbi-specific rules

- **One primary action per screen.** Homepage in Travelling mode: "Post a trip". In Shopping mode:
  "Browse trips". Never show two equally-weighted black buttons.
- **Speak to the current mode.** Copy and CTA should reflect whether the user is here to carry or
  to buy. This is the point of the toggle; extend it past the hero (Day 8).
- **Trust signals near money.** Anywhere a fee, budget, or escrow is shown, keep the "verified /
  escrow / money-back" reassurance close. Trust is the core product risk.
- **Status is always visible and always the same color.** A request's state should read
  identically on the trip page, the dashboard, and any future notification.
- **Real data, real empty states.** Once pages use the DB, an empty database must look
  intentional (the existing empty states handle this), never broken.

---

## Part 4: Polish checklist (use during Days 9-10)

Per screen:
- [ ] Purpose is obvious in one second; exactly one primary action.
- [ ] Type scale and spacing match the system; no one-off sizes.
- [ ] Colors limited to the palette above; status colors used with fixed meaning.
- [ ] Loading, empty, and error states all exist and look designed.
- [ ] Hover, focus, active, and disabled states present on every interactive element.
- [ ] Works at 375 / 768 / 1280px with no horizontal scroll or overflow.
- [ ] Contrast passes AA; focus rings visible; tab order logical.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] Copy is in the user's language, mode-appropriate, and free of system jargon.

If a change fails any box, fix it before shipping the screen.
