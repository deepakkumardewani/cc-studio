export type SelectOption = {
  value: string;
  label: string;
};

export type FieldRendererProps = {
  id: string;
  label: string;
  description: string;
  value: unknown;
  readOnly?: boolean;
  options?: SelectOption[];
  error?: string;
  onChange?: (value: unknown) => void;
};

function FieldShell({
  id,
  label,
  description,
  error,
  children,
}: FieldRendererProps & { children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <label htmlFor={id} className="text-sm font-medium text-stone-900">
          {label}
        </label>
        {description ? <p className="text-sm text-stone-600">{description}</p> : null}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ToggleField({
  id,
  label,
  description,
  value,
  readOnly = true,
  error,
  onChange,
}: FieldRendererProps) {
  const checked = Boolean(value);

  return (
    <FieldShell id={id} label={label} description={description} value={value} error={error}>
      <label className="inline-flex items-center gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          readOnly={readOnly}
          disabled={readOnly}
          aria-readonly={readOnly}
          aria-invalid={error ? true : undefined}
          onChange={
            readOnly
              ? undefined
              : (event) => {
                  onChange?.(event.target.checked);
                }
          }
          className="size-4 rounded border-stone-300 text-stone-900"
        />
        <span className="text-sm text-stone-700">{checked ? "Enabled" : "Disabled"}</span>
      </label>
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  description,
  value,
  options = [],
  readOnly = true,
  error,
  onChange,
}: FieldRendererProps) {
  const selected = typeof value === "string" || typeof value === "number" ? String(value) : "";

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      value={value}
      options={options}
      error={error}
    >
      <select
        id={id}
        value={selected}
        disabled={readOnly}
        aria-readonly={readOnly}
        aria-invalid={error ? true : undefined}
        onChange={
          readOnly
            ? undefined
            : (event) => {
                const next = event.target.value;
                onChange?.(next === "" ? undefined : next);
              }
        }
        className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900"
      >
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function InputField({
  id,
  label,
  description,
  value,
  readOnly = true,
  error,
  onChange,
}: FieldRendererProps) {
  const displayValue =
    typeof value === "string" || typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : "";

  return (
    <FieldShell id={id} label={label} description={description} value={value} error={error}>
      <input
        id={id}
        type="text"
        value={displayValue}
        readOnly={readOnly}
        disabled={readOnly}
        aria-readonly={readOnly}
        aria-invalid={error ? true : undefined}
        onChange={
          readOnly
            ? undefined
            : (event) => {
                const next = event.target.value;
                onChange?.(next === "" ? undefined : next);
              }
        }
        className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900"
      />
    </FieldShell>
  );
}

export function JsonField({
  id,
  label,
  description,
  value,
  readOnly = true,
  error,
  onChange,
}: FieldRendererProps) {
  const displayValue =
    value == null || value === undefined
      ? ""
      : typeof value === "string"
        ? value
        : JSON.stringify(value, null, 2);

  return (
    <FieldShell id={id} label={label} description={description} value={value} error={error}>
      <textarea
        id={id}
        value={displayValue}
        readOnly={readOnly}
        disabled={readOnly}
        aria-readonly={readOnly}
        aria-invalid={error ? true : undefined}
        rows={Math.min(12, Math.max(4, displayValue.split("\n").length))}
        onChange={
          readOnly
            ? undefined
            : (event) => {
                const next = event.target.value.trim();
                if (next === "") {
                  onChange?.(undefined);
                  return;
                }
                try {
                  onChange?.(JSON.parse(next));
                } catch {
                  onChange?.(next);
                }
              }
        }
        className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-900"
      />
    </FieldShell>
  );
}

export type SchemaField = {
  key: string;
  label: string;
  description: string;
  control: "toggle" | "select" | "input" | "json";
  options?: SelectOption[];
};

export function EditableField({
  field,
  value,
  onChange,
  error,
}: {
  field: SchemaField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const id = `setting-${field.key}`;
  const props = {
    id,
    label: field.label,
    description: field.description,
    value,
    options: field.options,
    readOnly: false,
    error,
    onChange,
  };

  switch (field.control) {
    case "toggle":
      return <ToggleField {...props} />;
    case "select":
      return <SelectField {...props} />;
    case "json":
      return <JsonField {...props} />;
    default:
      return <InputField {...props} />;
  }
}

export function ReadOnlyField({ field, value }: { field: SchemaField; value: unknown }) {
  const id = `setting-${field.key}`;
  const props = {
    id,
    label: field.label,
    description: field.description,
    value,
    options: field.options,
    readOnly: true,
  };

  switch (field.control) {
    case "toggle":
      return <ToggleField {...props} />;
    case "select":
      return <SelectField {...props} />;
    case "json":
      return <JsonField {...props} />;
    default:
      return <InputField {...props} />;
  }
}
