import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { createApp } from "../dist/app.js";
import { createAuthRuntime, PostgresApplicationSessionStore } from "../dist/auth/index.js";
import { MAELK_SESSION_HYPERDRIVE_BINDING, createWorkerAuthRuntimeOptions } from "../dist/worker-auth-env.js";

const ALLOWED_ORIGIN = "https://app.xn--mlk-yla.com";
const HYPERDRIVE_CONNECTION_FIXTURE = ["postgresql://", "worker-hyperdrive.example.invalid", "/maelk?sslmode=require"].join("");
const NODE_DATABASE_URL_FIXTURE = ["postgresql://", "node-database.example.invalid", "/postgres"].join("");
const repoRoot = resolve(import.meta.dirname, "../../..");

async function createFixtureBuild() {
  const root = await mkdtemp(join(tmpdir(), "maelk-worker-auth-client-build-"));
  await mkdir(join(root, "assets"));
  await writeFile(join(root, "index.html"), "<!doctype html><html><body>Mælk SPA</body></html>", "utf8");
  return root;
}

async function startServer(app) {
  const server = createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  assert(address && typeof address === "object");
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}

function applyOverrides(base, overrides) {
  const output = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete output[key];
    } else {
      output[key] = value;
    }
  }
  return output;
}

function createProductionAuthEnv(overrides = {}) {
  return applyOverrides(
    {
      NODE_ENV: "production",
      SUPABASE_URL: "https://maelk-test.supabase.co",
      SUPABASE_ANON_KEY: "public-anon-key",
      SUPABASE_JWT_ISSUER: "https://maelk-test.supabase.co/auth/v1",
      SUPABASE_JWT_AUDIENCE: "authenticated",
      SUPABASE_JWKS_URL: "https://maelk-test.supabase.co/auth/v1/.well-known/jwks.json",
      SUPABASE_JWT_ALGORITHMS: "RS256",
      MAELK_AUTH_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
      MAELK_SESSION_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64url"),
      MAELK_SESSION_TTL_SECONDS: "3600",
    },
    overrides,
  );
}

function createWorkerEnv(overrides = {}) {
  return createProductionAuthEnv({
    [MAELK_SESSION_HYPERDRIVE_BINDING]: { connectionString: HYPERDRIVE_CONNECTION_FIXTURE },
    ...overrides,
  });
}

async function closeRuntimeStore(runtime) {
  if (typeof runtime.store.close === "function") {
    await runtime.store.close();
  }
}

test("Worker Hyperdrive binding is selected over an absent Node DATABASE_URL", async () => {
  const workerEnv = createWorkerEnv();
  assert.equal("DATABASE_URL" in workerEnv, false, "fixture must not provide the Node DATABASE_URL path");

  const runtimeOptions = createWorkerAuthRuntimeOptions(workerEnv);
  assert.equal(runtimeOptions.env?.NODE_ENV, "production");
  assert.equal(runtimeOptions.env?.DATABASE_URL, undefined);
  assert.equal(runtimeOptions.sessionDatabaseConnection?.getConnectionString(), HYPERDRIVE_CONNECTION_FIXTURE);
  assert.equal(JSON.stringify(runtimeOptions).includes(HYPERDRIVE_CONNECTION_FIXTURE), false);

  const runtime = createAuthRuntime(runtimeOptions);
  try {
    assert.equal(runtime.config.authConfigured, true);
    assert.equal(runtime.config.databaseUrl, "");
    assert.ok(runtime.store instanceof PostgresApplicationSessionStore);
  } finally {
    await closeRuntimeStore(runtime);
  }
});

test("Node auth runtime still accepts DATABASE_URL without a Worker binding", async () => {
  const runtime = createAuthRuntime({ env: createProductionAuthEnv({ DATABASE_URL: NODE_DATABASE_URL_FIXTURE }) });
  try {
    assert.equal(runtime.config.authConfigured, true);
    assert.equal(runtime.config.databaseUrl, NODE_DATABASE_URL_FIXTURE);
    assert.ok(runtime.store instanceof PostgresApplicationSessionStore);
  } finally {
    await closeRuntimeStore(runtime);
  }
});

test("incomplete production Worker auth config returns sanitized unavailable JSON without names or connection strings", async (t) => {
  const clientBuildPath = await createFixtureBuild();
  t.after(() => rm(clientBuildPath, { recursive: true, force: true }));

  const auth = createWorkerAuthRuntimeOptions(createWorkerEnv({ SUPABASE_ANON_KEY: undefined }));
  const server = await startServer(createApp({ clientBuildPath, auth }));
  t.after(server.close);

  const response = await fetch(`${server.baseUrl}/api/auth/otp/start`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: "mads@example.com" }),
  });

  assert.equal(response.status, 503);
  const text = await response.text();
  for (const forbidden of [
    "SUPABASE_ANON_KEY",
    "DATABASE_URL",
    MAELK_SESSION_HYPERDRIVE_BINDING,
    HYPERDRIVE_CONNECTION_FIXTURE,
    "postgresql://",
  ]) {
    assert.equal(text.includes(forbidden), false, `unavailable response leaked ${forbidden}`);
  }
  assert.deepEqual(JSON.parse(text), {
    authConfigured: false,
    authenticated: false,
    missingConfiguration: [],
    message: "Authentication is temporarily unavailable.",
  });
});

test("adapter and browser/API build outputs do not expose the fixture connection string", async () => {
  const inspectedRoots = [join(repoRoot, "apps/api/dist"), join(repoRoot, "apps/app/build/client")].filter(existsSync);
  assert.ok(inspectedRoots.length > 0, "expected at least one build output root to inspect");

  const inspectedFiles = [];
  for (const root of inspectedRoots) {
    inspectedFiles.push(...(await collectTextFiles(root)));
  }
  assert.ok(inspectedFiles.length > 0, "expected text files in build outputs");

  for (const file of inspectedFiles) {
    const source = await readFile(file, "utf8");
    assert.equal(source.includes(HYPERDRIVE_CONNECTION_FIXTURE), false, `${file} exposes Worker connection fixture`);
  }
});

async function collectTextFiles(root) {
  const files = [];
  for (const entry of await readdir(root)) {
    const absolutePath = join(root, entry);
    const details = await stat(absolutePath);
    if (details.isDirectory()) {
      files.push(...(await collectTextFiles(absolutePath)));
    } else if (/\.(cjs|css|html|js|json|mjs|txt)$/u.test(entry)) {
      files.push(absolutePath);
    }
  }
  return files;
}
