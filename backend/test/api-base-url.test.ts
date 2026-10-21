import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveApiBaseUrl } from "../../frontend/src/data/apiBaseUrl.js";

test("API base URL honors configuration and selects the correct environment default", () => {
  assert.equal(
    resolveApiBaseUrl("https://api.example.test///", false),
    "https://api.example.test",
  );
  assert.equal(resolveApiBaseUrl(undefined, true), "");
  assert.equal(
    resolveApiBaseUrl(undefined, false),
    "https://educhain-i345.onrender.com",
  );
  assert.equal(resolveApiBaseUrl("  ", true), "");
});
