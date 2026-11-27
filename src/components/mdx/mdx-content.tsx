"use client";

import React from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { remarkTemplates } from "@/lib/remark-templates";
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
  User,
  Blockquote,
  MdxTabs,
  MdxTab,
  Stacks,
  Stack,
} from "@/mdx-components";
import { MdxAccordion, MdxAccordionItem } from "./mdx-accordion";
import { MdxCard, MdxCards } from "./mdx-card";
import { MdxCodeBlock } from "./mdx-code-block";
import { cn } from "@heroui/react";
import { NODE_ENV } from "@/config/env";

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

class MDXErrorBoundary extends React.Component<
  { resetKey?: string; fallback?: React.ReactNode; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidUpdate(prevProps: { resetKey?: string }) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (NODE_ENV !== "production") {
      console.warn("MDX runtime render error caught:", error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 p-3 text-xs text-amber-300 font-mono my-2">
            <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-400 mb-1">
              Markdown Rendering Notice
            </span>
            <span className="opacity-80 block truncate">
              {this.state.error?.message || "Render error in MDX preview"}
            </span>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export function clearMDXPromiseCache() {
  promiseMap.clear();
  resolvedCache.clear();
}

// Ensure dev hot-reloads invalidate stale compiled closures
if (typeof window !== "undefined" && NODE_ENV !== "production") {
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
          remarkPlugins: [
            remarkGfm,
            remarkTemplates,
            remarkBreaks,
            remarkCardGroup,
            remarkCodeMeta,
          ],
          rehypePlugins: [rehypeCodeMeta],
        });

        return Component;
      } catch (err: any) {
        // Safe resilient fallback component to prevent studio crash during active typing
        const ErrorFallback: React.FC<{ components?: any }> = () => (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 p-3 text-xs text-amber-300 font-mono my-2">
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
      <div className="h-4 bg-white/7 rounded-md w-full" />
      <div className="h-4 bg-white/7 rounded-md w-[88%]" />
      <div className="h-4 bg-white/7 rounded-md w-[62%]" />
    </div>
  );
};

export interface MDXContentProps {
  content: string;
  className?: string;
  components?: Record<string, React.ComponentType<any>>;
  fallback?: React.ReactNode;
}

const BASE_MDX_COMPONENTS = {
  ...getMDXComponents(mdxComponents),
  Accordion: MdxAccordion,
  AccordionItem: MdxAccordionItem,
  Accordions: MdxAccordion,
  Card: MdxCard,
  Cards: MdxCards,
  Stacks,
  Stack,
  Tabs: MdxTabs,
  Tab: MdxTab,
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
  User,
  Blockquote,
};

/**
 * Invokes the stateless function produced by `@mdx-js/mdx` evaluate() directly
 * so React diffs the returned JSX element tree instead of unmounting and
 * remounting the entire preview subtree whenever `renderFn` reference changes.
 */
const MdxTreeHost: React.FC<{
  renderFn: React.ComponentType<{ components?: any }>;
  components: Record<string, any>;
}> = ({ renderFn, components }) => {
  return <>{(renderFn as any)({ components })}</>;
};

export const MDXContent: React.FC<MDXContentProps> = ({
  content,
  className,
  components,
  fallback,
}) => {
  const [RenderedComponent, setRenderedComponent] =
    React.useState<React.ComponentType<{ components?: any }> | null>(() =>
      content ? resolvedCache.get(content) || null : null,
    );

  React.useEffect(() => {
    if (!content) {
      setRenderedComponent(null);
      return;
    }

    // If already resolved in cache, update immediately in 0ms
    const cached = resolvedCache.get(content);
    if (cached) {
      setRenderedComponent(() => cached);
      return;
    }

    let isCancelled = false;
    // Debounce AST compilation during active typing bursts so we don't fire
    // full Unified/Remark/Acorn evaluations on the main thread mid-keystroke
    const timer = setTimeout(
      () => {
        getMdxPromise(content).then((Comp) => {
          if (!isCancelled) {
            resolvedCache.set(content, Comp);
            setRenderedComponent(() => Comp);
          }
        });
      },
      RenderedComponent ? 180 : 0,
    );

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [content]);

  const mergedComponents = React.useMemo(
    () =>
      components && Object.keys(components).length > 0
        ? { ...BASE_MDX_COMPONENTS, ...components }
        : BASE_MDX_COMPONENTS,
    [components],
  );

  if (!content) return null;

  if (!RenderedComponent) {
    return (
      <div className={className}>
        {fallback || <MDXContentSkeleton className={className} />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-invert prose-neutral max-w-none text-sm",
        "[&_h1]:border-l-[5px] [&_h1]:border-accent-1 [&_h1]:pl-2.5",
        "[&_h2]:border-l-[5px] [&_h2]:border-accent-1 [&_h2]:pl-2.5",
        "[&_thead_th:first-child]:pl-4! [&_thead_th:last-child]:pr-4!",
        "[&_tbody_td:first-child]:pl-4! [&_tbody_td:last-child]:pr-4!",
        "[&_thead_th]:py-3! [&_thead_th]:px-4!",
        "[&_tbody_td]:py-3! [&_tbody_td]:px-4!",
        className,
      )}
    >
      <MDXErrorBoundary resetKey={content} fallback={fallback}>
        <MdxTreeHost
          renderFn={RenderedComponent}
          components={mergedComponents}
        />
      </MDXErrorBoundary>
    </div>
  );
};

export default MDXContent;
