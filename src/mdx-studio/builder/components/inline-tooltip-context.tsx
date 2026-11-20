"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useBuilderUiStore } from "../store/use-builder-ui-store";

export interface InlineTooltipTarget {
  element: HTMLInputElement | HTMLTextAreaElement;
  /** The auto-set, read-only selected text the tooltip will wrap */
  word: string;
  /** Original selection range captured when the action fired */
  start: number;
  end: number;
}

export const useInlineTooltip = () =>
  useBuilderUiStore(
    useShallow((s) => ({
      target: s.inlineTooltipTarget,
      open: s.openInlineTooltip,
      close: s.closeInlineTooltip,
    })),
  );

export const InlineTooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
