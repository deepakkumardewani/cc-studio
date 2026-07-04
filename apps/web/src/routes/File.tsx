import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MarkdownView } from "../components/MarkdownView";
import { SkillHeader } from "../components/SkillHeader";
import { fetchFile, fileHref, isRouteSegment, routeToCategory, type ApiCategory } from "../lib/api";
import { parseFrontmatter } from "../lib/frontmatter";
import { recordRecent } from "../lib/recent";
import { CATEGORY_LABELS, deriveFileLabel, deriveTitleFromFilename } from "../lib/workspace";

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
          const isFileCategory = category === "claudeMd" || category === "settings";
          recordRecent({
            href: fileHref(category, file.name),
            label: isFileCategory ? CATEGORY_LABELS[category] : deriveFileLabel(file.name),
            categoryLabel: CATEGORY_LABELS[category],
          });
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
  const { data, body, hasFrontmatter } = parseFrontmatter(content);
  const markdownContent = hasFrontmatter ? body : content;

  const category = segment && isRouteSegment(segment) ? routeToCategory(segment) : null;
  const isPlugin = category === "plugins";
  const isCommandOrAgent = category === "commands" || category === "agents";

  const fallbackTitle = isCommandOrAgent ? deriveTitleFromFilename(title) : undefined;
  const showHeader = hasFrontmatter || Boolean(fallbackTitle);
  const pluginBadge = isPlugin ? (
    <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted ring-1 ring-border-subtle">
      View only
    </span>
  ) : null;

  return (
    <article className="mx-auto max-w-[70ch]">
      {showHeader ? (
        <SkillHeader data={data} fallbackTitle={fallbackTitle} badge={pluginBadge} />
      ) : isPlugin ? (
        <div className="mb-4 flex">{pluginBadge}</div>
      ) : null}

      {isJson ? (
        <pre className="overflow-x-auto rounded-lg bg-surface-raised p-5 font-mono text-sm text-text-muted ring-1 ring-border-subtle">
          {content}
        </pre>
      ) : (
        <div className={showHeader ? "mt-6" : undefined}>
          <MarkdownView content={markdownContent} />
        </div>
      )}
    </article>
  );
}
