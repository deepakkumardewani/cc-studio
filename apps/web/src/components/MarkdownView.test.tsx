import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { MarkdownView } from "./MarkdownView";
import { ThemeProvider } from "../lib/theme";

const sampleMarkdown = `# Demo

| Column | Value |
| --- | --- |
| Name | cc-studio |

\`\`\`typescript
const greeting = "hello";
\`\`\`

- [x] Done task
- [ ] Pending task
`;

test("MarkdownView renders GFM table and code block", () => {
  const html = renderToStaticMarkup(
    <ThemeProvider>
      <MarkdownView content={sampleMarkdown} />
    </ThemeProvider>,
  );

  expect(html).toContain("<table");
  expect(html).toContain("Column");
  expect(html).toContain("<pre");
  expect(html).toContain("const greeting");
  expect(html).toContain('type="checkbox"');
  expect(html).toContain("text-text-muted");
  expect(html).toContain("text-text");
});

test("MarkdownView applies token classes to prose elements", () => {
  const proseSample = "> Quote\n\n[Link](https://example.com)\n\n`inline`";
  const html = renderToStaticMarkup(
    <ThemeProvider>
      <MarkdownView content={proseSample} />
    </ThemeProvider>,
  );

  expect(html).toContain("text-accent");
  expect(html).toContain("ring-border-subtle");
  expect(html).toContain("bg-surface-raised");
});
