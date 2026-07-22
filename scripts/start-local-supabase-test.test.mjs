import assert from "node:assert/strict";
import { once } from "node:events";
import { Writable } from "node:stream";
import test from "node:test";

import {
  SUPABASE_START_TEST_ARGS,
  SupabaseStartRedactionTransform,
  redactSupabaseStartOutput,
} from "./start-local-supabase-test.mjs";

const JWT_HEADER_FIXTURE = "eyJhbGciOiJIUzI1NiJ9";
const ANON_KEY_FIXTURE = [JWT_HEADER_FIXTURE, "eyJyb2xlIjoiYW5vbiJ9", "fixture"].join(".");
const SERVICE_ROLE_KEY_FIXTURE = [JWT_HEADER_FIXTURE, "eyJyb2xlIjoic2VydmljZV9yb2xlIn0", "fixture"].join(".");

test("local Supabase start command keeps the bounded security-stack exclude list", () => {
  assert.deepEqual(SUPABASE_START_TEST_ARGS, [
    "start",
    "--exclude",
    "edge-runtime,imgproxy,logflare,mailpit,postgres-meta,realtime,storage-api,studio,supavisor,vector",
  ]);
});

test("local Supabase start output redacts disposable credential material", () => {
  const input = [
    "Started supabase local development setup.",
    "API URL: http://127.0.0.1:54321",
    "DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    `anon key: ${ANON_KEY_FIXTURE}`,
    `service_role key: ${SERVICE_ROLE_KEY_FIXTURE}`,
    "S3 Secret Key: local-secret-value",
    "│ Publishable │ sb_publishable_local_table_value            │",
    "│ Secret      │ sb_secret_local_table_value                 │",
    "A startup failure can still say port already allocated.",
  ].join("\n");

  const redacted = redactSupabaseStartOutput(input);

  assert.match(redacted, /Started supabase local development setup\./u);
  assert.match(redacted, /API URL: http:\/\/127\.0\.0\.1:54321/u);
  assert.match(redacted, /A startup failure can still say port already allocated\./u);
  assert.match(redacted, /DB URL: \[REDACTED\]/u);
  assert.match(redacted, /anon key: \[REDACTED\]/u);
  assert.match(redacted, /service_role key: \[REDACTED\]/u);
  assert.match(redacted, /S3 Secret Key: \[REDACTED\]/u);
  assert.match(redacted, /│ Publishable\s+│ \[REDACTED\]\s*│/u);
  assert.match(redacted, /│ Secret\s+│ \[REDACTED\]\s*│/u);
  for (const forbidden of [
    "postgres:postgres",
    "eyJhbGci",
    "local-secret-value",
    "sb_publishable_local_table_value",
    "sb_secret_local_table_value",
  ]) {
    assert.equal(redacted.includes(forbidden), false, `redacted output leaked ${forbidden}`);
  }
});

test("local Supabase redaction survives chunk boundaries", async () => {
  const chunks = [];
  const sink = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString("utf8"));
      callback();
    },
  });
  const transform = new SupabaseStartRedactionTransform();
  transform.pipe(sink);

  transform.write("Secret");
  transform.write(" key: split-secret");
  transform.end("\nReady for local tests\n");
  await once(sink, "finish");

  const redacted = chunks.join("");
  assert.equal(redacted.includes("split-secret"), false);
  assert.equal(redacted, "Secret key: [REDACTED]\nReady for local tests\n");
});
