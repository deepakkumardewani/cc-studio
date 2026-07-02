import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { MarkdownView } from "./MarkdownView";

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
  const html = renderToStaticMarkup(<MarkdownView content={sampleMarkdown} />);

  expect(html).toContain("<table");
  expect(html).toContain("Column");
  expect(html).toContain("<pre");
  expect(html).toContain("const greeting");
  expect(html).toContain('type="checkbox"');
});
