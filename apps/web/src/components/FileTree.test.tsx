// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import { FileTree } from "./FileTree";
import type { TreeCategory } from "../lib/api";

const categories: TreeCategory[] = [
  {
    category: "skills",
    label: "Skills",
    files: [
      { name: "alpha.md" },
      { name: "colorize/SKILL.md" },
      { name: "frontend-design/SKILL.md" },
    ],
  },
];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

function renderTree(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<FileTree categories={categories} />} />
      </Routes>
    </MemoryRouter>,
  );
}

test("FileTree renders category headings and root files", () => {
  renderTree();

  expect(screen.getByRole("heading", { name: "Skills" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "alpha.md" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Expand colorize" })).toBeTruthy();
});

test("FileTree toggles folder open state on click", () => {
  renderTree();

  const folderButton = screen.getByRole("button", { name: "Expand colorize" });
  fireEvent.click(folderButton);

  expect(screen.getByRole("link", { name: "SKILL.md" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Collapse colorize" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Collapse colorize" }));
  expect(screen.queryByRole("link", { name: "SKILL.md" })).toBeNull();
});

test("FileTree persists open folders in localStorage", () => {
  renderTree();

  fireEvent.click(screen.getByRole("button", { name: "Expand colorize" }));

  const stored = JSON.parse(localStorage.getItem("cc-studio-tree-open") ?? "[]") as string[];
  expect(stored).toContain("skills:colorize");
});

test("FileTree navigates when a file leaf is clicked", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <FileTree categories={categories} />
              <div data-testid="location" />
            </div>
          }
        />
        <Route path="/skills/alpha.md" element={<div>Alpha page</div>} />
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("link", { name: "alpha.md" }));

  expect(screen.getByText("Alpha page")).toBeTruthy();
});

test("FileTree auto-expands folders for the active route", () => {
  renderTree("/skills/colorize/SKILL.md");

  expect(screen.getByRole("link", { name: "SKILL.md" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Collapse colorize" })).toBeTruthy();
});
