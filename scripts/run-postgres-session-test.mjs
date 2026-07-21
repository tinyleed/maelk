import { spawnSync } from "node:child_process";

const status = spawnSync("supabase", ["status", "--output", "json"], {
  encoding: "utf8",
  env: process.env,
});

if (status.status !== 0) {
  console.error("Unable to read the local Supabase status. Start it with `npm run supabase:start:test` first.");
  process.exit(status.status ?? 1);
}

let databaseUrl;
try {
  const parsed = JSON.parse(status.stdout);
  databaseUrl = parsed.DB_URL;
} catch {
  console.error("Supabase returned malformed status JSON.");
  process.exit(1);
}

if (
  typeof databaseUrl !== "string" ||
  !databaseUrl.startsWith("postgresql://") ||
  /[\r\n\0]/u.test(databaseUrl)
) {
  console.error("Supabase status did not include a valid local PostgreSQL URL.");
  process.exit(1);
}

const test = spawnSync("npm", ["--workspace", "@maelk/api", "run", "test:postgres"], {
  env: {
    ...process.env,
    MAELK_TEST_DATABASE_URL: databaseUrl,
  },
  stdio: "inherit",
});

process.exit(test.status ?? 1);
