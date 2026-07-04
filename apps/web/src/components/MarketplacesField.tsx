import { useState } from "react";
import {
  EmptyHint,
  ModeTabs,
  PlusIcon,
  RawJsonPanel,
  RemoveButton,
  structuredInputClass,
  type EditorMode,
} from "./structured-shared";
import { SelectDropdown } from "./SelectDropdown";

type SourceObject = { source?: string } & Record<string, unknown>;
type MarketEntry = { source?: SourceObject } & Record<string, unknown>;
type MarketMap = Record<string, MarketEntry>;
type Row = { name: string; entry: MarketEntry };

const SOURCE_TYPES = [
  { value: "github", label: "GitHub repo" },
  { value: "url", label: "Git URL" },
];

function asMarketMap(value: unknown): MarketMap {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as MarketMap) : {};
}

function toRows(value: unknown): Row[] {
  return Object.entries(asMarketMap(value)).map(([name, entry]) => ({ name, entry }));
}

function fromRows(rows: Row[]): MarketMap | undefined {
  const map: MarketMap = {};
  for (const row of rows) {
    if (row.name.trim()) {
      map[row.name.trim()] = row.entry;
    }
  }
  return Object.keys(map).length > 0 ? map : undefined;
}

function sourceField(entry: MarketEntry, key: string): string {
  const raw = entry.source?.[key];
  return typeof raw === "string" ? raw : "";
}

export function MarketplacesField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [mode, setMode] = useState<EditorMode>("fields");
  const [newName, setNewName] = useState("");
  const rows = toRows(value);

  function commit(next: Row[]) {
    onChange(fromRows(next));
  }

  function updateRow(index: number, patch: Partial<Row>) {
    commit(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  function updateSource(index: number, nextSource: SourceObject) {
    updateRow(index, { entry: { ...rows[index]?.entry, source: nextSource } });
  }

  function addMarketplace() {
    const name = newName.trim();
    if (!name) {
      return;
    }
    commit([...rows, { name, entry: { source: { source: "github", repo: "" } } }]);
    setNewName("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {rows.length} marketplace{rows.length === 1 ? "" : "s"}
        </p>
        <ModeTabs mode={mode} onChange={setMode} />
      </div>

      {mode === "json" ? (
        <RawJsonPanel value={value} onChange={onChange} />
      ) : (
        <div className="space-y-3">
          {rows.length === 0 ? (
            <EmptyHint>
              No extra marketplaces. Add one to share plugin sources with your team.
            </EmptyHint>
          ) : (
            rows.map((row, index) => {
              const type = row.entry.source?.source === "url" ? "url" : "github";
              return (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-border-subtle bg-surface p-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      value={row.name}
                      placeholder="marketplace-name"
                      aria-label="Marketplace name"
                      onChange={(event) => updateRow(index, { name: event.target.value })}
                      className={`${structuredInputClass} flex-1 font-mono`}
                    />
                    <RemoveButton
                      onClick={() => commit(rows.filter((_, rowIndex) => rowIndex !== index))}
                      label={`Remove ${row.name || "marketplace"}`}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <SelectDropdown
                      id={`marketplace-source-${index}`}
                      value={type}
                      options={SOURCE_TYPES}
                      onChange={(next) =>
                        updateSource(index, { ...row.entry.source, source: next ?? "github" })
                      }
                    />
                    <input
                      value={
                        type === "url"
                          ? sourceField(row.entry, "url")
                          : sourceField(row.entry, "repo")
                      }
                      placeholder={
                        type === "url" ? "https://example.com/marketplace.json" : "owner/repo"
                      }
                      aria-label={type === "url" ? "Git URL" : "GitHub repo"}
                      onChange={(event) =>
                        updateSource(index, {
                          ...row.entry.source,
                          source: type,
                          [type === "url" ? "url" : "repo"]: event.target.value,
                        })
                      }
                      className={`${structuredInputClass} font-mono`}
                    />
                  </div>

                  <input
                    value={sourceField(row.entry, "ref")}
                    placeholder="ref (optional, e.g. main or v2.0)"
                    aria-label="Git ref"
                    onChange={(event) => {
                      const nextSource: SourceObject = { ...row.entry.source, source: type };
                      if (event.target.value) {
                        nextSource.ref = event.target.value;
                      } else {
                        delete nextSource.ref;
                      }
                      updateSource(index, nextSource);
                    }}
                    className={`${structuredInputClass} font-mono`}
                  />
                </div>
              );
            })
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newName}
              placeholder="marketplace-name"
              aria-label="New marketplace name"
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addMarketplace();
                }
              }}
              className={`${structuredInputClass} w-52 font-mono`}
            />
            <button
              type="button"
              onClick={addMarketplace}
              disabled={!newName.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text transition hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon />
              Add marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
