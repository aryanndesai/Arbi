# Arbi — Manual Testing Notes

How today's fix was verified, and how to re-verify the core flows locally without needing real Clerk/Supabase credentials.

## Spinning up a disposable local database

```bash
# start a local Postgres (adjust for your OS/package manager)
service postgresql start   # or: pg_ctlcluster 16 main start

sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE arbi_test;"

echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/arbi_test' > .env.local

npx drizzle-kit push --force
```

Then seed a trip and request so the pages have something real to render:

```sql
INSERT INTO users (id, email, full_name, avatar_initials, traveler_rating, buyer_rating, trips_completed, requests_completed)
VALUES
  ('user_traveler1', 'traveler1@example.com', 'Test Traveler', 'TT', 4.8, 4.5, 3, 1),
  ('user_buyer1', 'buyer1@example.com', 'Test Buyer', 'TB', 4.2, 4.9, 1, 5);

INSERT INTO trips (id, traveler_id, from_country, to_country, from_flag, to_flag, departure_date, return_date, capacity_kg, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'user_traveler1', 'Singapore', 'Japan', '🇸🇬', '🇯🇵', '2026-09-01', '2026-09-10', 4, 'open');

INSERT INTO item_requests (id, trip_id, buyer_id, item_name, item_url, max_budget, courier_fee, status)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'user_buyer1', 'Nintendo Switch 2', 'https://example.com/switch2', 400, 30, 'pending');
```

Run `npx next dev`. Clerk automatically falls back to a "keyless" dev mode without real API keys — enough to click through unauthenticated pages, though not to fully exercise sign-in-gated flows without claiming real dev keys from the link it prints.

## What to check by hand

| Flow | Steps | Expected |
|---|---|---|
| Home page shows real trips | Visit `/` | Seeded trip appears in "Open trips", not placeholder mock data |
| Browse + filter | Visit `/trips`, click a destination filter | Seeded trip appears/disappears correctly by destination |
| Trip detail (non-owner) | Visit `/trips/<seeded-id>` | Shows the request with buyer name + rating, and the traveler's rating |
| Post a trip end to end | Sign in, go to `/post-trip`, submit | Redirects to `/dashboard`; new trip immediately visible on `/`, `/trips`, and its own `/trips/[id]` |
| Request an item end to end | From a trip's detail page, click "Request item", submit | Redirects to `/dashboard`; request appears under "My requests" and on the trip's detail page for the owner |
| Accept/decline | Sign in as the trip owner, open the trip, click Accept/Decline | Status badge updates without a full page reload; buttons disappear once resolved |
| Mode toggle | Toggle Travelling/Shopping in the navbar | Hero headline/CTA text changes; toast confirms the switch; persists across a refresh |

## Automated checks to run before any commit

```bash
npx tsc --noEmit
npx eslint .
npx next build   # requires DATABASE_URL to fully collect page data; will fail at that step without it, which is expected/fine outside a DB-connected environment
```

## Known testing limitation in a sandboxed/CI environment

Without real Clerk API keys, sign-in-gated flows (posting a trip, submitting a request, accept/decline) can't be driven through an actual browser session — Clerk's keyless dev mode is permissive enough for local page rendering but isn't a substitute for testing against real auth. When real Clerk keys are available, re-run the full table above through an actual signed-in session.
