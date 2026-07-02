import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MarkdownView } from "../components/MarkdownView";
import { fetchFile, isRouteSegment, routeToCategory, type ApiCategory } from "../lib/api";

function resolveName(category: ApiCategory, nameParam?: string): string {
  if (category === "claudeMd") {
    return "CLAUDE.md";
  }
  if (category === "settings") {
    return "settings.json";
  }
  if (!nameParam) {
    return "";
  }
  return nameParam.split("/").map(decodeURIComponent).join("/");
}

export function File() {
  const { segment } = useParams<{ segment: string }>();
  const params = useParams<{ "*": string }>();
  const nameParam = params["*"];
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
    return <p className="text-text-muted">Loading file…</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  const isJson = title.endsWith(".json");

  return (
    <article className="mx-auto max-w-[70ch]">
      {isJson ? (
        <pre className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-raised p-5 font-mono text-sm text-text-muted">
          {content}
        </pre>
      ) : (
        <MarkdownView content={content} />
      )}
    </article>
  );
}
