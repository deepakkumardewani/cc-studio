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
  {
    category: "claudeMd",
    label: "CLAUDE.md",
    files: [{ name: "CLAUDE.md" }],
  },
  {
    category: "settings",
    label: "Settings",
    files: [{ name: "settings.json" }],
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

function expandSkills() {
  fireEvent.click(screen.getByRole("button", { name: "Expand Skills" }));
}

test("FileTree renders collapsible categories and root files", () => {
  renderTree();

  expect(screen.getByRole("button", { name: "Expand Skills" })).toBeTruthy();
  expect(screen.queryByRole("link", { name: "alpha.md" })).toBeNull();

  expandSkills();

  expect(screen.getByRole("link", { name: "alpha.md" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Expand colorize" })).toBeTruthy();
});

test("FileTree toggles category and folder open state on click", () => {
  renderTree();

  expandSkills();

  const folderButton = screen.getByRole("button", { name: "Expand colorize" });
  fireEvent.click(folderButton);

  expect(screen.getByRole("link", { name: "SKILL.md" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Collapse colorize" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Collapse Skills" }));
  expect(screen.queryByRole("link", { name: "alpha.md" })).toBeNull();
});

test("FileTree renders single-file categories as direct links", () => {
  renderTree();

  expect(screen.getByRole("link", { name: "CLAUDE.md" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Settings" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Expand CLAUDE.md/i })).toBeNull();
});

test("FileTree persists open folders in localStorage", () => {
  renderTree();

  expandSkills();
  fireEvent.click(screen.getByRole("button", { name: "Expand colorize" }));

  const stored = JSON.parse(localStorage.getItem("cc-studio-tree-open") ?? "[]") as string[];
  expect(stored).toContain("category:skills");
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

  expandSkills();
  fireEvent.click(screen.getByRole("link", { name: "alpha.md" }));

  expect(screen.getByText("Alpha page")).toBeTruthy();
});

test("FileTree auto-expands categories and folders for the active route", () => {
  renderTree("/skills/colorize/SKILL.md");

  expect(screen.getByRole("button", { name: "Collapse Skills" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "SKILL.md" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Collapse colorize" })).toBeTruthy();
});
