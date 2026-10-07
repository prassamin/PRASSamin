"use client";

import React, { useCallback, useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";

export interface InlineTooltipProps {
  /** Hover text - may contain real newlines (stored as &#10; in MDX) */
  content: string;
  /** The words the tooltip wraps */
  children: React.ReactNode;
}

/**
 * Inline tooltip trigger for MDX-embedded `<InlineTooltip>` tags.
 *
 * Selection suppression: while ANY text is selected (dragging inside a builder
 * field, or a reader selecting page content), open requests are swallowed -
 * the bubble would otherwise fight the drag and block the selection UI.
 */
export function InlineTooltip({ content, children }: InlineTooltipProps) {
  const [open, setOpen] = useState(false);

  const isSelectionActive = useCallback(() => {
    if (typeof document === "undefined") return false;

    // Focused text field (builder canvas): its internal selection may never be
    // published to the document selection (Firefox) - check start/end directly
    const active = document.activeElement;
    if (
      (active instanceof HTMLTextAreaElement ||
        active instanceof HTMLInputElement) &&
      active.selectionStart !== active.selectionEnd
    ) {
      return true;
    }

    const sel = document.getSelection();
    return !!sel && !sel.isCollapsed && sel.toString().length > 0;
  }, []);

  return (
    <Tooltip
      isOpen={open}
      onOpenChange={(nextOpen) => {
        // Never appear over selected text
        if (nextOpen && isSelectionActive()) return;
        setOpen(nextOpen);
      }}
      noDelay
      content={
        // Multiline hover text: attr stores &#10;, MDX decodes back to \n,
        // pre-line renders the real breaks
        <span className="whitespace-pre-line">{content}</span>
      }
      contentProps={{ className: "text-sm px-3" }}
    >
      <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 cursor-help hover:text-white transition-colors">
        {children}
      </span>
    </Tooltip>
  );
}
