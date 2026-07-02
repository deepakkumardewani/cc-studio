import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { File } from "./routes/File";
import { Layout } from "./routes/Layout";
import { List } from "./routes/List";
import { Settings } from "./routes/Settings";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <List /> },
      { path: "settings", element: <Settings /> },
      { path: ":segment/*", element: <File /> },
      { path: ":segment", element: <File /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
