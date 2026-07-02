import { Hono } from "hono";
import { getFileResponse } from "./routes/file.js";
import { getTreeResponse } from "./routes/tree.js";

export function createApp() {
  const app = new Hono();

  app.get("/api/health", (c) => c.json({ ok: true, service: "cli" }));

  app.get("/api/tree", async (c) => {
    const tree = await getTreeResponse();
    return c.json(tree);
  });

  app.get("/api/file", async (c) => {
    const category = c.req.query("category") ?? "";
    const name = c.req.query("name") ?? "";
    const result = await getFileResponse(category, name);

    if (result.status === 200) {
      return c.json(result.body);
    }
    return c.json(result.body, result.status);
  });

  app.onError((_error, c) => c.json({ error: "internal server error" }, 500));

  return app;
}
