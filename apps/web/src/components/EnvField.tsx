import { useState } from "react";
import { ENV_VAR_BY_NAME, searchEnvCatalog, type EnvVarDef } from "../lib/env-catalog";
import { Modal } from "./Modal";
import { SelectDropdown } from "./SelectDropdown";
import {
  EditorList,
  EmptyHint,
  ModeTabs,
  PlusIcon,
  RawJsonPanel,
  RemoveButton,
  structuredInputClass,
  type EditorMode,
} from "./structured-shared";

type EnvMap = Record<string, string>;

function asEnvMap(value: unknown): EnvMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result: EnvMap = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") {
      result[key] = raw;
    }
  }
  return result;
}

function groupByCategory(defs: EnvVarDef[]): Array<[string, EnvVarDef[]]> {
  const groups = new Map<string, EnvVarDef[]>();
  for (const def of defs) {
    const list = groups.get(def.category) ?? [];
    list.push(def);
    groups.set(def.category, list);
  }
  return [...groups.entries()];
}

function EnvValueControl({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const def = ENV_VAR_BY_NAME.get(name);
  const options = def?.options ?? (def?.flag ? ["1", "0"] : undefined);

  if (options) {
    return (
      <SelectDropdown
        id={`env-${name}`}
        value={value}
        options={options.map((option) => ({ value: option, label: option }))}
        onChange={(next) => onChange(next ?? "")}
      />
    );
  }

  return (
    <input
      value={value}
      placeholder={def?.example ?? "value"}
      aria-label={`Value for ${name}`}
      onChange={(event) => onChange(event.target.value)}
      className={`${structuredInputClass} font-mono`}
    />
  );
}

function AddVariableDialog({
  existing,
  onAdd,
  onClose,
}: {
  existing: Set<string>;
  onAdd: (name: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const grouped = groupByCategory(searchEnvCatalog(query, existing));

  return (
    <Modal title="Add environment variable" onClose={onClose}>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <input
          autoFocus
          value={query}
          placeholder="Search available variables…"
          aria-label="Search environment variables"
          onChange={(event) => setQuery(event.target.value)}
          className={`${structuredInputClass} bg-surface`}
        />

        <div className="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
          {grouped.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-text-muted">
              {query.trim()
                ? "No matching variables."
                : "Every catalogued variable is already set."}
            </p>
          ) : (
            grouped.map(([category, defs]) => (
              <div key={category}>
                <p className="px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {category}
                </p>
                <div className="mt-1 space-y-0.5">
                  {defs.map((def) => (
                    <button
                      key={def.name}
                      type="button"
                      onClick={() => onAdd(def.name)}
                      className="group flex w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left transition hover:bg-surface"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-sm text-text">
                          {def.name}
                        </span>
                        <span className="block text-xs text-text-muted">{def.description}</span>
                      </span>
                      <span className="mt-0.5 shrink-0 text-text-muted transition group-hover:text-accent">
                        <PlusIcon />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

export function EnvField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [mode, setMode] = useState<EditorMode>("fields");
  const [dialogOpen, setDialogOpen] = useState(false);

  const map = asEnvMap(value);
  const names = Object.keys(map);

  function commit(next: EnvMap) {
    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  function addVar(name: string) {
    if (name in map) {
      return;
    }
    commit({ ...map, [name]: "" });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {names.length} variable{names.length === 1 ? "" : "s"} set
        </p>
        <ModeTabs mode={mode} onChange={setMode} />
      </div>

      {mode === "json" ? (
        <RawJsonPanel value={value} onChange={onChange} />
      ) : (
        <div className="space-y-3">
          {names.length === 0 ? (
            <EmptyHint>No environment variables set. Browse and add one below.</EmptyHint>
          ) : (
            <EditorList>
              {names.map((name) => {
                const def = ENV_VAR_BY_NAME.get(name);
                return (
                  <div
                    key={name}
                    className="grid gap-x-4 gap-y-2 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,20rem)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-text">{name}</p>
                      {def ? (
                        <p className="truncate text-xs text-text-muted">{def.description}</p>
                      ) : null}
                    </div>
                    <EnvValueControl
                      name={name}
                      value={map[name] ?? ""}
                      onChange={(next) => commit({ ...map, [name]: next })}
                    />
                    <RemoveButton
                      onClick={() => {
                        const next = { ...map };
                        delete next[name];
                        commit(next);
                      }}
                      label={`Remove ${name}`}
                    />
                  </div>
                );
              })}
            </EditorList>
          )}

          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text transition hover:border-accent/40 hover:text-accent"
          >
            <PlusIcon />
            Add variable
          </button>
        </div>
      )}

      {dialogOpen ? (
        <AddVariableDialog
          existing={new Set(names)}
          onAdd={addVar}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}
