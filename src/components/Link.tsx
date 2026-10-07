"use client";

import NextLink from "next/link";
import React from "react";
import { cn } from "@heroui/react";

export type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithRef<"a">, "href" | "children" | "className">;

const INTERNAL_PROTOCOLS = new Set(["http:", "https:"]);

function isExternalUrl(href: string): boolean {
  // Relative paths, anchors, and query strings stay internal.
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("?")) {
    return false;
  }

  // Non-web protocols aren't external website navigation.
  if (/^(mailto|tel|sms):/i.test(href)) {
    return false;
  }

  try {
    const url = new URL(href, "https://internal.local");

    // Protocol-relative URLs and absolute URLs are supported.
    if (href.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(href)) {
      return (
        INTERNAL_PROTOCOLS.has(url.protocol) &&
        url.origin !== "https://internal.local"
      );
    }

    // Ordinary relative paths remain internal.
    return false;
  } catch {
    return false;
  }
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, href, className, target, rel, ...rest }, ref) => {
    const external = isExternalUrl(href);

    // Respect explicit target preferences.
    const resolvedTarget = target ?? (external ? "_blank" : undefined);
    const opensNewTab = resolvedTarget === "_blank";

    const resolvedRel = opensNewTab
      ? Array.from(
          new Set([
            ...(rel?.split(/\s+/).filter(Boolean) ?? []),
            "noopener",
            "noreferrer",
          ]),
        ).join(" ")
      : rel;

    const classes = cn(opensNewTab && "cursor-newtab", className);

    // External websites use a regular anchor.
    if (external) {
      return (
        <a
          {...rest}
          ref={ref}
          href={href}
          target={resolvedTarget}
          rel={resolvedRel}
          className={classes}
        >
          {children}
        </a>
      );
    }

    // Internal navigation uses Next.js routing.
    return (
      <NextLink
        {...rest}
        ref={ref}
        href={href}
        target={target}
        rel={rel}
        className={className}
      >
        {children}
      </NextLink>
    );
  },
);

Link.displayName = "Link";
