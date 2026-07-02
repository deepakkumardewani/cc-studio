import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vite-plus/test";
import { List } from "./List";

test("List renders loading state", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <List />
    </MemoryRouter>,
  );
  expect(html).toContain("Loading config types");
});
