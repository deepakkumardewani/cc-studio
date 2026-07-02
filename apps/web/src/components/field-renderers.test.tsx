import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { ReadOnlyField, ToggleField } from "./field-renderers";

test("boolean field renders as toggle", () => {
  const html = renderToStaticMarkup(
    <ReadOnlyField
      field={{
        key: "alwaysThinkingEnabled",
        label: "Always Thinking Enabled",
        description: "Enable extended thinking by default.",
        control: "toggle",
        group: "General",
      }}
      value={true}
    />,
  );

  expect(html).toContain('type="checkbox"');
  expect(html).toContain("checked");
  expect(html).toContain("Always Thinking Enabled");
});

test("enum field renders as select", () => {
  const html = renderToStaticMarkup(
    <ReadOnlyField
      field={{
        key: "effortLevel",
        label: "Effort Level",
        description: "Persist adaptive reasoning effort across sessions.",
        control: "select",
        group: "General",
        options: [
          { value: "low", label: "low" },
          { value: "high", label: "high" },
        ],
      }}
      value="high"
    />,
  );

  expect(html).toContain("<select");
  expect(html).toContain('value="high"');
  expect(html).toContain("Effort Level");
});

test("inline error uses danger styling", () => {
  const html = renderToStaticMarkup(
    <ToggleField
      id="setting-alwaysThinkingEnabled"
      label="Always Thinking Enabled"
      description="Enable extended thinking by default."
      value={false}
      error="Invalid value"
    />,
  );

  expect(html).toContain("text-danger");
  expect(html).toContain("Invalid value");
});
