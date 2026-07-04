import { useTheme } from "../lib/theme";

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="inline-flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={toggle}
    >
      <span className="relative size-5">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isDark ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        >
          <SunIcon />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        >
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}
