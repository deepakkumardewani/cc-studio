import { describe, expect, test } from "vite-plus/test";
import { createApp } from "../server.js";

describe("/api/context", () => {
  test("returns graceful error when claude CLI not in PATH", async () => {
    const originalPath = process.env.PATH;
    process.env.PATH = "";

    try {
      const app = createApp();
      const response = await app.request("/api/context");
      expect(response.status).toBe(200);

      const body = (await response.json()) as { success: boolean; error?: string };
      expect(body.success).toBe(false);
      expect(typeof body.error).toBe("string");
      expect(body.error!.length).toBeGreaterThan(0);
    } finally {
      process.env.PATH = originalPath;
    }
  }, 10_000);
});
