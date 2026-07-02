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
    return <p className="text-stone-600">Loading config types…</p>;
  }

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Config types</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Browse the five author-owned config surfaces under your local Claude directory.
        </p>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <article
            key={category.category}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-medium">{category.label}</h3>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                {category.files.length} file{category.files.length === 1 ? "" : "s"}
              </span>
            </div>

            {category.files.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">No files found.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {category.files.map((file) => (
                  <li key={file.name}>
                    <Link
                      to={fileHref(category.category, file.name)}
                      className="text-sm font-medium text-stone-800 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-500"
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
