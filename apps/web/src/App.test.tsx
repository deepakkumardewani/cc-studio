import { expect, test } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App";

test("App renders cc-studio heading", () => {
  const html = renderToStaticMarkup(<App />);
  expect(html).toContain("cc-studio");
  expect(html).toContain("Claude Config Tool");
});
