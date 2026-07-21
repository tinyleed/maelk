import type { Request, Response } from "express";

import { loadAuthConfig, type AuthConfig } from "./config.js";
import { serializeClearSessionCookie, serializeSessionCookie } from "./cookies.js";
import { RefreshTokenCipher } from "./crypto.js";
import { SupabaseJwtVerifier, type VerifiedSupabaseJwt } from "./jwt.js";
import { PostgresApplicationSessionStore } from "./postgres-session-store.js";
import { createSupabaseAuthProvider, type SupabaseAuthProvider } from "./provider.js";
import { createSessionDatabaseConnection, type SessionDatabaseConnection } from "./session-database.js";
import { ApplicationSessionService } from "./session-service.js";
import { InMemoryApplicationSessionStore, type ApplicationSessionStore, type StoredApplicationSession } from "./session-store.js";

export type AuthenticatedRequestContext = {
  user: {
    id: string;
    email: string | null;
  };
  session: StoredApplicationSession;
  csrfTokenHash: string;
};

export type JwtVerifier = {
  verify(accessToken: string): Promise<VerifiedSupabaseJwt>;
};

export type AuthRuntime = {
  config: AuthConfig;
  provider: SupabaseAuthProvider | null;
  jwtVerifier: JwtVerifier | null;
  sessionService: ApplicationSessionService | null;
  store: ApplicationSessionStore;
  now: () => number;
};

export type AuthRuntimeOptions = {
  env?: NodeJS.ProcessEnv;
  config?: AuthConfig;
  provider?: SupabaseAuthProvider;
  jwtVerifier?: JwtVerifier;
  store?: ApplicationSessionStore;
  sessionDatabaseConnection?: SessionDatabaseConnection;
  sessionDatabaseRequiredName?: string;
  now?: () => number;
  fetch?: typeof fetch;
};

export function createAuthRuntime(options: AuthRuntimeOptions = {}): AuthRuntime {
  const now = options.now ?? Date.now;
  const config =
    options.config ??
    loadAuthConfig(options.env, {
      sessionDatabaseConfigured: Boolean(options.sessionDatabaseConnection),
      sessionDatabaseRequiredName: options.sessionDatabaseRequiredName,
    });
  const store = options.store ?? createDefaultSessionStore(config, now, options.sessionDatabaseConnection);

  if (!config.authConfigured) {
    return {
      config,
      provider: null,
      jwtVerifier: null,
      sessionService: null,
      store,
      now,
    };
  }

  const provider = options.provider ?? createSupabaseAuthProvider(config, options.fetch);
  const jwtVerifier =
    options.jwtVerifier ??
    new SupabaseJwtVerifier({
      audience: config.jwtAudience,
      issuer: config.jwtIssuer,
      jwksUrl: config.jwksUrl,
      algorithms: config.jwtAlgorithms,
      now,
    });
  const sessionService = new ApplicationSessionService({
    config,
    cipher: new RefreshTokenCipher(config.sessionEncryptionKey),
    store,
    now,
  });

  return {
    config,
    provider,
    jwtVerifier,
    sessionService,
    store,
    now,
  };
}

function createDefaultSessionStore(
  config: AuthConfig,
  now: () => number,
  sessionDatabaseConnection: SessionDatabaseConnection | undefined,
): ApplicationSessionStore {
  if (!config.authConfigured) {
    return new InMemoryApplicationSessionStore({ now });
  }

  const databaseConnection =
    sessionDatabaseConnection ??
    (config.databaseUrl
      ? createSessionDatabaseConnection({ connectionString: config.databaseUrl, source: "node-database-url" })
      : undefined);

  if (!databaseConnection) {
    throw new Error("auth_session_database_unavailable");
  }

  return new PostgresApplicationSessionStore({ databaseConnection });
}

export function sendAuthUnavailable(response: Response, runtime: AuthRuntime): void {
  const missingConfiguration = runtime.config.environment === "production" ? [] : runtime.config.missingConfiguration;
  response.status(runtime.config.environment === "production" ? 503 : 200).json({
    authConfigured: false,
    authenticated: false,
    missingConfiguration,
    message:
      runtime.config.environment === "production"
        ? "Authentication is temporarily unavailable."
        : "Server-owned Supabase auth is not configured for this runtime.",
  });
}

export function requireOrigin(request: Request, response: Response, runtime: AuthRuntime): boolean {
  const origin = request.get("origin") ?? "";
  if (!origin || !runtime.config.allowedOrigins.has(origin)) {
    response.status(403).json({ error: "forbidden_origin" });
    return false;
  }
  return true;
}

export function setSessionCookie(response: Response, runtime: AuthRuntime, cookieValue: string): void {
  response.append("set-cookie", serializeSessionCookie(cookieValue, runtime.config));
}

export function clearSessionCookie(response: Response, runtime: AuthRuntime): void {
  response.append("set-cookie", serializeClearSessionCookie(runtime.config));
}

export async function getAuthenticatedContext(request: Request, runtime: AuthRuntime): Promise<AuthenticatedRequestContext | null> {
  if (!runtime.sessionService) {
    return null;
  }

  const session = await runtime.sessionService.getFromCookieHeader(request.get("cookie"));
  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.userId,
      email: session.email,
    },
    session,
    csrfTokenHash: session.csrfTokenHash,
  };
}
