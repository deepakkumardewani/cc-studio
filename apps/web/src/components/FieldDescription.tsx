import { useState, type ReactNode } from "react";
import { HighlightText } from "./HighlightText";

// Descriptions longer than this collapse to two lines until expanded.
const COLLAPSE_THRESHOLD = 220;
const URL_PATTERN = /https?:\/\/[^\s,)]+/g;
// Env-var-like tokens: ALL-CAPS with at least one underscore (e.g. CLAUDE_CODE_DISABLE_AUTO_MEMORY).
const ENV_TOKEN_PATTERN = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g;

type TextPart = { type: "text"; value: string } | { type: "link"; value: string };

function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({ type: "link", value: url });
    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

/** Render a plain-text run, styling env-var tokens as inline code and highlighting search hits. */
function renderText(
  text: string,
  highlightQuery: string | undefined,
  keyPrefix: string,
): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let index = 0;

  for (const match of text.matchAll(ENV_TOKEN_PATTERN)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      nodes.push(
        <HighlightText
          key={`${keyPrefix}-t-${index}`}
          text={text.slice(lastIndex, start)}
          query={highlightQuery}
        />,
      );
    }
    nodes.push(
      <code key={`${keyPrefix}-e-${index}`} className="env-token">
        {token}
      </code>,
    );
    lastIndex = start + token.length;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <HighlightText
        key={`${keyPrefix}-t-${index}`}
        text={text.slice(lastIndex)}
        query={highlightQuery}
      />,
    );
  }

  return nodes;
}

export function FieldDescription({
  text,
  highlightQuery,
}: {
  text: string;
  highlightQuery?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const parts = splitLinks(text);
  // Keep long descriptions out of the way, but never hide an active search match.
  const collapsible = text.length > COLLAPSE_THRESHOLD && !highlightQuery;
  const collapsed = collapsible && !expanded;

  return (
    <div>
      <p className={`text-sm leading-relaxed text-text-muted ${collapsed ? "line-clamp-2" : ""}`}>
        {parts.map((part, partIndex) =>
          part.type === "link" ? (
            <a
              key={`${part.value}-${partIndex}`}
              href={part.value}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
            >
              {part.value}
            </a>
          ) : (
            renderText(part.value, highlightQuery, `p${partIndex}`)
          ),
        )}
      </p>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium text-text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
