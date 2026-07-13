type SkillHeaderProps = {
  data: Record<string, string>;
  fallbackTitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
};

function displayValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function SkillChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-text ring-1 ring-border-subtle">
      <span className="text-text-muted">{label}</span>
      <span>{value}</span>
    </span>
  );
}

export function SkillHeader({ data, fallbackTitle, badge, action }: SkillHeaderProps) {
  const title = data.name ?? fallbackTitle ?? "Untitled skill";
  const description = data.description;
  const userInvocable = data["user-invocable"];
  const argumentHint = data["argument-hint"];

  const chips: Array<{ label: string; value: string }> = [];

  if (userInvocable === "true") {
    chips.push({ label: "User invocable", value: "yes" });
  } else if (userInvocable === "false") {
    chips.push({ label: "User invocable", value: "no" });
  }

  if (argumentHint) {
    chips.push({ label: "Argument hint", value: displayValue(argumentHint) });
  }

  return (
    <header className="border-b border-border-subtle pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-text">{title}</h1>
          {badge}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-text-muted">{description}</p>
      ) : null}
      {chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <SkillChip key={chip.label} label={chip.label} value={chip.value} />
          ))}
        </div>
      ) : null}
    </header>
  );
}
