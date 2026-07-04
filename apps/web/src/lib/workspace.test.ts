import { expect, test } from "vite-plus/test";
import { deriveFileLabel, deriveTitleFromFilename } from "./workspace";

test("deriveFileLabel strips SKILL.md suffix", () => {
  expect(deriveFileLabel("colorize/SKILL.md")).toBe("colorize");
});

test("deriveFileLabel strips .md extension", () => {
  expect(deriveFileLabel("build-phases.md")).toBe("build-phases");
});

test("deriveFileLabel strips .json extension", () => {
  expect(deriveFileLabel("settings.json")).toBe("settings");
});

test("deriveFileLabel uses basename for nested paths", () => {
  expect(deriveFileLabel("some/nested/file.md")).toBe("file");
});

test("deriveTitleFromFilename title-cases dash-separated words", () => {
  expect(deriveTitleFromFilename("build-phases.md")).toBe("Build Phases");
});

test("deriveTitleFromFilename title-cases underscore-separated words", () => {
  expect(deriveTitleFromFilename("my_agent.md")).toBe("My Agent");
});

test("deriveTitleFromFilename handles single word", () => {
  expect(deriveTitleFromFilename("colorize.md")).toBe("Colorize");
});

test("deriveTitleFromFilename handles skill path SKILL.md", () => {
  expect(deriveTitleFromFilename("colorize/SKILL.md")).toBe("Colorize");
});

test("deriveTitleFromFilename handles nested agent path", () => {
  expect(deriveTitleFromFilename("agents/my-custom-agent.md")).toBe("My Custom Agent");
});
