import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();

function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function requireFile(path) {
  assert.equal(existsSync(join(root, path)), true, `missing required file: ${path}`);
}

function requireIncludes(value, needle, label) {
  assert.ok(value.includes(needle), `${label} missing ${needle}`);
}

function requireNotIncludes(value, needle, label) {
  assert.ok(!value.includes(needle), `${label} still includes ${needle}`);
}

const rootPackage = readJson("package.json");
assert.equal(rootPackage.engines?.node, ">=22.22.0", "root package must require Node >=22.22.0");
assert.deepEqual(rootPackage.workspaces, ["apps/app", "apps/api"], "root workspaces must cover web and API");
for (const [script, needle] of [
  ["dev", "@maelk/api"],
  ["dev", "@maelk/app"],
  ["build", "@maelk/app run build && npm --workspace @maelk/api run build"],
  ["start", "@maelk/api"],
  ["test", "--workspaces"],
  ["typecheck", "--workspaces"],
  ["lint", "--workspaces"],
  ["test:worker-preview", "wrangler deploy --dry-run"],
  ["supabase:start:test", "--exclude"],
  ["supabase:reset", "db reset --local"],
  ["test:rls", "cross_tenant_rls_harness.sql"],
  ["test:rls:hosted", "hosted_auth_tenant_smoke.sql --linked"],
  ["test:auth:postgres", "run-postgres-session-test.mjs"],
  ["test:security:local", "test:auth:postgres"],
]) {
  requireIncludes(rootPackage.scripts?.[script] ?? "", needle, `root script ${script}`);
}
assert.equal(rootPackage.devDependencies?.wrangler, "4.112.0", "Wrangler must be pinned to verified v4.112.0");
assert.equal(
  rootPackage.devDependencies?.["@cloudflare/workers-types"],
  "5.20260721.1",
  "Cloudflare Workers types must be pinned to the verified runtime date",
);

const appPackage = readJson("apps/app/package.json");
assert.equal(appPackage.engines?.node, ">=22.22.0", "app package must require Node >=22.22.0");
requireIncludes(appPackage.scripts?.test ?? "", "run-client-safe-redirect-tests.mjs", "app test script");
assert.equal(appPackage.dependencies?.["react-router"], "8.2.0", "react-router must be pinned to verified v8.2.0");
assert.equal(appPackage.dependencies?.["@react-router/node"], "8.2.0", "@react-router/node must be pinned to verified v8.2.0");
assert.equal(appPackage.devDependencies?.["@react-router/dev"], "8.2.0", "@react-router/dev must be pinned to verified v8.2.0");
for (const removedDependency of ["@react-router/serve", "@vercel/react-router", "@supabase/ssr", "@supabase/supabase-js", "isbot"]) {
  assert.equal(appPackage.dependencies?.[removedDependency], undefined, `removed dependency still present: ${removedDependency}`);
}
for (const dependency of ["class-variance-authority", "clsx", "tailwind-merge"]) {
  assert.ok(appPackage.dependencies?.[dependency], `shadcn dependency missing: ${dependency}`);
}

const apiPackage = readJson("apps/api/package.json");
assert.equal(apiPackage.engines?.node, ">=22.22.0", "api package must require Node >=22.22.0");
assert.equal(apiPackage.dependencies?.express, "5.2.1", "Express must be pinned to verified v5.2.1");
for (const script of ["dev", "build", "start", "typecheck", "lint", "test", "test:postgres"]) {
  assert.ok(apiPackage.scripts?.[script], `api package missing ${script} script`);
}

requireFile("apps/app/components.json");
requireFile("apps/app/app/components/ui/button.tsx");
requireFile("apps/app/app/entry.server.tsx");
requireFile("apps/app/app/lib/auth-api.ts");
requireFile("apps/app/app/lib/client-safe-redirect.ts");
requireFile("apps/app/app/lib/client-safe-redirect.test.ts");
requireFile("apps/app/app/lib/utils.ts");
requireFile("apps/app/scripts/run-client-safe-redirect-tests.mjs");
requireFile("apps/api/src/app.ts");
requireFile("apps/api/src/api-app.ts");
requireFile("apps/api/src/server.ts");
requireFile("apps/api/src/worker.ts");
requireFile("apps/api/.env.example");
requireFile("apps/api/test/app.test.mjs");
requireFile("apps/api/test/postgres-session-store.integration.test.mjs");
requireFile("supabase/config.toml");
requireFile("supabase/migrations/20260721000100_auth_tenant_foundation_v0.sql");
requireFile("supabase/migrations/20260721103921_revoke_anon_tenant_helpers.sql");
requireFile("supabase/tests/cross_tenant_rls_harness.sql");
requireFile("supabase/tests/hosted_auth_tenant_smoke.sql");
requireFile("scripts/check-worker-preview.mjs");
requireFile("scripts/run-postgres-session-test.mjs");
requireFile("wrangler.jsonc");

const postgresTestRunner = readText("scripts/run-postgres-session-test.mjs");
for (const needle of ["supabase", "status", "--output", "json", "DB_URL", "MAELK_TEST_DATABASE_URL"]) {
  requireIncludes(postgresTestRunner, needle, "run-postgres-session-test.mjs");
}
requireNotIncludes(rootPackage.scripts?.["test:auth:postgres"] ?? "", "postgresql://", "root script test:auth:postgres");

const workerSource = readText("apps/api/src/worker.ts");
for (const needle of ["httpServerHandler", "createServer", "createApiApp", "server.listen(8080)"]) {
  requireIncludes(workerSource, needle, "worker.ts");
}
const wranglerConfig = readText("wrangler.jsonc");
for (const needle of [
  '"main": "./apps/api/src/worker.ts"',
  '"compatibility_flags": ["nodejs_compat"]',
  '"directory": "./apps/app/build/client"',
  '"not_found_handling": "single-page-application"',
  '"run_worker_first": ["/api/*"]',
]) {
  requireIncludes(wranglerConfig, needle, "wrangler.jsonc");
}

const reactRouterConfig = readText("apps/app/react-router.config.ts");
requireIncludes(reactRouterConfig, "ssr: false", "react-router.config.ts");
for (const forbidden of ["vercelPreset", "presets:", "ssr: true"]) {
  requireNotIncludes(reactRouterConfig, forbidden, "react-router.config.ts");
}

const viteConfig = readText("apps/app/vite.config.ts");
requireIncludes(viteConfig, "proxy", "vite.config.ts");
requireIncludes(viteConfig, "http://localhost:3001", "vite.config.ts");

const authApi = readText("apps/app/app/lib/auth-api.ts");
for (const needle of ["/api/auth/session", "/api/auth/otp/start", "/api/auth/otp/verify", "/api/auth/logout", "credentials: \"include\""]) {
  requireIncludes(authApi, needle, "auth-api.ts");
}
assert.equal(existsSync(join(root, "apps/app/app/lib/supabase-client.ts")), false, "browser Supabase auth helper must be removed");
assert.equal(existsSync(join(root, "apps/app/app/lib/supabase-server.ts")), false, "server-only Supabase helper must be removed");

const clientSafeRedirect = readText("apps/app/app/lib/client-safe-redirect.ts");
for (const needle of ["DEFAULT_CLIENT_REDIRECT_PATH", "getClientSafeRedirectPath", "decodeURIComponent", "new URL"]) {
  requireIncludes(clientSafeRedirect, needle, "client-safe-redirect.ts");
}

for (const route of ["apps/app/app/routes/login.tsx", "apps/app/app/routes/app.tsx"]) {
  const source = readText(route);
  requireIncludes(source, "clientLoader", route);
  requireNotIncludes(source, "export async function loader", route);
  requireNotIncludes(source, "createSupabaseServerClient", route);
}

const loginRoute = readText("apps/app/app/routes/login.tsx");
requireIncludes(loginRoute, "getClientSafeRedirectPath", "login.tsx");
const loginForm = readText("apps/app/app/components/login-form.tsx");
for (const needle of ["requestEmailOtp", "verifyEmailOtp", "Email OTP"]) {
  requireIncludes(loginForm, needle, "login-form.tsx");
}
requireNotIncludes(loginForm, "encodeURIComponent(nextPath)", "login-form.tsx");
const authCallbackRoute = readText("apps/app/app/routes/auth-callback.tsx");
requireIncludes(authCallbackRoute, "getClientSafeRedirectPath", "auth-callback.tsx");
requireIncludes(authCallbackRoute, "Retired auth callback", "auth-callback.tsx");

const button = readText("apps/app/app/components/ui/button.tsx");
requireIncludes(button, "class-variance-authority", "ui/button.tsx");
requireIncludes(button, "~/lib/utils", "ui/button.tsx");
requireIncludes(button, "Slot", "ui/button.tsx");

const apiApp = readText("apps/api/src/api-app.ts");
for (const needle of [
  "/api/health",
  "createAuthRouter",
  "not_found",
  "internal_server_error",
]) {
  requireIncludes(apiApp, needle, "API-only app");
}

const nodeApp = readText("apps/api/src/app.ts");
for (const needle of [
  "configureApiApp",
  "express.static",
  "index.html",
  "isMissingStaticAssetRequest",
  "Client build unavailable",
]) {
  requireIncludes(nodeApp, needle, "Node app");
}
requireNotIncludes(nodeApp, "path: spaIndexPath", "Node app");

const stalePatterns = [
  /Vercel preview hosting/i,
  /Vercel hosting/i,
  /official Vercel React Router preset/i,
  /deployed to Vercel/i,
  /Vercel setup can be prepared/i,
  /Use Vercel preview\/production URLs first/i,
  /@vercel\/react-router/,
  /vercelPreset/,
  /ssr:\s*true/,
  /react-router-serve/,
  /server\/\*\/index\.js/,
  /Product Launch OS remains the first workflow wedge/i,
];
const skippedDirs = new Set([".git", ".next", ".react-router", ".vercel", ".wrangler", "build", "dist", "node_modules"]);
const skippedFiles = new Set([
  "package-lock.json",
  "scripts/check-stack-contract.mjs",
  "apps/app/scripts/check-auth-shell.mjs",
]);

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const absolutePath = join(dir, entry);
    const rel = relative(root, absolutePath);
    if (skippedDirs.has(entry) || skippedFiles.has(rel)) continue;
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      walk(absolutePath);
    } else if (/\.(md|mdx|ts|tsx|js|mjs|json|sh)$/.test(entry)) {
      const source = readFileSync(absolutePath, "utf8");
      for (const pattern of stalePatterns) {
        assert.ok(!pattern.test(source), `stale stack wording ${pattern} found in ${rel}`);
      }
    }
  }
}

walk(root);
console.log("maelk_stack_contract_ok");
