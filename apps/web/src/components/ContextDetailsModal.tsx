import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { fetchContextDetails, type ContextDetails } from "../api/context";
import { StackedUsageBar } from "./StackedUsageBar";
import { CategorySummaryTable } from "./CategorySummaryTable";
import { CategorySection } from "./CategorySection";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorState } from "./ErrorState";
import { getCategoryColor } from "../lib/categoryColors";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ContextDetailsModal({ isOpen, onClose }: Props) {
  const [data, setData] = useState<ContextDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchDetails = () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    fetchContextDetails()
      .then((response) => {
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to fetch context details");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    handleFetchDetails();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const refreshButton = (
    <button
      type="button"
      aria-label="Refresh context details"
      onClick={handleFetchDetails}
      disabled={isLoading}
      className="grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <svg
        aria-hidden="true"
        className={`size-4 ${isLoading ? "animate-spin" : ""}`}
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
  );

  const modalTitle = data ? `Context Details • ${data.model}` : "Context Details";

  return (
    <Modal title={modalTitle} onClose={onClose} headerAction={refreshButton}>
      <div className="flex flex-col overflow-hidden max-h-[calc(80vh-60px)]">
        {isLoading && <LoadingSpinner />}

        {error && !isLoading && <ErrorState message={error} onRetry={handleFetchDetails} />}

        {data && (
          <>
            {/* Header with total tokens */}
            <div className="px-4 py-3 border-b border-border-subtle space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Total Context
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-sm font-semibold text-text">
                    {(data.total_tokens / 1000).toFixed(1)}k / {(data.max_tokens / 1000).toFixed(1)}
                    k tokens ({data.percentage}%)
                  </span>
                  {data.is_estimated && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <svg
                        className="size-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Estimated</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stacked usage bar */}
              <StackedUsageBar
                total={data.total_tokens}
                categories={data.categories.map((cat) => ({
                  name: cat.name,
                  tokens: cat.tokens,
                  color: getCategoryColor(cat.name),
                }))}
                height="h-3"
              />
            </div>

            {/* Summary table */}
            <div className="px-4 py-3 border-b border-border-subtle overflow-x-auto">
              <CategorySummaryTable
                categories={data.categories.map((cat) => ({
                  name: cat.name,
                  tokens: cat.tokens,
                  percentage: cat.percentage,
                  color: getCategoryColor(cat.name),
                }))}
              />
            </div>

            {/* Category sections - scrollable */}
            <div className="overflow-y-auto flex-1">
              {data.categories.map((category) => (
                <CategorySection
                  key={category.name}
                  categoryName={category.name}
                  itemCount={category.items?.length ?? 0}
                  items={category.items ?? []}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
