import { NavLink, Outlet } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-surface text-text">
      <header className="border-b border-border-subtle bg-surface-raised">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
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
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
