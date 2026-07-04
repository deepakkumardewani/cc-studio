// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vite-plus/test";
import * as api from "../lib/api";
import { Workspace } from "./Workspace";

vi.mock("../lib/api", () => ({
  fetchContext: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

function renderWorkspace() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Workspace />
    </MemoryRouter>,
  );
}

test("renders loading skeleton initially", () => {
  vi.mocked(api.fetchContext).mockReturnValue(new Promise(() => {}));
  const html = renderWorkspace();
  expect(html).toContain("animate-pulse");
  expect(html).toContain("Loading context breakdown");
});

test("renders without errors when mounted", () => {
  vi.mocked(api.fetchContext).mockReturnValue(new Promise(() => {}));
  expect(() => renderWorkspace()).not.toThrow();
});

test("renders breakdown when context API succeeds", async () => {
  vi.mocked(api.fetchContext).mockResolvedValue({
    success: true,
    breakdown: [
      { category: "System Prompt", tokens: 5000, percentage: 50 },
      { category: "Tools", tokens: 5000, percentage: 50 },
    ],
    total: 10000,
  });

  render(
    <MemoryRouter>
      <Workspace />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(screen.getByText("10,000")).toBeTruthy();
  });
  expect(screen.getByText("System Prompt")).toBeTruthy();
  expect(screen.getByText("Tools")).toBeTruthy();
});

test("renders error alert when context API fails", async () => {
  vi.mocked(api.fetchContext).mockRejectedValue(new Error("Network error"));

  render(
    <MemoryRouter>
      <Workspace />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(screen.getByRole("alert")).toBeTruthy();
  });
  expect(screen.getByText("Unable to fetch context.")).toBeTruthy();
});
