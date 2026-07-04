import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { SkillHeader } from "./SkillHeader";

test("SkillHeader renders title, description, and chips from frontmatter data", () => {
  const html = renderToStaticMarkup(
    <SkillHeader
      data={{
        name: "colorize",
        description: "Add strategic color to monochromatic interfaces.",
        "user-invocable": "true",
        "argument-hint": '"[target]"',
      }}
    />,
  );

  expect(html).toContain("colorize");
  expect(html).toContain("Add strategic color to monochromatic interfaces.");
  expect(html).toContain("User invocable");
  expect(html).toContain("Argument hint");
  expect(html).toContain("[target]");
});

test("SkillHeader uses fallbackTitle when frontmatter has no name", () => {
  const html = renderToStaticMarkup(
    <SkillHeader
      data={{ description: "Runs a phased build loop." }}
      fallbackTitle="Build Phases"
    />,
  );

  expect(html).toContain("Build Phases");
  expect(html).not.toContain("Untitled skill");
});

test("SkillHeader renders a badge next to the title when provided", () => {
  const html = renderToStaticMarkup(
    <SkillHeader data={{ name: "my-plugin" }} badge={<span>View only</span>} />,
  );

  expect(html).toContain("View only");
});
