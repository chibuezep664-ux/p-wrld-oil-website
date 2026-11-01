# P-WRLD OIL website

A Next.js App Router application for public product enquiries and protected enquiry administration. Company copy is restricted to facts supplied by the business. Product categories are enquiry categories, not confirmed inventory.

## Requirements

- Node.js 20.9 or newer and npm.
- A Supabase project for persisted enquiries, administrator authentication, and shared rate limiting.

## Local setup

1. Open this folder in VS Code and install Node.js LTS if it is missing.
2. Copy `.env.example` to `.env.local` and set values using the environment guide below. Public Supabase values may be exposed to the browser. `SUPABASE_SERVICE_ROLE_KEY` is a server-only secret.
3. In the Supabase SQL Editor, run `supabase/schema.sql`.
4. Create an administrator in Supabase Dashboard → Authentication → Users (invite user/set password). Add the same email to `ADMIN_EMAILS`. Then, in SQL Editor, provision that exact user id/email in `public.admin_users` using the SQL in [Administrator setup](#administrator-setup). Do not allow public sign-up.
5. Run `npm install`, `npm run dev`, and open the local URL printed by Next.js.
6. Run `npm run typecheck`, `npm run lint`, and `npm run build` before deployment.

## Environment variables

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical production origin; set to localhost for local development. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/publishable key used for Auth. This key is safe to expose only with RLS enabled. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server-only database access for validated enquiry routes and admin operations. Never prefix with `NEXT_PUBLIC_`. |
| `ADMIN_EMAILS` | Server config | Comma-separated allowlist of administrator emails. Must match Supabase Auth users and `admin_users`. |

Never commit `.env.local` or real credentials. The example uses Supabase's anon-key naming for compatibility with the current `@supabase/ssr` client; a Supabase publishable key is compatible in this role. The service role is never browser accessible.

## Supabase setup

1. Create a Supabase project and configure Auth email/password. Disable public sign-ups; invite administrator accounts manually.
2. Run the full schema in `supabase/schema.sql`. It creates enquiry, admin registry, audit, and rate-limit tables, indexes, policies and the atomic rate-limit RPC.
3. Create/invite the intended admin under Auth → Users. Copy that Auth user UUID. Add its exact email to Vercel/local `ADMIN_EMAILS`.
4. In SQL Editor, insert only an intentionally authorized account into the registry (run after replacing values):

```sql
insert into public.admin_users (user_id, email)
values ('AUTH_USER_UUID', 'admin@example.com');
```

5. Keep the Supabase service-role key exclusively in server environment settings. The public browser key has no direct enquiry permissions; RLS denies direct customer-data access. The server verifies both Supabase Auth and the server-side `ADMIN_EMAILS` allowlist before privileged admin operations.
6. Confirm RLS in Supabase policies and test with a separate non-admin account before accepting real enquiries.

## Admin access

Visit `/login` and sign in with the invited Supabase Auth email and password. Only authenticated users whose email matches `ADMIN_EMAILS` can call the admin API; the SQL admin registry adds database-side RLS protection for direct authenticated database access. There is no public registration, hardcoded password, or client-only authorization. Status changes are recorded in `admin_audit_log`.

## Enquiry behavior and service limits

The form uses client and server Zod validation, honeypot spam field, request-size cap, and server-side rate limiting. A successful response is sent only after Supabase insert succeeds. Database or rate-limit configuration failures fail closed and return contact alternatives. Requests are stored without payment information. The website does not send email notifications because no email provider was specified/configured; customer acknowledgement is shown only once database persistence succeeds.

## GitHub and Vercel

1. Create an empty private or public repository under the business's GitHub account.
2. From this workspace, initialize Git if needed, commit the source and lockfile, add the GitHub remote, then push the desired branch. Confirm `.env.local` is not tracked (`.gitignore` excludes it); never push real secrets.
3. In Vercel choose **Add New → Project**, import the repository, and keep the detected Next.js build settings.
4. Configure all environment values under Vercel Project Settings → Environment Variables. Include public Supabase URL/key and site URL in the right environments, plus the service role as a server secret. Set `ADMIN_EMAILS` to intended admin accounts.
5. Set the production domain in Vercel, verify DNS, then set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin and redeploy.
6. Inspect deployment/build logs. Test public pages, valid and invalid form submissions, saved database rows, WhatsApp URL, sign-in, forbidden non-admin requests, status update, mobile layout and RLS. Review Supabase logs.

## Source organization

- `app/`: public pages, admin/login, route handlers, metadata, robots/sitemap.
- `components/`: navigation, product catalogue/cards, forms, shared brand/footer.
- `lib/`: product descriptions, Zod schemas, Supabase clients, rate limits and authorization.
- `supabase/schema.sql`: schema, RLS, audit and atomic rate limiting.
- `public/logo/`: brand marks (SVG assets).

## Verification status

A successful local production build and automated unit/e2e checks must be run in the actual environment before deployment. Supabase persistence/RLS, Auth, production AI behavior, provider failure modes, responsive browser behavior, and live deployment require configured services and have not been independently verified by the source scaffold. Do not treat this project as legally reviewed. Product photos are illustrative third-party photography and are not represented as company inventory; replace or verify image licenses before commercial launch.
