import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchSettings, fetchTree, type ApiCategory, type TreeCategory } from "../lib/api";
import { getCategoryMeta } from "../lib/categories";
import { getRecent, type RecentItem } from "../lib/recent";
import {
  flattenFiles,
  searchFiles,
  summarizeConfig,
  type ConfigStat,
  type WorkspaceFile,
} from "../lib/workspace";
import type { ClaudeSettings } from "schema";

const RESULT_LIMIT = 40;
const SCOPES: Array<{ id: ApiCategory | null; label: string }> = [
  { id: null, label: "All" },
  { id: "skills", label: "Skills" },
  { id: "commands", label: "Commands" },
  { id: "plans", label: "Plans" },
];

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 text-text-muted"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function FileRow({ file }: { file: WorkspaceFile }) {
  return (
    <Link
      to={file.href}
      className="group flex items-center gap-3 px-4 py-3 transition hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text">{file.label}</p>
        {file.detail !== file.label ? (
          <p className="truncate font-mono text-xs text-text-muted">{file.detail}</p>
        ) : null}
      </div>
      <span className="shrink-0 rounded-full border border-border-subtle px-2 py-0.5 text-xs text-text-muted">
        {file.categoryLabel}
      </span>
      <ArrowIcon />
    </Link>
  );
}

function StatRow({ stat }: { stat: ConfigStat }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <span className="text-sm text-text-muted">{stat.label}</span>
      <span className="min-w-0 truncate text-right font-mono text-sm font-medium text-text">
        {stat.value}
        {stat.hint ? <span className="ml-1 font-sans text-text-muted">{stat.hint}</span> : null}
      </span>
    </div>
  );
}

export function List() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [settings, setSettings] = useState<ClaudeSettings>({});
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ApiCategory | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchTree(), fetchSettings()])
      .then(([tree, settingsResponse]) => {
        if (cancelled) {
          return;
        }
        setCategories(tree.categories);
        setSettings(settingsResponse.settings as ClaudeSettings);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load your workspace.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!isCommandK && !isSlash) {
        return;
      }
      const target = event.target;
      const inField =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isSlash && inField) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const files = useMemo(() => flattenFiles(categories), [categories]);
  const results = useMemo(() => searchFiles(files, query, scope), [files, query, scope]);
  const stats = useMemo(() => summarizeConfig(settings), [settings]);
  const isBrowsing = query.trim().length > 0 || scope !== null;

  if (loading) {
    return <p className="text-text-muted">Loading your workspace…</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
          Workspace
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-text">
          Your Claude workspace
        </h1>
        <p className="mt-3 text-base text-text-muted">
          {files.length} files across skills, commands, plans, and config. Search to jump anywhere,
          or pick up where you left off.
        </p>
      </header>

      <div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            type="search"
            role="searchbox"
            aria-label="Search your workspace"
            value={query}
            placeholder="Search skills, commands, plans…"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results[0]) {
                void navigate(results[0].href);
              }
            }}
            className="settings-search w-full rounded-xl border border-border-subtle bg-surface-raised py-3.5 pl-12 pr-16 text-base text-text shadow-sm transition placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-4 focus:ring-accent/10"
          />
          <kbd className="pointer-events-none absolute inset-y-0 right-4 my-auto hidden h-6 items-center rounded border border-border-subtle bg-surface px-1.5 font-mono text-[0.7rem] text-text-muted sm:flex">
            ⌘K
          </kbd>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SCOPES.map((option) => {
            const isActive = scope === option.id;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setScope(option.id)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  isActive
                    ? "bg-accent text-accent-fg"
                    : "border border-border-subtle text-text-muted hover:border-accent/40 hover:text-text"
                }`}
              >
                {option.label}
              </button>
            );
          })}
          {isBrowsing ? (
            <span className="ml-auto text-sm text-text-muted">
              {results.length} match{results.length === 1 ? "" : "es"}
            </span>
          ) : null}
        </div>
      </div>

      {isBrowsing ? (
        <section aria-label="Search results">
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-subtle bg-surface-raised p-10 text-center">
              <p className="font-medium text-text">No matches</p>
              <p className="mt-1 text-sm text-text-muted">
                Try a different keyword or widen the scope to “All”.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-sm">
              <div className="divide-y divide-border-subtle">
                {results.slice(0, RESULT_LIMIT).map((file) => (
                  <FileRow key={`${file.category}-${file.name}`} file={file} />
                ))}
              </div>
              {results.length > RESULT_LIMIT ? (
                <p className="border-t border-border-subtle px-4 py-2.5 text-xs text-text-muted">
                  Showing first {RESULT_LIMIT} of {results.length}. Keep typing to narrow it down.
                </p>
              ) : null}
            </div>
          )}
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="space-y-8">
            {recent.length > 0 ? (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Recently viewed
                </h2>
                <div className="mt-3 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-sm">
                  <div className="divide-y divide-border-subtle">
                    {recent.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium text-text">
                          {item.label}
                        </span>
                        <span className="shrink-0 rounded-full border border-border-subtle px-2 py-0.5 text-xs text-text-muted">
                          {item.categoryLabel}
                        </span>
                        <ArrowIcon />
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Browse
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {categories.map((category) => {
                  const isDirect =
                    category.category === "settings" || category.category === "claudeMd";
                  const { colorToken } = getCategoryMeta(category.category);
                  const className =
                    "group flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-raised px-3.5 py-2.5 text-sm shadow-sm transition hover:border-accent/40 hover:bg-surface hover:-translate-y-px active:translate-y-0 active:shadow-none";
                  const inner = (
                    <>
                      <span className={`size-2 shrink-0 rounded-full ${colorToken}`} />
                      <span className="font-medium text-text">{category.label}</span>
                      <span className="font-mono text-xs text-text-muted">
                        {category.files.length}
                      </span>
                    </>
                  );
                  return isDirect ? (
                    <Link
                      key={category.category}
                      to={category.category === "settings" ? "/settings" : "/claude-md"}
                      className={className}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      key={category.category}
                      type="button"
                      onClick={() => setScope(category.category)}
                      className={className}
                    >
                      {inner}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Current config
              </h2>
              <Link
                to="/settings"
                className="text-xs font-medium text-accent transition hover:opacity-80"
              >
                Edit →
              </Link>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-sm">
              <div className="divide-y divide-border-subtle">
                {stats.map((stat) => (
                  <StatRow key={stat.label} stat={stat} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
