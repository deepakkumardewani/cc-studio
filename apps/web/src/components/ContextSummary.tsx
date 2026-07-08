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
};

export function ContextSummary({
  breakdown,
  total,
  maxTokens,
  percentage,
  model,
  isEstimated,
  onRefresh,
  refreshing,
}: Props) {
  const stackedCategories = useMemo<StackedUsageBarCategory[]>(() => {
    return breakdown.map((entry) => ({
      name: entry.name,
      tokens: entry.tokens,
      color: getCategoryColor(entry.name),
    }));
  }, [breakdown]);

  const tableCategories = useMemo<CategorySummaryTableCategory[]>(() => {
    return breakdown.map((entry) => ({
      name: entry.name,
      tokens: entry.tokens,
      percentage: entry.percentage,
      color: getCategoryColor(entry.name),
    }));
  }, [breakdown]);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Total tokens, usage info, model, and refresh button */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-4xl font-bold tracking-tight text-text tabular-nums">
            {total.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted">tokens in context</span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh context summary"
            className="ml-auto grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-soft hover:text-text disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        </div>

        {/* Model name and usage percentage */}
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span>{model}</span>
          <span>•</span>
          <span>
            {(total / 1000).toFixed(1)}k / {(maxTokens / 1000).toFixed(1)}k tokens ({percentage}%)
          </span>
          {isEstimated && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                Estimated
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stacked usage bar */}
      <div>
        <StackedUsageBar total={total} categories={stackedCategories} height="h-4" />
      </div>

      {/* Category summary table */}
      <CategorySummaryTable categories={tableCategories} />
    </div>
  );
}
