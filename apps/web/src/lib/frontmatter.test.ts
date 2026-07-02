import { expect, test } from "vite-plus/test";
import { parseFrontmatter } from "./frontmatter";

const skillSample = `---
name: colorize
description: Add strategic color to features that are too monochromatic.
user-invocable: true
argument-hint: "[target]"
---

Strategically introduce color to designs that are too monochromatic.

## MANDATORY PREPARATION

Invoke /frontend-design first.
`;

const claudeMdSample = `# Claude Code

This is the root instructions file.

## Guidelines

Follow the project conventions.
`;

const planSample = `# Plan: Feature X

> Overview of the plan.

## Steps

1. Do thing one
2. Do thing two
`;

test("parseFrontmatter extracts skill frontmatter and returns clean body", () => {
  const result = parseFrontmatter(skillSample);

  expect(result.hasFrontmatter).toBe(true);
  expect(result.data).toEqual({
    name: "colorize",
    description: "Add strategic color to features that are too monochromatic.",
    "user-invocable": "true",
    "argument-hint": '"[target]"',
  });
  expect(result.body).toBe(
    "Strategically introduce color to designs that are too monochromatic.\n\n## MANDATORY PREPARATION\n\nInvoke /frontend-design first.\n",
  );
  expect(result.body).not.toContain("name:");
  expect(result.body).not.toContain("---");
});

test("parseFrontmatter passes through files without frontmatter", () => {
  expect(parseFrontmatter(claudeMdSample)).toEqual({
    data: {},
    body: claudeMdSample,
    hasFrontmatter: false,
  });

  expect(parseFrontmatter(planSample)).toEqual({
    data: {},
    body: planSample,
    hasFrontmatter: false,
  });
});

test("parseFrontmatter passes through settings-like content unchanged", () => {
  const settingsJson = `{
  "theme": "dark",
  "effortLevel": "high"
}`;

  expect(parseFrontmatter(settingsJson)).toEqual({
    data: {},
    body: settingsJson,
    hasFrontmatter: false,
  });
});

test("parseFrontmatter is a no-op when opening fence has no closing fence", () => {
  const incomplete = `---
name: broken
description: Missing closing fence

# Still markdown
`;

  expect(parseFrontmatter(incomplete)).toEqual({
    data: {},
    body: incomplete,
    hasFrontmatter: false,
  });
});
