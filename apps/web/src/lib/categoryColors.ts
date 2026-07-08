/**
 * Maps context categories to their brand colors.
 * Used for StackedUsageBar and CategorySummaryTable visualizations.
 *
 * Keys are normalized (lowercased, qualifiers like "(deferred)" stripped) since the
 * CLI labels the same category differently across sections, e.g. "MCP tools (deferred)".
 */
const CATEGORY_COLOR_MAP: Record<string, string> = {
  "system prompt": "var(--cat-claudemd)",
  "mcp tools": "var(--cat-plugins)",
  "system tools": "var(--cat-settings)",
  "custom agents": "var(--cat-agents)",
  agents: "var(--cat-agents)",
  "memory files": "var(--cat-commands)",
  memory: "var(--cat-commands)",
  skills: "var(--cat-plans)",
  tools: "var(--cat-plugins)",
  messages: "var(--cat-skills)",
  "free space": "#6a6a6a",
  "autocompact buffer": "var(--danger)",
  input: "var(--cat-plans)",
  output: "var(--cat-plugins)",
  history: "var(--cat-commands)",
};

function normalizeCategoryName(categoryName: string): string {
  return categoryName
    .replace(/\(.*?\)/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Get the color for a category name.
 * Falls back to accent color if category is not recognized.
 */
export function getCategoryColor(categoryName: string): string {
  return CATEGORY_COLOR_MAP[normalizeCategoryName(categoryName)] ?? "var(--accent)";
}
