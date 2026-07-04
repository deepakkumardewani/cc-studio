import { useCallback, useEffect, useState } from "react";
import { ContextBreakdown } from "../components/ContextBreakdown";
import { fetchContext, type ContextResponse } from "../lib/api";

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
  const [data, setData] = useState<ContextResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    fetchContext()
      .then((res) => setData(res))
      .catch(() => setData({ success: false, error: "Unable to reach the server." }))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return (
    <section className="flex flex-col gap-6 py-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text">Workspace</h2>
        <p className="font-mono text-sm text-text-muted">context inspector</p>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : !data || !data.success ? (
        <div
          role="alert"
          className="rounded-lg border border-border-subtle bg-surface-raised px-5 py-4 text-sm text-text-muted"
        >
          <p className="font-medium text-text">Unable to fetch context.</p>
          <p className="mt-1">
            {data?.error ?? "Unknown error."}
            {(!data || data.error?.includes("CLI") || data.error?.includes("claude")) && (
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
        <ContextBreakdown
          breakdown={data.breakdown}
          total={data.total}
          onRefresh={() => load(true)}
          refreshing={refreshing}
        />
      )}
    </section>
  );
}
