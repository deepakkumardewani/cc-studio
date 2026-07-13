// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, test, beforeEach, afterEach } from "vite-plus/test";
import { ThemeToggle } from "../components/ThemeToggle";
import { ThemeProvider } from "./theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
});

afterEach(() => {
  cleanup();
});

test("ThemeToggle toggles dark class on documentElement", () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );

  expect(document.documentElement.classList.contains("dark")).toBe(false);

  fireEvent.click(screen.getByRole("button", { name: /switch to dark mode/i }));

  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(
    screen.getByRole("button", { name: /switch to light mode/i }).getAttribute("aria-pressed"),
  ).toBe("true");

  fireEvent.click(screen.getByRole("button", { name: /switch to light mode/i }));

  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

test("ThemeToggle persists theme in localStorage", () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: /switch to dark mode/i }));

  expect(localStorage.getItem("claude-desk-theme")).toBe("dark");
});
