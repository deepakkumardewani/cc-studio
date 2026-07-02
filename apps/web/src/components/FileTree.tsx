import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { TreeCategory } from "../lib/api";
import { buildTree, type TreeNode } from "../lib/tree";

const OPEN_FOLDERS_KEY = "cc-studio-tree-open";

function loadOpenFolders(): Set<string> {
  try {
    const raw = localStorage.getItem(OPEN_FOLDERS_KEY);
    if (!raw) {
      return new Set();
    }
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveOpenFolders(open: Set<string>): void {
  localStorage.setItem(OPEN_FOLDERS_KEY, JSON.stringify([...open]));
}

function folderKey(category: string, path: string): string {
  return `${category}:${path}`;
}

function findFolderPathsToHref(nodes: TreeNode[], href: string, folderPath = ""): string[] | null {
  for (const node of nodes) {
    if (node.kind === "file") {
      if (node.href === href) {
        return [];
      }
      continue;
    }

    const path = folderPath ? `${folderPath}/${node.name}` : node.name;
    const childResult = findFolderPathsToHref(node.children, href, path);
    if (childResult !== null) {
      return [path, ...childResult];
    }
  }

  return null;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-3.5 shrink-0 text-text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

type TreeBranchProps = {
  node: TreeNode;
  category: string;
  folderPath: string;
  openFolders: Set<string>;
  activeHref: string;
  onToggle: (key: string) => void;
};

function TreeBranch({
  node,
  category,
  folderPath,
  openFolders,
  activeHref,
  onToggle,
}: TreeBranchProps) {
  if (node.kind === "file") {
    const isActive = activeHref === node.href;

    return (
      <li role="treeitem" aria-selected={isActive} className="list-none">
        <NavLink
          to={node.href}
          className={({ isActive: linkActive }) =>
            [
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
              linkActive || isActive
                ? "bg-accent/15 font-medium text-accent"
                : "text-text hover:bg-surface-raised",
            ].join(" ")
          }
        >
          <span className="w-3.5 shrink-0" />
          <FileIcon />
          <span className="truncate">{node.name}</span>
        </NavLink>
      </li>
    );
  }

  const path = folderPath ? `${folderPath}/${node.name}` : node.name;
  const key = folderKey(category, path);
  const isOpen = openFolders.has(key);

  return (
    <li role="treeitem" aria-expanded={isOpen} className="list-none">
      <button
        type="button"
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.name}`}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text hover:bg-surface-raised"
        onClick={() => onToggle(key)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle(key);
          }
        }}
      >
        <ChevronIcon expanded={isOpen} />
        <FolderIcon />
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {isOpen ? (
        <ul role="group" className="ml-3 border-l border-border-subtle pl-1">
          {node.children.map((child) => (
            <TreeBranch
              key={child.kind === "folder" ? `folder:${path}/${child.name}` : `file:${child.href}`}
              node={child}
              category={category}
              folderPath={path}
              openFolders={openFolders}
              activeHref={activeHref}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

type FileTreeProps = {
  categories: TreeCategory[];
  loading?: boolean;
  error?: string | null;
};

export function FileTree({ categories, loading = false, error = null }: FileTreeProps) {
  const location = useLocation();
  const activeHref = location.pathname;
  const [openFolders, setOpenFolders] = useState(loadOpenFolders);

  const trees = useMemo(
    () => categories.map((category) => ({ category, nodes: buildTree(category) })),
    [categories],
  );

  useEffect(() => {
    setOpenFolders((current) => {
      const next = new Set(current);
      let changed = false;

      for (const { category, nodes } of trees) {
        const paths = findFolderPathsToHref(nodes, activeHref);
        if (!paths) {
          continue;
        }

        for (const path of paths) {
          const key = folderKey(category.category, path);
          if (!next.has(key)) {
            next.add(key);
            changed = true;
          }
        }
      }

      if (changed) {
        saveOpenFolders(next);
      }

      return changed ? next : current;
    });
  }, [activeHref, trees]);

  const handleToggle = useCallback((key: string) => {
    setOpenFolders((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      saveOpenFolders(next);
      return next;
    });
  }, []);

  if (loading) {
    return <p className="px-3 py-2 text-sm text-text-muted">Loading tree…</p>;
  }

  if (error) {
    return <p className="px-3 py-2 text-sm text-danger">{error}</p>;
  }

  return (
    <nav aria-label="Config files" className="space-y-5">
      {trees.map(({ category, nodes }) => (
        <section key={category.category}>
          <h2 className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            {category.label}
          </h2>
          {nodes.length === 0 ? (
            <p className="px-3 text-sm text-text-muted">No files</p>
          ) : (
            <ul role="tree" aria-label={category.label} className="space-y-0.5 px-1">
              {nodes.map((node) => (
                <TreeBranch
                  key={node.kind === "folder" ? `folder:${node.name}` : `file:${node.href}`}
                  node={node}
                  category={category.category}
                  folderPath=""
                  openFolders={openFolders}
                  activeHref={activeHref}
                  onToggle={handleToggle}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </nav>
  );
}
