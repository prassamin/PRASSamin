"use client";

import React, { useMemo } from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { cn } from "@heroui/react";

function parseHighlightLines(highlightStr?: string): Set<number> {
  const set = new Set<number>();
  if (!highlightStr) return set;
  const parts = String(highlightStr).replace(/[{}]/g, "").split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          set.add(i);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) {
        set.add(num);
      }
    }
  }
  return set;
}

function addClassToHast(node: any, className: string) {
  if (!className) return node;
  if (!node.properties) node.properties = {};

  let currentClasses: string[] = [];
  const raw = node.properties.className || node.properties.class;
  if (Array.isArray(raw)) {
    currentClasses = [...raw];
  } else if (typeof raw === "string") {
    currentClasses = raw.split(/\s+/g).filter(Boolean);
  }

  // Ensure "line" is ALWAYS preserved so line numbers & gutters never break
  if (!currentClasses.includes("line")) {
    currentClasses.unshift("line");
  }

  const targets = className.split(/\s+/g).filter(Boolean);
  for (const c of targets) {
    if (!currentClasses.includes(c)) {
      currentClasses.push(c);
    }
  }

  node.properties.className = currentClasses;
  node.properties.class = currentClasses.join(" ");
  return node;
}

function stripNotationFromLine(node: any) {
  let fullText = "";
  const tokenLengths: { node: any; start: number; len: number }[] = [];

  function collect(n: any) {
    if (n.type === "text" && typeof n.value === "string") {
      tokenLengths.push({
        node: n,
        start: fullText.length,
        len: n.value.length,
      });
      fullText += n.value;
    }
    if (Array.isArray(n.children)) {
      n.children.forEach(collect);
    }
  }
  collect(node);

  const match = fullText.match(
    /\s*(?:\/\/|--|#|\/\*|<!--|\{\/\*)\s*\[!code\s+[^\]]+\](?:\s*\*\/|-->|\*\/\}|\s*)?$/,
  );
  if (!match || match.index === undefined) return;

  const cutIndex = match.index;

  for (const item of tokenLengths) {
    const itemEnd = item.start + item.len;
    if (item.start >= cutIndex) {
      item.node.value = "";
    } else if (itemEnd > cutIndex) {
      item.node.value = item.node.value.slice(0, cutIndex - item.start);
    }
  }

  function prune(n: any) {
    if (Array.isArray(n.children)) {
      n.children = n.children.filter((c: any) => {
        if (c.type === "text" && c.value === "") return false;
        if (
          c.type === "element" &&
          Array.isArray(c.children) &&
          c.children.length === 0
        )
          return false;
        return true;
      });
      n.children.forEach(prune);
    }
  }
  prune(node);
}

function wrapWordInLine(node: any, targetWord: string) {
  if (!targetWord) return;
  if (Array.isArray(node.children)) {
    const newChildren: any[] = [];
    for (const child of node.children) {
      if (child.type === "element" && child.children) {
        wrapWordInLine(child, targetWord);
        newChildren.push(child);
      } else if (
        child.type === "text" &&
        child.value &&
        child.value.includes(targetWord)
      ) {
        const parts = child.value.split(targetWord);
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) newChildren.push({ type: "text", value: parts[i] });
          if (i < parts.length - 1) {
            newChildren.push({
              type: "element",
              tagName: "span",
              properties: {
                class: ["highlighted-word"],
                className: ["highlighted-word"],
              },
              children: [{ type: "text", value: targetWord }],
            });
          }
        }
      } else {
        newChildren.push(child);
      }
    }
    node.children = newChildren;
  }
}

function extractTextFromChildren(children: any): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (children && typeof children === "object" && children.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}

export const MdxCodeBlock = (props: any) => {
  const codeChild = React.isValidElement(props.children)
    ? (props.children as React.ReactElement<any>)
    : null;

  // If there's no <code> child, or already marked as pre-rendered by Fumadocs server loader
  if (!codeChild || props["data-pre-rendered"]) {
    return (
      <CodeBlock title={props.title || props["data-title"]} {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    );
  }

  const codeProps: any = codeChild.props || {};
  const rawCode = extractTextFromChildren(codeProps.children) || "";

  // If children are already rich react elements (like Shiki spans), don't re-highlight
  if (!rawCode && codeProps.children) {
    return (
      <CodeBlock title={props.title || props["data-title"]} {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    );
  }

  const match = (codeProps.className || "").match(/language-([^\s]+)/);
  const lang = match ? match[1] : props.lang || "typescript";
  const title =
    props.title ||
    props["data-title"] ||
    codeProps.title ||
    codeProps["data-title"] ||
    undefined;

  const showLineNumbers = Boolean(
    props["data-line-numbers"] === "true" ||
    props["data-line-numbers"] === true ||
    codeProps["data-line-numbers"] === "true" ||
    codeProps["data-line-numbers"] === true,
  );

  const wrap = Boolean(
    props["data-wrap"] === "true" ||
    props["data-wrap"] === true ||
    codeProps["data-wrap"] === "true" ||
    codeProps["data-wrap"] === true,
  );

  const highlightStr =
    props["data-highlight"] || codeProps["data-highlight"] || "";

  const transformers = useMemo(() => {
    let codeHasFocus = false;

    const list: any[] = [
      {
        name: "universal-shiki-notation",
        line(node: any) {
          let fullText = "";
          function collect(n: any) {
            if (n.type === "text") fullText += n.value;
            if (Array.isArray(n.children)) n.children.forEach(collect);
          }
          collect(node);

          const match = fullText.match(/[/#<!*-\s]*\[!code\s+([^\]]+)\]/);
          if (!match) return;

          const action = match[1].trim();

          if (action === "highlight") {
            addClassToHast(node, "highlighted");
          } else if (action === "++") {
            addClassToHast(node, "diff add");
          } else if (action === "--") {
            addClassToHast(node, "diff remove");
          } else if (action === "focus") {
            codeHasFocus = true;
            addClassToHast(node, "focused");
          } else if (action === "error") {
            addClassToHast(node, "highlighted error");
          } else if (action === "warning") {
            addClassToHast(node, "highlighted warning");
          } else if (action.startsWith("word:")) {
            const word = action.slice(5).trim();
            wrapWordInLine(node, word);
          }

          stripNotationFromLine(node);
        },
        root(rootNode: any) {
          if (codeHasFocus) {
            const preNode =
              rootNode.children?.find?.((c: any) => c.tagName === "pre") ||
              rootNode;
            addClassToHast(preNode, "has-focused");
          }
        },
      },
    ];

    const highlightSet = parseHighlightLines(highlightStr);
    if (highlightSet.size > 0) {
      list.push({
        name: "highlight-lines",
        line(node: any, line: number) {
          if (highlightSet.has(line)) {
            addClassToHast(node, "highlighted");
          }
        },
      });
    }

    return list;
  }, [highlightStr]);

  return (
    <DynamicCodeBlock
      lang={lang}
      code={rawCode.replace(/\n$/, "")}
      options={
        {
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          transformers,
          components: {
            pre: (preProps: any) => (
              <CodeBlock
                title={title}
                data-line-numbers={showLineNumbers ? true : undefined}
              >
                <Pre
                  {...preProps}
                  data-line-numbers={showLineNumbers ? "true" : undefined}
                  className={cn(
                    // Critical: Force block display on code & line spans to prevent inline collapse/wrapping bugs
                    "[&>code]:!block [&>code]:!w-full",
                    "[&_.line]:!block [&_.line]:!w-full [&_.line]:!relative [&_.line]:!min-h-[1.5em]",
                    // Wrapping control per line
                    wrap
                      ? "!min-w-full !w-full !whitespace-pre-wrap !break-words [&_.line]:!whitespace-pre-wrap [&_.line]:!break-words"
                      : "!min-w-full !w-max !whitespace-pre !break-normal [&_.line]:!whitespace-pre [&_.line]:!break-normal",
                    // Non-numbered line padding & diff positioning
                    "not-data-[line-numbers=true]:[&_.line]:!pl-4",
                    "not-data-[line-numbers=true]:[&_.line.diff]:!pl-8",
                    "not-data-[line-numbers=true]:[&_.line.diff::before]:!left-2.5",
                    // Numbered line padding, counter & diff positioning
                    "data-[line-numbers=true]:[&_.line]:!pl-14",
                    "data-[line-numbers=true]:[&_.line::after]:!left-4 data-[line-numbers=true]:[&_.line::after]:!w-7 data-[line-numbers=true]:[&_.line::after]:!text-right",
                    "data-[line-numbers=true]:[&_.line.diff::before]:!left-2",
                    // Custom state styling
                    "[&_.line.error]:!bg-red-500/15 [&_.line.error]:!border-l-2 [&_.line.error]:!border-red-500",
                    "[&_.line.warning]:!bg-amber-500/15 [&_.line.warning]:!border-l-2 [&_.line.warning]:!border-amber-500",
                    preProps.className,
                  )}
                >
                  {preProps.children}
                </Pre>
              </CodeBlock>
            ),
          },
        } as any
      }
    />
  );
};

export default MdxCodeBlock;
