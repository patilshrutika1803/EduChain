# Database schema

EduChain's first database migration is
[`20261019235500_initial_credential_schema.sql`](./20261019235500_initial_credential_schema.sql).
It defines the initial Supabase/PostgreSQL schema, row-level security (RLS)
policies, credential integrity checks, and database-generated audit entries.
The migration has **not** been applied automatically.

## Apply the migration

1. Open the project's Supabase dashboard and select **SQL Editor**.
2. Open the migration file in this directory and copy its complete contents
   into a new SQL Editor query.
3. Review the SQL, then run it once using a database-owner/admin SQL Editor
   session.
4. Confirm the five tables, RLS settings, policies, triggers, and helper
   functions were created before connecting application code.

This migration assumes Supabase's `auth.users` table and the `anon` and
`authenticated` database roles are available. It creates no demo users and
contains no Supabase secret or service-role key. Do not put a service-role key
in SQL, source code, or frontend configuration.

## Tables and relationships

- **`profiles`** maps one application profile to an `auth.users` row. Its
  `role` is `student`, `institution_admin`, or `platform_admin`; new profiles
  default to `student`. Deleting an auth user cascades to the profile, though
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
  date, and commitment are immutable after insertion; status changes and
  blockchain reference fields remain updateable by authorized issuers.
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

## RLS policies

RLS is enabled on all five tables. Table privileges are revoked from both
PostgreSQL's `PUBLIC` role and Supabase's `anon` role; there are no anonymous
policies. Authenticated access is limited by the following policies:

| Table | Policy | Purpose |
| --- | --- | --- |
| `profiles` | `profiles_select_self_or_platform_admin` | A user reads their own profile; platform admins can read profiles for administration. |
| `profiles` | `profiles_insert_self_as_student` | A user may create only their own student profile, never grant themselves a higher role. |
| `profiles` | `profiles_insert_platform_admin` | A platform admin may provision profiles and roles. |
| `profiles` | `profiles_update_self` | A user may update their own profile row; a trigger prevents changing the profile ID or self-granting a role. |
| `profiles` | `profiles_update_platform_admin` | A platform admin may manage profile roles. |
| `institutions` | `institutions_select_members_or_platform_admin` | Active members can read their institution; platform admins can read all institutions. |
| `institutions` | `institutions_insert_platform_admin`, `institutions_update_platform_admin` | Only platform admins can create institutions or change institution/verification data. There is no authenticated delete policy. |
| `institution_memberships` | `institution_memberships_select_self_or_admin` | Users can read their own memberships; verified-institution admins and platform admins can read memberships for administration. |
| `institution_memberships` | `institution_memberships_insert_admin`, `institution_memberships_update_admin`, `institution_memberships_delete_admin` | Only platform admins or active admins at the verified institution can manage its memberships. A trigger keeps membership identity fields fixed during updates. |
| `credentials` | `credentials_select_student_or_institution_member` | Students can read only their own records; active members can read records issued by their institution; platform admins can read all. No anonymous/public credential-read policy is provided. |
| `credentials` | `credentials_insert_verified_institution_issuer` | Only active `issuer` or `institution_admin` members of a verified institution may issue a credential, initially active. |
| `credentials` | `credentials_update_verified_institution_issuer` | Only those same authorized members may change credential status or blockchain reference fields. A trigger prevents changing ownership, issuer, identifier, committed details, or commitment and enforces contract-compatible status transitions. |
| `audit_logs` | `audit_logs_select_platform_admin` | Only platform admins can read audit history. No user-facing insert, update, or delete policy exists. |

Membership and platform-role checks are implemented by `SECURITY DEFINER`
helpers in the non-exposed `educhain_private` schema. Their fixed search paths
avoid recursive RLS policy evaluation; the helpers inspect the
membership/profile tables without re-entering their RLS policies. Credential
audit rows are inserted only by a restricted trigger function, and direct
authenticated `INSERT`, `UPDATE`, and `DELETE` privileges on `audit_logs` are
revoked.

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
