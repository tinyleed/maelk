import express, { type NextFunction, type Request, type Response } from "express";

import { clearSessionCookie, getAuthenticatedContext, requireOrigin, sendAuthUnavailable, setSessionCookie, type AuthRuntime } from "./runtime.js";

const OTP_START_RESPONSE = {
  ok: true,
  message: "If this invited email can sign in, an email OTP has been sent.",
};

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/u;
const MAX_EMAIL_LENGTH = 254;
const OTP_PATTERN = /^[0-9A-Za-z_-]{6,128}$/u;

declare global {
  namespace Express {
    interface Request {
      auth?: Awaited<ReturnType<typeof getAuthenticatedContext>>;
      authRuntime?: AuthRuntime;
    }
  }
}

export type AuthRuntimeResolver = (request: Request, response: Response) => AuthRuntime;

export function createAuthRouter(runtimeSource: AuthRuntime | AuthRuntimeResolver): express.Router {
  const resolveRuntime = typeof runtimeSource === "function" ? runtimeSource : () => runtimeSource;
  const router = express.Router();

  router.use((request: Request, response: Response, next: NextFunction) => {
    request.authRuntime = resolveRuntime(request, response);
    next();
  });

  router.get("/auth/session", async (request: Request, response: Response, next: NextFunction) => {
    try {
      const runtime = getRequestAuthRuntime(request);
      if (!runtime.config.authConfigured || !runtime.sessionService) {
        sendAuthUnavailable(response, runtime);
        return;
      }

      const context = await getAuthenticatedContext(request, runtime);
      if (!context) {
        response.status(401).json({
          authConfigured: true,
          authenticated: false,
        });
        return;
      }

      response.json({
        authConfigured: true,
        authenticated: true,
        user: context.user,
        csrfToken: context.session.csrfToken,
        expiresAt: new Date(context.session.expiresAt).toISOString(),
        csrfTokenRequired: true,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/otp/start", async (request: Request, response: Response, next: NextFunction) => {
    try {
      const runtime = getRequestAuthRuntime(request);
      if (!runtime.config.authConfigured || !runtime.provider) {
        sendAuthUnavailable(response, runtime);
        return;
      }
      if (!requireOrigin(request, response, runtime)) {
        return;
      }

      const email = parseEmail(request.body?.email);
      if (!email) {
        response.status(400).json({ error: "invalid_email" });
        return;
      }

      try {
        await runtime.provider.startEmailOtp({ email, shouldCreateUser: false });
      } catch {
        // Keep the response generic so account existence and provider details are not disclosed.
      }

      response.status(202).json(OTP_START_RESPONSE);
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/otp/verify", async (request: Request, response: Response, next: NextFunction) => {
    try {
      const runtime = getRequestAuthRuntime(request);
      if (!runtime.config.authConfigured || !runtime.provider || !runtime.jwtVerifier || !runtime.sessionService) {
        sendAuthUnavailable(response, runtime);
        return;
      }
      if (!requireOrigin(request, response, runtime)) {
        return;
      }

      const email = parseEmail(request.body?.email);
      const token = parseOtpToken(request.body?.token);
      if (!email || !token) {
        response.status(400).json({ error: "invalid_otp_request" });
        return;
      }

      let verifiedJwt;
      let refreshToken: string;
      try {
        const bundle = await runtime.provider.verifyEmailOtp({ email, token });
        verifiedJwt = await runtime.jwtVerifier.verify(bundle.accessToken);
        refreshToken = bundle.refreshToken;
      } catch {
        response.status(401).json({ error: "otp_verification_failed" });
        return;
      }

      const session = await runtime.sessionService.create({
        userId: verifiedJwt.subject,
        email: verifiedJwt.email ?? email,
        refreshToken,
        accessTokenExpiresAt: verifiedJwt.expiresAt,
      });
      setSessionCookie(response, runtime, session.cookieValue);
      response.status(200).json({
        authenticated: true,
        user: {
          id: verifiedJwt.subject,
          email: verifiedJwt.email ?? email,
        },
        csrfToken: session.csrfToken,
        expiresAt: new Date(session.session.expiresAt).toISOString(),
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/session/refresh", async (request: Request, response: Response, next: NextFunction) => {
    try {
      const runtime = getRequestAuthRuntime(request);
      if (!runtime.config.authConfigured || !runtime.provider || !runtime.jwtVerifier || !runtime.sessionService) {
        sendAuthUnavailable(response, runtime);
        return;
      }
      if (!requireOrigin(request, response, runtime)) {
        return;
      }

      const cookieSession = await runtime.sessionService.getCookieValueAndSession(request.get("cookie"));
      if (!cookieSession) {
        clearSessionCookie(response, runtime);
        response.status(401).json({ error: "unauthenticated" });
        return;
      }
      if (!runtime.sessionService.assertCsrf(cookieSession.session, request.get(runtime.config.csrfHeaderName))) {
        response.status(403).json({ error: "csrf_mismatch" });
        return;
      }

      try {
        const refreshToken = runtime.sessionService.decryptRefreshToken(cookieSession.session);
        const bundle = await runtime.provider.refreshSession({ refreshToken });
        const verifiedJwt = await runtime.jwtVerifier.verify(bundle.accessToken);
        if (verifiedJwt.subject !== cookieSession.session.userId) {
          throw new Error("session_subject_changed");
        }
        const rotatedSession = await runtime.sessionService.rotate(cookieSession.session, {
          userId: verifiedJwt.subject,
          email: verifiedJwt.email ?? cookieSession.session.email,
          refreshToken: bundle.refreshToken,
          accessTokenExpiresAt: verifiedJwt.expiresAt,
        });
        setSessionCookie(response, runtime, rotatedSession.cookieValue);
        response.json({
          authenticated: true,
          user: {
            id: verifiedJwt.subject,
            email: verifiedJwt.email ?? cookieSession.session.email,
          },
          csrfToken: rotatedSession.csrfToken,
          expiresAt: new Date(rotatedSession.session.expiresAt).toISOString(),
        });
      } catch {
        await runtime.sessionService.destroy(cookieSession.session);
        clearSessionCookie(response, runtime);
        response.status(401).json({ error: "session_refresh_failed" });
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/logout", async (request: Request, response: Response, next: NextFunction) => {
    try {
      const runtime = getRequestAuthRuntime(request);
      if (!runtime.config.authConfigured || !runtime.sessionService) {
        sendAuthUnavailable(response, runtime);
        return;
      }
      if (!requireOrigin(request, response, runtime)) {
        return;
      }

      const session = await runtime.sessionService.getFromCookieHeader(request.get("cookie"));
      if (!session) {
        clearSessionCookie(response, runtime);
        response.status(401).json({ error: "unauthenticated" });
        return;
      }
      if (!runtime.sessionService.assertCsrf(session, request.get(runtime.config.csrfHeaderName))) {
        response.status(403).json({ error: "csrf_mismatch" });
        return;
      }

      await runtime.sessionService.destroy(session);
      clearSessionCookie(response, runtime);
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", requireAuthentication(), (request: Request, response: Response) => {
    response.json({
      user: request.auth?.user,
      session: {
        expiresAt: request.auth ? new Date(request.auth.session.expiresAt).toISOString() : null,
      },
    });
  });

  return router;
}

function getRequestAuthRuntime(request: Request): AuthRuntime {
  if (!request.authRuntime) {
    throw new Error("auth_runtime_unavailable");
  }
  return request.authRuntime;
}

function requireAuthentication() {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const runtime = getRequestAuthRuntime(request);
      if (!runtime.config.authConfigured) {
        sendAuthUnavailable(response, runtime);
        return;
      }

      const context = await getAuthenticatedContext(request, runtime);
      if (!context) {
        response.status(401).json({ error: "unauthenticated" });
        return;
      }

      request.auth = context;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function parseEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const email = value.trim().toLowerCase();
  return email.length > 0 && email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email) ? email : null;
}

function parseOtpToken(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const token = value.trim();
  return OTP_PATTERN.test(token) ? token : null;
}
