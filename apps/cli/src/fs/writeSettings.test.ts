import { copyFile, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { safePath } from "./scoped.js";
import { writeSettings } from "./writeSettings.js";

let fixtureRoot = "";
let previousRoot: string | undefined;

beforeEach(async () => {
  previousRoot = process.env.CLAUDE_ROOT;
  fixtureRoot = await mkdtemp(join(tmpdir(), "claude-write-settings-"));
  process.env.CLAUDE_ROOT = fixtureRoot;
});

afterEach(async () => {
  process.env.CLAUDE_ROOT = previousRoot;
  await rm(fixtureRoot, { recursive: true, force: true });
});

function settingsPath() {
  return join(fixtureRoot, "settings.json");
}

function backupPath() {
  return `${settingsPath()}.bak`;
}

describe("writeSettings", () => {
  test("rejects invalid settings before any disk change", async () => {
    await writeFile(settingsPath(), JSON.stringify({ model: "opus" }, null, 2));

    const result = await writeSettings({ effortLevel: "turbo" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
    }

    const current = await readFile(settingsPath(), "utf8");
    expect(JSON.parse(current)).toEqual({ model: "opus" });
    await expect(stat(backupPath())).rejects.toThrow();
  });

  test("creates backup then updates settings atomically on valid write", async () => {
    const initial = { model: "opus", alwaysThinkingEnabled: true };
    await writeFile(settingsPath(), JSON.stringify(initial, null, 2));

    const next = { model: "sonnet", effortLevel: "high", alwaysThinkingEnabled: false };
    const result = await writeSettings(next);
    expect(result.success).toBe(true);

    const backup = JSON.parse(await readFile(backupPath(), "utf8")) as typeof initial;
    expect(backup).toEqual(initial);

    const updated = JSON.parse(await readFile(settingsPath(), "utf8")) as typeof next;
    expect(updated).toEqual(next);
  });

  test("writes valid settings when file is missing", async () => {
    const result = await writeSettings({ model: "haiku" });
    expect(result.success).toBe(true);

    const updated = JSON.parse(await readFile(settingsPath(), "utf8")) as { model: string };
    expect(updated.model).toBe("haiku");
    await expect(stat(backupPath())).rejects.toThrow();
  });

  test("refreshes backup on subsequent writes", async () => {
    await writeFile(settingsPath(), JSON.stringify({ model: "opus" }, null, 2));
    await writeSettings({ model: "sonnet" });
    await writeSettings({ model: "haiku" });

    const backup = JSON.parse(await readFile(backupPath(), "utf8")) as { model: string };
    expect(backup.model).toBe("sonnet");
  });

  test("only writes through the settings safePath target", () => {
    expect(safePath("settings")).toBe(settingsPath());
    expect(() => safePath("settings", "../skills/evil.md")).toThrow(/path escapes/);
  });

  test("never leaves a temp file after successful write", async () => {
    await writeSettings({ model: "opus" });
    const tempPath = `${settingsPath()}.tmp.${process.pid}`;
    await expect(stat(tempPath)).rejects.toThrow();
  });

  test("preserves valid file when write fails validation", async () => {
    const valid = { model: "opus", effortLevel: "low" };
    await writeFile(settingsPath(), JSON.stringify(valid, null, 2));
    await copyFile(settingsPath(), backupPath());

    const result = await writeSettings({ effortLevel: "invalid-level" });
    expect(result.success).toBe(false);

    const current = JSON.parse(await readFile(settingsPath(), "utf8")) as typeof valid;
    expect(current).toEqual(valid);

    const backup = JSON.parse(await readFile(backupPath(), "utf8")) as typeof valid;
    expect(backup).toEqual(valid);
  });
});
