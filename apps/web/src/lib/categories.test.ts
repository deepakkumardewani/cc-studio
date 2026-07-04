import { expect, test } from "vite-plus/test";
import { getCategoryMeta } from "./categories";

test("skills returns lavender token", () => {
  expect(getCategoryMeta("skills").colorToken).toBe("bg-cat-skills");
});

test("plans returns peach token", () => {
  expect(getCategoryMeta("plans").colorToken).toBe("bg-cat-plans");
});

test("commands returns pink token", () => {
  expect(getCategoryMeta("commands").colorToken).toBe("bg-cat-commands");
});

test("claudeMd returns ochre token", () => {
  expect(getCategoryMeta("claudeMd").colorToken).toBe("bg-cat-claudemd");
});

test("settings returns teal token", () => {
  expect(getCategoryMeta("settings").colorToken).toBe("bg-cat-settings");
});

test("agents returns blue token", () => {
  expect(getCategoryMeta("agents").colorToken).toBe("bg-cat-agents");
});

test("plugins returns green token", () => {
  expect(getCategoryMeta("plugins").colorToken).toBe("bg-cat-plugins");
});

test("unknown category returns fallback", () => {
  const meta = getCategoryMeta("nonexistent");
  expect(meta.colorToken).toBe("text-text-muted");
  expect(meta.label).toBe("Unknown");
});
