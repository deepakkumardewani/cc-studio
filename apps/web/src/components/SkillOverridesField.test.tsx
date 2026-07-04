// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, test, vi } from "vite-plus/test";
import * as api from "../lib/api";
import { SkillOverridesField } from "./SkillOverridesField";

vi.mock("../lib/api", () => ({
  fetchSkills: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

test("SkillOverridesField renders loading state without errors", () => {
  vi.mocked(api.fetchSkills).mockReturnValue(new Promise(() => {}));
  const html = renderToStaticMarkup(
    <SkillOverridesField value={undefined} onChange={() => undefined} />,
  );

  expect(html).toContain("Loading");
});

test("SkillOverridesField renders without error when given override values", () => {
  vi.mocked(api.fetchSkills).mockReturnValue(new Promise(() => {}));
  const overrides = { colorize: "off", animate: "name-only" };
  const html = renderToStaticMarkup(
    <SkillOverridesField value={overrides} onChange={() => undefined} />,
  );

  expect(html).toContain("Loading");
  expect(html).toContain("Fields");
  expect(html).toContain("JSON");
});

test("toggle select calls onChange with updated overrides", async () => {
  vi.mocked(api.fetchSkills).mockResolvedValue({
    skills: [
      { name: "colorize", label: "Colorize", value: "colorize" },
      { name: "animate", label: "Animate", value: "animate" },
    ],
  });

  const handleChange = vi.fn();
  render(<SkillOverridesField value={undefined} onChange={handleChange} />);

  await waitFor(() => {
    expect(screen.getByLabelText("Override for colorize")).toBeTruthy();
  });

  fireEvent.change(screen.getByLabelText("Override for colorize"), {
    target: { value: "off" },
  });

  expect(handleChange).toHaveBeenCalledWith({ colorize: "off" });
});
