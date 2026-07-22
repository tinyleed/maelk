import { httpServerHandler } from "cloudflare:node";
import { createServer } from "node:http";

import { createApiApp } from "./api-app.js";
import {
  WORKER_AUTH_ENV_REQUEST_HEADER,
  bindWorkerAuthEnvToRequest,
  createWorkerAuthRuntimeOptionsForRequestId,
  releaseWorkerAuthEnvForRequest,
  type MaelkWorkerEnv,
} from "./worker-auth-env.js";

type HttpServerWorkerHandler = Required<Pick<ExportedHandler<MaelkWorkerEnv>, "fetch">>;

const handler = httpServerHandler({ port: 8080 }) as HttpServerWorkerHandler;
let serverStarted = false;

function ensureServerStarted(): void {
  if (serverStarted) {
    return;
  }

  const server = createServer(
    createApiApp({
      auth: (request) => createWorkerAuthRuntimeOptionsForRequestId(request.get(WORKER_AUTH_ENV_REQUEST_HEADER)),
    }),
  );
  server.listen(8080);
  serverStarted = true;
}

export default {
  async fetch(request, env, context) {
    ensureServerStarted();
    const workerRequest = bindWorkerAuthEnvToRequest(request, env) as typeof request;
    try {
      return await handler.fetch(workerRequest, env, context);
    } finally {
      releaseWorkerAuthEnvForRequest(workerRequest);
    }
  },
} satisfies ExportedHandler<MaelkWorkerEnv>;
