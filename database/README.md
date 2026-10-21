# Database schema

EduChain's initial database migration is
[`20261019235500_initial_credential_schema.sql`](./20261019235500_initial_credential_schema.sql).
It defines the initial Supabase/PostgreSQL schema, row-level security (RLS)
policies, credential integrity checks, and database-generated audit entries.
A separate hardening migration,
[`20261020003000_harden_credential_permissions.sql`](./20261020003000_harden_credential_permissions.sql),
restricts direct client writes and tightens grants. Neither migration is
applied automatically.

## Apply the migration

1. Open the project's Supabase dashboard and select **SQL Editor**.
2. Check which migrations have already been applied. For a new database, apply
   the migration files in timestamp order. For a database where the initial
   schema already exists, apply only the hardening migration after reviewing
   it; do not rerun the initial migration.
3. Open the applicable migration file in this directory and copy its complete
   contents into a new SQL Editor query.
4. Review the SQL, then run it once using a database-owner/admin SQL Editor
   session.
5. Confirm the tables, RLS settings, policies, triggers, helper functions, and
   grants match the expected state before connecting application code.

This migration assumes Supabase's `auth.users` table and the `anon` and
`authenticated` database roles are available. It creates no demo users and
contains no Supabase secret or service-role key. Do not put a service-role key
in SQL, source code, or frontend configuration.

## Tables and relationships

- **`profiles`** maps one application profile to an `auth.users` row. Its
  `role` is `student`, `institution_admin`, or `platform_admin`; new profiles
  default to `student`. Authenticated users can update only `display_name` and
  `updated_at` directly. Platform administrators change roles through the
  `set_profile_role` RPC. Deleting an auth user cascades to the profile, though
  credential ownership references prevent deleting a profile that still owns
  credentials.
- **`institutions`** stores institution names, verification state, and an
  optional public issuer wallet address. Verification is `pending`, `verified`,
  `rejected`, or `suspended`; new institutions default to `pending`.
- **`institution_memberships`** joins profiles to institutions. Its composite
  primary key on `(institution_id, profile_id)` prevents duplicate
  memberships. Membership roles are `institution_admin`, `issuer`, and
  `viewer`; statuses are `pending`, `active`, and `suspended`.
- **`credentials`** belongs to one student profile and one issuing institution.
  Both references prevent deletion while a credential exists. The
  `commitment_hash` is exactly 32 bytes, matching the Solidity contract's
  `bytes32` commitment. The credential status is `active`, `suspended`, or
  `revoked`, matching the contract's `Active`, `Suspended`, and `Revoked`
  states. The student, issuer, public identifier, qualification details, issue
  date, and commitment are immutable after insertion. Authenticated clients
  cannot insert or update credentials directly; the existing application
  exposes only trusted backend issuance, not a status-update workflow.
- **`audit_logs`** records credential issuance and changes. Its metadata is a
  JSON object containing only status values where relevant; the trigger does
  not copy student or credential details. Actor and credential references are
  nullable and become null if their referenced rows are later removed.

The contract supports `Active -> Suspended`, `Active -> Revoked`,
`Suspended -> Active`, and `Suspended -> Revoked`; a revoked credential is
terminal. The migration stores these values in lowercase and rejects other
transitions. It does not store personal student data or full credential
details on-chain. Only the commitment and issuer-related proof metadata belong
on-chain.

## Roles and onboarding assumptions

`profiles.role` is a platform-level role, distinct from an institution
membership role. Users may create their own profile only as a `student`, and
cannot change their own role. Only an existing `platform_admin` can manage
platform roles, institutions, and verification status. Active institution
memberships are provisioned by a platform administrator or managed by an
active `institution_admin` at a verified institution. A student profile row
must be created for an authenticated user before that user can own a
credential.

The first platform administrator and verified institutions require a trusted
administrator/bootstrap process outside this migration. No self-service path
is provided to verify an institution or grant platform privileges.

## Application authentication dependency

The backend verifies Supabase access tokens, then reads the caller's own
`profiles.role` using the same bearer token. The frontend permits an
authenticated user's own `student` profile to be created only through the
`profiles_insert_self_as_student` policy. Institution portal access requires
an administrator-provisioned `institution_admin` profile; signup cannot
assign it. The application fails closed if the profile table, grants, or RLS
policies are missing or unavailable.

These migrations have not been validated or applied to the configured
Supabase project. Do not assume the application authentication flow is
end-to-end until a database owner has reviewed and applied the appropriate
migrations in timestamp order and confirmed the expected schema and policies.

## RLS policies

RLS is enabled on all five tables. Table privileges are revoked from both
PostgreSQL's `PUBLIC` role and Supabase's `anon` role; there are no anonymous
policies. Authenticated access is limited by the following policies:

| Table | Policy | Purpose |
| --- | --- | --- |
| `profiles` | `profiles_select_self_or_platform_admin` | A user reads their own profile; platform admins can read profiles for administration. |
| `profiles` | `profiles_insert_self_as_student` | A user may create only their own student profile, never grant themselves a higher role. |
| `profiles` | `profiles_insert_platform_admin` | A platform admin may provision profiles and roles. |
| `profiles` | `profiles_update_self` | A user may update their own profile row, but column grants limit direct updates to `display_name` and `updated_at`. |
| `profiles` | `profiles_update_platform_admin` | Platform admins retain profile administration; role changes use the `set_profile_role` RPC, which checks the caller's platform-admin role. |
| `institutions` | `institutions_select_members_or_platform_admin` | Active members can read their institution; platform admins can read all institutions. |
| `institutions` | `institutions_insert_platform_admin`, `institutions_update_platform_admin` | Only platform admins can create institutions or change institution/verification data. There is no authenticated delete policy. |
| `institution_memberships` | `institution_memberships_select_self_or_admin` | Users can read their own memberships; verified-institution admins and platform admins can read memberships for administration. |
| `institution_memberships` | `institution_memberships_insert_admin`, `institution_memberships_update_admin`, `institution_memberships_delete_admin` | Only platform admins or active admins at the verified institution can manage its memberships. A trigger keeps membership identity fields fixed during updates. |
| `credentials` | `credentials_select_student_or_institution_member` | Students can read only their own records; active members can read records issued by their institution; platform admins can read all. No anonymous/public credential-read policy is provided. |
| `credentials` | *(no authenticated insert policy)* | Authenticated clients cannot insert credentials directly. Issuance is reserved for a trusted backend workflow. |
| `credentials` | *(no authenticated update policy)* | Authenticated clients receive no credential `UPDATE` privilege or update policy. The update trigger still protects owner-controlled updates and writes audit entries. |
| `audit_logs` | `audit_logs_select_platform_admin` | Only platform admins can read audit history. No user-facing insert, update, or delete policy exists. |

Membership and platform-role checks are implemented by `SECURITY DEFINER`
helpers in the non-exposed `educhain_private` schema. Their fixed search paths
avoid recursive RLS policy evaluation; the helpers inspect the
membership/profile tables without re-entering their RLS policies. Credential
audit rows are inserted only by a restricted trigger function, and direct
authenticated `INSERT`, `UPDATE`, and `DELETE` privileges on `audit_logs` are
revoked. The hardening migration also revokes `PUBLIC` and `anon` access to
the private schema and helper functions, then grants authenticated users only
the helper execution and schema usage required by RLS.

## Hardening and issuance workflow

The hardening migration revokes existing table grants from `PUBLIC`, `anon`,
and `authenticated` before restoring only the authenticated operations needed
by current RLS policies. It uses column-level grants to prevent direct updates
to profile roles and immutable credential fields. Role changes remain
available to platform administrators through `public.set_profile_role`, a
`SECURITY DEFINER` RPC with a fixed search path that verifies the caller's
platform-admin role. The function does not grant table-wide profile update
access.

Other authenticated writes are column-scoped as well: profile inserts may
provide only `id`, `display_name`, and `role` (the self-insert RLS policy still
requires the role to be `student`); institution inserts and updates are limited
to institution name, verification status, and issuer wallet address; membership
inserts are limited to membership identity, role, and status, while updates
are limited to role and status. Institution and membership IDs and timestamp
fields are not directly writable. Authenticated users can read credentials
subject to RLS but receive no credential `INSERT` or `UPDATE` privileges. The
migration drops both direct-write credential policies; the credential update
trigger remains in place for owner-controlled changes and audit logging.

The backend exposes authenticated credential reads and
a validated issuance endpoint. Reads use the caller's JWT and apply both
application-level scoping and RLS. Issuance verifies the caller's profile role,
active membership role, verified institution, and target student profile. The
hardening migration first revokes all direct `service_role` privileges on
`credentials`, then grants `INSERT` only on the columns used by the issuance
endpoint and `SELECT` only on the fields returned by that endpoint. It does
not grant service-role credential `UPDATE` or `DELETE`; those column grants
are not substitutes for broad table-level grants. Other `service_role`
privileges are left unchanged because the backend uses that role to read the
target student profile; verify the effective role memberships and grants
separately when applying the migration. The endpoint refuses
issuance unless the backend has both a server-only
`SUPABASE_SERVICE_ROLE_KEY` and
`EDUCHAIN_DATABASE_HARDENING_VALIDATED=true`. A database owner must set that
flag only after reviewing and validating the migration and live permissions.
Neither migration has been validated or applied in the current project, so
database-backed issuance is not enabled or claimed to work. No service-role
key is used or exposed by the frontend. The insert trigger continues to
generate audit rows, while clients retain no direct audit-log insert, update,
or delete access.

The existing credential update trigger rejects changes outside the contract's
allowed status transitions (`Active -> Suspended`, `Active -> Revoked`,
`Suspended -> Active`, and `Suspended -> Revoked`) and rejects changes to
immutable credential data. The hardening migration retains that trigger, its
audit trigger, all existing profile/institution/membership policies, and RLS
without enabling `FORCE ROW LEVEL SECURITY`.

## Manual privilege verification

After applying the hardening migration in the intended Supabase project, a
database owner should verify effective role and column privileges. These
checks are not run by this repository's local tests:

```sql
select
    has_table_privilege('authenticated', 'public.credentials', 'SELECT') as authenticated_select,
    has_table_privilege('authenticated', 'public.credentials', 'INSERT') as authenticated_insert,
    has_table_privilege('authenticated', 'public.credentials', 'UPDATE') as authenticated_update,
    has_table_privilege('service_role', 'public.credentials', 'SELECT') as service_role_table_select,
    has_table_privilege('service_role', 'public.credentials', 'INSERT') as service_role_table_insert,
    has_table_privilege('service_role', 'public.credentials', 'UPDATE') as service_role_table_update,
    has_table_privilege('service_role', 'public.credentials', 'DELETE') as service_role_table_delete,
    has_column_privilege('service_role', 'public.credentials', 'commitment_hash', 'INSERT') as service_role_issue_insert,
    has_column_privilege('service_role', 'public.credentials', 'commitment_hash', 'SELECT') as service_role_return_select;
```

Expected results: authenticated `SELECT=true`, authenticated `INSERT/UPDATE=false`,
service-role table-level `SELECT/INSERT/UPDATE/DELETE=false`, and service-role
column-level `INSERT/SELECT=true` for the issuance/returned fields. Also inspect
`pg_policies`, `pg_trigger`, `pg_proc`/function ACLs, and role memberships to
confirm RLS, guards, trigger functions, and inherited grants match the reviewed
migration. The service-role key must remain server-only.

## Limitations

- Institution verification and the initial platform administrator are
  trusted administrative responsibilities; this migration does not implement
  an institution-review workflow.
- This schema is not a replacement for backend authorization. Backend
  operations must use the authenticated user's Supabase identity and must not
  expose a service-role key.
- Credential content and its commitment are immutable in this first milestone.
  The existing contract has no credential-content amendment operation; an
  amendment workflow would need an explicit design that preserves the
  relationship between the database record and its on-chain commitment.
- The optional wallet, transaction hash, and contract address are stored as
  text and are not validated against a particular chain or deployment.
- The current API creates database-only records. The API commitment is not a
  salted privacy-preserving proof and is not submitted to the Solidity
  registry. No contract address, network, or backend transaction signer is
  configured.
