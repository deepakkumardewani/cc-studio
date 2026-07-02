import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTree, fileHref, type TreeCategory } from "../lib/api";

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
          setError("Unable to load config categories.");
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

  if (loading) {
    return <p className="text-text-muted">Loading config types…</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Config types</h2>
        <p className="mt-2 max-w-2xl text-text-muted">
          Browse the five author-owned config surfaces under your local Claude directory.
        </p>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <article
            key={category.category}
            className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-medium">{category.label}</h3>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted">
                {category.files.length} file{category.files.length === 1 ? "" : "s"}
              </span>
            </div>

            {category.files.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">No files found.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {category.files.map((file) => (
                  <li key={file.name}>
                    <Link
                      to={fileHref(category.category, file.name)}
                      className="text-sm font-medium text-text underline decoration-border-subtle underline-offset-4 hover:decoration-accent"
                    >
                      {file.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
