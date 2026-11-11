"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { LuMessageSquareQuote, LuX, LuSmile } from "react-icons/lu";
import { cn } from "@heroui/react";
import { useInlineTooltip } from "./inline-tooltip-context";
import { useIconPicker } from "./icon-picker-context";
import {
  TooltipOccurrence,
  buildTooltipTag,
  escapeTooltipAttr,
  normalizeTooltipText,
  parseInlineTooltips,
  setFieldValue,
  splitWhitespace,
} from "./inline-tooltip-utils";

interface InlineTooltipFieldProps {
  as?: "input" | "textarea";
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  /** "glass" = light field bg, "dark" = darker card inner bg (cards, items) */
  variant?: "glass" | "dark";
  className?: string;
}

/**
 * Persistent inline tooltip editor.
 *
 * Behaves like a NESTED BLOCK: every `<InlineTooltip>` present in the field's
 * content renders as an always-embedded editor row under the main input -
 * it stays there after being added, so it can be re-edited (or removed) later.
 *
 * Adding is triggered from the floating selection toolbar; the hover text is
 * reflected INSTANTLY in the field while typing (the tag is re-written on
 * every keystroke against the captured selection anchor).
 */
export const InlineTooltipField: React.FC<InlineTooltipFieldProps> = ({
  as = "textarea",
  value,
  onChange,
  rows = 3,
  placeholder,
  variant = "glass",
  className,
}) => {
  const [node, setNode] = useState<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);
  const [pendingTip, setPendingTip] = useState("");
  const { target, close } = useInlineTooltip();
  const { openIconPicker } = useIconPicker();

  const isActive = node !== null && target !== null && target.element === node;

  // Snapshot of the ORIGINAL plain-text selection when the editor opened.
  // Live rewrites anchor onto it so caret movement / re-clicks can never
  // corrupt what is being wrapped.
  const anchorRef = useRef<{
    raw: string;
    start: number;
    end: number;
  } | null>(null);

  useEffect(() => {
    if (isActive && target && node) {
      anchorRef.current = {
        raw: node.value.substring(target.start, target.end),
        start: target.start,
        end: target.end,
      };
    } else {
      anchorRef.current = null;
    }
  }, [isActive, target, node]);

  // Every new editor session (or dismissal) starts with a clean buffer
  useEffect(() => {
    setPendingTip("");
  }, [isActive, target]);

  // Persistent rows derive from the content itself - they stay embedded
  // across sessions like nested blocks
  const occurrences = useMemo<TooltipOccurrence[]>(
    () => parseInlineTooltips(value),
    [value],
  );

  // While the pending editor is open, its own tag (already live-written at
  // the anchor) must not ALSO render as a duplicate persistent row
  const hiddenStart = isActive && target ? target.start : -1;
  const visibleOccurrences = occurrences.filter((o) => o.start !== hiddenStart);

  const fieldClasses =
    as === "textarea"
      ? cn(
          "w-full text-xs p-2.5 rounded-lg text-white font-inter leading-relaxed focus:outline-none border transition-colors resize-y placeholder:text-neutral-600",
          variant === "dark"
            ? "bg-black/25 border border-white/8 rounded-xl text-neutral-200 focus:border-accent/40"
            : "bg-white/3 border border-white/10 focus:border-accent/40",
        )
      : cn(
          "w-full text-xs h-[38px] px-3 rounded-lg text-white focus:outline-none border transition-colors placeholder:text-neutral-500",
          "bg-white/3 border border-white/10 focus:border-accent/40",
        );

  /** Rewrites (or first-writes) the tag anchored at the ORIGINAL selection,
   *  called on every keystroke so the field content reflects live. */
  const liveWrite = (tipRaw: string) => {
    setPendingTip(tipRaw);

    const anchor = anchorRef.current;
    if (!anchor || !target) return;

    const { lead, core, trail } = splitWhitespace(anchor.raw);
    if (!core) return;

    const content = normalizeTooltipText(tipRaw).trim();
    const tag = `${lead}${buildTooltipTag(content ? escapeTooltipAttr(content) : "", core)}${trail}`;

    // The tag always (re-)builds at the anchor position: the prefix of the
    // value never changes during live edits
    const at = parseInlineTooltips(value).find((o) => o.start === anchor.start);
    const newValue = at
      ? value.substring(0, at.start) + tag + value.substring(at.end)
      : value.substring(0, anchor.start) + tag + value.substring(anchor.end);

    if (newValue !== value) onChange(newValue);
  };

  /** Removes the live tag and restores the plain original selection text */
  const cancelPending = () => {
    const anchor = anchorRef.current;
    const el = node;
    if (anchor && el) {
      const at = parseInlineTooltips(value).find(
        (o) => o.start === anchor.start,
      );
      if (at) {
        // Restores the original plain selection (whitespace preserved)
        setFieldValue(
          el,
          value.substring(0, at.start) + anchor.raw + value.substring(at.end),
        );
      }
    }
    setPendingTip("");
    close();
  };

  /** Finalizer for blur / Enter: live writes already keep the tag in sync,
   *  so this only closes (or repairs a missing wrap). */
  const finalizePending = () => {
    const anchor = anchorRef.current;
    if (!anchor) return close();

    const at = parseInlineTooltips(value).find((o) => o.start === anchor.start);
    if (at) {
      // Already live-written (possibly with empty content while typing) -
      // if the user blurred with no text, empty tooltips are undone
      if (!pendingTip.trim()) {
        setFieldValue(
          node!,
          value.substring(0, at.start) + anchor.raw + value.substring(at.end),
        );
      }
      close();
      return;
    }

    // Repair: no live tag was written yet (rare) - wrap now if there is text
    const content = normalizeTooltipText(pendingTip).trim();
    if (content) {
      const { lead, core, trail } = splitWhitespace(anchor.raw);
      if (core) {
        const newValue =
          value.substring(0, anchor.start) +
          `${lead}${buildTooltipTag(escapeTooltipAttr(content), core)}${trail}` +
          value.substring(anchor.end);
        setFieldValue(node!, newValue);
      }
    }
    setPendingTip("");
    close();
  };

  /** Live-rewrite the hover text of a persistent row */
  const updateOccurrence = (occ: TooltipOccurrence, text: string) => {
    const safe = normalizeTooltipText(text);
    if (!safe.trim()) return; // keep empty edits from wiping the markup
    const tag = buildTooltipTag(escapeTooltipAttr(safe), occ.inner);
    onChange(value.substring(0, occ.start) + tag + value.substring(occ.end));
  };

  /** Removes a persistent tooltip, leaving its inner text as plain content */
  const removeOccurrence = (occ: TooltipOccurrence) => {
    onChange(
      value.substring(0, occ.start) + occ.inner + value.substring(occ.end),
    );
  };

  return (
    <div className={cn("space-y-1.5 relative group/field", className)}>
      <div className="relative">
        {as === "textarea" ? (
          <textarea
            ref={setNode}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(fieldClasses, "pr-8")}
          />
        ) : (
          <input
            ref={setNode}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(fieldClasses, "pr-8")}
          />
        )}

        {/* Quick Icon Button inside the field */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (node) {
              openIconPicker(node);
            } else {
              openIconPicker();
            }
          }}
          title="Insert Icon"
          className="absolute right-2 top-2 p-1 rounded-md text-neutral-500 hover:text-sky-400 hover:bg-sky-400/15 opacity-0 group-hover/field:opacity-100 focus:opacity-100 transition-all cursor-pointer z-10"
        >
          <LuSmile className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Toolbar-triggered child editor (fresh selection, live auto-apply) */}
      {isActive && target && (
        <div
          data-inline-tooltip-block="true"
          className="rounded-xl border border-pink-400/25 bg-pink-400/7 p-2.5 space-y-1.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-1.5">
            <LuMessageSquareQuote className="w-3.5 h-3.5 text-pink-300 shrink-0" />
            <input
              type="text"
              readOnly
              data-format-role="plain"
              data-inline-tooltip-input="true"
              value={target.word}
              tabIndex={-1}
              aria-label="Selected text"
              title="Selected text (read only)"
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white/6 border border-white/10 text-[11px] font-mono text-neutral-300 cursor-default select-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <textarea
              autoFocus
              rows={2}
              data-format-role="plain"
              data-inline-tooltip-input="true"
              value={pendingTip}
              onChange={(e) => liveWrite(e.target.value)}
              onBlur={() => {
                // AUTO-CHECK: leaving the field finalizes the pending editor
                // (the tag is already live-written, only cleanup/close here)
                finalizePending();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelPending();
                } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  // Newline is the default Enter - explicit apply is Cmd/Ctrl+Enter
                  e.preventDefault();
                  finalizePending();
                }
              }}
              aria-label="Tooltip hover text"
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 focus:border-pink-400/60 focus:outline-none text-[11px] text-white placeholder:text-neutral-600 transition-colors resize-y leading-relaxed"
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                cancelPending();
              }}
              title="Cancel (Esc)"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent nested-block rows: parsed from the content, kept embedded.
          Keys are INDEX-based, not position-based: tag positions shift on every
          keystroke (tag length changes), and shifting keys would remount the
          focused input and steal focus mid-typing. Parse order is stable. */}
      {visibleOccurrences.map((occ, i) => (
        <div
          key={`tip-row-${i}`}
          data-inline-tooltip-block="true"
          className="rounded-xl border border-pink-400/20 bg-pink-400/5 p-2.5 space-y-1.5"
        >
          <div className="flex items-center gap-1.5">
            <LuMessageSquareQuote className="w-3.5 h-3.5 text-pink-300 shrink-0" />
            <input
              type="text"
              readOnly
              data-format-role="plain"
              data-inline-tooltip-input="true"
              value={occ.inner}
              tabIndex={-1}
              aria-label="Tooltip text"
              title="Tooltip text (read only)"
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white/6 border border-white/10 text-[11px] font-mono text-neutral-300 cursor-default select-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <textarea
              rows={2}
              data-format-role="plain"
              data-inline-tooltip-input="true"
              value={occ.content}
              onChange={(e) => updateOccurrence(occ, e.target.value)}
              placeholder="Hover text (new lines allowed)..."
              aria-label="Tooltip hover text"
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 focus:border-pink-400/60 focus:outline-none text-[11px] text-white placeholder:text-neutral-600 transition-colors resize-y leading-relaxed"
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                removeOccurrence(occ);
              }}
              title="Remove tooltip"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 shrink-0 transition-colors"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
