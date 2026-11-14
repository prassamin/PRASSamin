"use client";

import React, {
  createContext,
  use,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useShiki } from "fumadocs-core/highlight/client";
import * as Primitive from "@radix-ui/react-tabs";
import { LuCopy, LuCheck } from "react-icons/lu";
import { cn } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { EXT_STACKS } from "@/lib/stacks";

/* ────────────────────────────────────────────────────────────────
 * Context for Tabs
 * ──────────────────────────────────────────────────────────────── */

export const CodeBlockTabsContext = createContext<{
  containerRef: RefObject<HTMLElement | null>;
  nested: boolean;
  /** Currently active tab value (mirrors Radix state). */
  active: string | null;
  /** Unique id for this tabs group (used for layoutId). */
  uid: string;
} | null>(null);

/* ────────────────────────────────────────────────────────────────
 * Props Interface
 * ──────────────────────────────────────────────────────────────── */

export interface CodeBlockProps extends Omit<
  ComponentProps<"figure">,
  "title"
> {
  title?: ReactNode;
  filename?: string;
  lang?: string;
  code?: string;
  icon?: ReactNode;
  allowCopy?: boolean | "true" | "false";
  viewportProps?: HTMLAttributes<HTMLElement>;
  "data-line-numbers"?: boolean | string;
  "data-line-numbers-start"?: number | string;
  "data-title"?: string;
  "data-filename"?: string;
  "data-pre-rendered"?: boolean | string;
  "data-wrap"?: boolean | string;
  "data-highlight"?: string;
  showLineNumbers?: boolean;
  highlightLines?: string;
  wrap?: boolean;
  Actions?: (props: { className?: string; children?: ReactNode }) => ReactNode;
  children?: ReactNode;
  [key: `data-${string}`]: any;
}

/* ────────────────────────────────────────────────────────────────
 * Icon & Badge Helpers
 * ──────────────────────────────────────────────────────────────── */

const CONFIG_FILE_STACK: Record<string, string> = {
  "next.config.js": "Nextjs",
  "next.config.ts": "Nextjs",
  "next.config.mjs": "Nextjs",
  "tailwind.config.js": "Tailwindcss",
  "tailwind.config.ts": "Tailwindcss",
  "tailwind.config.cjs": "Tailwindcss",
  "tailwind.config.mjs": "Tailwindcss",
  "vite.config.ts": "Vitejs",
  "vite.config.js": "Vitejs",
  "vite.config.mjs": "Vitejs",
  "eslint.config.mjs": "Eslint",
  "eslint.config.js": "Eslint",
  "eslint.config.ts": "Eslint",
  "playwright.config.ts": "Playwright",
  "playwright.config.js": "Playwright",
  "vitest.config.ts": "Vitest",
  "vitest.config.js": "Vitest",
  "jest.config.js": "Jest",
  "jest.config.ts": "Jest",
  "nuxt.config.ts": "Nuxt",
  "nuxt.config.js": "Nuxt",
  "remix.config.js": "Remix",
  "package.json": "Npm",
  "bun.lock": "Bun",
  "bun.lockb": "Bun",
  "yarn.lock": "Yarn",
  "pnpm-lock.yaml": "Pnpm",
  Dockerfile: "Docker",
  "docker-compose.yml": "Docker",
  "docker-compose.yaml": "Docker",
  "vercel.json": "Vercel",
  "turbo.json": "Turborepo",
  "turborepo.json": "Turborepo",
};

const STACK_PRIORITY = ["React"];
const ORDERED_STACK_KEYS = [
  ...STACK_PRIORITY,
  ...Object.keys(EXT_STACKS).filter((key) => !STACK_PRIORITY.includes(key)),
];

const EXT_TO_STACK = new Map<string, string>();
for (const key of ORDERED_STACK_KEYS) {
  const stack = EXT_STACKS[key as keyof typeof EXT_STACKS];
  const exts = (stack as { ext?: string[] }).ext;
  if (Array.isArray(exts)) {
    for (const ext of exts) {
      if (!EXT_TO_STACK.has(ext)) EXT_TO_STACK.set(ext, key);
    }
  }
}

function resolveFileIcon(filename?: string): React.ReactNode | undefined {
  if (!filename) return undefined;
  const base = String(filename).trim();
  const lower = base.toLowerCase();

  const configKey = CONFIG_FILE_STACK[base] || CONFIG_FILE_STACK[lower];
  const stackName = configKey || EXT_TO_STACK.get(lower.split(".").pop() ?? "");
  if (!stackName) return undefined;

  const stack = EXT_STACKS[stackName as keyof typeof EXT_STACKS];
  if (!stack) return undefined;

  const Icon = stack.icon;
  return <Icon size={14} className="grayscale opacity-85 shrink-0" />;
}

const LANG_BADGES: Record<string, string> = {
  ts: "TS",
  tsx: "TS",
  typescript: "TS",
  js: "JS",
  jsx: "JS",
  javascript: "JS",
  mjs: "JS",
  cjs: "JS",
  bash: "SH",
  sh: "SH",
  shell: "SH",
  zsh: "SH",
  json: "JSON",
  jsonc: "JSON",
  css: "CSS",
  scss: "SCSS",
  html: "HTML",
  md: "MD",
  mdx: "MDX",
  py: "PY",
  python: "PY",
  rs: "RS",
  rust: "RS",
  go: "GO",
  sql: "SQL",
  prisma: "PR",
  yaml: "YML",
  yml: "YML",
  toml: "TOML",
  docker: "DOCKER",
  dockerfile: "DOCKER",
};

function resolveBadgeText(lang?: string, filename?: string): string {
  const cleanLang = (lang || "").toLowerCase();
  if (LANG_BADGES[cleanLang]) return LANG_BADGES[cleanLang];

  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (LANG_BADGES[ext]) return LANG_BADGES[ext];
    if (ext.length > 0 && ext.length <= 4) return ext.toUpperCase();
  }

  if (cleanLang.length > 0 && cleanLang.length <= 4) {
    return cleanLang.toUpperCase();
  }
  return "CODE";
}

function getLangFromFilename(filename?: string): string | undefined {
  if (!filename) return undefined;
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return undefined;
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mts: "typescript",
    cts: "typescript",
    py: "python",
    rs: "rust",
    go: "go",
    json: "json",
    jsonc: "json",
    html: "html",
    css: "css",
    scss: "scss",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    mdx: "mdx",
    sql: "sql",
  };
  return map[ext] || ext;
}

function extractTextFromChildren(children: any): string {
  if (children == null) return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (children && typeof children === "object" && children.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}

function cleanCodeForCopy(text: string): string {
  return text
    .replace(
      /\s*(?:\/\/|--|#|\/\*|<!--|\{\/\*)\s*\[!code\s+[^\]]+\](?:\s*\*\/|-->|\*\/\}|\s*)?$/gm,
      "",
    )
    .trimEnd();
}

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

/* ────────────────────────────────────────────────────────────────
 * Pre Component
 * ──────────────────────────────────────────────────────────────── */

export function Pre(props: ComponentProps<"pre">) {
  return (
    <pre
      {...props}
      className={cn(
        "min-w-full w-max *:flex *:flex-col font-mono text-[13px] leading-relaxed whitespace-normal! [&_code]:whitespace-normal! [&_.line]:whitespace-pre!",
        "[&_code]:bg-transparent! [&_code]:p-0! [&_code]:border-0! [&_code]:rounded-none! [&_code]:text-inherit!",
        "[&_code::before]:content-none! [&_code::after]:content-none!",
        props.className,
      )}
    >
      {props.children}
    </pre>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Copy Button with Framer Motion Transition
 * ──────────────────────────────────────────────────────────────── */

function CopyButton({
  containerRef,
  className,
}: {
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pre =
      containerRef.current?.querySelector('[data-state="active"] pre') ||
      containerRef.current?.getElementsByTagName("pre").item(0);
    if (!pre) return;

    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
      node.replaceWith("\n");
    });

    const text = cleanCodeForCopy(clone.textContent ?? "");
    navigator.clipboard.writeText(text);

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button
      type="button"
      data-checked={copied || undefined}
      aria-label={copied ? "Copied Text" : "Copy Text"}
      onClick={handleClick}
      className={cn(
        "size-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-fd-foreground hover:bg-fd-accent/50 transition-colors cursor-pointer",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-emerald-400 flex items-center justify-center"
          >
            <LuCheck className="size-3.5" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <LuCopy className="size-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Pure Container Component (Matches Fumadocs codeblock.tsx)
 * ──────────────────────────────────────────────────────────────── */

export function CodeBlockContainer({
  title,
  icon,
  allowCopy = true,
  viewportProps = {},
  children,
  Actions = (props) => (
    <div {...props} className={cn("empty:hidden", props.className)} />
  ),
  className,
  ...props
}: CodeBlockProps) {
  const inTab = use(CodeBlockTabsContext) !== null;
  const areaRef = useRef<HTMLDivElement>(null);

  let canCopy = allowCopy;
  if (canCopy === undefined) canCopy = !inTab;
  if (canCopy === "true") canCopy = true;
  else if (canCopy === "false") canCopy = false;
  if (inTab) canCopy = false;

  return (
    <figure
      dir="ltr"
      tabIndex={-1}
      {...props}
      className={cn(
        "shiki relative outline-none not-prose text-sm",
        inTab
          ? "bg-transparent -mx-px -mb-px rounded-b-lg border-0 my-0 shadow-none"
          : cn(
              "bg-neutral-900 border border-neutral-800/60 rounded-xl",
              title ? "px-1 pb-1 my-4 overflow-hidden" : "p-1 my-4",
            ),
        className,
      )}
    >
      {/* ────────────────────────────────────────────────────────
       * Layout 0: Title is present -> Header Bar (Screenshot 0)
       * In tab mode: Title/filename and icon are NOT allowed.
       * ──────────────────────────────────────────────────────── */}
      {!inTab && title ? (
        <div className="flex text-neutral-400 items-center gap-2 h-10 px-2">
          {typeof icon === "string" ? (
            <div
              className="[&_svg]:size-3.5 flex items-center shrink-0"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          ) : (
            icon
          )}
          <figcaption className="flex-1 truncate font-mono text-xs text-neutral-400">
            {title}
          </figcaption>
          {Actions({
            className: "-me-1",
            children: canCopy && <CopyButton containerRef={areaRef} />,
          })}
        </div>
      ) : (
        /* ────────────────────────────────────────────────────────
         * Layout 1: NO Title -> Top-Right Corner Notch Tab (Screenshot 1)
         * ──────────────────────────────────────────────────────── */
        !inTab &&
        canCopy &&
        Actions({
          className:
            "absolute top-1 right-1 z-2 bg-fd-card rounded-bl-lg border-l border-b border-border text-neutral-400 flex items-center justify-center p-0.5",
          children: <CopyButton containerRef={areaRef} />,
        })
      )}

      {/* Inner Code Viewport */}
      <div
        ref={areaRef}
        role="region"
        tabIndex={0}
        {...viewportProps}
        className={cn(
          "rounded-lg bg-fd-secondary",
          inTab
            ? "text-[13px] py-3.5 overflow-auto max-h-150 fd-scroll-container focus-visible:outline-none"
            : title
              ? cn(
                  "text-[13px] py-3.5 overflow-auto max-h-150 fd-scroll-container focus-visible:outline-none",
                )
              : cn(
                  "border border-border text-[13px] py-3.5 pr-10 overflow-auto max-h-150 fd-scroll-container focus-visible:outline-none",
                ),
          viewportProps.className,
        )}
        style={
          {
            counterSet: props["data-line-numbers"]
              ? `line ${Number(props["data-line-numbers-start"] ?? 1) - 1}`
              : undefined,
            ...viewportProps.style,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Helper for Pre Classes
 * ──────────────────────────────────────────────────────────────── */

function getPreClasses(wrap: boolean, showLineNumbers: boolean) {
  return cn(
    "[&>code]:flex! [&>code]:flex-col! [&>code]:w-full!",
    "[&_.line]:block! [&_.line]:w-full! [&_.line]:relative! [&_.line]:min-h-[1.5em]!",
    wrap
      ? "min-w-full! w-full! whitespace-normal! [&>code]:whitespace-normal! [&_.line]:whitespace-pre-wrap! [&_.line]:wrap-break-word!"
      : "min-w-full! w-max! whitespace-normal! [&>code]:whitespace-normal! [&_.line]:whitespace-pre! [&_.line]:break-normal!",
    "not-data-[line-numbers=true]:[&_.line]:pl-4!",
    "not-data-[line-numbers=true]:[&_.line.diff]:pl-8!",
    "not-data-[line-numbers=true]:[&_.line.diff::before]:left-2.5!",
    showLineNumbers
      ? "data-[line-numbers=true]:[&_.line]:pl-14! data-[line-numbers=true]:[&_.line::after]:left-4! data-[line-numbers=true]:[&_.line::after]:w-7! data-[line-numbers=true]:[&_.line::after]:text-right! data-[line-numbers=true]:[&_.line.diff::before]:left-2!"
      : "",
    "[&_.line.error]:bg-red-500/15! [&_.line.error]:border-l-2! [&_.line.error]:border-red-500!",
    "[&_.line.warning]:bg-amber-500/15! [&_.line.warning]:border-l-2! [&_.line.warning]:border-amber-500!",
  );
}

/* ────────────────────────────────────────────────────────────────
 * Main CodeBlock (Full Feature-Rich Shiki Engine + Fumadocs Container)
 * ──────────────────────────────────────────────────────────────── */

export const CodeBlock: React.FC<CodeBlockProps> = (props) => {
  const codeChild = React.isValidElement(props.children)
    ? (props.children as React.ReactElement<any>)
    : null;
  const codeProps: any = codeChild?.props || {};

  const inTab = use(CodeBlockTabsContext) !== null;

  const resolvedTitle = inTab
    ? undefined
    : props.title ||
      props.filename ||
      props["data-title"] ||
      props["data-filename"] ||
      codeProps.title ||
      codeProps["data-title"] ||
      codeProps.filename ||
      codeProps["data-filename"] ||
      undefined;

  const resolvedFilename = inTab
    ? undefined
    : props.filename ||
      codeProps.filename ||
      (typeof resolvedTitle === "string" && resolvedTitle.includes(".")
        ? resolvedTitle
        : undefined);

  const fileIcon = inTab
    ? undefined
    : props.icon ||
      codeProps.icon ||
      resolveFileIcon(resolvedFilename) ||
      (resolvedFilename ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none bg-neutral-800 border border-neutral-700/80 text-neutral-300 uppercase shrink-0">
          {resolveBadgeText(props.lang || codeProps.lang, resolvedFilename)}
        </span>
      ) : undefined);

  const showLineNumbers = Boolean(
    props["data-line-numbers"] === "true" ||
    props["data-line-numbers"] === true ||
    props.showLineNumbers ||
    codeProps["data-line-numbers"] === "true" ||
    codeProps["data-line-numbers"] === true,
  );

  const wrap = Boolean(
    props["data-wrap"] === "true" ||
    props["data-wrap"] === true ||
    props.wrap ||
    codeProps["data-wrap"] === "true" ||
    codeProps["data-wrap"] === true,
  );

  const isPreRendered = Boolean(
    props["data-pre-rendered"] === true ||
    props["data-pre-rendered"] === "true" ||
    (typeof props.className === "string" &&
      props.className.includes("shiki")) ||
    (typeof codeProps?.className === "string" &&
      codeProps.className.includes("shiki")) ||
    (codeChild &&
      React.Children.toArray(codeProps.children).some((c: any) =>
        c?.props?.className?.includes?.("line"),
      )),
  );

  // If already pre-rendered by Fumadocs MDX or children are already formatted elements
  if (isPreRendered) {
    const isPreChild =
      codeChild && (codeChild.type === Pre || codeChild.type === "pre");

    return (
      <CodeBlockContainer title={resolvedTitle} icon={fileIcon} {...props}>
        {isPreChild ? (
          props.children
        ) : (
          <Pre
            data-line-numbers={showLineNumbers ? "true" : undefined}
            className={cn(
              getPreClasses(wrap, showLineNumbers),
              props.className,
            )}
          >
            {props.children}
          </Pre>
        )}
      </CodeBlockContainer>
    );
  }

  const rawCode =
    props.code ??
    (typeof props.children === "string"
      ? props.children
      : codeChild
        ? extractTextFromChildren(codeProps.children)
        : "");

  // If children are already elements without raw code
  if (!rawCode && props.children) {
    return (
      <CodeBlockContainer title={resolvedTitle} icon={fileIcon} {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlockContainer>
    );
  }

  const match = (codeProps.className || props.className || "").match(
    /language-([^\s]+)/,
  );
  const lang =
    props.lang ||
    codeProps.lang ||
    (match ? match[1] : undefined) ||
    getLangFromFilename(resolvedFilename) ||
    "bash";
  const title = resolvedTitle;

  const highlightStr =
    props["data-highlight"] ||
    props.highlightLines ||
    codeProps["data-highlight"] ||
    "";

  // Shiki AST Transformers
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

          const notationMatch = fullText.match(
            /[/#<!*-\s]*\[!code\s+([^\]]+)\]/,
          );
          if (!notationMatch) return;

          const action = notationMatch[1].trim();

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
          const stripStrayNewlines = (node: any) => {
            if (node.tagName === "pre" || node.tagName === "code") {
              if (Array.isArray(node.children)) {
                node.children = node.children.filter(
                  (child: any) =>
                    !(
                      child.type === "text" &&
                      typeof child.value === "string" &&
                      /^\s*$/.test(child.value)
                    ),
                );
                node.children.forEach(stripStrayNewlines);
              }
            }
          };
          stripStrayNewlines(rootNode);

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

  const cleanCode = rawCode.replace(/\n$/, "");

  // Fast loading preview
  const loading = useMemo(() => {
    return (
      <CodeBlockContainer title={title} icon={fileIcon} {...props}>
        <Pre
          data-line-numbers={showLineNumbers ? "true" : undefined}
          className={getPreClasses(wrap, showLineNumbers)}
        >
          <code>
            {cleanCode.split("\n").map((line: string, i: number) => (
              <span key={i} className="line">
                {line || "\n"}
              </span>
            ))}
          </code>
        </Pre>
      </CodeBlockContainer>
    );
  }, [title, fileIcon, cleanCode, showLineNumbers, wrap, props]);

  return useShiki(cleanCode, {
    lang,
    loading,
    withPrerenderScript: true,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    transformers,
    components: {
      pre: (preProps: any) => (
        <CodeBlockContainer title={title} icon={fileIcon} {...props}>
          <Pre
            {...preProps}
            data-line-numbers={showLineNumbers ? "true" : undefined}
            className={cn(
              getPreClasses(wrap, showLineNumbers),
              preProps.className,
            )}
          >
            {preProps.children}
          </Pre>
        </CodeBlockContainer>
      ),
    },
  });
};

/* ────────────────────────────────────────────────────────────────
 * CodeBlock Tabs Components (Custom Implementation)
 * ──────────────────────────────────────────────────────────────── */

export type CodeBlockTabsProps = ComponentProps<typeof Primitive.Root>;

export const CodeBlockTabs = React.forwardRef<
  HTMLDivElement,
  CodeBlockTabsProps
>(function CodeBlockTabs({ className, children, ...props }, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nested = use(CodeBlockTabsContext) !== null;
  const uid = useId();

  // Mirror Radix's active state so triggers can render the single indicator.
  const [internalActive, setInternalActive] = useState<string | undefined>(
    () =>
      (props.defaultValue as string | undefined) ??
      (props.value as string | undefined),
  );
  const active =
    props.value !== undefined ? (props.value as string) : internalActive;

  return (
    <Primitive.Root
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as any).current = node;
      }}
      className={cn(
        "bg-neutral-900 p-1 rounded-xl border border-neutral-800/60 overflow-hidden not-prose",
        !nested && "my-4",
        className,
      )}
      {...props}
      value={active}
      onValueChange={(value) => {
        setInternalActive(value);
        props.onValueChange?.(value);
      }}
    >
      <CodeBlockTabsContext.Provider
        value={useMemo(
          () => ({
            containerRef,
            nested,
            active: active ?? null,
            uid,
          }),
          [nested, active, uid],
        )}
      >
        {children}
      </CodeBlockTabsContext.Provider>
    </Primitive.Root>
  );
});
CodeBlockTabs.displayName = "CodeBlockTabs";

export type CodeBlockTabsListProps = ComponentProps<typeof Primitive.List>;

export const CodeBlockTabsList = React.forwardRef<
  HTMLDivElement,
  CodeBlockTabsListProps
>(function CodeBlockTabsList({ className, children, ...props }, ref) {
  const ctx = use(CodeBlockTabsContext);

  return (
    <Primitive.List
      ref={ref}
      className={cn(
        "flex flex-row items-center overflow-x-auto px-1 -mx-1 text-neutral-400 mb-0.5 gap-1",
        className,
      )}
      {...props}
    >
      {children}
      {ctx && !ctx.nested && (
        <CopyButton
          className="sticky ms-auto right-0 bg-neutral-900/90 backdrop-blur-xs"
          containerRef={ctx.containerRef}
        />
      )}
    </Primitive.List>
  );
});
CodeBlockTabsList.displayName = "CodeBlockTabsList";

export type CodeBlockTabsTriggerProps = ComponentProps<
  typeof Primitive.Trigger
>;

export const CodeBlockTabsTrigger = React.forwardRef<
  HTMLButtonElement,
  CodeBlockTabsTriggerProps
>(function CodeBlockTabsTrigger({ className, children, ...props }, ref) {
  const ctx = use(CodeBlockTabsContext);
  const isActive = ctx?.active != null && ctx.active === String(props.value);

  return (
    <Primitive.Trigger
      ref={ref}
      className={cn(
        "relative group inline-flex text-xs font-medium text-nowrap items-center gap-2 px-3 py-2 cursor-pointer rounded-md outline-none",
        "text-neutral-400 hover:text-neutral-200",
        "data-[state=active]:text-white",
        "[&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}

      {/* Single shared indicator: only mounted on the ACTIVE tab, so Framer
          Motion's layoutId animates it sliding between tabs. */}
      {isActive && ctx && (
        <span className="absolute bottom-0 left-3 right-3 flex justify-center pointer-events-none">
          <motion.span
            layoutId={`code-tabs-indicator-${ctx.uid}`}
            className="h-px w-full rounded-full bg-white"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
            }}
          />
        </span>
      )}
    </Primitive.Trigger>
  );
});
CodeBlockTabsTrigger.displayName = "CodeBlockTabsTrigger";

export type CodeBlockTabProps = ComponentProps<typeof Primitive.Content>;

export const CodeBlockTab = React.forwardRef<HTMLDivElement, CodeBlockTabProps>(
  function CodeBlockTab({ className, children, ...props }, ref) {
    return (
      <Primitive.Content
        ref={ref}
        className={cn("outline-none focus-visible:outline-none", className)}
        {...props}
      >
        {children}
      </Primitive.Content>
    );
  },
);
CodeBlockTab.displayName = "CodeBlockTab";

export default CodeBlock;
