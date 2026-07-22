# Arbi UI Guidelines — What "good UI" means here

_Last updated: 2026-07-22_

This is the design language already present in the codebase, written down so every new screen
looks like it belongs. Good UI for Arbi is **calm, trustworthy, and fast to read** — this is a
marketplace where people hand strangers money and luggage space, so clarity and trust beat
decoration every time.

## Principles

1. **Clarity over cleverness.** A first-time visitor should understand "travelers carry, buyers
   request" within one screen. Copy is plain and benefit-led, not jargon.
2. **Trust is a feature.** Ratings, verified badges, escrow language, and money-back guarantees
   are shown early and often. Never bury the safety story.
3. **One primary action per view.** Each screen has a single obvious next step (a black pill
   button). Secondary actions are outlined, not filled.
4. **Two audiences, one surface.** The Travelling/Shopping mode toggle reframes the same product;
   copy and CTAs must adapt to the active mode.
5. **Fast to scan.** Short lines, generous whitespace, left-aligned text, numbers right-aligned in
   lists.

## Visual system (do not reinvent — reuse)

- **Palette:** monochrome. White background `#ffffff`, near-black text `#171717`, grays
  `gray-400/500/700/900`. Color is reserved for **status only**:
  - amber = pending/open, green = accepted, blue = completed, gray = declined, purple = in-transit.
- **Accent:** tasteful emoji (✈️ 🛍️ 📦 🌍) as lightweight iconography. Keep them sparing.
- **Typography:** Geist sans. Headings `font-bold`/`font-extrabold`, tight tracking on big titles.
  Section labels are `text-xs uppercase tracking-wide text-gray-400`.
- **Shape language:**
  - Buttons / pills → `rounded-full`.
  - Cards / inputs / containers → `rounded-2xl` (inputs use the `.arbi-input` class).
  - Borders are light: `border border-gray-100` / `border-gray-200`.
- **Buttons:**
  - Primary: `bg-black text-white rounded-full hover:bg-gray-800`.
  - Secondary: `border border-gray-200 text-gray-700 hover:bg-gray-50`.
- **Motion:** subtle only. Use `animate-arbi-fade-in` on page sections; `active:scale-[0.98]` on
  primary buttons. Respect that animations are short (~220–280ms).
- **Layout widths:** content columns cap at `max-w-3xl` (detail/forms) or `max-w-4xl` (grids/lists),
  `mx-auto px-6`. Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

## Reusable utilities (in `app/globals.css`)

- `.animate-arbi-fade-in`, `.animate-arbi-slide-up`, `.animate-arbi-toast-in/out`
- `.arbi-skeleton` (shimmer loaders), `.arbi-gradient-border`, `.arbi-input`

## State coverage checklist (every data view must handle all four)

- **Loading** — skeletons (`.arbi-skeleton`) or a `loading.tsx`, never a blank flash.
- **Empty** — dashed `rounded-2xl` panel, emoji, one-line explanation, one CTA. (See dashboard.)
- **Error** — inline red note (`text-red-600 bg-red-50 border border-red-100`), never a raw 500.
- **Populated** — the happy path.

## Accessibility bar

- All interactive elements reachable by keyboard; visible focus (`focus:` styles / rings).
- `aria-label` on icon-only buttons (see Navbar hamburger, mode toggle `role="tablist"`).
- Status conveyed by text + color, never color alone.
- Contrast: body text at `gray-500` or darker on white.

## Anti-patterns (don't)

- Don't introduce new brand colors or gradients beyond the status palette.
- Don't use em dashes in code comments.
- Don't ship a data view without an empty state.
- Don't mix filled + outlined buttons of equal weight in the same action row.
</content>
