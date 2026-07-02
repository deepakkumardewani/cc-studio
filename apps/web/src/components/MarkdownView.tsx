import { isValidElement, useEffect, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { highlightCode } from "../lib/markdown";

type CodeProps = {
  className?: string;
  children?: ReactNode;
};

function CodeBlock({ className, children }: CodeProps) {
  const code = String(children ?? "").replace(/\n$/, "");
  const language = className?.replace("language-", "") ?? "plaintext";
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    highlightCode(code, language)
      .then((result) => {
        if (!cancelled) {
          setHtml(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHtml(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-stone-950 p-4 text-sm text-stone-100">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-lg [&_pre]:m-0 [&_pre]:bg-stone-950 [&_pre]:p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function markdownCode(props: CodeProps) {
  const { className, children } = props;
  const isBlock = Boolean(className) || (typeof children === "string" && children.includes("\n"));

  if (isBlock) {
    return <CodeBlock className={className}>{children}</CodeBlock>;
  }

  return (
    <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm text-stone-800">{children}</code>
  );
}

type MarkdownViewProps = {
  content: string;
};

export function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <article className="markdown-view space-y-4 text-stone-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 text-2xl font-semibold tracking-tight text-stone-900">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-xl font-semibold text-stone-900">{children}</h3>
          ),
          p: ({ children }) => <p className="leading-7 text-stone-700">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-2 pl-6 text-stone-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-6 text-stone-700">{children}</ol>
          ),
          li: ({ children }) => {
            const childList = Array.isArray(children) ? children : [children];
            const hasTask = childList.some((child) => {
              if (!isValidElement<{ type?: string }>(child)) {
                return false;
              }
              return child.props.type === "checkbox";
            });
            return (
              <li className={hasTask ? "list-none -ml-6 flex items-start gap-2" : undefined}>
                {children}
              </li>
            );
          },
          input: ({ type, checked, disabled }) =>
            type === "checkbox" ? (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                readOnly
                className="mt-1 h-4 w-4 rounded border-stone-300"
              />
            ) : null,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-stone-200 bg-stone-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-stone-900">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-t border-stone-200 px-4 py-3 text-stone-700">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-stone-300 pl-4 italic text-stone-600">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-4"
            >
              {children}
            </a>
          ),
          code: markdownCode,
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
