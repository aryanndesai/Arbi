# Arbi — UI Guidelines & Review

## What "good UI" means (and how it applies here)

Five criteria, in priority order when they conflict:

1. **Clarity over cleverness.** A first-time visitor should understand what Arbi does and what to click within 5 seconds, without reading a paragraph. Copy beats iconography beats color.
2. **Consistency.** The same kind of thing should always look the same way — one button shape, one status-badge system, one spacing scale, one loading pattern. Consistency is what makes an interface feel "designed" rather than assembled.
3. **Feedback.** Every action a user takes (submit a form, accept a request, switch modes) needs an immediate, visible response — a state change, a toast, a disabled button while pending. Silence after a click reads as broken, even when the request actually succeeded.
4. **Accessibility.** Sufficient color contrast, visible focus states, semantic HTML, and `aria-*` where the visual structure doesn't already convey it. This isn't a nice-to-have pass at the end — it's part of "does it work."
5. **Restraint.** Motion, color, and decoration should support the above four, not compete with them. A minimal palette used consistently reads as more trustworthy than a colorful one used inconsistently — especially for something handling money and trust between strangers.

None of this requires a component library. It requires applying the same few decisions everywhere.

---

## Current state — what's already good

This codebase already gets several things right, worth protecting rather than "fixing":

- **One color language for status everywhere.** `pending` = amber, `accepted` = green, `declined` = gray, `completed` = blue — and it's the *exact same* badge markup (`STATUS_BADGE` / `statusBadge()`) repeated in `RequestActions.tsx`, `app/trips/[id]/page.tsx`, and `app/dashboard/page.tsx`. That's the right instinct; see "worth fixing" below for why it's currently three separate copies of the same object instead of one shared one.
- **One shape language for actions.** Every primary CTA is a black pill (`rounded-full bg-black text-white`), every secondary action is an outlined gray pill. That's a real, consistent system, not incidental.
- **Feedback is mostly there.** Forms disable their submit button and show a "Posting…"/"Submitting…" label while in flight (`post-trip`, `PostRequestForm`); `RequestActions` does optimistic UI (flips the badge immediately, reverts on error) plus an inline error message; `ModeToggle` shows a toast confirming the switch. This is above-average attention to feedback for a project at this stage.
- **Loading states exist where they exist:** `app/trips/loading.tsx` + `TripCardSkeleton` give `/trips` a real shimmer skeleton instead of a blank flash.
- **Restraint:** black/white/gray base palette with color reserved for status and destination-country tinting (`lib/country-style.ts`). Nothing competes with the primary action.

---

## Worth fixing

### 1. The status-badge map is defined three separate times
`RequestActions.tsx`, `app/trips/[id]/page.tsx`, and `app/dashboard/page.tsx` each hardcode their own version of the pending/accepted/declined/completed → color-class mapping. They already agree with each other today, but there's nothing stopping them from silently drifting (e.g. someone adds an `"in_transit"` case to one and not the others — which has *already* half-happened, since `dashboard/page.tsx`'s `statusBadge()` has extra cases for `"in_transit"` and `"full"` that the other two copies don't). Pull this into one shared helper (e.g. `lib/status-badge.ts`) and import it everywhere. This is the single highest-value, lowest-risk cleanup in the whole UI layer.

### 2. Loading states are inconsistent across routes
`/trips` has a skeleton. `/dashboard`, `/trips/[id]`, and `/profile/[id]` — all server components doing DB round-trips — have no `loading.tsx` at all, so they'll show nothing (a blank page under the sticky navbar) until the data resolves. Add a `loading.tsx` skeleton for each, reusing `TripCardSkeleton`/a generic version of it where it fits.

### 3. Color contrast and focus states need a pass
Several places use `text-gray-400` or `text-gray-500` at small sizes (`text-[10px]`, `text-xs`) for body copy that's meant to be read, not just decorative (empty-state body text, timestamps, badges' uppercase labels). At small sizes, gray-on-white contrast ratios get tight — worth running an actual contrast check rather than eyeballing it. Separately, `Navbar`'s nav links and `TripCard`'s clickable card use only `hover:` states in some places with no visible `focus-visible:` ring — meaning keyboard-only users lose track of what's focused. Add `focus-visible:ring-2 focus-visible:ring-black/20` (or similar) to every interactive element that currently only styles `:hover`.

### 4. The homepage doesn't say what happens with money
Neither mode's hero, nor `HowItWorks`, mentions *when* money changes hands, *who* holds it, or what happens if an item never arrives. For a marketplace between strangers moving physical goods, that ambiguity is a trust problem before it's a UI problem — but the UI is where it needs to surface. Don't invent an escrow claim that isn't true yet (see `docs/ROADMAP.md` Day 6) — but do say plainly, today, something like "courier fee is agreed before the trip, paid directly for now" if that's the actual current mechanism, rather than saying nothing.

### 5. `HowItWorks` and `HeroSection` copy has a slight mismatch
`HeroSection` in shopping mode says a traveler "brings it back for a small fee," and its secondary CTA is "Post a request" — but there is no page that lets you post a request without first picking a trip (`/post-request/[tripId]` requires a `tripId`). That secondary CTA currently points at `/trips` regardless (check: `HeroSection.tsx` line ~69 — the "Post a request" button links to `/post-trip`, which is the *traveler* flow, not a buyer request flow). That's a real mislabeled link, not just a copy nit — a buyer in shopping mode clicking "Post a request" lands on the traveler trip-creation form.

### 6. No dark mode / no `prefers-color-scheme` handling
Not urgent, but worth a conscious decision rather than an accident: `globals.css` defines `--background`/`--foreground` CSS variables in a way that *looks* like it's set up for theming, but everything else in the app hardcodes `bg-white`/`text-gray-900` directly rather than using those variables. Either commit to light-mode-only deliberately (fine, just say so) or actually wire the variables through.

---

## Test plan (run this in an actual browser before shipping any UI change)

This session did not have `DATABASE_URL` or Clerk keys available, and `node_modules` isn't installed in this container, so none of the below was run live this pass — it's a checklist for whoever next has real credentials and a running `npm run dev`. Treat "audit §1.6 / §1.4" claims in `docs/AUDIT.md` as code-read-verified, not click-verified, until this list has actually been run once.

1. **Signed out, `/`:** hero renders in "travelling" mode by default. Toggle to "shopping" — headline, subtext, form, and both CTAs should change. Click the shopping-mode secondary CTA and confirm it goes where its label says (see "Worth fixing" #5).
2. **Signed out, `/trips`:** filter by each destination pill, confirm the list narrows correctly and the "All destinations" pill deselects the others.
3. **Sign up as a new user (Clerk modal from the navbar).** Confirm a `users` row gets created (webhook working) before doing anything else.
4. **As that user, `/post-trip`:** submit with an invalid date range (return before departure) and confirm there's a validation message, not just a silent failure or a 500 from the API route (the API route doesn't currently check `returnDate > departureDate` — worth confirming whether that's intentional).
5. **After posting, `/dashboard`:** the new trip appears immediately under "My trips" with an accurate pending-request count (0).
6. **Open a second browser / incognito, sign up as a different user, find the first user's trip via `/trips` browsing (not a direct link)** — this will fail until Day 1 of `docs/ROADMAP.md` ships; that's expected and is the point of the check.
7. **As the second user, `/post-request/[tripId]`:** submit a request, confirm redirect to `/dashboard` and the request shows under "My requests" with status "Pending."
8. **As the first user (traveler), open `/trips/[id]` for that trip:** confirm the request appears under "Attached requests" with working Accept/Decline buttons, that clicking Accept updates the badge without a full page reload, and that a network failure (throttle to offline in devtools mid-click) correctly reverts the optimistic UI and shows the inline error.
9. **Keyboard-only pass:** tab through the navbar, a trip card grid, and a form, confirming visible focus at every stop (see "Worth fixing" #3).
10. **Mobile viewport (375px):** open the mobile nav menu, confirm it opens/closes cleanly and every nav link is reachable; check `/trips/[id]`'s two-column stat row and the request list don't overflow.
11. **Contrast check:** run the homepage and dashboard through a contrast checker (e.g. browser devtools' built-in one) specifically on the small gray text called out in "Worth fixing" #3.

Log the result of this test plan in `CHANGELOG.md` each time it's run, including what failed and what was fixed as a result — that log is what turns "we think the UI works" into "we know it works."
