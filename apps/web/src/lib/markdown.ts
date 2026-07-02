import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light"],
      langs: ["javascript", "typescript", "bash", "json", "markdown", "plaintext"],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, language: string): Promise<string> {
  const highlighter = await getHighlighter();
  const lang = highlighter.getLoadedLanguages().includes(language as never)
    ? language
    : "plaintext";
  return highlighter.codeToHtml(code, {
    lang,
    theme: "github-light",
  });
}
