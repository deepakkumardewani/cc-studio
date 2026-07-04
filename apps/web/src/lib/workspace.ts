import type { ClaudeSettings } from "schema";
import { fileHref, type ApiCategory, type TreeCategory } from "./api";

export const CATEGORY_LABELS: Record<ApiCategory, string> = {
  skills: "Skills",
  plans: "Plans",
  commands: "Commands",
  claudeMd: "CLAUDE.md",
  settings: "Settings",
  agents: "Agents",
  plugins: "Plugins",
};

export type WorkspaceFile = {
  category: ApiCategory;
  categoryLabel: string;
  name: string;
  label: string;
  detail: string;
  href: string;
};

/** Turn a stored path into a human label: "colorize/SKILL.md" -> "colorize". */
export function deriveFileLabel(name: string): string {
  if (name.endsWith("/SKILL.md")) {
    return name.slice(0, -"/SKILL.md".length);
  }
  const base = name.includes("/") ? name.slice(name.lastIndexOf("/") + 1) : name;
  return base.replace(/\.(md|json)$/i, "");
}

/** Convert a filename to a human-readable title: "build-phases.md" -> "Build Phases". */
export function deriveTitleFromFilename(name: string): string {
  const label = deriveFileLabel(name);
  return label
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function flattenFiles(categories: TreeCategory[]): WorkspaceFile[] {
  return categories.flatMap((category) =>
    category.files.map((file) => ({
      category: category.category,
      categoryLabel: category.label,
      name: file.name,
      label: deriveFileLabel(file.name),
      detail: file.name,
      href: fileHref(category.category, file.name),
    })),
  );
}

export function searchFiles(
  files: WorkspaceFile[],
  query: string,
  scope: ApiCategory | null,
): WorkspaceFile[] {
  const normalized = query.trim().toLowerCase();
  const scoped = scope ? files.filter((file) => file.category === scope) : files;
  if (!normalized) {
    return scoped;
  }
  return scoped.filter(
    (file) =>
      file.label.toLowerCase().includes(normalized) ||
      file.detail.toLowerCase().includes(normalized) ||
      file.categoryLabel.toLowerCase().includes(normalized),
  );
}

export type ConfigStat = {
  label: string;
  value: string;
  hint?: string;
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Derive at-a-glance stats from the current settings.json. */
export function summarizeConfig(settings: ClaudeSettings): ConfigStat[] {
  const enabledPlugins = settings.enabledPlugins ?? {};
  const pluginEntries = Object.values(enabledPlugins);
  const enabledCount = pluginEntries.filter((value) => value !== false).length;

  return [
    { label: "Model", value: settings.model ?? "Default" },
    { label: "Effort", value: settings.effortLevel ? titleCase(settings.effortLevel) : "Auto" },
    {
      label: "Permissions",
      value: settings.permissions?.defaultMode
        ? titleCase(settings.permissions.defaultMode)
        : "Default",
    },
    {
      label: "Plugins on",
      value: String(enabledCount),
      hint: pluginEntries.length ? `of ${pluginEntries.length}` : undefined,
    },
  ];
}
