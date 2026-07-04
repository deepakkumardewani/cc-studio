// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test } from "vite-plus/test";
import { HighlightText } from "./HighlightText";

test("highlights matching query text", () => {
  render(<HighlightText text="Auto Memory Enabled" query="memory" />);
  expect(screen.getByText("Memory")).toBeTruthy();
});

test("renders plain text when query is empty", () => {
  render(<HighlightText text="Auto Memory Enabled" query="" />);
  expect(screen.getByText("Auto Memory Enabled")).toBeTruthy();
});
