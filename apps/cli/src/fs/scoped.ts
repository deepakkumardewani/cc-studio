import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve, sep } from "node:path";

export const CATEGORY_IDS = ["skills", "plans", "commands", "claudeMd", "settings"] as const;

export type Category = (typeof CATEGORY_IDS)[number];

export type CategoryMeta = {
  id: Category;
  label: string;
  routeSegment: string;
};

export const CATEGORY_META: CategoryMeta[] = [
  { id: "skills", label: "Skills", routeSegment: "skills" },
  { id: "plans", label: "Plans", routeSegment: "plans" },
  { id: "commands", label: "Commands", routeSegment: "commands" },
  { id: "claudeMd", label: "CLAUDE.md", routeSegment: "claude-md" },
  { id: "settings", label: "Settings", routeSegment: "settings" },
];

function getRoot(): string {
  return resolve(process.env.CLAUDE_ROOT ?? join(homedir(), ".claude"));
}

function getCategories(root: string): Record<Category, string> {
  return {
    skills: resolve(root, "skills"),
    plans: resolve(root, "plans"),
    commands: resolve(root, "commands"),
    claudeMd: resolve(root, "CLAUDE.md"),
    settings: resolve(root, "settings.json"),
  };
}

export function isCategory(value: string): value is Category {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

/** Resolve a request to an absolute path, or throw if it escapes ~/.claude. */
export function safePath(category: Category, relative = ""): string {
  const root = getRoot();
  const categories = getCategories(root);
  const base = categories[category];

  const target = resolve(base, relative);
  const rootWithSep = root + sep;

  if (target !== root && !target.startsWith(rootWithSep)) {
    throw new Error("path escapes claude root");
  }

  const isFileCategory = category === "claudeMd" || category === "settings";
  if (isFileCategory) {
    if (relative !== "" && target !== base) {
      throw new Error("path escapes category root");
    }
    return base;
  }

  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error("path escapes category root");
  }

  return target;
}

async function walkMarkdownFiles(dir: string, prefix = ""): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const relativePath = prefix ? join(prefix, entry) : entry;
    const absolutePath = join(dir, entry);
    const entryStat = await stat(absolutePath);
    if (entryStat.isDirectory()) {
      files.push(...(await walkMarkdownFiles(absolutePath, relativePath)));
      continue;
    }
    if (entry.endsWith(".md") || entry.endsWith(".json")) {
      files.push(relativePath);
    }
  }
  return files.sort();
}

export async function listCategory(category: Category): Promise<string[]> {
  if (category === "claudeMd") {
    try {
      await stat(safePath(category));
      return ["CLAUDE.md"];
    } catch {
      return [];
    }
  }

  if (category === "settings") {
    try {
      await stat(safePath(category));
      return ["settings.json"];
    } catch {
      return [];
    }
  }

  return walkMarkdownFiles(safePath(category));
}

export async function readFileText(category: Category, relative: string): Promise<string> {
  const path = safePath(category, relative);
  return readFile(path, "utf8");
}

export async function listAllCategories(): Promise<
  Array<{ category: Category; label: string; files: string[] }>
> {
  const results = await Promise.all(
    CATEGORY_META.map(async ({ id, label }) => ({
      category: id,
      label,
      files: await listCategory(id),
    })),
  );
  return results;
}
