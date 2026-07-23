# Arbi — UI Guidelines

_What "nice UI" means for Arbi, and the concrete design system already present
in the code. Use this as the bar for the Day 9 polish pass and every new screen._

---

## Part 1 — What good UI actually means

Good UI is not decoration. It is **the interface getting out of the way** so the
user reaches their goal with the least friction and the most confidence. Six
principles, in priority order:

1. **Clarity beats cleverness.** The user should never wonder "what does this do?"
   or "what happens if I click this?" Labels say what they mean ("Post trip", not
   "Submit"). One primary action per screen, visually dominant.
2. **Hierarchy guides the eye.** Size, weight, color, and spacing tell the user
   what to look at first, second, third. If everything is bold, nothing is.
3. **Consistency lowers the learning cost.** The same action looks the same
   everywhere. A black pill is always the primary button. A gray badge always
   means the same kind of status. Users learn the system once.
4. **Feedback for every action.** Clicks show a pressed state; async actions show
   loading; success and error are visible, not silent. Optimistic UI (update
   first, roll back on failure) makes the app feel instant.
5. **Forgiveness.** Empty states teach instead of dead-ending. Errors explain and
   offer a next step. Destructive actions confirm.
6. **Accessibility is not optional.** Keyboard reachable, visible focus, real
   contrast (WCAG AA: 4.5:1 for text), semantic HTML, `aria-*` where the visual
   cue is not enough. If it only works with a mouse, it is broken for many users.

A screen is "nice" when a first-time user finishes their task without asking a
question, on a phone, with a keyboard, and knows at every step that it worked.

---

## Part 2 — Arbi's design system (as built)

The codebase already has a coherent, minimal, Vercel-flavored aesthetic. Keep it.
Do not introduce a second visual language.

### Color
- **Canvas:** white (`bg-white`). Generous whitespace.
- **Primary action:** black — `bg-black text-white rounded-full`, hover `bg-gray-800`, active `scale-[0.98]`.
- **Secondary action:** `border border-gray-200 text-gray-700`, hover `bg-gray-50`.
- **Text scale:** `text-gray-900` (headings) → `text-gray-700` → `text-gray-500` (support) → `text-gray-400` (labels/uppercase).
- **Accent:** amber (`amber-100/800` badges, `#F59E0B` globe arcs) for "attention / pending / activity".
- **Status colors:** green = accepted, gray = declined, blue = completed, amber = pending/open. (See `STATUS_BADGE` maps — keep them identical across pages.)
- **Per-country tints:** soft gradient card backgrounds from `lib/country-style.ts`. This is a signature touch — reuse it, don't reinvent per-card colors.

### Typography
- Geist Sans throughout, Geist Mono reserved for code/monospace only.
- Headings: `font-bold`/`font-extrabold`, `tracking-tight`.
- Section labels: `text-xs uppercase tracking-wide text-gray-400`.
- Body: `text-sm`/`text-base`, `text-gray-500` for supporting copy.

### Shape & depth
- Cards: `rounded-2xl` with `border-gray-100`. Buttons/badges/pills: `rounded-full`.
- Elevation is subtle: `hover:shadow-lg hover:-translate-y-0.5` on cards; avoid heavy drop shadows.
- Inputs: `rounded-xl`/`rounded-2xl`, border `gray-200`, focus border darkens to `gray-900`. Use the shared **`arbi-input`** class — do not hand-roll `<style>` blocks (the post-request form currently does; fix in Day 9).

### Motion (defined in `app/globals.css` — reuse, don't add new ones casually)
- `animate-arbi-fade-in` — page/section entrance (280ms).
- `animate-arbi-toast-in` / `-out` — the mode-switch toast.
- `animate-arbi-slide-up` — chat panel.
- `arbi-skeleton` / `arbi-shimmer` — loading placeholders (see `TripCardSkeleton`).
- Keep transitions 150–300ms, `ease-out`. Respect `prefers-reduced-motion` (add a guard if you extend motion).

### Spacing & layout
- Content max-widths: `max-w-3xl` (reading/detail), `max-w-4xl` (grids), `max-w-xl` (forms). Stay on this scale.
- Section rhythm: `px-6`, vertical `pt-12 pb-20` for top-level sections.
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `gap-4`.

### Components — the vocabulary
- **Primary pill button**, **secondary outline pill**, **status badge**, **stat card**, **empty state** (dashed border + emoji + title + body + CTA), **skeleton loaders**. These already exist and are consistent — extend them rather than inventing new patterns.
- Emoji are part of the brand voice (✈️ 🛍️ 📦). Use them as small accents, never as the only signal for meaning (pair with text).

---

## Part 3 — Polish checklist (run on every screen)

**Hierarchy & clarity**
- [ ] Exactly one primary (black) action per screen; everything else is secondary.
- [ ] Headings, support text, and labels use the gray scale above — no random grays.

**Feedback**
- [ ] Every button has hover + active + disabled states.
- [ ] Every async action shows loading ("Posting…") and cannot be double-submitted.
- [ ] Errors render inline in the red info style (`bg-red-50 border-red-100 text-red-600`), never a silent failure.

**Empty & edge states**
- [ ] Empty lists show the teaching empty-state with a CTA, not a blank box.
- [ ] Long strings truncate (`truncate`, `min-w-0`) instead of breaking layout.

**Accessibility**
- [ ] Tab order is logical; every interactive element is reachable and has a visible focus ring.
- [ ] Icon-only buttons have `aria-label` (chat, menu — already done; keep the habit).
- [ ] Text contrast ≥ 4.5:1. Watch `text-gray-400` on white for anything that must be read (it's borderline — reserve it for decorative labels).
- [ ] Toggles/tabs use `role`/`aria-selected` (the ModeToggle does — match it).

**Responsive**
- [ ] Check 375px (iPhone SE), 768px, 1280px. No horizontal scroll.
- [ ] Mobile nav (hamburger) works and closes on navigation.

**Consistency**
- [ ] Status colors match the shared maps exactly.
- [ ] New inputs use `arbi-input`. New cards use `rounded-2xl border-gray-100`.

---

## Part 4 — Quick "is this nice?" gut check
Before shipping a screen, ask:
1. Could a first-time buyer/traveler finish the task without help?
2. Is there one obvious next step?
3. Does it work on a phone, with a keyboard, and when the data is empty or errors?
4. Does it look like the rest of Arbi, or like a different app?

If any answer is "no", it is not done yet.
