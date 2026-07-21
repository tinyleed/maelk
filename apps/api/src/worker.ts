import { httpServerHandler } from "cloudflare:node";
import { createServer } from "node:http";

import { createApiApp } from "./api-app.js";

const server = createServer(createApiApp());
server.listen(8080);

export default httpServerHandler({ port: 8080 });
