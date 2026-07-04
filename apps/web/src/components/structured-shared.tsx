import { useId, useState, type ReactNode } from "react";

export const structuredInputClass =
  "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-text shadow-sm transition placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15";

export type EditorMode = "fields" | "json";

export function ModeTabs({
  mode,
  onChange,
}: {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
}) {
  const tabs: Array<{ id: EditorMode; label: string }> = [
    { id: "fields", label: "Fields" },
    { id: "json", label: "JSON" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border-subtle bg-surface p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={mode === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
            mode === tab.id
              ? "bg-surface-raised text-text shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        aria-label={label}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="h-5 w-9 rounded-full border border-border-subtle bg-surface-raised transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0.5 top-0.5 size-4 rounded-full bg-surface-raised shadow-sm transition-transform peer-checked:translate-x-4"
      />
    </label>
  );
}

export function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border-subtle bg-surface px-4 py-6 text-center text-sm text-text-muted">
      {children}
    </p>
  );
}

/** Recessed panel that groups the structured editor rows. */
export function EditorList({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-surface">
      {children}
    </div>
  );
}

/** Raw-JSON escape hatch for the whole field value. Keeps the last valid value on parse errors. */
export function RawJsonPanel({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const errorId = useId();
  const [text, setText] = useState(() => (value == null ? "" : JSON.stringify(value, null, 2)));
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      <textarea
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        rows={Math.min(18, Math.max(6, text.split("\n").length + 1))}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          const trimmed = next.trim();
          if (trimmed === "") {
            setError(null);
            onChange(undefined);
            return;
          }
          try {
            onChange(JSON.parse(trimmed));
            setError(null);
          } catch {
            setError("Invalid JSON — changes paused until fixed.");
          }
        }}
        className={`${structuredInputClass} bg-surface font-mono text-xs leading-relaxed`}
      />
      {error ? (
        <p id={errorId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
