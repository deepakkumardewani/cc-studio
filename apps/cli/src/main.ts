import { serve } from "@hono/node-server";
import { createApp } from "./server.js";

const app = createApp();

let port = Number(process.env.PORT ?? 3000);
const portIndex = process.argv.indexOf("--port");
if (portIndex !== -1 && process.argv[portIndex + 1]) {
  port = Number(process.argv[portIndex + 1]);
}

serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, (info) => {
  console.log(`cli listening on http://127.0.0.1:${info.port}`);
});
