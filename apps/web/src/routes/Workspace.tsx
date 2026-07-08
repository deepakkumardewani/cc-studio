import { useCallback, useEffect, useState } from "react";
import { ContextSummary } from "../components/ContextSummary";
import { ContextDetailsModal } from "../components/ContextDetailsModal";
import { FetchDetailsButton } from "../components/FetchDetailsButton";
import { fetchContextDetails, type ContextDetails } from "../api/context";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
      <div className="h-4 w-40 animate-pulse rounded bg-border-subtle" />
      <div className="h-2 flex-1 animate-pulse rounded-full bg-border-subtle" />
      <div className="h-4 w-20 animate-pulse rounded bg-border-subtle" />
      <div className="h-4 w-12 animate-pulse rounded bg-border-subtle" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading context breakdown" className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <div className="h-10 w-32 animate-pulse rounded bg-border-subtle" />
        <div className="h-4 w-40 animate-pulse rounded bg-border-subtle" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

export function Workspace() {
  const [data, setData] = useState<ContextDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    fetchContextDetails()
      .then((res) => {
        if (res.success) {
          setData(res.data);
          setError(null);
        } else {
          setData(null);
          setError(res.error);
        }
      })
      .catch((err) => {
        setData(null);
        setError(err instanceof Error ? err.message : "Unable to reach the server.");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text">Workspace</h2>
        <p className="font-mono text-sm text-text-muted">context inspector</p>
      </div>

      <ContextDetailsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {loading ? (
        <LoadingSkeleton />
      ) : error || !data ? (
        <div
          role="alert"
          className="rounded-lg border border-border-subtle bg-surface-raised px-5 py-4 text-sm text-text-muted"
        >
          <p className="font-medium text-text">Unable to fetch context.</p>
          <p className="mt-1">
            {error ?? "Unknown error."}
            {(!error || error.includes("CLI") || error.includes("claude")) && (
              <span>
                {" "}
                Make sure the{" "}
                <code className="rounded bg-surface-soft px-1 font-mono text-xs">claude</code> CLI
                is installed and in your PATH.
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => load(false)}
            className="mt-3 rounded px-3 py-1.5 text-xs font-medium text-text-muted transition hover:bg-surface-soft hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <ContextSummary
            breakdown={data.categories}
            total={data.total_tokens}
            maxTokens={data.max_tokens}
            percentage={data.percentage}
            model={data.model}
            isEstimated={data.is_estimated}
            onRefresh={() => load(true)}
            refreshing={refreshing}
          />
          <FetchDetailsButton onClick={() => setModalOpen(true)} />
        </>
      )}
    </section>
  );
}
