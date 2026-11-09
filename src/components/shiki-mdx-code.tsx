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
        langs: ["mdx", "tsx", "typescript", "javascript", "json", "yaml"],
      }),
    );
  }
  return highlighterPromise;
}

export const ShikiMdxCode: React.FC<{ code: string }> = ({ code }) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let alive = true;

    getHighlighter()
      .then((hl) => {
        if (!alive) return;
        const out = hl.codeToHtml(code, {
          lang: "mdx",
          theme: "one-dark-pro",
        });
        if (alive) setHtml(out);
      })
      .catch(() => {
        if (alive) setHtml("");
      });

    return () => {
      alive = false;
    };
  }, [code]);

  if (html) {
    return (
      <div
        className="w-full max-w-full overflow-hidden px-4 py-3 font-mono text-[12.5px] leading-[1.7] 
             [&_pre.shiki]:whitespace-pre-wrap! [&_pre.shiki]:break-all! [&_pre.shiki]:w-full! [&_pre.shiki]:max-w-full!
             [&_code]:whitespace-pre-wrap! [&_code]:break-all!
             [&_.shiki]:bg-transparent! [&_span]:px-0! [&_span]:break-all!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <pre className="p-5 font-mono text-[12.5px] leading-[1.7] text-neutral-300 [&_.shiki]:bg-transparent! min-w-full w-max">
      {code || "// Nothing to save yet"}
    </pre>
  );
};
