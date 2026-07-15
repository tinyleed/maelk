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
]) {
  requireIncludes(rootPackage.scripts?.[script] ?? "", needle, `root script ${script}`);
}

const appPackage = readJson("apps/app/package.json");
assert.equal(appPackage.engines?.node, ">=22.22.0", "app package must require Node >=22.22.0");
assert.equal(appPackage.dependencies?.["react-router"], "8.2.0", "react-router must be pinned to verified v8.2.0");
assert.equal(appPackage.dependencies?.["@react-router/node"], "8.2.0", "@react-router/node must be pinned to verified v8.2.0");
assert.equal(appPackage.devDependencies?.["@react-router/dev"], "8.2.0", "@react-router/dev must be pinned to verified v8.2.0");
for (const removedDependency of ["@react-router/serve", "@vercel/react-router", "@supabase/ssr", "isbot"]) {
  assert.equal(appPackage.dependencies?.[removedDependency], undefined, `removed dependency still present: ${removedDependency}`);
}
for (const dependency of ["class-variance-authority", "clsx", "tailwind-merge"]) {
  assert.ok(appPackage.dependencies?.[dependency], `shadcn dependency missing: ${dependency}`);
}

const apiPackage = readJson("apps/api/package.json");
assert.equal(apiPackage.engines?.node, ">=22.22.0", "api package must require Node >=22.22.0");
assert.equal(apiPackage.dependencies?.express, "5.2.1", "Express must be pinned to verified v5.2.1");
for (const script of ["dev", "build", "start", "typecheck", "lint", "test"]) {
  assert.ok(apiPackage.scripts?.[script], `api package missing ${script} script`);
}

requireFile("apps/app/components.json");
requireFile("apps/app/app/components/ui/button.tsx");
requireFile("apps/app/app/entry.server.tsx");
requireFile("apps/app/app/lib/utils.ts");
requireFile("apps/api/src/app.ts");
requireFile("apps/api/src/server.ts");
requireFile("apps/api/test/app.test.mjs");

const reactRouterConfig = readText("apps/app/react-router.config.ts");
requireIncludes(reactRouterConfig, "ssr: false", "react-router.config.ts");
for (const forbidden of ["vercelPreset", "presets:", "ssr: true"]) {
  requireNotIncludes(reactRouterConfig, forbidden, "react-router.config.ts");
}

const viteConfig = readText("apps/app/vite.config.ts");
requireIncludes(viteConfig, "proxy", "vite.config.ts");
requireIncludes(viteConfig, "http://localhost:3001", "vite.config.ts");

const supabaseClient = readText("apps/app/app/lib/supabase-client.ts");
requireIncludes(supabaseClient, "@supabase/supabase-js", "supabase-client.ts");
requireIncludes(supabaseClient, "createClient", "supabase-client.ts");
assert.equal(existsSync(join(root, "apps/app/app/lib/supabase-server.ts")), false, "server-only Supabase helper must be removed");

for (const route of ["apps/app/app/routes/login.tsx", "apps/app/app/routes/app.tsx"]) {
  const source = readText(route);
  requireIncludes(source, "clientLoader", route);
  requireNotIncludes(source, "export async function loader", route);
  requireNotIncludes(source, "createSupabaseServerClient", route);
}

const button = readText("apps/app/app/components/ui/button.tsx");
requireIncludes(button, "class-variance-authority", "ui/button.tsx");
requireIncludes(button, "~/lib/utils", "ui/button.tsx");
requireIncludes(button, "Slot", "ui/button.tsx");

const apiApp = readText("apps/api/src/app.ts");
for (const needle of ["/api/health", "not_found", "express.static", "index.html"]) {
  requireIncludes(apiApp, needle, "api app");
}

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
const skippedDirs = new Set([".git", ".next", ".react-router", ".vercel", "build", "dist", "node_modules"]);
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
