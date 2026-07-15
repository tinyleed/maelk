import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import express, { type Express, type NextFunction, type Request, type Response } from "express";

export type CreateAppOptions = {
  clientBuildPath?: string;
};

const moduleDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(moduleDir, "../../..");
const defaultClientBuildPath = join(repoRoot, "apps/app/build/client");

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  const clientBuildPath = options.clientBuildPath ?? defaultClientBuildPath;
  const spaIndexPath = join(clientBuildPath, "index.html");

  app.disable("x-powered-by");

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

  app.use("/api", (request: Request, response: Response) => {
    response.status(404).json({
      error: "not_found",
      path: request.originalUrl,
    });
  });

  app.use(express.static(clientBuildPath, { index: false }));

  app.get(/.*/, async (_request: Request, response: Response, next: NextFunction) => {
    if (!existsSync(spaIndexPath)) {
      response.status(503).json({
        error: "client_build_missing",
        path: spaIndexPath,
      });
      return;
    }

    try {
      const html = await readFile(spaIndexPath, "utf8");
      response.type("html").send(html);
    } catch (error) {
      next(error);
    }
  });

  return app;
}
