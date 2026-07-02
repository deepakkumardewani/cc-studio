import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getSettingsFieldMetadata } from "schema";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { createApp } from "../server.js";

let fixtureRoot = "";
let previousRoot: string | undefined;

beforeEach(async () => {
  previousRoot = process.env.CLAUDE_ROOT;
  fixtureRoot = await mkdtemp(join(tmpdir(), "claude-settings-fixture-"));
  process.env.CLAUDE_ROOT = fixtureRoot;
});

afterEach(async () => {
  process.env.CLAUDE_ROOT = previousRoot;
  await rm(fixtureRoot, { recursive: true, force: true });
});

describe("/api/settings/schema", () => {
  test("lists every schema field", async () => {
    const app = createApp();
    const response = await app.request("/api/settings/schema");
    expect(response.status).toBe(200);

    const body = (await response.json()) as { fields: Array<{ key: string }> };
    const metadata = getSettingsFieldMetadata();
    expect(body.fields).toHaveLength(metadata.length);
    expect(body.fields.map((field) => field.key).sort()).toEqual(
      metadata.map((field) => field.key).sort(),
    );
  });
});

describe("/api/settings", () => {
  test("returns parsed settings from fixture file", async () => {
    await writeFile(
      join(fixtureRoot, "settings.json"),
      JSON.stringify({ model: "opus", alwaysThinkingEnabled: false, effortLevel: "high" }),
    );

    const app = createApp();
    const response = await app.request("/api/settings");
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      settings: { model: string; effortLevel: string; alwaysThinkingEnabled: boolean };
    };
    expect(body.settings.model).toBe("opus");
    expect(body.settings.effortLevel).toBe("high");
    expect(body.settings.alwaysThinkingEnabled).toBe(false);
  });

  test("returns empty default when settings file is missing", async () => {
    const app = createApp();
    const response = await app.request("/api/settings");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ settings: {} });
  });

  test("returns 422 for invalid settings content", async () => {
    await writeFile(join(fixtureRoot, "settings.json"), JSON.stringify({ effortLevel: "turbo" }));

    const app = createApp();
    const response = await app.request("/api/settings");
    expect(response.status).toBe(422);
    const body = (await response.json()) as { error: string; issues?: unknown[] };
    expect(body.error).toBe("invalid settings.json");
    expect(body.issues?.length).toBeGreaterThan(0);
  });

  test("returns 422 for malformed JSON", async () => {
    await writeFile(join(fixtureRoot, "settings.json"), "{not-json");

    const app = createApp();
    const response = await app.request("/api/settings");
    expect(response.status).toBe(422);
    expect((await response.json()) as { error: string }).toEqual({
      error: "invalid JSON in settings.json",
    });
  });
});
