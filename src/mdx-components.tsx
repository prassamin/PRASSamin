import * as React from "react";
import { cn } from "tailwind-variants";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  MdxFiles,
  MdxFolder,
  MdxFile,
  Files,
  Folder,
  File,
} from "./components/mdx/mdx-files";
export { MdxFiles, MdxFolder, MdxFile, Files, Folder, File };
import * as TabsComponents from "fumadocs-ui/components/tabs";
import * as StepsComponents from "fumadocs-ui/components/steps";
import type { MDXComponents } from "mdx/types";
import * as luIcons from "react-icons/lu";
import * as siIcons from "react-icons/si";
import { Link } from "@/components/link";
import { Banner } from "fumadocs-ui/components/banner";
import {
  MdxTypeTable,
  MdxTypeTable as TypeTable,
} from "./components/mdx/mdx-type-table";
export { MdxTypeTable, TypeTable };
import { Callout } from "fumadocs-ui/components/callout";
import { Heading } from "fumadocs-ui/components/heading";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import Image from "next/image";
import { Chip } from "@heroui/react/chip";
import { Checkbox } from "@heroui/react/checkbox";
import {
  MdxAvatar,
  Avatar,
  MdxAvatarGroup,
  AvatarGroup,
} from "./components/mdx/mdx-avatar";
import { MdxProfile, Profile } from "./components/mdx/mdx-profile";
import { MdxBlockquote, Blockquote } from "./components/mdx/mdx-blockquote";
export {
  MdxAvatar,
  Avatar,
  MdxAvatarGroup,
  AvatarGroup,
  MdxProfile,
  Profile,
  MdxBlockquote,
  Blockquote,
};
import { InlineTooltip as MdxInlineTooltip } from "@/components/ui/inline-tooltip";
import { MdxAccordion, MdxAccordionItem } from "./components/mdx/mdx-accordion";
import { MdxCard, MdxCards } from "./components/mdx/mdx-card";
import { MdxCodeBlock } from "./components/mdx/mdx-code-block";
import {
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  CodeBlockTab,
} from "./components/code-block";
export {
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  CodeBlockTab,
};

type HeadProps = React.ComponentProps<typeof Heading>;
const Head = ({ className, ...props }: HeadProps) => (
  <Heading className={cn("[&_a]:no-underline!", className)} {...props} />
);

export const MdxTable = ({
  className,
  children,
  ...props
}: React.ComponentProps<"table">) => (
  <div className="relative my-6 w-full overflow-x-auto rounded-xl border border-border/80 bg-card/40 shadow-sm not-prose">
    <table
      className={cn("w-full border-collapse text-left text-sm", className)}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const MdxThead = ({
  className,
  ...props
}: React.ComponentProps<"thead">) => (
  <thead
    className={cn("border-b border-border/80 bg-muted/40", className)}
    {...props}
  />
);

export const MdxTbody = ({
  className,
  ...props
}: React.ComponentProps<"tbody">) => (
  <tbody className={cn("divide-y divide-border/40", className)} {...props} />
);

export const MdxTr = ({ className, ...props }: React.ComponentProps<"tr">) => (
  <tr
    className={cn(
      "transition-colors hover:bg-muted/20 last:border-b-0",
      className,
    )}
    {...props}
  />
);

export const MdxTh = ({
  className,
  style,
  ...props
}: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "px-4 py-3 text-xs font-semibold text-foreground border-r border-border/40 last:border-r-0 tracking-wide",
      className,
    )}
    style={style}
    {...props}
  />
);

export const MdxTd = ({
  className,
  style,
  ...props
}: React.ComponentProps<"td">) => (
  <td
    className={cn(
      "px-4 py-3 text-xs text-muted-foreground border-r border-border/40 last:border-r-0 leading-relaxed",
      className,
    )}
    style={style}
    {...props}
  />
);

export const MdxHeading = ({ as = "h1", className, ...props }: any) => {
  const isBordered = as === "h1" || as === "h2";
  return (
    <Head
      as={as}
      className={cn(
        isBordered && "border-l-[5px] border-accent-1 pl-2.5",
        className,
      )}
      {...props}
    />
  );
};

export const MdxCallout = ({
  type = "info",
  icon,
  className,
  style,
  ...props
}: any) => {
  const normalizedType = String(type).toLowerCase();

  const fumaType =
    normalizedType === "danger" || normalizedType === "error"
      ? "error"
      : normalizedType === "warning" || normalizedType === "warn"
        ? "warn"
        : "info";

  return (
    <Callout
      type={fumaType}
      icon={icon}
      className={className}
      style={style}
      {...props}
    />
  );
};

const CHIP_STYLES: Record<string, Record<string, string>> = {
  accent: {
    soft: "bg-accent/15 text-accent border-transparent",
    outline: "bg-transparent text-accent border border-accent/40",
    solid: "bg-accent text-accent-foreground font-medium border-transparent",
    ghost: "bg-transparent text-accent border-transparent",
  },
  emerald: {
    soft: "bg-emerald-500/15 text-emerald-400 border-transparent",
    outline: "bg-transparent text-emerald-400 border border-emerald-500/40",
    solid: "bg-emerald-500 text-white font-medium border-transparent",
    ghost: "bg-transparent text-emerald-400 border-transparent",
  },
  sky: {
    soft: "bg-sky-500/15 text-sky-400 border-transparent",
    outline: "bg-transparent text-sky-400 border border-sky-500/40",
    solid: "bg-sky-500 text-white font-medium border-transparent",
    ghost: "bg-transparent text-sky-400 border-transparent",
  },
  default: {
    soft: "bg-white/[0.08] text-neutral-300 border-transparent",
    outline: "bg-transparent text-neutral-300 border border-white/20",
    solid: "bg-white/20 text-white font-medium border-transparent",
    ghost: "bg-transparent text-neutral-400 border-transparent",
  },
};

export const MdxChip = ({
  color = "default",
  variant = "soft",
  size = "sm",
  className,
  children,
  ...props
}: any) => {
  const normColor =
    color === "success" || color === "emerald"
      ? "emerald"
      : color === "sky"
        ? "sky"
        : color === "accent"
          ? "accent"
          : "default";

  const normVariant =
    variant === "secondary" || variant === "outline"
      ? "outline"
      : variant === "primary" || variant === "solid"
        ? "solid"
        : variant === "tertiary" || variant === "ghost"
          ? "ghost"
          : "soft";

  const styleClass =
    CHIP_STYLES[normColor]?.[normVariant] || CHIP_STYLES.default.soft;

  return (
    <Chip size={size} className={cn(styleClass, className, "px-2")} {...props}>
      {children}
    </Chip>
  );
};
Object.assign(MdxChip, Chip);

export { MdxAccordion, MdxAccordionItem, MdxCard, MdxCards };

// Fumadocs Tabs with compound compatibility fallbacks (e.g. Tabs.List, Tabs.Tab, Tabs.Panel)
export const MdxTabs = Object.assign(
  (props: any) => <TabsComponents.Tabs {...props} />,
  {
    Tab: TabsComponents.Tab,
    Content: TabsComponents.TabsContent,
    List: TabsComponents.TabsList,
    Trigger: TabsComponents.TabsTrigger,
    Panel: TabsComponents.TabsContent,
  },
);

export const mdxComponents = {
  Heading: MdxHeading,
  h1: ({ className, ...props }: HeadProps) => (
    <Head
      className={cn("border-l-[5px] border-accent-1 pl-2.5", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: HeadProps) => (
    <Head
      as="h2"
      className={cn("border-l-[5px] border-accent-1 pl-2.5", className)}
      {...props}
    />
  ),
  h3: ({ ...props }: HeadProps) => <Head as="h3" {...props} />,
  h4: ({ ...props }: HeadProps) => <Head as="h4" {...props} />,
  h5: ({ ...props }: HeadProps) => <Head as="h5" {...props} />,
  h6: ({ ...props }: HeadProps) => <Head as="h6" {...props} />,
  blockquote: ({ children, className, ...props }: any) => {
    let alertType: "info" | "warn" | "error" | null = null;
    let cleanedChildren = children;

    try {
      const childArray = React.Children.toArray(children);
      const firstChild = childArray[0];
      if (
        React.isValidElement(firstChild) &&
        (firstChild as any).props?.children
      ) {
        const pChildren = React.Children.toArray(
          (firstChild as any).props.children,
        );
        const firstText = pChildren[0];
        if (typeof firstText === "string") {
          const match = firstText.match(/^\[!([A-Z]+)\]\s*/i);
          if (match) {
            const raw = match[1].toUpperCase();
            alertType =
              raw === "DANGER" || raw === "CAUTION" || raw === "ERROR"
                ? "error"
                : raw === "WARNING" || raw === "WARN"
                  ? "warn"
                  : "info";

            const remainingText = firstText.replace(/^\[!([A-Z]+)\]\s*/i, "");
            const newPChildren = [remainingText, ...pChildren.slice(1)].filter(
              (c) => c !== "",
            );
            const newFirstChild = React.cloneElement(
              firstChild as React.ReactElement<any>,
              {},
              ...newPChildren,
            );
            cleanedChildren = [newFirstChild, ...childArray.slice(1)];
          }
        }
      }
    } catch {
      // fallback to original children
    }

    // If it's a GitHub-style alert [!NOTE] etc, render Callout
    if (alertType) {
      return (
        <MdxCallout type={alertType} className={className} {...props}>
          {cleanedChildren}
        </MdxCallout>
      );
    }

    // Standard markdown blockquote: render MdxBlockquote
    return (
      <MdxBlockquote className={className} {...props}>
        {cleanedChildren}
      </MdxBlockquote>
    );
  },
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className={cn("before:hidden after:hidden", className)} {...props} />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong
      className={cn(
        "font-semibold bg-transparent border-0 font-sans p-0 rounded-none",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("leading-relaxed not-first:my-0", className)} {...props} />
  ),
  input: ({
    type,
    checked,
    defaultChecked,
    disabled,
    className,
    ...props
  }: React.ComponentProps<"input">) => {
    if (type === "checkbox") {
      return (
        <Checkbox
          isSelected={checked ?? defaultChecked}
          defaultSelected={defaultChecked}
          isDisabled={disabled}
          aria-label="Task item"
          className={cn("inline-flex shrink-0 my-0 select-none", className)}
        >
          <Checkbox.Content className="p-0 gap-0">
            <Checkbox.Control className="bg-muted">
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox.Content>
        </Checkbox>
      );
    }
    return (
      <input
        type={type}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className={className}
        {...props}
      />
    );
  },
  li: ({ className, children, ...props }: React.ComponentProps<"li">) => {
    const isTaskList = className?.includes("task-list-item");
    if (isTaskList) {
      const childArray = React.Children.toArray(children);
      const inputElement = childArray.find(
        (c) => React.isValidElement(c) && (c.props as any)?.type === "checkbox",
      );
      const textChildren = childArray
        .filter(
          (c) =>
            !(React.isValidElement(c) && (c.props as any)?.type === "checkbox"),
        )
        .map((c, i) =>
          i === 0 && typeof c === "string" ? c.replace(/^\s+/, "") : c,
        );

      if (inputElement && React.isValidElement(inputElement)) {
        const inputProps = (inputElement as any).props;
        const isChecked = inputProps.checked ?? inputProps.defaultChecked;
        const isDisabled = inputProps.disabled;

        return (
          <li
            className={cn("list-none not-prose my-1.5 leading-snug", className)}
            {...props}
          >
            <Checkbox
              isSelected={isChecked}
              defaultSelected={inputProps.defaultChecked}
              isDisabled={isDisabled}
              aria-label="Task item"
              className="inline-flex select-none disabled:opacity-100 data-[disabled='true']:opacity-100"
            >
              <Checkbox.Content className="flex items-center gap-2.5 cursor-pointer text-sm text-neutral-200">
                <Checkbox.Control className="bg-white/5 shrink-0 translate-y-px">
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <span className="leading-snug select-text">{textChildren}</span>
              </Checkbox.Content>
            </Checkbox>
          </li>
        );
      }

      return (
        <li
          className={cn(
            "list-none not-prose flex items-center gap-2.5 my-1.5 leading-snug",
            className,
          )}
          {...props}
        >
          {children}
        </li>
      );
    }

    return (
      <li className={className} {...props}>
        {children}
      </li>
    );
  },
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => {
    const isTaskList = className?.includes("contains-task-list");
    return (
      <ul
        className={cn(
          isTaskList && "list-none not-prose pl-0! ml-0! space-y-1.5 my-3",
          className,
        )}
        {...props}
      />
    );
  },
  hr: ({ className, ...props }: React.ComponentProps<"hr">) => (
    <hr className={cn("border-border", className)} {...props} />
  ),
  img: ({ className, alt, src, ...props }: React.ComponentProps<"img">) => {
    if (!src) return null;
    return (
      <img
        className={cn("rounded-md", className)}
        alt={alt}
        src={src}
        {...props}
      />
    );
  },
  figure: ({ className, ...props }: React.ComponentProps<"figure">) => {
    return <figure className={cn(className, "show-scrollbar")} {...props} />;
  },
  Image: ({
    src,
    className,
    width,
    height,
    alt,
    ...props
  }: React.ComponentProps<"img">) => {
    if (!src) return null;
    return (
      <Image
        className={cn("mt-6 rounded-md border", className)}
        src={src as string}
        width={Number(width) || 1200}
        height={Number(height) || 675}
        alt={alt || ""}
        {...props}
      />
    );
  },
  ImageZoom: ({ src, alt, width, height, className, ...props }: any) => {
    if (!src) return null;
    return (
      <ImageZoom
        src={src}
        alt={alt || ""}
        width={Number(width) || 1200}
        height={Number(height) || 675}
        className={cn("rounded-md", className)}
        {...props}
      />
    );
  },
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "underline underline-offset-4 text-fd-foreground font-medium decoration-2 decoration-blue-300 hover:opacity-80",
        className,
      )}
      {...props}
    />
  ),
  a: ({ href, className, ...props }: React.ComponentProps<typeof Link>) => {
    return (
      <Link
        className={cn(
          "underline underline-offset-4 text-fd-foreground font-medium decoration-2 decoration-blue-300 hover:opacity-80",
          className,
        )}
        href={href}
        {...props}
      />
    );
  },
  InlineTooltip: MdxInlineTooltip,
  Chip: MdxChip,
  Avatar,
  AvatarGroup,
  Profile,
  Blockquote,
  Checkbox,
  Card: MdxCard,
  Cards: MdxCards,
  Accordion: MdxAccordion,
  AccordionItem: MdxAccordionItem,
  Accordions: MdxAccordion,
  Tabs: MdxTabs,
  Tab: TabsComponents.Tab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  CodeBlockTab,
  Callout: MdxCallout,
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
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(luIcons as unknown as MDXComponents),
    ...(siIcons as unknown as MDXComponents),
    ...defaultMdxComponents,
    ...mdxComponents,
    Heading: MdxHeading,
    table: MdxTable,
    thead: MdxThead,
    tbody: MdxTbody,
    tr: MdxTr,
    th: MdxTh,
    td: MdxTd,
    Files,
    Folder,
    File,
    ...TabsComponents,
    ...StepsComponents,
    Tabs: MdxTabs,
    Tab: TabsComponents.Tab,
    Callout: MdxCallout,
    ImageZoom: mdxComponents.ImageZoom,
    Banner,
    TypeTable,
    Chip: MdxChip,
    Avatar,
    AvatarGroup,
    Profile,
    Blockquote,
    Checkbox,
    Card: MdxCard,
    Cards: MdxCards,
    Accordion: MdxAccordion,
    AccordionItem: MdxAccordionItem,
    Accordions: MdxAccordion,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    CodeBlockTab,
    pre: MdxCodeBlock,
    ...components,
  };
}
