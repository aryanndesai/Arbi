# Arbi — UI Guidelines & "What Good UI Means"

_A working design system for Arbi, plus the principles behind it and a
prioritized list of concrete improvements. Written against the code that exists
today (Tailwind v4, Geist, the black/white/gray palette in `app/globals.css`)._

---

## Part 1 — What "good UI" actually means

Good UI isn't decoration. It's a set of decisions that lower the effort a person
spends to do the thing they came to do. Six principles, in priority order:

1. **Clarity over cleverness.** A first-time visitor should understand what Arbi
   is and what to do next within ~5 seconds, without reading a paragraph. If a
   buyer can't tell the product is for them, nothing else matters.
2. **One primary action per screen.** Every view has exactly one obvious next
   step (a single filled black button). Everything else is secondary (outline)
   or tertiary (text link). Two equally-loud buttons = no primary action.
3. **Consistency is trust.** Same corner radius, same spacing rhythm, same
   button shapes everywhere. Inconsistency reads as "unfinished" and, on a
   marketplace handling money, as "unsafe."
4. **Feedback for every action.** Clicks show loading; success shows a state
   change; errors say what went wrong and how to fix it. Silence feels broken.
   (Arbi already does this well: skeletons, optimistic accept/decline, toasts.)
5. **Hierarchy through weight & space, not lines.** Size, weight, and whitespace
   should carry the eye. Borders and dividers are a last resort. Arbi's current
   look leans on this correctly — keep it.
6. **Accessible by default.** Sufficient contrast, real focus states, keyboard
   operability, `aria` on custom controls, and honoring
   `prefers-reduced-motion`. Accessible design is just good design with fewer
   people excluded.

**How to test UI (not vibes):**

- **The 5-second test:** show `/` to someone new for 5s, hide it, ask "what is
  this and who is it for?" If they can't answer, the hero failed.
- **The squint test:** blur your eyes at a screen. The one thing that stays
  visible should be the primary action. If nothing dominates, hierarchy is off.
- **Keyboard-only pass:** unplug the mouse, Tab through every flow. Anything you
  can't reach or can't see focused is broken.
- **Contrast check:** run text colors through a WCAG checker; body text needs
  ≥ 4.5:1, large text ≥ 3:1.
- **Real-content test:** view every screen with 0 items, 1 item, and 50 items.
  Empty and overflow states break more designs than the happy path.

---

## Part 2 — Arbi's design system (as it exists, formalized)

The current look is a clean, editorial, near-monochrome aesthetic. It's good.
This section names the tokens so new work stays consistent.

### Color

| Token | Value | Use |
| --- | --- | --- |
| Ink / primary | `text-gray-900` / `bg-black` | Headlines, primary buttons |
| Body | `text-gray-500` / `text-gray-600` | Paragraphs, secondary text |
| Muted label | `text-gray-400 uppercase tracking-wide` | Section eyebrows |
| Surface | `bg-white` | Page background |
| Subtle surface | `from-gray-50/30 to-white` gradient | Cards, empty states |
| Hairline | `border-gray-100` | Card borders (very light) |
| Status: pending | amber-100/800 | Request pending |
| Status: accepted | green-100/800 | Request accepted |
| Status: declined | gray-100/700 | Request declined |
| Status: completed | blue-100/800 | Completed |

Keep status colors **only** for status. Don't introduce new accent colors
casually — the restraint is what makes it feel premium.

### Type

- Font: **Geist Sans** (body/UI), **Geist Mono** (reserved). Loaded in `layout.tsx`.
- Scale in use: hero `text-4xl sm:text-5xl font-bold`, page title `text-3xl font-bold`,
  card title `text-xl font-bold`, body `text-sm`/`text-base`, eyebrow `text-sm uppercase`.
- Rule: **one bold headline per section.** Don't bold body text to add emphasis;
  use color/weight tokens above.

### Shape & spacing

- Radii: pills = `rounded-full` (buttons, chips, toggles); cards = `rounded-2xl`;
  inputs = `.arbi-input` (`0.875rem`). **Never mix** a `rounded-lg` button into
  this system.
- Container: `max-w-4xl` (index/list) or `max-w-3xl` (detail) `mx-auto px-6`.
- Vertical rhythm: sections use `pt-8/pt-12 pb-12/pb-20`. Keep multiples of 4.

### Buttons (the contract)

| Level | Class recipe | When |
| --- | --- | --- |
| Primary | `px-5/6 py-2.5/3 bg-black text-white rounded-full hover:bg-gray-800` | The one main action |
| Secondary | `border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50` | Alternative action |
| Tertiary | `text-xs text-gray-500 hover:text-gray-900` | Low-priority links |

One primary per screen. Everything else steps down.

### Motion

Defined in `globals.css`: `arbi-fade-in` (page/section entrances),
`arbi-toast-in/out`, `arbi-slide-up`, `arbi-shimmer` (skeletons). Durations
200–280ms, `ease-out`. Rule: **animate entrances and feedback, never idle
decoration.** Add a `prefers-reduced-motion` guard (see fixes).

### Components to reuse (don't re-invent)

`TripCard`, `TripCardSkeleton`, `EmptyState` (inline in dashboard/trip pages —
consider extracting), status badge helper, `Stat` tile, `ModeToggle`.

---

## Part 3 — Prioritized UI improvements

Ranked by impact-to-effort. Each ties to a real file.

### High impact

1. **Homepage trust signals** _(Priority 2, still missing)_ — Add a row under
   `HowItWorks`: **Escrow payments · Verified travelers · Money-back guarantee**,
   each an icon + label + one line. This is the single biggest gap for buyer
   confidence on a money-handling marketplace. _File:_ new section in
   `app/page.tsx` (or a `TrustSignals` component).
2. **Recent matches strip** _(Priority 2)_ — social proof: "Yumi brought Onitsuka
   Tigers from Tokyo 🇯🇵 → 🇸🇬 · saved $80". Placeholder/seeded data is fine.
   Answers "does anyone actually use this?"
3. **Real buyer identity on trip detail** — right now real-DB requests show `?`
   avatars (see AUDIT 1.2). Fixing the buyer join is a data task but its payoff
   is UI: the accept/decline list becomes trustworthy.

### Medium impact

4. **Dark mode** — `globals.css` declares `--background`/`--foreground` but never
   wires `prefers-color-scheme`. Either commit to light-only (fine) or implement
   dark properly. Half-implemented tokens invite bugs — pick one.
5. **Focus-visible states** — custom pill buttons rely on default outlines. Add
   `focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2`
   to the button recipes for keyboard users.
6. **Contrast on muted labels** — `text-gray-400` uppercase eyebrows are ~3:1 on
   white, under the 4.5:1 body threshold. They're large/bold enough to pass as
   large text, but bump to `text-gray-500` where they carry meaning.
7. **`prefers-reduced-motion`** — wrap the `animate-arbi-*` utilities so users who
   opt out of motion don't get fades/toasts. One `@media` block in `globals.css`.

### Polish

8. **Extract `EmptyState`** into a shared component (duplicated in dashboard and
   trip detail with slightly different markup).
9. **Mode-aware `/trips`** — the browse page should echo the shopping/travelling
   framing for consistency with the homepage.
10. **Skeleton parity** — ensure list pages show `TripCardSkeleton` during data
    fetch (there's a `trips/loading.tsx` — verify it covers the grid).

---

## Part 4 — Definition of done for any UI change

Before you call a UI change finished:

- [ ] Passes the squint test (clear primary action).
- [ ] Works at 0 / 1 / many items.
- [ ] Keyboard reachable with a visible focus ring.
- [ ] Body text ≥ 4.5:1 contrast.
- [ ] Uses existing tokens (radii, colors, button levels) — no new one-offs.
- [ ] Looks right at 375px (mobile) and ≥ 1024px (desktop).
- [ ] Respects `prefers-reduced-motion`.
- [ ] Logged in `docs/CHANGELOG.md`.
