import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { CategorySection } from "./CategorySection";

test("CategorySection renders with category name and item count", () => {
  const html = renderToStaticMarkup(
    <CategorySection
      categoryName="Memory files"
      itemCount={3}
      items={[
        { name: "file1.md", tokens: 100 },
        { name: "file2.md", tokens: 200 },
        { name: "file3.md", tokens: 300 },
      ]}
    />,
  );

  expect(html).toContain("Memory files");
  expect(html).toContain("(3)");
});

test("CategorySection renders expandable button", () => {
  const html = renderToStaticMarkup(
    <CategorySection
      categoryName="Skills"
      itemCount={2}
      items={[
        { name: "javascript-analysis", tokens: 5000 },
        { name: "react-optimization", tokens: 3500 },
      ]}
    />,
  );

  expect(html).toContain("Skills");
  expect(html).toContain("button");
});

test("CategorySection handles empty items gracefully", () => {
  const html = renderToStaticMarkup(
    <CategorySection categoryName="Empty Category" itemCount={0} items={[]} />,
  );

  expect(html).toContain("Empty Category");
  expect(html).toContain("(0)");
});

test("CategorySection renders with aria-expanded attribute", () => {
  const html = renderToStaticMarkup(
    <CategorySection
      categoryName="System Prompt"
      itemCount={1}
      items={[{ name: "system-prompt.md", tokens: 5000 }]}
    />,
  );

  expect(html).toContain('aria-expanded="false"');
});
