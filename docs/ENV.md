# Environment Variables

_Last updated: 2026-07-16._

Create `.env.local` in the project root (it is gitignored). None of these are committed. Values
below are placeholders — replace with your real keys.

```bash
# --- Database (Supabase Postgres connection string) ---
# Used by Drizzle in db/index.ts and drizzle.config.ts.
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres"

# --- Clerk (auth) ---
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"
# Signing secret from the Clerk dashboard webhook you create (see below).
CLERK_WEBHOOK_SECRET="whsec_xxx"

# --- Supabase client (currently a stub, not required to run) ---
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"

# --- Later features (stubs only, safe to leave unset for now) ---
# STRIPE_SECRET_KEY="sk_xxx"
# RESEND_API_KEY="re_xxx"
# NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
```

## Clerk webhook setup (for user sync)

1. In the Clerk dashboard go to **Webhooks -> Add Endpoint**.
2. Endpoint URL (production): `https://YOUR_DOMAIN/api/webhooks/clerk`
   - Local testing: expose your dev server (e.g. with a tunnel) and use
     `https://YOUR_TUNNEL/api/webhooks/clerk`.
3. Subscribe to these events:
   - `user.created` (handled today)
   - `user.updated` (handled after Roadmap Day 5)
   - `user.deleted` (handled after Roadmap Day 5)
4. Copy the endpoint's **Signing Secret** into `CLERK_WEBHOOK_SECRET`.

## Notes
- `db/index.ts` throws at startup if `DATABASE_URL` is missing, so set it first.
- The Supabase `NEXT_PUBLIC_*` vars only matter once `lib/supabase.ts` becomes a real client;
  the app currently talks to Postgres directly through Drizzle using `DATABASE_URL`.
