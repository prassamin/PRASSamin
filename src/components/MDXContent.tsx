"use client";

import React from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { remarkCardGroup } from "@/lib/remark-card-group";
import { remarkCodeMeta, rehypeCodeMeta } from "@/lib/remark-code-meta";
import {
  getMDXComponents,
  mdxComponents,
  MdxTable,
  MdxThead,
  MdxTbody,
  MdxTr,
  MdxTh,
  MdxTd,
  TypeTable,
  Files,
  Folder,
  File,
  Avatar,
  AvatarGroup,
  Profile,
  Blockquote,
} from "@/mdx-components";
import { MdxAccordion, MdxAccordionItem } from "./MdxAccordion";
import { MdxCard, MdxCards } from "./MdxCard";
import { MdxCodeBlock } from "./MdxCodeBlock";
import { cn } from "@/lib/utils";

// Map to deduplicate compilation promises for React with LRU eviction
const MAX_MDX_CACHE = 50;
const promiseMap = new Map<
  string,
  Promise<React.ComponentType<{ components?: any }>>
>();
const resolvedCache = new Map<
  string,
  React.ComponentType<{ components?: any }>
>();

export function clearMDXPromiseCache() {
  promiseMap.clear();
  resolvedCache.clear();
}

// Ensure dev hot-reloads invalidate stale compiled closures
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  promiseMap.clear();
  resolvedCache.clear();
}

function getMdxPromise(content: string) {
  if (!promiseMap.has(content)) {
    if (promiseMap.size >= MAX_MDX_CACHE) {
      const oldestKey = promiseMap.keys().next().value;
      if (oldestKey) promiseMap.delete(oldestKey);
    }

    const promise = (async () => {
      try {
        // Sanitize `<` that are not valid JSX tags (e.g. emoticons like `<3`, `< 10`)
        const normalized = content.replace(/<(?![a-zA-Z_/!])/g, "\\<");

        const { default: Component } = await evaluate(normalized, {
          ...runtime,
          // remark-breaks: single newlines in builder inputs (<textarea>) render
          // as hard line breaks instead of being collapsed into spaces
          remarkPlugins: [remarkGfm, remarkBreaks, remarkCardGroup, remarkCodeMeta],
          rehypePlugins: [rehypeCodeMeta],
        });

        return Component;
      } catch (err: any) {
        // Safe resilient fallback component to prevent studio crash during active typing
        const ErrorFallback: React.FC<{ components?: any }> = () => (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs text-amber-300 font-mono my-2 select-none">
            <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-400 mb-1">
              Markdown Formatting Notice
            </span>
            <span className="opacity-80 block truncate">
              {err?.message || "Invalid markdown or JSX formatting"}
            </span>
          </div>
        );
        return ErrorFallback;
      }
    })();

    promiseMap.set(content, promise);
  }

  return promiseMap.get(content)!;
}

export const MDXContentSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn("space-y-2.5 animate-pulse py-1 mt-2", className)}>
      <div className="h-4 bg-white/[0.07] rounded-md w-full" />
      <div className="h-4 bg-white/[0.07] rounded-md w-[88%]" />
      <div className="h-4 bg-white/[0.07] rounded-md w-[62%]" />
    </div>
  );
};

export interface MDXContentProps {
  content: string;
  className?: string;
  components?: Record<string, React.ComponentType<any>>;
  fallback?: React.ReactNode;
}

export const MDXContent: React.FC<MDXContentProps> = ({
  content,
  className,
  components = {},
  fallback,
}) => {
  const [RenderedComponent, setRenderedComponent] = React.useState<
    React.ComponentType<{ components?: any }> | null
  >(() => (content ? resolvedCache.get(content) || null : null));

  React.useEffect(() => {
    if (!content) {
      setRenderedComponent(null);
      return;
    }

    // If already resolved in cache, update immediately
    const cached = resolvedCache.get(content);
    if (cached) {
      setRenderedComponent(() => cached);
      return;
    }

    let isCancelled = false;
    getMdxPromise(content).then((Comp) => {
      if (!isCancelled) {
        resolvedCache.set(content, Comp);
        setRenderedComponent(() => Comp);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [content]);

  if (!content) return null;

  if (!RenderedComponent) {
    return (
      <div className={className}>
        {fallback || <MDXContentSkeleton className={className} />}
      </div>
    );
  }

  const mergedComponents = {
    ...getMDXComponents(mdxComponents),
    Accordion: MdxAccordion,
    AccordionItem: MdxAccordionItem,
    Accordions: MdxAccordion,
    Card: MdxCard,
    Cards: MdxCards,
    pre: MdxCodeBlock,
    table: MdxTable,
    thead: MdxThead,
    tbody: MdxTbody,
    tr: MdxTr,
    th: MdxTh,
    td: MdxTd,
    TypeTable,
    Files,
    Folder,
    File,
    Avatar,
    AvatarGroup,
    Profile,
    Blockquote,
    ...components,
  };

  return (
    <div
      className={cn(
        "prose prose-invert prose-neutral max-w-none text-sm",
        "[&_h1]:border-l-[5px] [&_h1]:border-accent-1 [&_h1]:pl-2.5",
        "[&_h2]:border-l-[5px] [&_h2]:border-accent-1 [&_h2]:pl-2.5",
        "[&_thead_th:first-child]:!pl-4 [&_thead_th:last-child]:!pr-4",
        "[&_tbody_td:first-child]:!pl-4 [&_tbody_td:last-child]:!pr-4",
        "[&_thead_th]:!py-3 [&_thead_th]:!px-4",
        "[&_tbody_td]:!py-3 [&_tbody_td]:!px-4",
        className
      )}
    >
      <RenderedComponent components={mergedComponents} />
    </div>
  );
};

export default MDXContent;
