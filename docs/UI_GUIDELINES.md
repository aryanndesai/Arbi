# Arbi UI Guidelines

_What "good UI" means for this app, written from the design system Arbi already
uses. When you add a screen, it should look like it was always there. Use this as
a checklist, not a rulebook._

## What good UI means here

Good UI is not decoration. It's **the user always knowing where they are, what
they can do, and what just happened** — with as little friction and as few
surprises as possible. For a marketplace like Arbi that means:

1. **Clarity over cleverness.** A first-time buyer and a first-time traveler both
   understand the page in under five seconds. The mode toggle and `HowItWorks`
   already do this — protect that.
2. **One visual system.** Same radii, same grays, same spacing everywhere. A new
   section that uses a different shadow or a blue button reads as a bug.
3. **Every state is designed.** Loading, empty, error, and success are not
   afterthoughts. Arbi already has skeletons and empty states — match them.
4. **Feedback is immediate.** Actions confirm themselves (optimistic accept/decline,
   the mode-change toast). Nothing should feel like it did nothing.
5. **Trust is visible.** This app moves money and goods between strangers. Ratings,
   escrow language, and verification cues aren't clutter — they're the product.

## The existing design system (match this exactly)

**Type:** Geist Sans (body), Geist Mono available. Weights: `font-extrabold` for
brand/hero, `font-bold` for section H1s, `font-medium`/`font-semibold` for labels.

**Color:** near-monochrome.
- Background `#ffffff`, foreground `#171717`.
- Text scale: `text-gray-900` (primary), `text-gray-500` (secondary), `text-gray-400` (labels/uppercase eyebrows).
- Primary action = **black** button (`bg-black text-white`, hover `bg-gray-800`).
- Secondary = bordered (`border-gray-200 text-gray-700`, hover `bg-gray-50`).
- Status colors are the ONLY accent palette — reuse them, don't invent:
  - pending → amber (`bg-amber-100 text-amber-800 border-amber-200`)
  - accepted → green, declined → gray, completed → blue, in_transit → purple.
- Country tints (`lib/country-style.ts`) are the one place color is allowed to breathe.

**Shape & spacing:**
- Radii: pills for buttons/badges/toggles (`rounded-full`); cards `rounded-2xl`; inputs `rounded-xl`/`rounded-[0.875rem]` (`.arbi-input`).
- Borders are light: `border-gray-100` / `border-gray-200`. Hairlines, not boxes.
- Page width: content maxes at `max-w-3xl`/`max-w-4xl`, centered, `px-6`.
- Cards often use a subtle `bg-gradient-to-br from-gray-50/30 to-white`.

**Motion (defined in `globals.css` — reuse these classes):**
- `.animate-arbi-fade-in` (280ms) on page/section mount.
- `.animate-arbi-toast-in/out` for transient confirmations.
- `.arbi-skeleton` shimmer for loading.
- Hover lifts are small: `hover:-translate-y-0.5`, `active:scale-[0.98]`. Keep it subtle.

**Inputs:** use `.arbi-input` (consistent focus ring `box-shadow: 0 0 0 4px rgb(0 0 0 / 0.04)`).
Every field has a label; helper text is `text-xs text-gray-500`.

## Per-screen checklist (run this before calling a screen done)

- [ ] **Loading:** skeletons or a spinner, no layout shift when data arrives.
- [ ] **Empty:** friendly message + a single clear CTA (see the dashboard `EmptyState`).
- [ ] **Error:** inline, human, recoverable (`text-red-600 bg-red-50 border-red-100` pill). Never a raw stack trace.
- [ ] **Primary action is obvious:** exactly one black button per view for the main action.
- [ ] **Mode-aware:** does this screen read right in both traveller and shopping mode?
- [ ] **Signed-out:** what does a logged-out visitor see? Public pages must not assume auth.
- [ ] **Responsive:** works at 375px (mobile) and up. Grids collapse to one column; the Navbar has its mobile menu.
- [ ] **Touch targets ≥ 40px**, spacing doesn't get cramped on mobile.
- [ ] **Accessibility:** real `<label>`s, `aria-label` on icon buttons, `role`/`aria-selected` on toggles (ModeToggle is the reference), focus states visible.
- [ ] **Copy:** short, concrete, benefit-led. "Earn a courier fee on items you bring back" beats "Submit trip."
- [ ] **No orphan color:** every color used is either gray, black, a defined status color, or a country tint.

## Trust cues (marketplace-specific)

- Show ratings and trips/requests completed wherever a person appears (TripCard already does).
- Use escrow / money-back / verified language near money and commitment points.
- Prefer real social proof (recent matches, counts) over invented testimonials.

## Anti-patterns to avoid
- New accent colors or gradients outside the system.
- Modals for things that could be a page or inline (Arbi uses pages + toasts well).
- Dense forms — Arbi's forms are one clear column with helper text. Keep it.
- "Success" that only changes a URL. Confirm with UI (toast, optimistic state, redirect to a meaningful page).
- Blocking spinners where an optimistic update would feel instant (see `RequestActions`).

## Quick reference: reusable pieces already built
- `EmptyState` (in `app/dashboard/page.tsx`) — pattern for empty views.
- `.arbi-input` + `Field` wrappers (post-trip / post-request) — forms.
- Status badge maps (`STATUS_BADGE`, `BADGE`) — reuse, don't redefine.
- `ModeToggle` — the reference for accessible, animated toggles.
- `TripCard` / `TripCardSkeleton` — list item + its loading twin.
