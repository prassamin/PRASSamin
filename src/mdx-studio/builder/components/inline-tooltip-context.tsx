"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

/**
 * Shared state between the floating selection menu (the launcher) and the
 * block fields (which render the inline tooltip editor as a child input
 * under their own main input).
 */
export interface InlineTooltipTarget {
  element: HTMLInputElement | HTMLTextAreaElement;
  /** The auto-set, read-only selected text the tooltip will wrap */
  word: string;
  /** Original selection range captured when the action fired */
  start: number;
  end: number;
}

interface InlineTooltipController {
  target: InlineTooltipTarget | null;
  /** Called by the floating menu when the user picks "Inline Tooltip" */
  open: (
    element: HTMLInputElement | HTMLTextAreaElement,
    word: string,
    start: number,
    end: number,
  ) => void;
  close: () => void;
}

const InlineTooltipContext = createContext<InlineTooltipController>({
  target: null,
  open: () => {},
  close: () => {},
});

export const useInlineTooltip = () => useContext(InlineTooltipContext);

export const InlineTooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [target, setTarget] = useState<InlineTooltipTarget | null>(null);

  const open = useCallback(
    (
      element: HTMLInputElement | HTMLTextAreaElement,
      word: string,
      start: number,
      end: number,
    ) => setTarget({ element, word, start, end }),
    [],
  );

  const close = useCallback(() => setTarget(null), []);

  return (
    <InlineTooltipContext.Provider value={{ target, open, close }}>
      {children}
    </InlineTooltipContext.Provider>
  );
};
