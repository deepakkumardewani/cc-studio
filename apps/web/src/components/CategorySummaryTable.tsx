export type CategorySummaryTableCategory = {
  name: string;
  tokens: number;
  percentage: number;
  color: string;
};

type Props = {
  categories: CategorySummaryTableCategory[];
};

function formatTokens(n: number): string {
  return n.toLocaleString();
}

export function CategorySummaryTable({ categories }: Props) {
  return (
    <div role="table" aria-label="Context category breakdown" className="flex flex-col gap-2">
      <div
        role="row"
        className="flex items-center gap-3 pb-1 text-xs font-medium uppercase tracking-wider text-text-muted"
      >
        <span role="columnheader" className="w-40 shrink-0">
          Category
        </span>
        <span role="columnheader" className="flex-1 text-right">
          %
        </span>
        <span role="columnheader" className="w-20 text-right font-mono tabular-nums">
          Tokens
        </span>
      </div>

      {categories.map((category) => (
        <div
          key={category.name}
          role="row"
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-soft focus-within:bg-surface-soft"
        >
          <div className="flex w-40 shrink-0 items-center gap-2">
            <div
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: category.color }}
              role="img"
              aria-label={`${category.name} color indicator`}
            />
            <span role="rowheader" className="truncate text-sm font-medium text-text">
              {category.name}
            </span>
          </div>

          <span role="cell" className="flex-1 text-right text-sm text-text-muted">
            {category.percentage.toFixed(1)}%
          </span>

          <span role="cell" className="w-20 text-right font-mono text-sm tabular-nums text-text">
            {formatTokens(category.tokens)}
          </span>
        </div>
      ))}
    </div>
  );
}
