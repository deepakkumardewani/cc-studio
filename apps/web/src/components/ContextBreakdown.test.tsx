import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { ContextBreakdown } from "./ContextBreakdown";

const breakdown = [
  { category: "System Prompt", tokens: 5000, percentage: 50 },
  { category: "Tools", tokens: 5000, percentage: 50 },
];

test("renders total tokens", () => {
  const html = renderToStaticMarkup(
    <ContextBreakdown
      breakdown={breakdown}
      total={10000}
      onRefresh={() => {}}
      refreshing={false}
    />,
  );
  expect(html).toContain("10,000");
  expect(html).toContain("System Prompt");
  expect(html).toContain("Tools");
});

test("renders refresh button", () => {
  const html = renderToStaticMarkup(
    <ContextBreakdown
      breakdown={breakdown}
      total={10000}
      onRefresh={() => {}}
      refreshing={false}
    />,
  );
  expect(html).toContain("Refresh");
});

test("shows refreshing label when refreshing", () => {
  const html = renderToStaticMarkup(
    <ContextBreakdown breakdown={breakdown} total={10000} onRefresh={() => {}} refreshing={true} />,
  );
  expect(html).toContain("Refreshing");
});
