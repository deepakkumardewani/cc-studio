import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MarkdownView } from "../components/MarkdownView";
import { fetchFile, isRouteSegment, routeToCategory, type ApiCategory } from "../lib/api";

function resolveName(category: ApiCategory, nameParam?: string): string {
  if (category === "claudeMd") {
    return "CLAUDE.md";
  }
  if (category === "settings") {
    return "settings.json";
  }
  return decodeURIComponent(nameParam ?? "");
}

export function File() {
  const { segment, name: nameParam } = useParams<{ segment: string; name?: string }>();
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!segment || !isRouteSegment(segment)) {
      setError("Unknown config category.");
      setLoading(false);
      return;
    }

    const category = routeToCategory(segment);
    const name = resolveName(category, nameParam);

    if (!name && category !== "claudeMd" && category !== "settings") {
      setError("File name is required.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchFile(category, name)
      .then((file) => {
        if (!cancelled) {
          setContent(file.content);
          setTitle(file.name);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load this file.");
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
  }, [segment, nameParam]);

  if (loading) {
    return <p className="text-stone-600">Loading file…</p>;
  }

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  const isJson = title.endsWith(".json");

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">File</p>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <Link
          to="/"
          className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4"
        >
          Back to list
        </Link>
      </div>

      {isJson ? (
        <pre className="overflow-x-auto rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-800">
          {content}
        </pre>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <MarkdownView content={content} />
        </div>
      )}
    </section>
  );
}
