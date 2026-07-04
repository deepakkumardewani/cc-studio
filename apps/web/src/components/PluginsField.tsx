import { useState } from "react";
import {
  EditorList,
  EmptyHint,
  ModeTabs,
  PlusIcon,
  RawJsonPanel,
  RemoveButton,
  Switch,
  structuredInputClass,
  type EditorMode,
} from "./structured-shared";

type PluginMap = Record<string, boolean | string[]>;

function asPluginMap(value: unknown): PluginMap {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as PluginMap) : {};
}

function splitPluginKey(key: string): { name: string; marketplace: string } {
  const at = key.lastIndexOf("@");
  if (at < 0) {
    return { name: key, marketplace: "other" };
  }
  return { name: key.slice(0, at), marketplace: key.slice(at + 1) };
}

function groupByMarketplace(entries: Array<[string, boolean | string[]]>) {
  const groups = new Map<string, Array<[string, boolean | string[]]>>();
  for (const entry of entries) {
    const { marketplace } = splitPluginKey(entry[0]);
    const list = groups.get(marketplace) ?? [];
    list.push(entry);
    groups.set(marketplace, list);
  }
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
}

export function PluginsField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [mode, setMode] = useState<EditorMode>("fields");
  const [newName, setNewName] = useState("");
  const [newMarketplace, setNewMarketplace] = useState("");

  const map = asPluginMap(value);
  const entries = Object.entries(map);
  const groups = groupByMarketplace(entries);

  function commit(next: PluginMap) {
    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  function addPlugin() {
    const name = newName.trim();
    const marketplace = newMarketplace.trim();
    if (!name || !marketplace) {
      return;
    }
    commit({ ...map, [`${name}@${marketplace}`]: true });
    setNewName("");
    setNewMarketplace("");
  }

  function handleAddKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addPlugin();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {entries.length} plugin{entries.length === 1 ? "" : "s"} configured
        </p>
        <ModeTabs mode={mode} onChange={setMode} />
      </div>

      {mode === "json" ? (
        <RawJsonPanel value={value} onChange={onChange} />
      ) : (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <EmptyHint>No plugins configured yet. Add one below.</EmptyHint>
          ) : (
            groups.map(([marketplace, items]) => (
              <div key={marketplace} className="space-y-1.5">
                <p className="px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {marketplace}
                </p>
                <EditorList>
                  {items
                    .sort(([left], [right]) => left.localeCompare(right))
                    .map(([key, entryValue]) => {
                      const { name } = splitPluginKey(key);
                      const enabled = entryValue !== false;
                      return (
                        <div key={key} className="flex items-center gap-3 px-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text">{name}</p>
                            <p className="truncate font-mono text-xs text-text-muted">{key}</p>
                          </div>
                          <Switch
                            checked={enabled}
                            onChange={(checked) => commit({ ...map, [key]: checked })}
                            label={`Toggle ${key}`}
                          />
                          <RemoveButton
                            onClick={() => {
                              const next = { ...map };
                              delete next[key];
                              commit(next);
                            }}
                            label={`Remove ${key}`}
                          />
                        </div>
                      );
                    })}
                </EditorList>
              </div>
            ))
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newName}
              placeholder="plugin-id"
              aria-label="New plugin id"
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={handleAddKeyDown}
              className={`${structuredInputClass} w-40`}
            />
            <span className="font-mono text-sm text-text-muted">@</span>
            <input
              value={newMarketplace}
              placeholder="marketplace-id"
              aria-label="New plugin marketplace"
              onChange={(event) => setNewMarketplace(event.target.value)}
              onKeyDown={handleAddKeyDown}
              className={`${structuredInputClass} w-44`}
            />
            <button
              type="button"
              onClick={addPlugin}
              disabled={!newName.trim() || !newMarketplace.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text transition hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon />
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
