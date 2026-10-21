# EduChain API

The backend is a Node.js, Express, and TypeScript API with a local health check
at `GET /api/health` and a Supabase connectivity check at
`GET /api/health/supabase`, plus a Neon PostgreSQL connectivity check at
`GET /api/health/neon`. `GET /api/auth/me` verifies the incoming bearer
token with Supabase Auth and resolves the caller's role from that user's
`public.profiles` row using the caller's JWT. Unknown routes return a JSON 404.
The API never accepts a role from the browser. A service-role key is used only
by the gated credential issuance path documented below; it is never returned to
or configured in the frontend.

The API permits browser requests from `https://edu-chain-eight.vercel.app`.
Localhost origins on ports 8443 and 5173 (including `127.0.0.1`) are permitted
only when `NODE_ENV` is not `production`. Cross-origin access is limited to
`GET`, `POST`, and `OPTIONS`, with `Authorization` and `Content-Type` headers.
The API does not allow cookies or other credentialed browser requests.

## Requirements

- Node.js 20 or newer
- pnpm 11 (the version used by this repository)

## Install

From the repository root:

```sh
pnpm install
```

## Run in development

From the repository root:

```sh
pnpm api:dev
```

The server listens on port `3001` by default. Set `PORT` to override it.
During Vite development, the frontend proxies `/api` requests to this server.
Production frontend requests use the Render API base URL.

To configure Supabase locally, copy `backend/.env.example` to `backend/.env`
and set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to the project's URL and
publishable key:

```powershell
Copy-Item backend/.env.example backend/.env
```

On macOS or Linux, use `cp backend/.env.example backend/.env`. Keep the
project's actual values in `backend/.env` or another local secret store; do not
put them in source files or commit them. `.env` is ignored by Git, while
`.env.example` contains placeholders and remains trackable.

## Vercel and Render environment

Set these variables separately in **Vercel project settings**, then redeploy:

- `VITE_API_BASE_URL=https://educhain-i345.onrender.com`
- `VITE_SUPABASE_URL=https://brmqvmcgyoxwaoapqyme.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY=<your-Supabase-publishable-key>`

The production frontend defaults to the Render API URL if
`VITE_API_BASE_URL` is omitted. In local Vite development, leave it empty to
use the `/api` proxy to `http://localhost:3001`.

Set these variables in **Render's backend service environment** only:

- `NODE_ENV=production` (keeps the local development origins out of production
  CORS)
- `SUPABASE_URL=https://brmqvmcgyoxwaoapqyme.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY`
- `EDUCHAIN_ADMIN_USER_ID` (the designated administrator's Supabase Auth UUID)
- `DATABASE_URL` (Neon connectivity check only; credentials remain in Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (required only for gated credential issuance)
- `EDUCHAIN_DATABASE_HARDENING_VALIDATED` (leave unset/false until the database
  owner has validated the applied hardening migration)

Never add the service-role key, `DATABASE_URL`, or other backend-only
configuration with a `VITE_` prefix; Vite variables are embedded in the browser
bundle. The CORS allowlist is narrow and allows the production Vercel origin
and local development origins only outside production.

For the Neon health check, set `DATABASE_URL` in `backend/.env` (or inject it
into the backend process in deployment). The server loads `backend/.env` first
and then root `.env.local` as a local fallback; values already set by the
process environment or `backend/.env` are not overridden. Do not expose this
server-only connection string to the frontend or commit it.

## Typecheck

From the repository root:

```sh
pnpm api:typecheck
```

## Build and run in production mode

From the repository root:

```sh
pnpm api:build
pnpm api:start
```

The build output is written to `backend/dist/`.

## Health check

With the server running:

```sh
curl http://localhost:3001/api/health
```

Expected response:

```json
{"status":"ok","service":"EduChain API"}
```

## Supabase connectivity check

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `backend/.env`, then start
the API and request:

```sh
curl http://localhost:3001/api/health/supabase
```

When the configured project's Supabase Auth health endpoint is reachable, the
API returns:

```json
{"status":"ok","service":"Supabase","message":"Supabase project is reachable"}
```

Missing configuration or a failed health check returns HTTP `503` with a
generic JSON error message. The check does not require a database table and
does not expose project keys or upstream response details.

## Neon PostgreSQL connectivity check

Set `DATABASE_URL` for the backend as described above, start the API, and
request this exact URL:

```sh
curl http://localhost:3001/api/health/neon
```

The endpoint executes `SELECT 1` against the configured PostgreSQL database.
It returns HTTP `200` only when the query succeeds; missing configuration or a
failed query returns HTTP `503` with a generic JSON error. It never returns or
logs the connection string or internal connection details. The backend tests
for this endpoint use mocked query functions and do not verify a live Neon
connection.

## Authentication and profile roles

The backend verifies access tokens with `supabase.auth.getUser(token)`. The
`/api/auth/me` endpoint then queries `profiles` with the same user token, so
Supabase RLS applies. Only `student` maps to the student portal and
`institution_admin` maps to the institution portal. `platform_admin` maps to
the institution portal only when the server's `EDUCHAIN_ADMIN_USER_ID` matches
the caller's authenticated Supabase UUID and the profile role is
`platform_admin`. Missing profiles, unsupported roles, and database errors
fail closed.

The frontend supports password login and session restoration. Student signup
creates only a `student` profile, subject to the database's self-insert policy.
Institution accounts must already have an administrator-provisioned
`institution_admin` profile. No browser input or signup choice can grant that
role.

### Designate the single platform administrator

The schema distinguishes the platform-level `platform_admin` role from
institution-level `institution_admin` and issuer memberships. Access by the
designated platform administrator requires both a trusted database profile
role and a matching backend-only `EDUCHAIN_ADMIN_USER_ID`. Keep exactly one
`platform_admin` profile and ensure its UUID matches Render's configured value.

1. In Supabase **Authentication → Users**, create or invite the intended
   administrator using a controlled email address. Complete email
   verification and password setup through Supabase; do not use a public admin
   signup path or share the password.
2. Copy the user's UUID from the Auth dashboard. Check that this new Auth user
   does not already have a profile. After reviewing and applying the
   appropriate schema migrations, run this in Supabase SQL Editor as a
   database owner, replacing the placeholder with that UUID:

   ```sql
   select id, role
   from public.profiles
   where id = '<SUPABASE_AUTH_USER_UUID>';

   insert into public.profiles (id, display_name, role)
   values ('<SUPABASE_AUTH_USER_UUID>', 'EduChain Administrator', 'platform_admin');
   ```

3. Check `public.profiles` and ensure exactly one row has
   `role = 'platform_admin'`. Have a database owner demote any other unintended
   platform-admin profiles through an existing trusted administrator workflow
   before proceeding. The current schema has no safe first-admin role-upgrade
   path for an existing profile: do not use an upsert, disable triggers, or
   bypass RLS. If a profile already exists, or an existing platform admin must
   be replaced, stop and use the existing trusted bootstrap/admin process (or
   add and review a dedicated migration) rather than improvising a privilege
   change.
4. Set `EDUCHAIN_ADMIN_USER_ID` to that same UUID in Render's backend
   environment and redeploy. Do not set it in Vercel.
5. In Supabase **Authentication → URL Configuration**, set the production
   site URL to `https://edu-chain-eight.vercel.app` and allow the production
   redirect URL. Add local Vite URLs only if local auth redirects are needed.
6. Sign in through **Institution Login** with this Supabase account and verify
   it reaches the institution portal. The platform-admin profile enables the
   designated account's protected read scope; institution-management APIs do
   not yet exist, and this role does not grant credential issuance.
   Issuance remains restricted to an `institution_admin` with an active issuer
   or admin membership at a verified institution.

If the profile schema has not been applied, the profile insert will fail.
Apply and validate the documented migrations first; do not set the database
hardening gate just to enable issuance.

The SQL migrations in `database/` have not been validated or applied to the
Supabase project. Until a database owner validates and provisions the expected
schema, policies, and grants, profile resolution or student signup may return
an error and protected application routes remain unavailable. The API
intentionally does not invent a role or bypass missing database permissions.
See [database/README.md](../database/README.md) for the schema and required
provisioning process.

The issuance UI requires the student's Supabase profile UUID. There is
intentionally no institution-facing profile-search endpoint; obtain/share that
identifier through a separately approved student onboarding process rather than
looking up private student identities by email.

## Credential endpoints

- `GET /api/credentials` lists the authenticated student's own credentials,
  records issued by the caller's active, verified institution memberships, or
  records visible to the designated platform administrator.
- `GET /api/credentials/:credentialIdentifier` applies the same row scope and
  returns `404` for records outside that scope.
- `POST /api/credentials` accepts `studentProfileId`, `qualificationName`, and
  `graduationDate` (`YYYY-MM-DD`). The API resolves the caller's profile role,
  checks active issuer/admin membership and institution verification, and
  verifies the target is a student profile. Browser-supplied roles and
  institution IDs are ignored.

The API sends read queries with the caller's bearer token so RLS is applied.
Credential creation uses a server-only Supabase service-role key because the
hardening migration reserves credential inserts for `service_role`. It is
disabled unless **both** `SUPABASE_SERVICE_ROLE_KEY` and
`EDUCHAIN_DATABASE_HARDENING_VALIDATED=true` are set in the backend environment.
Set that flag only after a database owner has reviewed, applied, and validated
the migrations, grants, RLS policies, triggers, and target project. Never place
the service-role key or this configuration in the frontend. Until this
validation gate and server key are present, valid issuance requests fail with
HTTP `503`; they are not saved to browser storage or reported as successful.

The database stores only the schema's qualification name, graduation date,
profile/institution references, status, and a SHA-256 commitment. It does not
store the frontend demo fields such as student name, student ID, department,
CGPA, or email. Credential endpoints do not submit transactions to the
Solidity registry, do not claim a signature or on-chain proof, and leave
blockchain transaction and contract fields empty.

Public verification pages still perform browser-local demo checks. The
database has no anonymous credential-read policy, and there is no public
verification endpoint; do not expose private credential records or weaken RLS
to make those pages query the database. Credential lifecycle changes,
institution-management APIs, issuer signatures, and blockchain verification
are not implemented.

Run backend tests with `pnpm --filter @educhain/backend test`.
