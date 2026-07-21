import { httpServerHandler } from "cloudflare:node";
import { createServer } from "node:http";

import { createApiApp } from "./api-app.js";
import { createWorkerAuthRuntimeOptions, type MaelkWorkerEnv } from "./worker-auth-env.js";

type HttpServerWorkerHandler = Required<Pick<ExportedHandler<MaelkWorkerEnv>, "fetch">>;

const handler = httpServerHandler({ port: 8080 }) as HttpServerWorkerHandler;
let serverStarted = false;

function ensureServerStarted(env: MaelkWorkerEnv): void {
  if (serverStarted) {
    return;
  }

  const server = createServer(createApiApp({ auth: createWorkerAuthRuntimeOptions(env) }));
  server.listen(8080);
  serverStarted = true;
}

export default {
  fetch(request, env, context) {
    ensureServerStarted(env);
    return handler.fetch(request, env, context);
  },
} satisfies ExportedHandler<MaelkWorkerEnv>;
