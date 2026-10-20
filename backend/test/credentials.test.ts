import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import app from "../src/app.js";
import {
  canIssueCredential,
  isAuthorizedIssuerMembership,
  validateCredentialIssueInput,
} from "../src/credentials.js";
import { getSupabaseServiceRoleClient } from "../src/supabase.js";

const environmentKeys = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "EDUCHAIN_DATABASE_HARDENING_VALIDATED",
] as const;
const originalEnvironment = new Map(
  environmentKeys.map((key) => [key, process.env[key]]),
);
let server: ReturnType<typeof app.listen>;
let apiUrl: string;

before(async () => {
  for (const key of environmentKeys) delete process.env[key];
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  apiUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  for (const [key, value] of originalEnvironment) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("credential issue input requires valid fields and calendar dates", () => {
  const valid = validateCredentialIssueInput({
    studentProfileId: "8b68e4bd-f053-4a0a-9186-087333a729a7",
    qualificationName: "Bachelor of Science",
    graduationDate: "2025-05-31",
  });
  assert.deepEqual(valid, {
    studentProfileId: "8b68e4bd-f053-4a0a-9186-087333a729a7",
    qualificationName: "Bachelor of Science",
    graduationDate: "2025-05-31",
  });
  assert.equal(
    validateCredentialIssueInput({
      studentProfileId: "not-a-uuid",
      qualificationName: "Degree",
      graduationDate: "2025-01-01",
    }),
    undefined,
  );
  assert.equal(
    validateCredentialIssueInput({
      studentProfileId: "8b68e4bd-f053-4a0a-9186-087333a729a7",
      qualificationName: "Degree",
      graduationDate: "2025-02-30",
    }),
    undefined,
  );
  assert.equal(
    validateCredentialIssueInput({
      studentProfileId: "8b68e4bd-f053-4a0a-9186-087333a729a7",
      qualificationName: " ".repeat(201),
      graduationDate: "2025-01-01",
    }),
    undefined,
  );
});

test("only issuer and institution administrator memberships can issue", () => {
  assert.equal(isAuthorizedIssuerMembership("issuer"), true);
  assert.equal(isAuthorizedIssuerMembership("institution_admin"), true);
  assert.equal(isAuthorizedIssuerMembership("viewer"), false);
  assert.equal(isAuthorizedIssuerMembership("student"), false);
  assert.equal(canIssueCredential("institution_admin", "issuer"), true);
  assert.equal(canIssueCredential("institution_admin", "viewer"), false);
  assert.equal(canIssueCredential("student", "issuer"), false);
  assert.equal(canIssueCredential(undefined, "institution_admin"), false);
});

test("credential endpoints reject unauthenticated requests", async () => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "public-test-key";
  const response = await fetch(`${apiUrl}/api/credentials`, {
    headers: { authorization: "Bearer " },
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).status, "error");
});

test("credential endpoints fail closed when database configuration is absent", async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_PUBLISHABLE_KEY;
  const response = await fetch(`${apiUrl}/api/credentials`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).message, "Supabase authentication is not configured");
});

test("service-role access requires both a validated-database gate and key", () => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "public-test-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-test-key";
  delete process.env.EDUCHAIN_DATABASE_HARDENING_VALIDATED;
  assert.equal(getSupabaseServiceRoleClient(), undefined);
  process.env.EDUCHAIN_DATABASE_HARDENING_VALIDATED = "true";
  assert.ok(getSupabaseServiceRoleClient());
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal(getSupabaseServiceRoleClient(), undefined);
});
