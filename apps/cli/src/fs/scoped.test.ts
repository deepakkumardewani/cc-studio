import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { CATEGORY_IDS, listAllCategories, listCategory, readFileText, safePath } from "./scoped.js";

let fixtureRoot = "";
let previousRoot: string | undefined;

beforeEach(async () => {
  previousRoot = process.env.CLAUDE_ROOT;
  fixtureRoot = await mkdtemp(join(tmpdir(), "claude-fixture-"));
  process.env.CLAUDE_ROOT = fixtureRoot;

  await mkdir(join(fixtureRoot, "skills", "demo"), { recursive: true });
  await mkdir(join(fixtureRoot, "plans"), { recursive: true });
  await mkdir(join(fixtureRoot, "commands"), { recursive: true });
  await writeFile(join(fixtureRoot, "skills", "demo", "SKILL.md"), "# Demo Skill");
  await writeFile(join(fixtureRoot, "plans", "plan-a.md"), "# Plan A");
  await writeFile(join(fixtureRoot, "commands", "build.md"), "# Build");
  await writeFile(join(fixtureRoot, "CLAUDE.md"), "# Root Claude");
  await writeFile(join(fixtureRoot, "settings.json"), '{"theme":"dark"}');
  await mkdir(join(fixtureRoot, "cache"), { recursive: true });
  await writeFile(join(fixtureRoot, "cache", "secret.db"), "nope");
});

afterEach(async () => {
  process.env.CLAUDE_ROOT = previousRoot;
  await rm(fixtureRoot, { recursive: true, force: true });
});

describe("safePath", () => {
  test("resolves all five categories within fixture root", () => {
    for (const category of CATEGORY_IDS) {
      const resolved = safePath(category);
      expect(resolved.startsWith(fixtureRoot)).toBe(true);
    }
  });

  test("resolves nested paths for directory categories", () => {
    expect(safePath("skills", "demo/SKILL.md")).toBe(
      join(fixtureRoot, "skills", "demo", "SKILL.md"),
    );
  });

  test("rejects traversal outside category root", () => {
    expect(() => safePath("skills", "../cache/secret.db")).toThrow(
      /path escapes (category root|claude root)/,
    );
    expect(() => safePath("plans", "../../etc/passwd")).toThrow(
      /path escapes (category root|claude root)/,
    );
  });

  test("rejects absolute escape attempts", () => {
    expect(() => safePath("skills", "/etc/passwd")).toThrow();
  });

  test("file categories reject non-empty relative paths", () => {
    expect(() => safePath("claudeMd", "../settings.json")).toThrow("path escapes category root");
    expect(() => safePath("settings", "other.json")).toThrow("path escapes category root");
    expect(safePath("claudeMd")).toBe(join(fixtureRoot, "CLAUDE.md"));
    expect(safePath("settings")).toBe(join(fixtureRoot, "settings.json"));
  });
});

describe("listCategory", () => {
  test("lists markdown files recursively for directory categories", async () => {
    expect(await listCategory("skills")).toEqual(["demo/SKILL.md"]);
    expect(await listCategory("plans")).toEqual(["plan-a.md"]);
    expect(await listCategory("commands")).toEqual(["build.md"]);
  });

  test("lists single entries for file categories when present", async () => {
    expect(await listCategory("claudeMd")).toEqual(["CLAUDE.md"]);
    expect(await listCategory("settings")).toEqual(["settings.json"]);
  });

  test("does not expose cache or db files", async () => {
    const tree = await listAllCategories();
    const allFiles = tree.flatMap((entry) => entry.files).join("\n");
    expect(allFiles).not.toContain("cache");
    expect(allFiles).not.toContain(".db");
  });
});

describe("readFileText", () => {
  test("reads markdown via safePath", async () => {
    const content = await readFileText("skills", "demo/SKILL.md");
    expect(content).toBe("# Demo Skill");
  });

  test("reads claudeMd and settings files", async () => {
    expect(await readFileText("claudeMd", "")).toBe("# Root Claude");
    expect(await readFileText("settings", "")).toContain("theme");
  });
});
