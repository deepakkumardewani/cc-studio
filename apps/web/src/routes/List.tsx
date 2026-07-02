import { useEffect, useMemo, useState } from "react";
import { fetchTree, type TreeCategory } from "../lib/api";

export function List() {
  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchTree()
      .then((tree) => {
        if (!cancelled) {
          setCategories(tree.categories);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load overview.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalFiles = useMemo(
    () => categories.reduce((sum, category) => sum + category.files.length, 0),
    [categories],
  );

  if (loading) {
    return <p className="text-text-muted">Loading overview…</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome</h2>
        <p className="mt-2 max-w-2xl text-text-muted">
          Browse and edit the five author-owned config surfaces in your local Claude directory. Use
          the sidebar to open skills, plans, commands, CLAUDE.md, and settings.
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
        <p className="text-sm font-medium text-text-muted">Total files</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">{totalFiles}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.category}
            className="rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-sm"
          >
            <h3 className="font-medium">{category.label}</h3>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-accent">
              {category.files.length}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {category.files.length === 1 ? "file" : "files"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
