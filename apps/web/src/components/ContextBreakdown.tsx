import type { ContextEntry } from "../lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  "System Prompt": "var(--cat-claudemd)",
  Tools: "var(--cat-skills)",
  Memory: "var(--cat-agents)",
  History: "var(--cat-commands)",
  Input: "var(--cat-plans)",
  Output: "var(--cat-plugins)",
};

function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? "var(--accent)";
}

function formatTokens(n: number): string {
  return n.toLocaleString();
}

type Props = {
  breakdown: ContextEntry[];
  total: number;
  onRefresh: () => void;
  refreshing: boolean;
};

export function ContextBreakdown({ breakdown, total, onRefresh, refreshing }: Props) {
  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Total */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl font-bold tracking-tight text-text tabular-nums">
          {formatTokens(total)}
        </span>
        <span className="text-sm text-text-muted">tokens in context</span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh context breakdown"
          className="ml-auto rounded px-3 py-1.5 text-xs font-medium text-text-muted transition hover:bg-surface-soft hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Breakdown table */}
      <div role="table" aria-label="Context token breakdown" className="flex flex-col gap-2">
        <div
          role="row"
          className="flex items-center gap-3 pb-1 text-xs font-medium uppercase tracking-wider text-text-muted"
        >
          <span role="columnheader" className="w-40 shrink-0">
            Category
          </span>
          <span role="columnheader" className="flex-1">
            Usage
          </span>
          <span role="columnheader" className="w-20 text-right tabular-nums">
            Tokens
          </span>
          <span role="columnheader" className="w-12 text-right tabular-nums">
            %
          </span>
        </div>

        {breakdown.map((entry) => {
          const color = categoryColor(entry.category);
          const pct = Math.min(entry.percentage, 100);
          return (
            <div
              key={entry.category}
              role="row"
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-soft focus-within:bg-surface-soft"
            >
              <span
                role="rowheader"
                className="w-40 shrink-0 truncate text-sm font-medium text-text"
              >
                {entry.category}
              </span>
              <div
                role="cell"
                className="relative flex-1"
                aria-label={`${pct.toFixed(1)}% of context`}
              >
                <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
              <span
                role="cell"
                className="w-20 text-right font-mono text-sm tabular-nums text-text"
              >
                {formatTokens(entry.tokens)}
              </span>
              <span
                role="cell"
                className="w-12 text-right font-mono text-xs tabular-nums text-text-muted"
              >
                {entry.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
