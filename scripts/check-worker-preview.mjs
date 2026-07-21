import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

async function reserveLoopbackPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return port;
}

async function waitForHealth(baseUrl, child, output) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`wrangler exited before readiness (${child.exitCode})\n${output.join("")}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Wrangler is still starting.
    }
    await delay(200);
  }
  throw new Error(`wrangler preview did not become ready\n${output.join("")}`);
}

function signalChildTree(child, signal) {
  if (!child.pid) {
    return;
  }
  try {
    if (process.platform === "win32") {
      child.kill(signal);
    } else {
      process.kill(-child.pid, signal);
    }
  } catch (error) {
    if (error?.code !== "ESRCH") {
      throw error;
    }
  }
}

async function stopChild(child) {
  const exited =
    child.exitCode !== null
      ? Promise.resolve()
      : new Promise((resolve) => child.once("exit", resolve));

  signalChildTree(child, "SIGTERM");
  await Promise.race([exited, delay(5_000)]);
  signalChildTree(child, "SIGKILL");
  child.stdout.destroy();
  child.stderr.destroy();
}

const port = await reserveLoopbackPort();
const baseUrl = `http://127.0.0.1:${port}`;
const output = [];
const child = spawn(
  "npx",
  ["--no-install", "wrangler", "dev", "--local", "--ip", "127.0.0.1", "--port", String(port), "--log-level", "error"],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CI: "1",
      WRANGLER_SEND_METRICS: "false",
    },
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  },
);
child.stdout.on("data", (chunk) => output.push(chunk.toString()));
child.stderr.on("data", (chunk) => output.push(chunk.toString()));

try {
  await waitForHealth(baseUrl, child, output);

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.match(healthResponse.headers.get("content-type") ?? "", /^application\/json/u);
  assert.deepEqual(await healthResponse.json(), {
    ok: true,
    service: "maelk-api",
    stack: { api: "express", web: "react-router-spa" },
  });

  const unknownApiResponse = await fetch(`${baseUrl}/api/does-not-exist`);
  assert.equal(unknownApiResponse.status, 404);
  assert.match(unknownApiResponse.headers.get("content-type") ?? "", /^application\/json/u);
  assert.deepEqual(await unknownApiResponse.json(), {
    error: "not_found",
    path: "/api/does-not-exist",
  });

  const authResponse = await fetch(`${baseUrl}/api/auth/session`);
  assert.equal(authResponse.status, 503);
  const authState = await authResponse.json();
  assert.equal(authState.authConfigured, false);
  assert.equal(authState.authenticated, false);
  assert.deepEqual(authState.missingConfiguration, []);
  assert.equal(authState.message, "Authentication is temporarily unavailable.");

  const appResponse = await fetch(`${baseUrl}/app`, {
    headers: { "Sec-Fetch-Mode": "navigate" },
  });
  assert.equal(appResponse.status, 200);
  assert.match(appResponse.headers.get("content-type") ?? "", /^text\/html/u);
  const html = await appResponse.text();
  assert.match(html, /Mælk|mælk/u);

  const assetPath = html.match(/(?:src|href)="([^"]*\/assets\/[^"]+)"/u)?.[1];
  assert.ok(assetPath, "SPA shell must reference a hashed static asset");
  const assetResponse = await fetch(new URL(assetPath, baseUrl));
  assert.equal(assetResponse.status, 200);
  assert.ok(Number(assetResponse.headers.get("content-length") ?? "0") > 0 || (await assetResponse.arrayBuffer()).byteLength > 0);

  console.log("cloudflare_worker_preview_check_ok");
} finally {
  await stopChild(child);
}
