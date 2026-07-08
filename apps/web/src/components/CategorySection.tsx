import { useState } from "react";

type Item = {
  name: string;
  tokens?: number;
};

type Props = {
  categoryName: string;
  itemCount: number;
  items: Item[];
};

export function CategorySection({ categoryName, itemCount, items }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-border-subtle first:border-t-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`size-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="text-sm font-medium text-text">
            {categoryName} ({itemCount})
          </h3>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-surface-soft/30 px-4 py-3 space-y-2 border-t border-border-subtle/50">
          {items.length === 0 ? (
            <p className="text-xs text-text-muted italic">No items</p>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${categoryName}-${item.name}-${idx}`}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-xs text-text-muted truncate">{item.name}</span>
                {item.tokens !== undefined && (
                  <span className="text-xs text-text font-mono tabular-nums shrink-0">
                    {item.tokens.toLocaleString()}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
