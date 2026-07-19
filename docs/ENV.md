# Arbi — Environment Variables

Create `.env.local` in the project root (it's gitignored). Values below are the
full set the codebase references today. Real values for Clerk + the database;
placeholders for services that are stubbed until later.

```bash
# --- Database (Drizzle + postgres-js) -------------------------------------
# Postgres connection string. If using Supabase, this is the "Connection string"
# (Session/Transaction pooler) from Project Settings -> Database.
DATABASE_URL="postgresql://user:password@host:5432/postgres"

# --- Clerk (auth) ----------------------------------------------------------
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"
# Signing secret from Clerk Dashboard -> Webhooks -> your endpoint
CLERK_WEBHOOK_SECRET="whsec_xxx"

# --- Supabase JS (stub, not yet used by the data layer) --------------------
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx"

# --- Later features (stubs today, safe to leave as placeholders) -----------
STRIPE_SECRET_KEY="sk_test_xxx"          # payments/escrow (Priority: later)
RESEND_API_KEY="re_xxx"                  # transactional email (later)
NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"        # analytics (later)
```

## Where each is read

| Var | Read in |
| --- | --- |
| `DATABASE_URL` | `db/index.ts`, `drizzle.config.ts` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk SDK (`layout.tsx`, `middleware.ts`) |
| `CLERK_WEBHOOK_SECRET` | `app/api/webhooks/clerk/route.ts` |
| `NEXT_PUBLIC_SUPABASE_*` | `lib/supabase.ts` (stub) |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` (stub) |
| `RESEND_API_KEY` | `lib/resend.ts` (stub) |
| `NEXT_PUBLIC_POSTHOG_KEY` | `lib/posthog.ts` (stub) |

## Notes

- `db/index.ts` **throws at import** if `DATABASE_URL` is missing, so the app
  won't boot without it. Set it first.
- Only `NEXT_PUBLIC_*` vars reach the browser. Keep secret keys un-prefixed.
- After setting `DATABASE_URL`, run `npx drizzle-kit push` to create tables.
