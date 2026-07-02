import { Hono } from "hono";
import { getFileResponse } from "./routes/file.js";
import {
  getSettingsResponse,
  getSettingsSchemaResponse,
  putSettingsResponse,
} from "./routes/settings.js";
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

  app.get("/api/settings/schema", (c) => {
    const result = getSettingsSchemaResponse();
    return c.json(result.body, result.status);
  });

  app.get("/api/settings", async (c) => {
    const result = await getSettingsResponse();
    return c.json(result.body, result.status);
  });

  app.put("/api/settings", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "invalid JSON body" }, 400);
    }
    const result = await putSettingsResponse(body);
    return c.json(result.body, result.status);
  });

  app.onError((_error, c) => c.json({ error: "internal server error" }, 500));

  return app;
}
