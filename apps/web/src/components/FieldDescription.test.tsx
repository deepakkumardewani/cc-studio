// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test } from "vite-plus/test";
import { FieldDescription } from "./FieldDescription";

test("renders plain text without links", () => {
  render(<FieldDescription text="Enable extended thinking by default." />);
  expect(screen.getByText("Enable extended thinking by default.")).toBeTruthy();
});

test("renders clickable links in description text", () => {
  render(
    <FieldDescription text="See https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files for details." />,
  );

  const link = screen.getByRole("link", {
    name: "https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files",
  });
  expect(link.getAttribute("href")).toBe(
    "https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files",
  );
  expect(link.getAttribute("target")).toBe("_blank");
});
