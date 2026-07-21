import { createSessionDatabaseConnection, type SessionDatabaseConnection } from "./auth/session-database.js";
import type { AuthRuntimeOptions } from "./auth/index.js";

export const MAELK_SESSION_HYPERDRIVE_BINDING = "MAELK_SESSION_HYPERDRIVE";

export type HyperdriveConnectionBinding = {
  connectionString?: unknown;
};

type WorkerAuthTextEnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "SUPABASE_JWT_ISSUER"
  | "SUPABASE_JWT_AUDIENCE"
  | "SUPABASE_JWKS_URL"
  | "SUPABASE_JWT_ALGORITHMS"
  | "MAELK_AUTH_ALLOWED_ORIGINS"
  | "MAELK_SESSION_ENCRYPTION_KEY"
  | "MAELK_SESSION_TTL_SECONDS"
  | "MAELK_SESSION_REFRESH_SKEW_SECONDS"
  | "MAELK_AUTH_COOKIE_SECURE";

export type MaelkWorkerEnv = Partial<Record<WorkerAuthTextEnvKey, string>> & {
  MAELK_SESSION_HYPERDRIVE?: HyperdriveConnectionBinding;
};

const WORKER_AUTH_TEXT_ENV_KEYS: WorkerAuthTextEnvKey[] = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_JWT_ISSUER",
  "SUPABASE_JWT_AUDIENCE",
  "SUPABASE_JWKS_URL",
  "SUPABASE_JWT_ALGORITHMS",
  "MAELK_AUTH_ALLOWED_ORIGINS",
  "MAELK_SESSION_ENCRYPTION_KEY",
  "MAELK_SESSION_TTL_SECONDS",
  "MAELK_SESSION_REFRESH_SKEW_SECONDS",
  "MAELK_AUTH_COOKIE_SECURE",
];

export function createWorkerAuthRuntimeOptions(env: MaelkWorkerEnv): AuthRuntimeOptions {
  return {
    env: createWorkerAuthProcessEnv(env),
    sessionDatabaseConnection: resolveHyperdriveSessionDatabaseConnection(env),
    sessionDatabaseRequiredName: MAELK_SESSION_HYPERDRIVE_BINDING,
  };
}

export function createWorkerAuthProcessEnv(env: MaelkWorkerEnv): NodeJS.ProcessEnv {
  const authEnv: NodeJS.ProcessEnv = {
    NODE_ENV: "production",
  };

  for (const key of WORKER_AUTH_TEXT_ENV_KEYS) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      authEnv[key] = value;
    }
  }

  return authEnv;
}

export function resolveHyperdriveSessionDatabaseConnection(env: MaelkWorkerEnv): SessionDatabaseConnection | undefined {
  const binding = env[MAELK_SESSION_HYPERDRIVE_BINDING];
  const connectionString = binding?.connectionString;
  if (typeof connectionString !== "string" || !connectionString.trim()) {
    return undefined;
  }

  return createSessionDatabaseConnection({
    connectionString,
    source: "worker-hyperdrive",
  });
}
