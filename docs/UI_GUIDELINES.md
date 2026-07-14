# Arbi — UI Guidelines

_What "nice UI" means for this project, written against the code that already exists. Arbi already has a coherent, restrained aesthetic — the goal is to protect and extend it, not restyle it._

---

## What good UI actually means (the principles)

Good UI is not decoration. It's the set of choices that let a stranger accomplish their goal without thinking about the interface. Six principles, in priority order:

1. **Clarity over cleverness.** The user should always know what this screen is, what they can do, and what happens next. Arbi's two-sided marketplace makes this hard — every screen must read correctly whether you're a traveler or a buyer. The mode toggle exists precisely for this.
2. **One primary action per screen.** Everything else is secondary. On `/post-trip` the primary action is "Post trip." On `/trips/[id]` it's "Request item" (buyer) or accept/decline (owner). Don't compete two black buttons against each other.
3. **Consistency.** A rounded-full black button means "the main thing to do" everywhere. A dashed border means "empty, here's what to do." Reuse these; don't invent a new treatment per page.
4. **Feedback for every action.** A click should visibly do something within ~100ms — optimistic update, spinner, toast. `RequestActions` and `ModeToggle` already do this well; match that bar.
5. **Forgiveness.** Show errors inline near the cause, never a dead 500 page. Confirm destructive actions. Preserve form input on failure.
6. **Accessibility is baseline, not polish.** Real focus states, `aria-*` on toggles/tabs, 4.5:1 text contrast, works with keyboard only. The codebase already uses `role="tablist"`, `aria-selected`, `aria-live` — hold that line.

A screen passes if a first-time user, given no instructions, does the right thing.

---

## Arbi's design system (extracted from the current code)

The app already follows a tight, Vercel-adjacent system. Documenting it so it stays consistent:

**Color**
- Surface: `bg-white`, subtle gradients `from-gray-50/30 to-white`
- Text: `text-gray-900` (primary), `text-gray-500` (secondary), `text-gray-400` (labels)
- Primary action: `bg-black text-white` → `hover:bg-gray-800`
- Borders: `border-gray-100` / `border-gray-200`, hairline dividers
- Status badges: amber = pending/open, green = accepted, blue = completed, gray = declined, purple = in-transit

**Shape & spacing**
- Radii: `rounded-full` (pills, buttons, avatars), `rounded-2xl` (cards, panels)
- Cards: `border border-gray-100 rounded-2xl p-6` on a faint gradient
- Layout widths: `max-w-3xl` (detail/forms), `max-w-4xl` (grids/dashboard)
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`

**Type**
- Font: Geist Sans (body), Geist Mono (available)
- Hero: `text-4xl sm:text-5xl font-bold leading-[1.1]`
- Section labels: `text-sm font-medium text-gray-400 uppercase tracking-wide`

**Motion**
- `animate-arbi-fade-in` on page sections (280ms, translateY(6px))
- Toasts slide from top; skeletons shimmer
- Keep animations <300ms and `ease-out`; never block interaction

**Buttons**
- Primary: `px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800`
- Secondary: `border border-gray-200 text-gray-700 hover:bg-gray-50`, same shape
- Never more than one primary in a viewport

**Empty states** (already a strength — reuse the pattern)
- Dashed border, big emoji, bold one-liner, muted explainer, one primary CTA

---

## Concrete improvements (mapped to ROADMAP Day 6)

1. **Buyer CTA on the trip card.** Cards currently only link to detail. Add a small "Request item →" on hover/focus so buyers act from the grid. (Known-issue #3.)
2. **Trust row on the homepage.** Three compact items — 🔒 Escrow payments · ✅ Verified travelers · ↩️ Money-back guarantee — under the hero. Marketplaces live and die on trust signals above the fold.
3. **Recent matches strip.** Social proof: "Yumi brought a camera from Japan to a buyer in Singapore." Real data if available, tasteful placeholder if not.
4. **Dark mode.** `globals.css` defines only light tokens. Add `@media (prefers-color-scheme: dark)` overrides and audit every hardcoded `bg-white` / `text-gray-900`. This is the biggest gap between "looks nice in the demo" and "looks nice for everyone."
5. **Skeletons everywhere.** `/trips` has `loading.tsx` + `TripCardSkeleton`. `/dashboard` and `/trips/[id]` should too, so navigation never flashes blank.
6. **Mobile pass.** Test every screen at 375px. The nav already collapses well; verify the trip-detail stat grid and forms don't overflow.

---

## Definition-of-done UI checklist (run before calling any screen finished)

- [ ] There is exactly one obvious primary action.
- [ ] It reads correctly in both traveller and shopper mode.
- [ ] Every interactive element has a visible focus state.
- [ ] Loading state exists (skeleton or spinner) — no blank flash.
- [ ] Empty state exists and offers a next step.
- [ ] Errors show inline, near the cause, and preserve input.
- [ ] Text meets 4.5:1 contrast in light **and** dark.
- [ ] No horizontal scroll at 375px.
- [ ] Actions give feedback within ~100ms.
- [ ] Spacing, radii, and colors match the system above (no one-off values).
