import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { createApp } from "../dist/app.js";

async function createFixtureBuild() {
  const root = await mkdtemp(join(tmpdir(), "maelk-client-build-"));
  await mkdir(join(root, "assets"));
  await writeFile(
    join(root, "index.html"),
    "<!doctype html><html><body><div id=\"root\">Mælk SPA shell</div></body></html>",
    "utf8",
  );
  await writeFile(join(root, "assets", "app.css"), "body{color:#35251d}", "utf8");
  return root;
}

async function startServer(clientBuildPath) {
  const server = createServer(createApp({ clientBuildPath }));

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
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

test("GET /api/health returns same-origin Express health JSON", async (t) => {
  const clientBuildPath = await createFixtureBuild();
  t.after(() => rm(clientBuildPath, { recursive: true, force: true }));
  const server = await startServer(clientBuildPath);
  t.after(server.close);

  const response = await fetch(`${server.baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  assert.deepEqual(await response.json(), {
    ok: true,
    service: "maelk-api",
    stack: {
      api: "express",
      web: "react-router-spa",
    },
  });
});

test("unknown /api routes return JSON 404 instead of the SPA shell", async (t) => {
  const clientBuildPath = await createFixtureBuild();
  t.after(() => rm(clientBuildPath, { recursive: true, force: true }));
  const server = await startServer(clientBuildPath);
  t.after(server.close);

  const response = await fetch(`${server.baseUrl}/api/does-not-exist`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  assert.deepEqual(await response.json(), {
    error: "not_found",
    path: "/api/does-not-exist",
  });
});

test("static assets are served and non-API GETs fall back to the SPA index", async (t) => {
  const clientBuildPath = await createFixtureBuild();
  t.after(() => rm(clientBuildPath, { recursive: true, force: true }));
  const server = await startServer(clientBuildPath);
  t.after(server.close);

  const asset = await fetch(`${server.baseUrl}/assets/app.css`);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get("content-type") ?? "", /text\/css/);
  assert.equal(await asset.text(), "body{color:#35251d}");

  for (const route of ["/", "/app", "/login", "/unknown/client/route"]) {
    const response = await fetch(`${server.baseUrl}${route}`);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/, route);
    assert.match(await response.text(), /Mælk SPA shell/, route);
  }
});
