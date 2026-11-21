"use client";

import React, { useEffect, useState } from "react";

type Highlighter = Awaited<
  ReturnType<(typeof import("shiki"))["createHighlighter"]>
>;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: ["one-dark-pro"],
        langs: ["markdown", "mdx", "typescript", "bash", "json"],
      }),
    );
  }
  return highlighterPromise;
}

interface ShikiDiffLineProps {
  code: string;
  lang?: string;
  type: "added" | "removed" | "unchanged";
  oldLineNumber?: number;
  newLineNumber?: number;
  className?: string;
}

/**
 * Low-level Shiki-highlighted single line for diff rendering without
 * the heavy container chrome, tabs, or copy buttons of CodeBlock.
 */
export const ShikiDiffLine: React.FC<ShikiDiffLineProps> = ({
  code,
  lang = "markdown",
  type,
  oldLineNumber,
  newLineNumber,
  className,
}) => {
  const [tokensHtml, setTokensHtml] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const safeCode = code || " ";

    getHighlighter()
      .then((hl) => {
        if (!alive) return;
        try {
          const rawHtml = hl.codeToHtml(safeCode, {
            lang,
            theme: "one-dark-pro",
          });
          // Extract the inner tokens from <pre ...><code>...</code></pre>
          const match = rawHtml.match(/<code>([\s\S]*?)<\/code>/);
          if (alive) {
            setTokensHtml(match ? match[1] : safeCode);
          }
        } catch {
          if (alive) setTokensHtml(safeCode);
        }
      })
      .catch(() => {
        if (alive) setTokensHtml(safeCode);
      });

    return () => {
      alive = false;
    };
  }, [code, lang]);

  const symbol = type === "added" ? "+" : type === "removed" ? "-" : " ";

  const lineNumber =
    type === "removed"
      ? oldLineNumber
      : type === "added"
        ? newLineNumber
        : (newLineNumber ?? oldLineNumber);

  return (
    <div
      className={`group flex items-start text-xs font-mono select-text transition-colors leading-[1.65] ${
        type === "added"
          ? "bg-emerald-500/15 text-emerald-200 border-l-2 border-emerald-500"
          : type === "removed"
            ? "bg-red-500/15 text-red-300 border-l-2 border-red-500 line-through opacity-85"
            : "hover:bg-white/2 text-neutral-300 border-l-2 border-transparent"
      } ${className || ""}`}
    >
      {/* Diff symbol (+ / -) */}
      <span
        className={`w-5 shrink-0 text-center select-none font-bold ${
          type === "added"
            ? "text-emerald-400"
            : type === "removed"
              ? "text-red-400"
              : "text-neutral-600"
        }`}
      >
        {symbol}
      </span>

      {/* Single unified line number */}
      <span className="w-8 shrink-0 text-right pr-3 text-neutral-600 select-none">
        {lineNumber ?? ""}
      </span>

      {/* Syntax-highlighted code content */}
      <div className="flex-1 min-w-0 pr-4 whitespace-pre-wrap break-all overflow-hidden [&_.shiki]:bg-transparent! [&_pre]:bg-transparent! [&_code]:bg-transparent!">
        {tokensHtml ? (
          <span dangerouslySetInnerHTML={{ __html: tokensHtml }} />
        ) : (
          <span>{code || " "}</span>
        )}
      </div>
    </div>
  );
};
