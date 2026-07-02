import { serve } from "@hono/node-server";
import { createApp } from "./server.js";

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, (info) => {
  console.log(`cli listening on http://127.0.0.1:${info.port}`);
});
