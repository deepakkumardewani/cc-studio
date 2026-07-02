import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FileTree } from "../components/FileTree";
import { ThemeToggle } from "../components/ThemeToggle";
import { fetchTree, type TreeCategory } from "../lib/api";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchTree()
      .then((tree) => {
        if (!cancelled) {
          setCategories(tree.categories);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load config tree.");
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

  return (
    <div className="flex min-h-screen flex-col bg-surface text-text">
      <header className="border-b border-border-subtle bg-surface-raised">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              cc-studio
            </p>
            <h1 className="text-lg font-semibold">Claude Config Tool</h1>
          </div>
          <div className="flex items-center gap-2">
            <nav aria-label="Primary" className="flex gap-4 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    isActive
                      ? "font-medium text-text underline decoration-accent underline-offset-4"
                      : "text-text-muted hover:text-text"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border-subtle bg-surface-raised py-4">
          <FileTree categories={categories} loading={loading} error={error} />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
