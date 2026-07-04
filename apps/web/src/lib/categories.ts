import type { ApiCategory } from "./api";

export type CategoryMeta = {
  colorToken: string;
  label: string;
};

const FALLBACK: CategoryMeta = { colorToken: "text-text-muted", label: "Unknown" };

const CATEGORY_MAP: Record<ApiCategory, CategoryMeta> = {
  skills: { colorToken: "bg-cat-skills", label: "Skills" },
  plans: { colorToken: "bg-cat-plans", label: "Plans" },
  commands: { colorToken: "bg-cat-commands", label: "Commands" },
  claudeMd: { colorToken: "bg-cat-claudemd", label: "CLAUDE.md" },
  settings: { colorToken: "bg-cat-settings", label: "Settings" },
  agents: { colorToken: "bg-cat-agents", label: "Agents" },
  plugins: { colorToken: "bg-cat-plugins", label: "Plugins" },
};

export function getCategoryMeta(category: string): CategoryMeta {
  return (CATEGORY_MAP as Record<string, CategoryMeta>)[category] ?? FALLBACK;
}
