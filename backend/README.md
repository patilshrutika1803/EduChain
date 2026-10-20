# EduChain API

The backend is a Node.js, Express, and TypeScript API with a local health check
at `GET /api/health` and a Supabase connectivity check at
`GET /api/health/supabase`. `GET /api/auth/me` verifies the incoming bearer
token with Supabase Auth and resolves the caller's role from that user's
`public.profiles` row using the caller's JWT. Unknown routes return a JSON 404.
The API does not use a service-role key or accept a role from the browser.

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
and replace the placeholder values with the project URL and publishable key
from your Supabase project:

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
