# Environment Variables

Last updated: 2026-07-17

All of these live in `.env.local` (git-ignored, never committed). This file documents
what each one is for. Values marked "deferred" are for services not yet wired up.

Create your own `.env.local` with these keys:

```bash
# --- Database (Supabase Postgres, used via Drizzle + postgres driver) ---
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/postgres   # Supabase connection string

# --- Clerk (auth) ---
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx                              # from the Clerk webhook settings

# --- Supabase client (currently unused; app uses Drizzle directly) ---
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# --- Deferred services (stubs only; safe to leave blank for now) ---
STRIPE_SECRET_KEY=                                         # deferred (payments/escrow)
RESEND_API_KEY=                                            # deferred (email/notifications)
NEXT_PUBLIC_POSTHOG_KEY=                                   # deferred (analytics)
```

## Which vars are actually required to run today
- `DATABASE_URL` - required for `/dashboard` and `/trips/[id]` (real DB reads/writes).
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` - required for the app to
  boot (ClerkProvider and middleware run on every request).
- `CLERK_WEBHOOK_SECRET` - required only for the `/api/webhooks/clerk` route.

## Clerk webhook setup (for Day 5)
- URL to paste into the Clerk dashboard:
  `https://YOUR_DEPLOYED_DOMAIN/api/webhooks/clerk`
- Events to subscribe to: `user.created`, `user.updated`, `user.deleted`
  (only `user.created` is handled in code today; the other two land on Day 5).
