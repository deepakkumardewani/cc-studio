import { useMemo } from "react";

export type StackedUsageBarCategory = {
  name: string;
  tokens: number;
  color: string;
};

type Props = {
  total: number;
  categories: StackedUsageBarCategory[];
  height?: string;
};

export function StackedUsageBar({ total, categories, height = "h-3" }: Props) {
  const segments = useMemo(() => {
    if (total === 0) return [];
    return categories.map((cat) => ({
      ...cat,
      percentage: (cat.tokens / total) * 100,
    }));
  }, [total, categories]);

  if (total === 0 || segments.length === 0) {
    return (
      <div
        className={`w-full overflow-hidden rounded-full bg-border-subtle ${height}`}
        role="img"
        aria-label="Empty context usage"
      />
    );
  }

  return (
    <div
      className={`flex w-full overflow-hidden rounded-full ${height}`}
      role="img"
      aria-label={`Context usage: ${segments.map((s) => `${s.name} ${s.percentage.toFixed(1)}%`).join(", ")}`}
    >
      {segments.map((segment) => (
        <div
          key={segment.name}
          className="transition-[width] duration-500 ease-out"
          style={{
            width: `${segment.percentage}%`,
            backgroundColor: segment.color,
          }}
          title={`${segment.name}: ${segment.tokens.toLocaleString()} tokens (${segment.percentage.toFixed(1)}%)`}
        />
      ))}
    </div>
  );
}
