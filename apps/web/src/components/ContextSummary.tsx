import { useMemo } from "react";
import { StackedUsageBar, type StackedUsageBarCategory } from "./StackedUsageBar";
import { CategorySummaryTable, type CategorySummaryTableCategory } from "./CategorySummaryTable";
import { getCategoryColor } from "../lib/categoryColors";
import type { ContextCategory } from "../api/context";

type Props = {
  breakdown: ContextCategory[];
  total: number;
  maxTokens: number;
  percentage: number;
  model: string;
  isEstimated: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  staleError?: { title: string; body: string } | null;
};

function formatK(tokens: number): string {
  return `${(tokens / 1000).toFixed(1)}k`;
}

export function ContextSummary({
  breakdown,
  total,
  maxTokens,
  percentage,
  model,
  isEstimated,
  onRefresh,
  refreshing,
  staleError = null,
}: Props) {
  const stackedCategories = useMemo<StackedUsageBarCategory[]>(() => {
    return breakdown.map((entry) => ({
      name: entry.name,
      tokens: entry.tokens,
      color: getCategoryColor(entry.name),
    }));
  }, [breakdown]);

  const freeTokens = useMemo(() => {
    return (
      breakdown.find((entry) => entry.name.trim().toLowerCase() === "free space")?.tokens ?? null
    );
  }, [breakdown]);

  const tableCategories = useMemo<CategorySummaryTableCategory[]>(() => {
    return breakdown.map((entry) => ({
      name: entry.name,
      tokens: entry.tokens,
      percentage: entry.percentage,
      color: getCategoryColor(entry.name),
      items: entry.items,
    }));
  }, [breakdown]);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              Workspace
            </h2>
            <p className="font-mono text-sm text-text-muted">context inspector</p>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-4xl font-bold tracking-tight text-text tabular-nums">
                {total.toLocaleString()}
              </span>
              <span className="pb-1 text-sm text-text-muted">tokens in context</span>
            </div>

            <p className="pb-1 text-sm text-text-muted">
              <span className="text-text">{model}</span>
              <span className="mx-2 text-border-subtle" aria-hidden="true">
                ·
              </span>
              <span>
                {formatK(total)} / {formatK(maxTokens)} ({percentage}%)
              </span>
              {freeTokens !== null ? (
                <>
                  <span className="mx-2 text-border-subtle" aria-hidden="true">
                    ·
                  </span>
                  <span>{formatK(freeTokens)} free</span>
                </>
              ) : null}
              {isEstimated ? (
                <>
                  <span className="mx-2 text-border-subtle" aria-hidden="true">
                    ·
                  </span>
                  <span>Estimated</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh context summary"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-soft hover:text-text disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg
            aria-hidden="true"
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {staleError ? (
        <div
          role="status"
          className="rounded-lg border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-muted"
        >
          <span className="font-medium text-text">{staleError.title}.</span> Showing the last
          successful load. {staleError.body}
        </div>
      ) : null}

      <StackedUsageBar total={maxTokens} categories={stackedCategories} height="h-4" />

      <CategorySummaryTable categories={tableCategories} />
    </div>
  );
}
