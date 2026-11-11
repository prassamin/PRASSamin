"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { Toast } from "@heroui/react";
import { RootProvider } from "fumadocs-ui/provider";
import { ReactLenis } from "lenis/react";
import { AnalyticsProvider } from "./analytics-provider";
import { GlobalKeyBindingProvider } from "./global-keybinding-provider";
import { ConfirmProvider } from "./confirm-provider";
import { OwnerProvider } from "./owner-provider";
import {
  useLenisSmartScroll,
  shouldPreventLenisScroll,
} from "@/hooks/use-lenis-smartscroll";
import type { GithubOwnerPublic } from "@/lib/github";

export function RootProviders({
  initialOwner,
  children,
}: {
  initialOwner?: GithubOwnerPublic | null;
  children: React.ReactNode;
}) {
  useLenisSmartScroll();

  const pathname = usePathname();

  // Long-form reading pages (blog/project detail) render heavy nested
  // scrollables (code blocks, tables) — native scroll there avoids all
  // Lenis wheel-capture conflicts.
  const isReadingPage =
    pathname?.startsWith("/blogs/") || pathname?.startsWith("/projects/");

  const content = (
    <ConfirmProvider>
      <ProgressProvider
        height="2px"
        color="color-mix(in oklab, var(--color-accent) 40%, transparent)"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <RootProvider
          search={{ enabled: false }}
          theme={{ defaultTheme: "dark", forcedTheme: "dark" }}
        >
          <Toast.Provider placement="top" width={360} />
          <OwnerProvider initialOwner={initialOwner ?? null}>
            <GlobalKeyBindingProvider>{children}</GlobalKeyBindingProvider>
          </OwnerProvider>
        </RootProvider>
        <AnalyticsProvider />
      </ProgressProvider>
    </ConfirmProvider>
  );

  if (isReadingPage) {
    return content;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        prevent: shouldPreventLenisScroll,
      }}
    >
      {content}
    </ReactLenis>
  );
}
