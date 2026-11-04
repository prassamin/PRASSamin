"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { Toast } from "@heroui/react";
import { RootProvider } from "fumadocs-ui/provider";
import { ReactLenis } from "lenis/react";
import { AnalyticsProvider } from "./AnalyticsProvider";
import GlobalKeyBinderProvider from "./GlobalKeyBinderProvider";
import { ConfirmProvider } from "./ConfirmProvider";
import { OwnerProvider } from "./OwnerProvider";
import {
  useLenisSmartScroll,
  shouldPreventLenisScroll,
} from "@/hooks/useLenisSmartScroll";
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
          <GlobalKeyBinderProvider>
            <OwnerProvider initialOwner={initialOwner ?? null}>
              {children}
            </OwnerProvider>
          </GlobalKeyBinderProvider>
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