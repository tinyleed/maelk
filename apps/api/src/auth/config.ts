export type AuthEnvironment = "development" | "test" | "production";

export type AuthConfig = {
  authConfigured: boolean;
  missingConfiguration: string[];
  environment: AuthEnvironment;
  allowedOrigins: Set<string>;
  cookieName: string;
  cookieSecure: boolean;
  sessionTtlSeconds: number;
  refreshSkewSeconds: number;
  csrfHeaderName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  jwtIssuer: string;
  jwtAudience: string;
  jwksUrl: string;
  jwtAlgorithms: string[];
  sessionEncryptionKey: string;
  databaseUrl: string;
};

export const DEFAULT_LOCAL_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
];

export const REQUIRED_PRODUCTION_AUTH_ENV = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_JWT_ISSUER",
  "SUPABASE_JWT_AUDIENCE",
  "SUPABASE_JWKS_URL",
  "MAELK_AUTH_ALLOWED_ORIGINS",
  "MAELK_SESSION_ENCRYPTION_KEY",
  "DATABASE_URL",
] as const;

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_REFRESH_SKEW_SECONDS = 60;
const DEFAULT_JWT_ALGORITHMS = ["RS256", "ES256"];
const ALLOWED_ASYMMETRIC_JWT_ALGORITHMS = new Set(DEFAULT_JWT_ALGORITHMS);

export function loadAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const environment = normalizeEnvironment(env.NODE_ENV);
  const isProduction = environment === "production";
  const allowedOrigins = parseAllowedOrigins(env.MAELK_AUTH_ALLOWED_ORIGINS);

  if (!isProduction && allowedOrigins.size === 0) {
    for (const origin of DEFAULT_LOCAL_ALLOWED_ORIGINS) {
      allowedOrigins.add(origin);
    }
  }

  const values = {
    SUPABASE_URL: readEnv(env, "SUPABASE_URL"),
    SUPABASE_ANON_KEY: readEnv(env, "SUPABASE_ANON_KEY"),
    SUPABASE_JWT_ISSUER: readEnv(env, "SUPABASE_JWT_ISSUER"),
    SUPABASE_JWT_AUDIENCE: readEnv(env, "SUPABASE_JWT_AUDIENCE"),
    SUPABASE_JWKS_URL: readEnv(env, "SUPABASE_JWKS_URL"),
    MAELK_AUTH_ALLOWED_ORIGINS: readEnv(env, "MAELK_AUTH_ALLOWED_ORIGINS"),
    MAELK_SESSION_ENCRYPTION_KEY: readEnv(env, "MAELK_SESSION_ENCRYPTION_KEY"),
    DATABASE_URL: readEnv(env, "DATABASE_URL"),
  };

  const missingConfiguration: string[] = REQUIRED_PRODUCTION_AUTH_ENV.filter((key) => !values[key]);

  if (values.MAELK_SESSION_ENCRYPTION_KEY) {
    try {
      const keyBytes = Buffer.from(values.MAELK_SESSION_ENCRYPTION_KEY, "base64url");
      if (keyBytes.length !== 32) {
        missingConfiguration.push("MAELK_SESSION_ENCRYPTION_KEY:32_base64url_bytes");
      }
    } catch {
      missingConfiguration.push("MAELK_SESSION_ENCRYPTION_KEY:base64url");
    }
  }

  const jwtAlgorithms = parseCsv(env.SUPABASE_JWT_ALGORITHMS, DEFAULT_JWT_ALGORITHMS);
  if (jwtAlgorithms.some((algorithm) => !ALLOWED_ASYMMETRIC_JWT_ALGORITHMS.has(algorithm))) {
    missingConfiguration.push("SUPABASE_JWT_ALGORITHMS:asymmetric_allowlist");
  }

  const authConfigured = missingConfiguration.length === 0;
  const cookieSecure = isProduction || env.MAELK_AUTH_COOKIE_SECURE === "true";
  const cookieName = isProduction ? "__Host-maelk-session" : env.MAELK_AUTH_COOKIE_NAME?.trim() || "maelk_session";

  return {
    authConfigured,
    missingConfiguration,
    environment,
    allowedOrigins,
    cookieName,
    cookieSecure,
    sessionTtlSeconds: parsePositiveInteger(env.MAELK_SESSION_TTL_SECONDS, DEFAULT_SESSION_TTL_SECONDS),
    refreshSkewSeconds: parsePositiveInteger(env.MAELK_SESSION_REFRESH_SKEW_SECONDS, DEFAULT_REFRESH_SKEW_SECONDS),
    csrfHeaderName: "x-maelk-csrf",
    supabaseUrl: values.SUPABASE_URL,
    supabaseAnonKey: values.SUPABASE_ANON_KEY,
    jwtIssuer: values.SUPABASE_JWT_ISSUER,
    jwtAudience: values.SUPABASE_JWT_AUDIENCE,
    jwksUrl: values.SUPABASE_JWKS_URL,
    jwtAlgorithms,
    sessionEncryptionKey: values.MAELK_SESSION_ENCRYPTION_KEY,
    databaseUrl: values.DATABASE_URL,
  };
}

function normalizeEnvironment(value: string | undefined): AuthEnvironment {
  if (value === "production" || value === "test") {
    return value;
  }
  return "development";
}

function readEnv(env: NodeJS.ProcessEnv, key: string): string {
  return env[key]?.trim() ?? "";
}

function parseAllowedOrigins(value: string | undefined): Set<string> {
  return new Set(parseCsv(value, []));
}

function parseCsv(value: string | undefined, fallback: string[]): string[] {
  const parsed = (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
