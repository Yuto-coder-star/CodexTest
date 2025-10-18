"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getHighlighter, type Highlighter } from "shiki";
import clsx from "clsx";

let highlighterPromise: Promise<Highlighter> | null = null;

const loadHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = getHighlighter({
      themes: ["github-light"],
      langs: [
        "javascript",
        "typescript",
        "tsx",
        "jsx",
        "json",
        "bash",
        "python",
        "html",
        "css",
        "markdown",
      ],
    });
  }
  return highlighterPromise;
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      className="absolute right-3 top-3 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
    >
      {copied ? "コピー済み" : "コピー"}
    </button>
  );
}

function CodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children: React.ReactNode[];
}) {
  const text = useMemo(() => String(children).replace(/\n$/, ""), [children]);
  const language = useMemo(() => className?.replace(/language-/, "") ?? "plaintext", [className]);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (inline) return;
    loadHighlighter()
      .then((highlighter) => {
        const highlighted = highlighter.codeToHtml(text, {
          lang: language,
          theme: "github-light",
        });
        setHtml(highlighted);
      })
      .catch((error) => console.error("Failed to load highlighter", error));
  }, [inline, language, text]);

  if (inline) {
    return (
      <code className={clsx("rounded-md bg-gray-100 px-1.5 py-0.5 text-sm text-gray-900", className)} {...props}>
        {text}
      </code>
    );
  }

  return (
    <div className="relative group my-4 overflow-hidden rounded-xl border border-gray-200 bg-white text-sm shadow-sm">
      <CopyButton value={text} />
      {html ? (
        <div
          className="overflow-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-auto bg-gray-900 p-4 text-white">{text}</pre>
      )}
    </div>
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      className="prose prose-slate max-w-none text-[15px] leading-relaxed prose-headings:text-gray-900 prose-p:my-3 prose-a:text-blue-600 prose-strong:text-gray-900"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code: CodeBlock as never,
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
