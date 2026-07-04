import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vite-plus/test";
import { ThemeProvider } from "../lib/theme";
import { Layout } from "./Layout";

function renderLayout(path: string) {
  return renderToStaticMarkup(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Layout />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

test("Layout on home route omits the sidebar aside", () => {
  const html = renderLayout("/");
  expect(html).not.toContain("<aside");
});

test("Layout on non-home route renders the sidebar aside", () => {
  const html = renderLayout("/settings");
  expect(html).toContain("<aside");
});
