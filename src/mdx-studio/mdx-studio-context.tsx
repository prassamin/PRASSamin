"use client";

import React from "react";
import { MdxStudioContextValue } from "./types";
import { MdxStudioModal } from "./mdx-studio";
import {
  useMdxStudioStore,
  MdxStudioStoreState,
} from "./store/use-mdx-studio-store";

/**
 * Zero-rerender provider shell: state is managed by Zustand (`useMdxStudioStore`),
 * so wrapping `{children}` (such as the Admin layout) never causes parent/child
 * tree re-renders when `mdx`, `activeTab`, or `metadata` updates inside the studio.
 */
export const MdxStudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      <MdxStudioModal />
    </>
  );
};

export function useMdxStudio(): MdxStudioContextValue;
export function useMdxStudio<T>(
  selector: (state: MdxStudioStoreState) => T,
): T;
export function useMdxStudio<T>(
  selector?: (state: MdxStudioStoreState) => T,
): T | MdxStudioContextValue {
  return useMdxStudioStore((selector as any) ?? ((s) => s));
}
