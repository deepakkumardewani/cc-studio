import { createHighlighter, type Highlighter } from "shiki";
import type { Theme } from "./theme";

export type ShikiTheme = "github-light" | "github-dark";

let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["javascript", "typescript", "bash", "json", "markdown", "plaintext", "css"],
    });
  }
  return highlighterPromise;
}

export function shikiThemeFor(appTheme: Theme): ShikiTheme {
  return appTheme === "dark" ? "github-dark" : "github-light";
}

export async function highlightCode(
  code: string,
  language: string,
  theme: ShikiTheme,
): Promise<string> {
  const highlighter = await getHighlighter();
  const lang = highlighter.getLoadedLanguages().includes(language as never)
    ? language
    : "plaintext";
  return highlighter.codeToHtml(code, {
    lang,
    theme,
  });
}
