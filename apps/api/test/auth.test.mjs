import assert from "node:assert/strict";
import { randomBytes, generateKeyPairSync } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { exportJWK, SignJWT, createLocalJWKSet } from "jose";

import { createApp } from "../dist/app.js";
import {
  createSupabaseAuthProvider,
  InMemoryApplicationSessionStore,
  loadAuthConfig,
  SupabaseJwtVerifier,
} from "../dist/auth/index.js";

const ALLOWED_ORIGIN = "https://app.xn--mlk-yla.com";
const ISSUER = "https://maelk-test.supabase.co/auth/v1";
const AUDIENCE = "authenticated";
const FIRST_REFRESH_FIXTURE = ["fixture", "refresh", "one"].join("-");
const ROTATED_REFRESH_FIXTURE = ["fixture", "refresh", "two"].join("-");
const DATABASE_URL_FIXTURE = ["postgresql://", "maelk.example.invalid", "/postgres"].join("");

async function createFixtureBuild() {
  const root = await mkdtemp(join(tmpdir(), "maelk-auth-client-build-"));
  await mkdir(join(root, "assets"));
  await writeFile(join(root, "index.html"), "<!doctype html><html><body>Mælk SPA</body></html>", "utf8");
  return root;
}

async function startServer(app) {
  const server = createServer(app);
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
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}

function createAuthEnv(overrides = {}) {
  return {
    NODE_ENV: "production",
    SUPABASE_URL: "https://maelk-test.supabase.co",
    SUPABASE_ANON_KEY: "public-anon-key",
    SUPABASE_JWT_ISSUER: ISSUER,
    SUPABASE_JWT_AUDIENCE: AUDIENCE,
    SUPABASE_JWKS_URL: "https://maelk-test.supabase.co/auth/v1/.well-known/jwks.json",
    SUPABASE_JWT_ALGORITHMS: "RS256",
    MAELK_AUTH_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
    MAELK_SESSION_ENCRYPTION_KEY: randomBytes(32).toString("base64url"),
    MAELK_SESSION_TTL_SECONDS: "3600",
    DATABASE_URL: DATABASE_URL_FIXTURE,
    ...overrides,
  };
}

async function createJwtFixture() {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = await exportJWK(publicKey);
  jwk.kid = "maelk-test-key";
  jwk.alg = "RS256";
  const getKey = createLocalJWKSet({ keys: [jwk] });
  async function signJwt({
    issuer = ISSUER,
    audience = AUDIENCE,
    subject = "user_123",
    email = "mads@example.com",
    expiresInSeconds = 300,
    algorithm = "RS256",
    kid = "maelk-test-key",
    key = privateKey,
  } = {}) {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ email })
      .setProtectedHeader({ alg: algorithm, kid })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject(subject)
      .setIssuedAt(now)
      .setExpirationTime(now + expiresInSeconds)
      .sign(key);
  }

  return { getKey, signJwt };
}

async function createConfiguredServer(t, options = {}) {
  const clientBuildPath = await createFixtureBuild();
  t.after(() => rm(clientBuildPath, { recursive: true, force: true }));
  const jwt = await createJwtFixture();
  const config = loadAuthConfig(createAuthEnv(options.env));
  const store = options.store ?? new InMemoryApplicationSessionStore();
  const providerCalls = [];
  const provider = options.provider ?? {
    async startEmailOtp(input) {
      providerCalls.push(["start", input]);
      if (options.failOtpStart) throw new Error("provider leaked token=123456 refresh_secret");
    },
    async verifyEmailOtp(input) {
      providerCalls.push(["verify", input]);
      if (options.failOtpVerify) throw new Error("provider leaked otp=123456 refresh_secret");
      return {
        accessToken: await jwt.signJwt(),
        refreshToken: FIRST_REFRESH_FIXTURE,
      };
    },
    async refreshSession(input) {
      providerCalls.push(["refresh", input]);
      return {
        accessToken: await jwt.signJwt({ email: "mads-refreshed@example.com" }),
        refreshToken: ROTATED_REFRESH_FIXTURE,
      };
    },
  };
  const server = await startServer(
    createApp({
      clientBuildPath,
      auth: {
        config,
        provider,
        store,
        jwtVerifier: new SupabaseJwtVerifier({
          issuer: ISSUER,
          audience: AUDIENCE,
          algorithms: ["RS256"],
          getKey: jwt.getKey,
        }),
      },
    }),
  );
  t.after(server.close);
  return { ...server, providerCalls, store, jwt };
}

async function login(server) {
  const response = await fetch(`${server.baseUrl}/api/auth/otp/verify`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: ALLOWED_ORIGIN,
    },
    body: JSON.stringify({ email: "mads@example.com", token: "123456" }),
  });
  const body = await response.json();
  return {
    response,
    body,
    cookie: response.headers.get("set-cookie"),
  };
}

test("production auth fails closed when required server-owned auth configuration is missing", async (t) => {
  const clientBuildPath = await createFixtureBuild();
  t.after(() => rm(clientBuildPath, { recursive: true, force: true }));
  const server = await startServer(createApp({ clientBuildPath, auth: { env: { NODE_ENV: "production" } } }));
  t.after(server.close);

  const response = await fetch(`${server.baseUrl}/api/auth/otp/start`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: "mads@example.com" }),
  });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.authConfigured, false);
  assert.deepEqual(body.missingConfiguration, []);
  assert.equal(JSON.stringify(body).includes("MAELK_SESSION_ENCRYPTION_KEY"), false);
  assert.equal(body.message, "Authentication is temporarily unavailable.");
});

test("OTP start is invite-only and always generic for provider errors", async (t) => {
  const server = await createConfiguredServer(t, { failOtpStart: true });
  const response = await fetch(`${server.baseUrl}/api/auth/otp/start`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: "MADS@Example.com" }),
  });
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), {
    ok: true,
    message: "If this invited email can sign in, an email OTP has been sent.",
  });
  assert.deepEqual(server.providerCalls, [["start", { email: "mads@example.com", shouldCreateUser: false }]]);
});

test("Supabase OTP provider maps invite-only auth to create_user=false", async () => {
  const requests = [];
  const provider = createSupabaseAuthProvider(loadAuthConfig(createAuthEnv()), async (url, init) => {
    requests.push({ url: String(url), init });
    return new Response(null, { status: 200 });
  });

  await provider.startEmailOtp({ email: "mads@example.com", shouldCreateUser: false });

  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /\/auth\/v1\/otp$/u);
  const payload = JSON.parse(requests[0].init.body);
  assert.equal(payload.create_user, false);
  assert.equal("should_create_user" in payload, false);
});

test("email input is rejected before provider calls when it exceeds the bounded length", async (t) => {
  const server = await createConfiguredServer(t);
  const oversizedEmail = `${"a".repeat(248)}@example.com`;
  const response = await fetch(`${server.baseUrl}/api/auth/otp/start`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: oversizedEmail }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "invalid_email" });
  assert.deepEqual(server.providerCalls, []);
});

test("production auth rejects symmetric JWT algorithm configuration", () => {
  const config = loadAuthConfig(createAuthEnv({ SUPABASE_JWT_ALGORITHMS: "HS256" }));
  assert.equal(config.authConfigured, false);
  assert.ok(config.missingConfiguration.includes("SUPABASE_JWT_ALGORITHMS:asymmetric_allowlist"));
});

test("malformed OTP input and provider verify errors return sanitized responses", async (t) => {
  const invalidServer = await createConfiguredServer(t);
  const malformed = await fetch(`${invalidServer.baseUrl}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: "not-an-email", token: "<script>123</script>" }),
  });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: "invalid_otp_request" });

  const providerErrorServer = await createConfiguredServer(t, { failOtpVerify: true });
  const failed = await fetch(`${providerErrorServer.baseUrl}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: "mads@example.com", token: "123456" }),
  });
  assert.equal(failed.status, 401);
  const text = await failed.text();
  assert.equal(text.includes("123456"), false);
  assert.equal(text.includes("refresh_secret"), false);
  assert.deepEqual(JSON.parse(text), { error: "otp_verification_failed" });
});

test("session cookie uses production __Host attributes without storing the raw identifier", async (t) => {
  const server = await createConfiguredServer(t);
  const { response, body, cookie } = await login(server);

  assert.equal(response.status, 200);
  assert.equal(body.authenticated, true);
  assert.match(cookie ?? "", /^__Host-maelk-session=/u);
  assert.match(cookie ?? "", /HttpOnly/u);
  assert.match(cookie ?? "", /Secure/u);
  assert.match(cookie ?? "", /SameSite=Lax/u);
  assert.match(cookie ?? "", /Path=\//u);
  assert.equal((cookie ?? "").includes("Domain="), false);

  const cookieValue = /__Host-maelk-session=([^;]+)/u.exec(cookie ?? "")?.[1] ?? "";
  const stored = server.store.snapshot();
  assert.equal(stored.length, 1);
  assert.notEqual(stored[0].idHash, decodeURIComponent(cookieValue));
  assert.equal(stored[0].encryptedRefreshToken.includes(FIRST_REFRESH_FIXTURE), false);
  assert.match(stored[0].encryptedRefreshToken, /^v1:/u);
});

test("CSRF and strict Origin checks reject hostile or missing state-changing requests", async (t) => {
  const server = await createConfiguredServer(t);
  const { body, cookie } = await login(server);

  const hostileOrigin = await fetch(`${server.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { cookie, origin: "https://evil.example", "x-maelk-csrf": body.csrfToken },
  });
  assert.equal(hostileOrigin.status, 403);
  assert.deepEqual(await hostileOrigin.json(), { error: "forbidden_origin" });

  const missingOrigin = await fetch(`${server.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { cookie, "x-maelk-csrf": body.csrfToken },
  });
  assert.equal(missingOrigin.status, 403);

  const missingCsrf = await fetch(`${server.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { cookie, origin: ALLOWED_ORIGIN },
  });
  assert.equal(missingCsrf.status, 403);
  assert.deepEqual(await missingCsrf.json(), { error: "csrf_mismatch" });

  const mismatchCsrf = await fetch(`${server.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { cookie, origin: ALLOWED_ORIGIN, "x-maelk-csrf": "wrong-token" },
  });
  assert.equal(mismatchCsrf.status, 403);
});

test("session refresh rotates identifiers, encrypts new refresh data, and rejects replay", async (t) => {
  const server = await createConfiguredServer(t);
  const loginResult = await login(server);
  const oldCookie = loginResult.cookie;

  const refreshed = await fetch(`${server.baseUrl}/api/auth/session/refresh`, {
    method: "POST",
    headers: { cookie: oldCookie, origin: ALLOWED_ORIGIN, "x-maelk-csrf": loginResult.body.csrfToken },
  });
  assert.equal(refreshed.status, 200);
  const refreshedBody = await refreshed.json();
  const newCookie = refreshed.headers.get("set-cookie");
  assert.notEqual(newCookie, oldCookie);
  assert.equal(refreshedBody.user.email, "mads-refreshed@example.com");

  const replay = await fetch(`${server.baseUrl}/api/me`, { headers: { cookie: oldCookie } });
  assert.equal(replay.status, 401);

  const replayRefresh = await fetch(`${server.baseUrl}/api/auth/session/refresh`, {
    method: "POST",
    headers: { cookie: oldCookie, origin: ALLOWED_ORIGIN, "x-maelk-csrf": loginResult.body.csrfToken },
  });
  assert.equal(replayRefresh.status, 401);
  assert.match(replayRefresh.headers.get("set-cookie") ?? "", /Max-Age=0/u);

  const stored = server.store.snapshot();
  assert.equal(stored.length, 1);
  assert.equal(stored[0].encryptedRefreshToken.includes(ROTATED_REFRESH_FIXTURE), false);
});

test("concurrent refresh with one cookie creates exactly one replacement session", async (t) => {
  const server = await createConfiguredServer(t);
  const loginResult = await login(server);
  const headers = {
    cookie: loginResult.cookie,
    origin: ALLOWED_ORIGIN,
    "x-maelk-csrf": loginResult.body.csrfToken,
  };

  const [first, second] = await Promise.all([
    fetch(`${server.baseUrl}/api/auth/session/refresh`, { method: "POST", headers }),
    fetch(`${server.baseUrl}/api/auth/session/refresh`, { method: "POST", headers }),
  ]);

  assert.deepEqual([first.status, second.status].sort(), [200, 401]);
  assert.equal(server.store.snapshot().length, 1);
});

test("logout destroys sessions and clears replayable cookies", async (t) => {
  const server = await createConfiguredServer(t);
  const { body, cookie } = await login(server);
  const logout = await fetch(`${server.baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { cookie, origin: ALLOWED_ORIGIN, "x-maelk-csrf": body.csrfToken },
  });
  assert.equal(logout.status, 200);
  assert.deepEqual(await logout.json(), { ok: true });
  assert.match(logout.headers.get("set-cookie") ?? "", /Max-Age=0/u);

  const replay = await fetch(`${server.baseUrl}/api/me`, { headers: { cookie } });
  assert.equal(replay.status, 401);
  assert.equal(server.store.snapshot().length, 0);
});

test("expired sessions are rejected", async (t) => {
  let now = Date.now();
  const store = new InMemoryApplicationSessionStore({ now: () => now });
  const server = await createConfiguredServer(t, { store, env: { MAELK_SESSION_TTL_SECONDS: "1" } });
  const { cookie } = await login(server);
  now += 2000;
  const response = await fetch(`${server.baseUrl}/api/me`, { headers: { cookie } });
  assert.equal(response.status, 401);
});

test("/api/me rejects unauthenticated requests and succeeds through injected auth fakes", async (t) => {
  const server = await createConfiguredServer(t);
  const unauthenticated = await fetch(`${server.baseUrl}/api/me`);
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual(await unauthenticated.json(), { error: "unauthenticated" });

  const { cookie } = await login(server);
  const authenticated = await fetch(`${server.baseUrl}/api/me`, { headers: { cookie } });
  assert.equal(authenticated.status, 200);
  assert.deepEqual(await authenticated.json(), {
    user: { id: "user_123", email: "mads@example.com" },
    session: { expiresAt: new Date(server.store.snapshot()[0].expiresAt).toISOString() },
  });
});

test("JWT verification accepts a valid Supabase token and rejects unsafe variants", async () => {
  const fixture = await createJwtFixture();
  const verifier = new SupabaseJwtVerifier({
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["RS256"],
    getKey: fixture.getKey,
  });

  assert.equal((await verifier.verify(await fixture.signJwt())).subject, "user_123");

  for (const [label, token] of [
    ["wrong issuer", await fixture.signJwt({ issuer: "https://evil.example" })],
    ["wrong audience", await fixture.signJwt({ audience: "anon" })],
    ["expired", await fixture.signJwt({ expiresInSeconds: -10 })],
    ["unknown key", await fixture.signJwt({ kid: "unknown-key" })],
    ["malformed", "not-a-jwt"],
  ]) {
    await assert.rejects(() => verifier.verify(token), /jwt_verification_failed/u, label);
  }

  const { privateKey: ecPrivateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const es256Token = await fixture.signJwt({ algorithm: "ES256", kid: "maelk-test-key", key: ecPrivateKey });
  await assert.rejects(() => verifier.verify(es256Token), /jwt_verification_failed/u, "disallowed algorithm");

  await assert.rejects(() => verifier.verify("eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyXzEyMyJ9."), /jwt_verification_failed/u);
});
