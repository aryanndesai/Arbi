# Arbi UI Guidelines

Last updated: 2026-07-17

Two jobs: (1) say plainly what "good UI" means so decisions are not guesswork, and
(2) write down Arbi's actual design system so every new screen looks like it belongs.

---

## Part 1 - What good UI actually means

Good UI is not decoration. It is a series of small promises kept. The principles below
are the ones worth internalising, roughly in priority order.

1. **Clarity beats cleverness.** A user should understand what a screen is for and what
   to do next within a couple of seconds. If a label needs explaining, rewrite the label.
   Arbi's own history proves this: the old hero ("Turn your spare luggage into cash")
   was clear for travelers and baffling for buyers. The fix was clearer copy per mode,
   not a nicer animation.

2. **One primary action per screen.** Make the main thing obvious (a solid black button)
   and everything else quieter (outline or text link). Two equally-loud buttons means the
   user has to think. Arbi already does this well: `Post a trip` is solid, `Browse trips`
   is outline.

3. **Visual hierarchy through size, weight, and space - not boxes and lines.** Group
   related things with whitespace; separate sections with generous padding. Reach for a
   border only when proximity alone is not enough.

4. **Consistency is a feature.** The same concept should look the same everywhere: a
   status badge, a card, a fee. Users learn the pattern once. Divergence reads as a bug.
   (Concrete example: request-status badges must look identical on `/dashboard` and
   `/trips/[id]` - share one helper, do not re-style per page.)

5. **Feedback for every action.** Clicks show pending states; success and failure are
   visible. Arbi's `RequestActions` optimistic update + rollback-on-error is the model to
   copy: change the UI immediately, revert if the server disagrees, always show the error.

6. **Design the empty, loading, and error states, not just the happy path.** A new user
   sees empty states first. They should teach and invite ("You haven't posted any trips
   yet -> Post your first trip"), never dead-end. Arbi's dashboard and trips empty states
   already do this; hold every new screen to the same bar.

7. **Accessibility is baseline, not polish.** Real text (not text baked into images),
   labelled controls, visible focus rings, `aria-*` where roles are non-obvious (see
   `ModeToggle`'s `role="tablist"`), and colour that is never the *only* signal - pair it
   with a word or icon.

8. **Respect the user's device and attention.** Responsive by default, no horizontal
   scroll, tap targets at least ~40px, motion that is quick (200-300ms) and purposeful.
   Never animate just because you can.

9. **Trust is part of the UI.** For a marketplace handling money, signals like escrow,
   verification, and refunds are not marketing fluff - they lower the anxiety that stops
   people transacting. That is why the trust row lives on the homepage.

10. **Reduce, then reduce again.** The best UI improvement is often removing a field, a
    step, or a choice. Every element on screen has a cost in attention.

### A quick way to judge a screen
Ask, in order: *What is this? What can I do here? What happens if I do it? What if I have
nothing yet? What if it breaks?* If any answer is unclear, the UI is not done.

---

## Part 2 - Arbi's design system (as built)

Follow this so new work is indistinguishable from existing work.

### Typography
- Font: **Geist Sans** (`--font-geist-sans`), Geist Mono for the rare mono case.
- Scale in use: hero `text-4xl`/`text-5xl` bold; page titles `text-3xl` bold; card
  titles `text-xl` bold; body `text-sm`; meta/labels `text-xs`.
- Section eyebrows: `text-sm font-medium text-gray-400 uppercase tracking-wide`.

### Colour
- Base: white background, near-black text (`gray-900`).
- Neutrals: `gray-400` (muted labels), `gray-500` (secondary text), `gray-100`/`gray-200`
  (borders and chips).
- Primary action: solid **black** (`bg-black text-white`, hover `bg-gray-800`).
- Status colours (keep these exact meanings):
  - pending -> amber (`bg-amber-100 text-amber-800 border-amber-200`)
  - accepted / positive -> green (`bg-green-100 text-green-800 border-green-200`)
  - declined / neutral-off -> gray (`bg-gray-100 text-gray-700 border-gray-200`)
  - completed / info -> blue (`bg-blue-100 text-blue-800 border-blue-200`)
- Colour is never the only signal - always pair a badge colour with its label word.

### Shape and depth
- Cards and inputs: `rounded-2xl` (inputs use the `.arbi-input` helper, `rounded-xl`ish).
- Pills/buttons/badges: `rounded-full`.
- Borders: `border border-gray-100` for cards, subtle.
- Card fill: often a whisper gradient `bg-gradient-to-br from-gray-50/30 to-white`.
- Elevation is minimal: rely on hover (`hover:shadow-lg hover:-translate-y-0.5`) rather
  than resting shadows.

### Spacing and layout
- Page container: `max-w-4xl` (content), `max-w-3xl` (detail/forms), `mx-auto px-6`.
- Vertical rhythm: sections use `pt-*`/`pb-*` in the 8-20 range; grids use `gap-4`.
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for cards.

### Motion (defined in `globals.css`)
- `animate-arbi-fade-in` (280ms) for page/section entrances.
- `animate-arbi-toast-in/out` for the mode-change toast.
- `arbi-skeleton` shimmer for loading.
- Keep durations 200-300ms, easing `ease-out`. No infinite motion except skeletons.

### Components to reuse (do not reinvent)
- `Navbar`, `ModeToggle`, `TripCard`, `TripCardSkeleton`, empty-state blocks (dashed
  border + emoji + title + body + CTA), the `Stat` card pattern, status badges.
- Emoji are used deliberately as lightweight iconography (✈️ traveler, 🛍️ buyer,
  flags for routes). Keep them meaningful, not ornamental.

### New-component checklist
Before adding a component, confirm it:
- [ ] uses the container widths, `rounded-2xl`, and `border-gray-100` conventions
- [ ] uses the status-colour meanings above (if it shows status)
- [ ] has one clear primary action (solid black), others quieter
- [ ] has empty / loading / error states where relevant
- [ ] is keyboard reachable with a visible focus state
- [ ] has no `any` types and human-written comments (no em dashes in comments)
- [ ] reads correctly at 360px, 768px, 1280px with no horizontal scroll
