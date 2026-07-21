import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import express, { type Express, type NextFunction, type Request, type Response } from "express";

import { appendJsonErrorHandler, configureApiApp, type CreateApiAppOptions } from "./api-app.js";

export type CreateAppOptions = CreateApiAppOptions & {
  clientBuildPath?: string;
};

const moduleDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(moduleDir, "../../..");
const defaultClientBuildPath = join(repoRoot, "apps/app/build/client");
const fileExtensionSegmentPattern = /\.[A-Za-z0-9][A-Za-z0-9-]{0,31}$/u;

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  const clientBuildPath = options.clientBuildPath ?? defaultClientBuildPath;
  const spaIndexPath = join(clientBuildPath, "index.html");

  configureApiApp(app, options);

  app.use(express.static(clientBuildPath, { index: false }));

  app.get(/.*/, async (request: Request, response: Response, next: NextFunction) => {
    if (isMissingStaticAssetRequest(request.path)) {
      response.status(404).json({
        error: "not_found",
        path: request.originalUrl,
      });
      return;
    }

    if (!existsSync(spaIndexPath)) {
      response.status(503).json({
        error: "client_build_missing",
        message: "Client build unavailable. Run npm run build before starting the server.",
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

  appendJsonErrorHandler(app);

  return app;
}

function isMissingStaticAssetRequest(path: string): boolean {
  if (path.startsWith("/assets/")) {
    return true;
  }

  const lastPathSegment = path.split("/").pop() ?? "";
  return fileExtensionSegmentPattern.test(lastPathSegment);
}
