function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightText({ text, query }: { text: string; query?: string }) {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-accent/20 px-0.5 text-text not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}
