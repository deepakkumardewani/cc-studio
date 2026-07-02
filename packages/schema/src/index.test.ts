import { describe, expect, test } from "vite-plus/test";
import {
  DEFAULT_SETTINGS,
  SETTINGS_GROUP_ORDER,
  claudeSettingsSchema,
  getSettingsFieldMetadata,
  parseSettings,
  safeParseSettings,
} from "./index.js";

const validMinimal = {
  model: "opus",
  alwaysThinkingEnabled: false,
  effortLevel: "high",
};

const validFull = {
  env: {
    CLAUDE_CODE_NO_FLICKER: "1",
    MAX_THINKING_TOKENS: "10000",
  },
  permissions: {
    allow: ["Bash(bun:*)", "Read(//tmp/**)"],
    defaultMode: "acceptEdits",
    additionalDirectories: ["/tmp"],
  },
  model: "opus",
  hooks: {
    PreToolUse: [
      {
        matcher: "Read",
        hooks: [{ type: "command", command: "~/.claude/hook.sh" }],
      },
    ],
  },
  statusLine: {
    type: "command",
    command: "bun run statusline.ts",
    padding: 0,
  },
  enabledPlugins: {
    "context-mode@context-mode": true,
  },
  extraKnownMarketplaces: {
    "context-mode": {
      source: { source: "github", repo: "mksglu/context-mode" },
    },
  },
  alwaysThinkingEnabled: false,
  effortLevel: "high",
};

describe("claudeSettingsSchema", () => {
  test("accepts known-good minimal config", () => {
    expect(parseSettings(validMinimal)).toEqual(validMinimal);
  });

  test("accepts known-good nested config", () => {
    const parsed = parseSettings(validFull);
    expect(parsed.model).toBe("opus");
    expect(parsed.permissions?.defaultMode).toBe("acceptEdits");
  });

  test("defaults to empty object", () => {
    expect(DEFAULT_SETTINGS).toEqual({});
    expect(parseSettings({})).toEqual({});
  });

  test("rejects wrong types", () => {
    const result = safeParseSettings({ alwaysThinkingEnabled: "yes" });
    expect(result.success).toBe(false);
  });

  test("rejects invalid enum values", () => {
    const result = safeParseSettings({ effortLevel: "turbo" });
    expect(result.success).toBe(false);
  });

  test("round-trips through JSON", () => {
    const parsed = parseSettings(validFull);
    const roundTripped = parseSettings(JSON.parse(JSON.stringify(parsed)));
    expect(roundTripped).toEqual(parsed);
  });

  test("schema metadata lists every top-level key", () => {
    const metadata = getSettingsFieldMetadata();
    const shapeKeys = Object.keys(claudeSettingsSchema.shape).filter((key) => key !== "$schema");
    expect(metadata).toHaveLength(shapeKeys.length);
    expect(metadata.map((field) => field.key).sort()).toEqual(shapeKeys.sort());
  });

  test("every metadata entry has a known group", () => {
    const metadata = getSettingsFieldMetadata();
    const knownGroups = new Set<string>(SETTINGS_GROUP_ORDER);

    for (const field of metadata) {
      expect(field.group).toBeDefined();
      expect(knownGroups.has(field.group)).toBe(true);
    }

    for (const group of SETTINGS_GROUP_ORDER) {
      expect(metadata.some((field) => field.group === group)).toBe(true);
    }
  });
});
