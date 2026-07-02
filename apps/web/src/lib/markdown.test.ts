import { expect, test } from "vite-plus/test";
import { shikiThemeFor } from "./markdown";

test("shikiThemeFor maps app theme to shiki theme", () => {
  expect(shikiThemeFor("light")).toBe("github-light");
  expect(shikiThemeFor("dark")).toBe("github-dark");
});
