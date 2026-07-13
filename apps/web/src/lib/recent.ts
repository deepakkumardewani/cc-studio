const STORAGE_KEY = "claude-desk-recent";
const MAX_ITEMS = 6;

export type RecentItem = {
  href: string;
  label: string;
  categoryLabel: string;
  viewedAt: number;
};

function isRecentItem(value: unknown): value is RecentItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.href === "string" &&
    typeof item.label === "string" &&
    typeof item.categoryLabel === "string" &&
    typeof item.viewedAt === "number"
  );
}

export function getRecent(): RecentItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecentItem) : [];
  } catch {
    return [];
  }
}

/** Record a viewed file, moving it to the front and de-duplicating by href. */
export function recordRecent(item: Omit<RecentItem, "viewedAt">): void {
  try {
    const next: RecentItem[] = [
      { ...item, viewedAt: Date.now() },
      ...getRecent().filter((existing) => existing.href !== item.href),
    ].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode, quota) — recent list is non-critical.
  }
}
