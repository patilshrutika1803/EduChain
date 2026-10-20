import assert from "node:assert/strict";
import express from "express";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import { createNeonHealthHandler } from "../src/neon.js";

let checkConnection: () => Promise<void> = async () => {};
const app = express();
app.get("/api/health/neon", createNeonHealthHandler(() => checkConnection()));

let server: ReturnType<typeof app.listen>;
let apiUrl: string;

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  apiUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("mocked Neon health query success returns an OK response", async () => {
  let queryCount = 0;
  checkConnection = async () => {
    queryCount += 1;
  };

  const response = await fetch(`${apiUrl}/api/health/neon`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "Neon",
    message: "Neon database is reachable",
  });
  assert.equal(queryCount, 1);
});

test("mocked Neon health query failure returns a generic response", async () => {
  checkConnection = async () => {
    throw new Error("connection failed: postgres://user:secret@example.test/db");
  };

  const response = await fetch(`${apiUrl}/api/health/neon`);
  const body = await response.text();

  assert.equal(response.status, 503);
  assert.equal(body, JSON.stringify({
    status: "error",
    service: "Neon",
    message: "Unable to reach the Neon database",
  }));
  assert.doesNotMatch(body, /secret|example\.test|postgres:\/\//);
});
