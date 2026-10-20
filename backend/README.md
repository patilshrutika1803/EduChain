# EduChain API

The backend is a Node.js, Express, and TypeScript API with a local health check
at `GET /api/health` and a Supabase connectivity check at
`GET /api/health/supabase`. `GET /api/auth/me` verifies the incoming bearer
token with Supabase Auth and resolves the caller's role from that user's
`public.profiles` row using the caller's JWT. Unknown routes return a JSON 404.
The API never accepts a role from the browser. A service-role key is used only
by the gated credential issuance path documented below; it is never returned to
or configured in the frontend.

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
Deployments must route `/api` to the backend on the same origin or provide an
appropriate API base URL and CORS/reverse-proxy configuration.

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

## Authentication and profile roles

The backend verifies access tokens with `supabase.auth.getUser(token)`. The
`/api/auth/me` endpoint then queries `profiles` with the same user token, so
Supabase RLS applies. Only `student` maps to the student portal and
`institution_admin` maps to the institution portal; missing profiles,
unsupported roles, and database errors fail closed.

The frontend supports password login and session restoration. Student signup
creates only a `student` profile, subject to the database's self-insert policy.
Institution accounts must already have an administrator-provisioned
`institution_admin` profile. No browser input or signup choice can grant that
role.

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

- `GET /api/credentials` lists the authenticated student's own credentials or
  records issued by the caller's active, verified institution memberships.
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

Run backend tests with `pnpm --filter @educhain/backend test`.
