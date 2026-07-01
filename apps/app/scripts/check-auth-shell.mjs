import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "react-router.config.ts",
  "vite.config.ts",
  "tsconfig.json",
  "app/root.tsx",
  "app/routes.ts",
  "app/routes/home.tsx",
  "app/routes/login.tsx",
  "app/routes/app.tsx",
  "app/routes/auth-callback.tsx",
  "app/components/button.tsx",
  "app/components/login-form.tsx",
  "app/components/logout-button.tsx",
  "app/lib/supabase-client.ts",
  "app/lib/supabase-server.ts",
  "app/lib/supabase-env.ts",
  "app/styles.css",
  ".env.example",
];

for (const file of requiredFiles) {
  readFileSync(join(root, file), "utf8");
}

const packageJson = readFileSync(join(root, "package.json"), "utf8");
for (const needle of [
  '"react-router"',
  '"@react-router/dev"',
  '"@vercel/react-router"',
  '"@tailwindcss/vite"',
  '"@radix-ui/react-slot"',
]) {
  if (!packageJson.includes(needle)) {
    throw new Error(`package.json missing ${needle}`);
  }
}

for (const forbidden of ['"next"', 'next build', 'next dev', 'middleware.ts', 'middleware.js']) {
  if (packageJson.includes(forbidden)) {
    throw new Error(`Next.js artifact still present in package.json: ${forbidden}`);
  }
}

const envExample = readFileSync(join(root, ".env.example"), "utf8");
for (const key of ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]) {
  if (!envExample.includes(key)) {
    throw new Error(`.env.example missing ${key}`);
  }
}

const allSource = requiredFiles
  .filter((file) => file.startsWith("app/"))
  .map((file) => readFileSync(join(root, file), "utf8"))
  .join("\n");

for (const required of [
  "createSupabaseBrowserClient",
  "createSupabaseServerClient",
  "signInWithOtp",
  "@radix-ui/react-slot",
  "Product Launch OS",
  "local-only",
]) {
  if (!allSource.includes(required)) {
    throw new Error(`auth shell missing ${required}`);
  }
}

for (const forbidden of [
  "SUPABASE_SERVICE_ROLE",
  "service_role",
  "Approve go-live",
  "Sync inventory",
  "Send to supplier",
  "Change live price",
]) {
  if (allSource.includes(forbidden)) {
    throw new Error(`forbidden auth-shell content: ${forbidden}`);
  }
}

console.log("react_router_auth_shell_static_check_ok");
