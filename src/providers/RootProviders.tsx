"use client";
import React from "react";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { Toast } from "@heroui/react";
import { RootProvider } from "fumadocs-ui/provider";
import { ReactLenis } from "lenis/react";
import { AnalyticsProvider } from "./AnalyticsProvider";
import GlobalKeyBinderProvider from "./GlobalKeyBinderProvider";
import { ConfirmProvider } from "./ConfirmProvider";

export function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        prevent: (node) => {
          return (
            node.hasAttribute("data-lenis-prevent") ||
            Boolean(
              node.closest?.(
                "[data-lenis-prevent], [data-slot='modal-dialog'], [data-slot='modal-backdrop'], [role='dialog'], [data-rac]"
              )
            )
          );
        },
      }}
    >
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
            <GlobalKeyBinderProvider>{children}</GlobalKeyBinderProvider>
          </RootProvider>
          <AnalyticsProvider />
        </ProgressProvider>
      </ConfirmProvider>
    </ReactLenis>
  );
}