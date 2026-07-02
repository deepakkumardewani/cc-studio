import { expect, test } from "vite-plus/test";
import { buildTree } from "./tree";
import type { TreeCategory } from "./api";

function category(files: string[]): TreeCategory {
  return {
    category: "skills",
    label: "Skills",
    files: files.map((name) => ({ name })),
  };
}

test("buildTree returns empty array for empty category", () => {
  expect(buildTree(category([]))).toEqual([]);
});

test("buildTree keeps flat files at root", () => {
  const tree = buildTree(category(["alpha.md", "beta.md"]));

  expect(tree).toEqual([
    { kind: "file", name: "alpha.md", href: "/skills/alpha.md" },
    { kind: "file", name: "beta.md", href: "/skills/beta.md" },
  ]);
});

test("buildTree nests slash-delimited paths into folders", () => {
  const tree = buildTree(category(["colorize/SKILL.md", "frontend-design/SKILL.md", "alpha.md"]));

  expect(tree).toEqual([
    {
      kind: "folder",
      name: "colorize",
      children: [{ kind: "file", name: "SKILL.md", href: "/skills/colorize/SKILL.md" }],
    },
    {
      kind: "folder",
      name: "frontend-design",
      children: [{ kind: "file", name: "SKILL.md", href: "/skills/frontend-design/SKILL.md" }],
    },
    { kind: "file", name: "alpha.md", href: "/skills/alpha.md" },
  ]);
});

test("buildTree handles deeply nested paths", () => {
  const tree = buildTree(category(["a/b/c/deep.md", "a/x.md"]));

  expect(tree).toEqual([
    {
      kind: "folder",
      name: "a",
      children: [
        {
          kind: "folder",
          name: "b",
          children: [
            {
              kind: "folder",
              name: "c",
              children: [{ kind: "file", name: "deep.md", href: "/skills/a/b/c/deep.md" }],
            },
          ],
        },
        { kind: "file", name: "x.md", href: "/skills/a/x.md" },
      ],
    },
  ]);
});

test("buildTree preserves href routing for claudeMd category", () => {
  const tree = buildTree({
    category: "claudeMd",
    label: "CLAUDE.md",
    files: [{ name: "CLAUDE.md" }],
  });

  expect(tree).toEqual([{ kind: "file", name: "CLAUDE.md", href: "/claude-md" }]);
});
