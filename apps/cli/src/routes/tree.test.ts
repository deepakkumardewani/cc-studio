import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { createApp } from "../server.js";

let fixtureRoot = "";
let previousRoot: string | undefined;

beforeEach(async () => {
  previousRoot = process.env.CLAUDE_ROOT;
  fixtureRoot = await mkdtemp(join(tmpdir(), "claude-api-fixture-"));
  process.env.CLAUDE_ROOT = fixtureRoot;

  await mkdir(join(fixtureRoot, "skills"), { recursive: true });
  await writeFile(join(fixtureRoot, "skills", "alpha.md"), "# Alpha");
  await writeFile(join(fixtureRoot, "CLAUDE.md"), "# Claude");
});

afterEach(async () => {
  process.env.CLAUDE_ROOT = previousRoot;
  await rm(fixtureRoot, { recursive: true, force: true });
});

describe("/api/tree", () => {
  test("returns all five categories", async () => {
    const app = createApp();
    const response = await app.request("/api/tree");
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      categories: Array<{ category: string; label: string; files: Array<{ name: string }> }>;
    };

    expect(body.categories).toHaveLength(5);
    expect(body.categories.map((entry) => entry.category)).toEqual([
      "skills",
      "plans",
      "commands",
      "claudeMd",
      "settings",
    ]);

    const skills = body.categories.find((entry) => entry.category === "skills");
    expect(skills?.files).toEqual([{ name: "alpha.md" }]);
  });
});

describe("/api/file", () => {
  test("returns markdown content for a valid file", async () => {
    const app = createApp();
    const response = await app.request("/api/file?category=skills&name=alpha.md");
    expect(response.status).toBe(200);

    const body = (await response.json()) as { content: string; category: string; name: string };
    expect(body.content).toBe("# Alpha");
    expect(body.category).toBe("skills");
    expect(body.name).toBe("alpha.md");
  });

  test("returns claudeMd without a name", async () => {
    const app = createApp();
    const response = await app.request("/api/file?category=claudeMd&name=");
    expect(response.status).toBe(200);
    const body = (await response.json()) as { content: string };
    expect(body.content).toBe("# Claude");
  });

  test("returns 400 for invalid category", async () => {
    const app = createApp();
    const response = await app.request("/api/file?category=cache&name=secret.db");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid category" });
  });

  test("returns 403 for traversal attempts", async () => {
    const app = createApp();
    const response = await app.request("/api/file?category=skills&name=..%2F..%2Fetc%2Fpasswd");
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "forbidden path" });
  });

  test("returns 404 for missing files", async () => {
    const app = createApp();
    const response = await app.request("/api/file?category=skills&name=missing.md");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "file not found" });
  });
});
