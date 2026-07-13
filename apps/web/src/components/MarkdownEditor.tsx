import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { useTheme } from "../lib/theme";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const markdownExtensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
];

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "0.875rem",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    lineHeight: "1.625",
    overflow: "auto",
  },
  ".cm-content": {
    padding: "1rem 0",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
  },
  "&.cm-focused": {
    outline: "none",
  },
});

export function MarkdownEditor({ value, onChange, disabled }: MarkdownEditorProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`h-full min-h-0 bg-surface-raised ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={theme === "dark" ? githubDark : githubLight}
        extensions={[...markdownExtensions, editorTheme]}
        onChange={onChange}
        editable={!disabled}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          bracketMatching: true,
          autocompletion: false,
        }}
        aria-label="Markdown editor"
        className="h-full [&_.cm-editor]:h-full"
      />
    </div>
  );
}
