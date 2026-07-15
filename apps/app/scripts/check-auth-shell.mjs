import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "react-router.config.ts",
  "vite.config.ts",
  "tsconfig.json",
  "components.json",
  "app/root.tsx",
  "app/entry.server.tsx",
  "app/routes.ts",
  "app/routes/home.tsx",
  "app/routes/login.tsx",
  "app/routes/app.tsx",
  "app/routes/auth-callback.tsx",
  "app/components/ui/button.tsx",
  "app/components/login-form.tsx",
  "app/components/logout-button.tsx",
  "app/lib/client-safe-redirect.ts",
  "app/lib/client-safe-redirect.test.ts",
  "app/lib/supabase-client.ts",
  "app/lib/supabase-env.ts",
  "app/lib/utils.ts",
  "app/lib/product-launches.ts",
  "app/modules/product-launch-os/index.ts",
  "app/modules/product-launch-os/product-launch-os.models.ts",
  "app/modules/product-launch-os/product-launch-os.fixtures.ts",
  "app/modules/product-launch-os/product-launch-os.readiness.ts",
  "app/styles.css",
  "scripts/run-client-safe-redirect-tests.mjs",
  ".env.example",
];

for (const file of requiredFiles) {
  readFileSync(join(root, file), "utf8");
}

if (existsSync(join(root, "app/lib/supabase-server.ts"))) {
  throw new Error("server-only Supabase helper must not exist in SPA mode");
}

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (packageJson.engines?.node !== ">=22.22.0") {
  throw new Error("apps/app package.json must require Node >=22.22.0");
}
for (const [name, expected] of [
  ["react-router", "8.2.0"],
  ["@react-router/node", "8.2.0"],
]) {
  if (packageJson.dependencies?.[name] !== expected) {
    throw new Error(`package.json must pin ${name}@${expected}`);
  }
}
if (packageJson.devDependencies?.["@react-router/dev"] !== "8.2.0") {
  throw new Error("package.json must pin @react-router/dev@8.2.0");
}
for (const needle of [
  "@tailwindcss/vite",
  "@radix-ui/react-slot",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
]) {
  if (!JSON.stringify(packageJson).includes(needle)) {
    throw new Error(`package.json missing ${needle}`);
  }
}
for (const forbidden of [
  "@react-router/serve",
  "@vercel/react-router",
  "@supabase/ssr",
  "isbot",
  "next",
]) {
  if (JSON.stringify(packageJson).includes(forbidden)) {
    throw new Error(`stale app dependency still present: ${forbidden}`);
  }
}

const reactRouterConfig = readFileSync(join(root, "react-router.config.ts"), "utf8");
if (!reactRouterConfig.includes("ssr: false")) {
  throw new Error("react-router.config.ts must enable SPA mode with ssr: false");
}
for (const forbidden of ["vercelPreset", "presets:", "ssr: true"]) {
  if (reactRouterConfig.includes(forbidden)) {
    throw new Error(`react-router.config.ts contains stale runtime config: ${forbidden}`);
  }
}

const viteConfig = readFileSync(join(root, "vite.config.ts"), "utf8");
if (!viteConfig.includes("proxy") || !viteConfig.includes("http://localhost:3001")) {
  throw new Error("vite.config.ts must proxy /api to the local Express service");
}

const allSource = requiredFiles
  .filter((file) => file.startsWith("app/"))
  .map((file) => readFileSync(join(root, file), "utf8"))
  .join("\n");

for (const required of [
  "createSupabaseBrowserClient",
  "@supabase/supabase-js",
  "signInWithOtp",
  "clientLoader",
  "getClientSafeRedirectPath",
  "DEFAULT_CLIENT_REDIRECT_PATH",
  "HydrateFallback",
  "@radix-ui/react-slot",
  "class-variance-authority",
  "Product Launch OS",
  "local-only",
]) {
  if (!allSource.includes(required)) {
    throw new Error(`SPA auth shell missing ${required}`);
  }
}

for (const forbidden of [
  "createSupabaseServerClient",
  "@supabase/ssr",
  "export async function loader",
  "SUPABASE_SERVICE_ROLE",
  "service_role",
  "encodeURIComponent(nextPath)",
  "Approve go-live",
  "Sync inventory",
  "Send to supplier",
  "Change live price",
]) {
  if (allSource.includes(forbidden)) {
    throw new Error(`forbidden SPA auth-shell content: ${forbidden}`);
  }
}

const productLaunchModuleSource = [
  "app/modules/product-launch-os/index.ts",
  "app/modules/product-launch-os/product-launch-os.models.ts",
  "app/modules/product-launch-os/product-launch-os.fixtures.ts",
  "app/modules/product-launch-os/product-launch-os.readiness.ts",
]
  .map((file) => readFileSync(join(root, file), "utf8"))
  .join("\n");

for (const required of [
  "export type ProductLaunchSummary",
  "export type ProductLaunchGate",
  "export type ProductLaunchReadiness",
  "companyId",
  "createdBy",
  "createdAt",
  "createProductLaunchSummaries",
  "deriveProductLaunchReadiness",
  "requiresHumanApprovalReason",
  "humanApprovalReasonRequired",
  "canApprove: false",
]) {
  if (!productLaunchModuleSource.includes(required)) {
    throw new Error(`Product Launch OS domain module missing ${required}`);
  }
}

for (const forbidden of ["ready=true", "ready = true", "syncMode: \"enabled\""]) {
  if (productLaunchModuleSource.includes(forbidden)) {
    throw new Error(`Product Launch OS domain module contains forbidden shortcut: ${forbidden}`);
  }
}

console.log("react_router_spa_auth_shell_static_check_ok");
