import { expect, test } from "vite-plus/test";
import { highlightCode, shikiThemeFor } from "./markdown";

test("shikiThemeFor maps app theme to shiki theme", () => {
  expect(shikiThemeFor("light")).toBe("github-light");
  expect(shikiThemeFor("dark")).toBe("github-dark");
});

test("highlightCode returns themed HTML for light and dark", async () => {
  const code = 'const theme = "dark";';

  const lightHtml = await highlightCode(code, "typescript", "github-light");
  const darkHtml = await highlightCode(code, "typescript", "github-dark");

  expect(lightHtml).toContain("<pre");
  expect(lightHtml).toContain("theme");
  expect(darkHtml).toContain("<pre");
  expect(darkHtml).toContain("theme");
  expect(lightHtml).not.toBe(darkHtml);
});
