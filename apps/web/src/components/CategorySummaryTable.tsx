import { useState } from "react";
import type { ContextItem } from "../api/context";

export type CategorySummaryTableCategory = {
  name: string;
  tokens: number;
  percentage: number;
  color: string;
  items?: ContextItem[];
};

type Props = {
  categories: CategorySummaryTableCategory[];
};

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-3.5 shrink-0 text-text-muted transition-transform duration-200 ${
        expanded ? "rotate-90" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

function RowContent({
  category,
  itemCount,
}: {
  category: CategorySummaryTableCategory;
  itemCount?: number;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: category.color }}
      />
      <span className="flex min-w-0 flex-1 items-baseline gap-2 text-left text-sm font-medium text-text">
        <span className="truncate">{category.name}</span>
        {itemCount !== undefined && itemCount > 0 ? (
          <span className="shrink-0 font-sans text-xs font-normal tabular-nums text-text-muted">
            {itemCount}
          </span>
        ) : null}
      </span>
      <span className="w-14 shrink-0 text-right text-sm text-text-muted">
        {category.percentage.toFixed(1)}%
      </span>
      <span className="w-24 shrink-0 text-right font-mono text-sm tabular-nums text-text">
        {category.tokens.toLocaleString()}
      </span>
    </>
  );
}

/** Caps expanded item lists so long categories (e.g. Skills) scroll in-place. */
const ITEM_LIST_MAX_HEIGHT_CLASS = "max-h-56";

function ItemList({ category }: { category: CategorySummaryTableCategory }) {
  const items = [...(category.items ?? [])].sort((a, b) => (b.tokens ?? 0) - (a.tokens ?? 0));
  const showScrollFade = items.length > 8;

  return (
    <div className="relative mb-1 ml-[1.35rem]">
      <div
        className={`border-l border-border-subtle ${ITEM_LIST_MAX_HEIGHT_CLASS} overflow-y-auto overscroll-contain`}
      >
        <ul aria-label={`${category.name} items`} className="flex flex-col py-1.5 pl-3 pr-3">
          {items.map((item, index) => {
            const share =
              item.tokens !== undefined && category.tokens > 0
                ? (item.tokens / category.tokens) * 100
                : null;

            return (
              <li
                key={`${item.name}-${index}`}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-surface-soft"
              >
                <span className="min-w-0 flex-1 truncate text-text" title={item.name}>
                  {item.name}
                </span>
                <span className="w-14 shrink-0 text-right tabular-nums text-text-muted">
                  {share === null ? "—" : share < 0.1 ? "<0.1%" : `${share.toFixed(1)}%`}
                </span>
                <span className="w-24 shrink-0 text-right font-mono tabular-nums text-text">
                  {item.tokens !== undefined ? item.tokens.toLocaleString() : "—"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {showScrollFade ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-surface to-transparent"
        />
      ) : null}
    </div>
  );
}

function CategoryRow({ category }: { category: CategorySummaryTableCategory }) {
  const [expanded, setExpanded] = useState(false);
  const itemCount = category.items?.length ?? 0;
  const expandable = itemCount > 0;

  if (!expandable) {
    return (
      <div role="row" className="flex items-center gap-3 rounded-lg px-3 py-2.5">
        <span aria-hidden="true" className="w-3.5 shrink-0" />
        <RowContent category={category} />
      </div>
    );
  }

  return (
    <div role="row" className={expanded ? "rounded-lg ring-1 ring-border-subtle" : undefined}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronIcon expanded={expanded} />
        <RowContent category={category} itemCount={itemCount} />
      </button>
      {expanded ? <ItemList category={category} /> : null}
    </div>
  );
}

export function CategorySummaryTable({ categories }: Props) {
  return (
    <div role="table" aria-label="Context category breakdown" className="flex flex-col gap-1">
      <div
        role="row"
        className="flex items-center gap-3 px-3 pb-1 text-xs font-medium uppercase tracking-wider text-text-muted"
      >
        <span aria-hidden="true" className="w-3.5 shrink-0" />
        <span role="columnheader" className="flex-1 text-left">
          Category
        </span>
        <span role="columnheader" className="w-14 shrink-0 text-right">
          %
        </span>
        <span role="columnheader" className="w-24 shrink-0 text-right">
          Tokens
        </span>
      </div>

      {categories.map((category) => (
        <CategoryRow key={category.name} category={category} />
      ))}
    </div>
  );
}
