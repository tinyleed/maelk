import express, { type Express, type NextFunction, type Request, type Response } from "express";

import { createAuthRuntime, type AuthRuntimeOptions } from "./auth/index.js";
import { createAuthRouter } from "./auth/routes.js";

export type CreateApiAppOptions = {
  auth?: AuthRuntimeOptions;
};

export function configureApiApp(app: Express, options: CreateApiAppOptions = {}): void {
  const authRuntime = createAuthRuntime(options.auth);

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
