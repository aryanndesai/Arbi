# Arbi — Environment Variables

Copy these into `.env.local` at the project root. `.env.local` is gitignored —
never commit real secrets. Placeholders below show the shape, not real values.

## Required to boot the app

| Variable | Used by | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `db/index.ts` (Drizzle + drizzle-kit) | Postgres connection string. The db client **throws on import** if this is missing, so it is required for `next build` too. Supabase gives you this under Project → Database → Connection string. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk provider / client | From the Clerk dashboard. |
| `CLERK_SECRET_KEY` | Clerk server (`auth()`) | From the Clerk dashboard. Secret — server only. |

## Required for the Clerk → Postgres webhook

| Variable | Used by | Notes |
|----------|---------|-------|
| `CLERK_WEBHOOK_SECRET` | `app/api/webhooks/clerk/route.ts` | The signing secret from the Clerk **Webhooks** page (starts with `whsec_`). Route returns 500 without it. |

### Wiring the webhook in the Clerk dashboard
- **Endpoint URL:** `https://<your-domain>/api/webhooks/clerk`
- **Events to subscribe:** `user.created` (handled today). Add `user.updated` and `user.deleted` once Day 7 lands.

## Referenced but currently unused (stubs — safe to leave as placeholders)

| Variable | Stub file | Status |
|----------|-----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase.ts` | App talks to Postgres via Drizzle, not the Supabase JS SDK. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase.ts` | Same. |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` | Payments deferred. |
| `RESEND_API_KEY` | `lib/resend.ts` | Email deferred. |
| `NEXT_PUBLIC_POSTHOG_KEY` | `lib/posthog.ts` | Analytics deferred. |

## Template

```bash
# --- Required ---
DATABASE_URL="postgresql://user:password@host:5432/postgres"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# --- Deferred / stubbed (placeholders are fine) ---
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ey..."
STRIPE_SECRET_KEY="sk_test_..."
RESEND_API_KEY="re_..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
```
