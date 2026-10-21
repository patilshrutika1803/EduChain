import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const initialSchema = await readFile(
  new URL(
    "../../database/20261019235500_initial_credential_schema.sql",
    import.meta.url,
  ),
  "utf8",
);
const hardeningMigration = await readFile(
  new URL(
    "../../database/20261020003000_harden_credential_permissions.sql",
    import.meta.url,
  ),
  "utf8",
);

test("authenticated credential access is read-only and subject to RLS", () => {
  assert.match(
    hardeningMigration,
    /grant select on public\.credentials to authenticated;/i,
  );
  assert.doesNotMatch(
    hardeningMigration,
    /grant\s+(?:insert|update)\b[^;]*\bon (?:table )?public\.credentials\s+to authenticated\s*;/i,
  );
  assert.match(
    hardeningMigration,
    /drop policy if exists credentials_insert_verified_institution_issuer\s+on public\.credentials;/i,
  );
  assert.match(
    hardeningMigration,
    /drop policy if exists credentials_update_verified_institution_issuer\s+on public\.credentials;/i,
  );
});

test("service-role credential access is limited to issuance and its response fields", () => {
  assert.match(
    hardeningMigration,
    /revoke all on table public\.credentials from service_role;/i,
  );
  assert.match(
    hardeningMigration,
    /revoke select \([\s\S]*?\), insert \([\s\S]*?\), update \([\s\S]*?\), references \([\s\S]*?\) on table public\.credentials from service_role;/i,
  );
  assert.match(
    hardeningMigration,
    /grant select\s*\([\s\S]*?\)\s+on table public\.credentials to service_role;/i,
  );
  assert.match(
    hardeningMigration,
    /grant insert\s*\([\s\S]*?\)\s+on public\.credentials to service_role;/i,
  );
  assert.doesNotMatch(
    hardeningMigration,
    /grant\s+(?:all|insert|update|delete)\s+on (?:table )?public\.credentials\s+to service_role\s*;/i,
  );
  assert.match(
    hardeningMigration,
    /has_table_privilege\('service_role', 'public\.credentials', 'UPDATE'\)/i,
  );
  assert.match(
    hardeningMigration,
    /has_column_privilege\(\s*'service_role', 'public\.credentials', required\.column_name, 'SELECT'\s*\)/i,
  );
  assert.match(
    hardeningMigration,
    /has_column_privilege\('service_role', a\.attrelid, a\.attname, 'REFERENCES'\)/i,
  );
  assert.match(
    hardeningMigration,
    /has_column_privilege\('authenticated', a\.attrelid, a\.attname, 'REFERENCES'\)/i,
  );
});

test("profile, institution, and membership policies keep privilege changes admin-only", () => {
  assert.match(
    initialSchema,
    /create policy profiles_insert_self_as_student[\s\S]*?with check \(id = \(select auth\.uid\(\)\) and role = 'student'\);/i,
  );
  assert.match(
    initialSchema,
    /create policy institutions_update_platform_admin[\s\S]*?using \(educhain_private\.is_platform_admin\(\)\)\s+with check \(educhain_private\.is_platform_admin\(\)\);/i,
  );
  assert.match(
    initialSchema,
    /create policy institution_memberships_insert_admin[\s\S]*?educhain_private\.has_institution_membership\(\s*institution_id,\s*array\['institution_admin'\]::text\[\],\s*true\s*\)/i,
  );
  assert.match(
    hardeningMigration,
    /if not educhain_private\.is_platform_admin\(\) then\s+raise exception 'Only a platform administrator may change a profile role'/i,
  );
});
