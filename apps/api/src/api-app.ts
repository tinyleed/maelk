import express, { type Express, type NextFunction, type Request, type Response } from "express";

import { createAuthRuntime, type AuthRuntime, type AuthRuntimeOptions } from "./auth/index.js";
import { createAuthRouter, type AuthRuntimeResolver } from "./auth/routes.js";

export type AuthRuntimeRequestFactory = (request: Request) => AuthRuntimeOptions;

export type CreateApiAppOptions = {
  auth?: AuthRuntimeOptions | AuthRuntimeRequestFactory;
};

export function configureApiApp(app: Express, options: CreateApiAppOptions = {}): void {
  const authRuntime = createAuthRuntimeResolver(options.auth);

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_request: Request, response: Response) => {
    response.json({
      ok: true,
      service: "maelk-api",
      stack: {
        api: "express",
        web: "react-router-spa",
      },
    });
  });

  app.use("/api", createAuthRouter(authRuntime));

  app.use("/api", (request: Request, response: Response) => {
    response.status(404).json({
      error: "not_found",
      path: request.originalUrl,
    });
  });
}

function createAuthRuntimeResolver(auth: AuthRuntimeOptions | AuthRuntimeRequestFactory | undefined): AuthRuntime | AuthRuntimeResolver {
  if (typeof auth !== "function") {
    return createAuthRuntime(auth);
  }

  const runtimesByRequest = new WeakMap<Request, AuthRuntime>();
  return (request: Request, response: Response) => {
    const existingRuntime = runtimesByRequest.get(request);
    if (existingRuntime) {
      return existingRuntime;
    }

    const runtime = createAuthRuntime(auth(request));
    runtimesByRequest.set(request, runtime);
    closeRuntimeStoreOnceResponseFinishes(response, runtime);
    return runtime;
  };
}

function closeRuntimeStoreOnceResponseFinishes(response: Response, runtime: AuthRuntime): void {
  let closed = false;
  const close = () => {
    if (closed) {
      return;
    }
    closed = true;
    const closeStore = (runtime.store as { close?: () => Promise<void> | void }).close;
    if (typeof closeStore === "function") {
      void Promise.resolve(closeStore.call(runtime.store)).catch(() => undefined);
    }
  };

  response.once("finish", close);
  response.once("close", close);
}

export function appendJsonErrorHandler(app: Express): void {
  app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    response.status(500).json({
      error: "internal_server_error",
    });
  });
}

export function createApiApp(options: CreateApiAppOptions = {}): Express {
  const app = express();
  configureApiApp(app, options);
  appendJsonErrorHandler(app);
  return app;
}
