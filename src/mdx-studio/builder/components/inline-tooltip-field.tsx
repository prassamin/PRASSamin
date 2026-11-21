"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LuMessageSquareQuote,
  LuX,
  LuSmile,
  LuAtSign,
  LuPencil,
  LuBlocks,
} from "react-icons/lu";
import { cn } from "@heroui/react";
import { useInlineTooltip } from "./inline-tooltip-context";
import { useOpenIconPicker } from "./icon-picker-context";
import { useOpenUserMention } from "./user-mention-context";
import { useAvailableTemplates } from "./template-context";
import { TemplateDefinitionInfo } from "../types";
import { parseShorthandParams } from "@/lib/remark-templates";
import {
  CaretPopupCoords,
  TemplateIntellisensePortal,
  getAnchorButtonCoords,
  getCaretPopupCoords,
} from "./template-intellisense-portal";
import {
  parseUserMentions,
  UserMentionOccurrence,
} from "./user-mention-utils";
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
  availableTemplates?: TemplateDefinitionInfo[];
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
  availableTemplates: propAvailableTemplates,
}) => {
  const [node, setNode] = useState<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);
  const [pendingTip, setPendingTip] = useState("");
  const { target, close } = useInlineTooltip();
  const openIconPicker = useOpenIconPicker();
  const openMentionPicker = useOpenUserMention();
  const contextTemplates = useAvailableTemplates();
  const availableTemplates = propAvailableTemplates ?? contextTemplates;
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [templateMenuCoords, setTemplateMenuCoords] =
    useState<CaretPopupCoords | null>(null);
  const [templateQuery, setTemplateQuery] = useState("");
  const [templateHashRange, setTemplateHashRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const templateBtnRef = useRef<HTMLButtonElement | null>(null);

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

  // Click-outside listener for template menu
  useEffect(() => {
    if (!isTemplateMenuOpen) return;
    const handleDocClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && !el.closest("[data-template-menu='true']")) {
        setIsTemplateMenuOpen(false);
      }
    };
    const handleDocKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsTemplateMenuOpen(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleDocKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleDocKey);
    };
  }, [isTemplateMenuOpen]);

  // Persistent user mentions embedded in this field
  const userMentions = useMemo<UserMentionOccurrence[]>(
    () => parseUserMentions(value),
    [value],
  );

  const removeUserMention = (occ: UserMentionOccurrence) => {
    onChange(value.substring(0, occ.start) + value.substring(occ.end));
  };

  interface TemplateShorthandOccurrence {
    name: string;
    params: Record<string, string>;
    start: number;
    end: number;
  }

  // Parse `#template-name` and `#template-name(k="v")` occurrences in this field's text
  const templateShorthands = useMemo<TemplateShorthandOccurrence[]>(() => {
    if (!value) return [];
    const regex =
      /(?:^|(?<=\s))#([a-zA-Z_][a-zA-Z0-9_-]*)(?:\(([^)\r\n]*)\))?(?![a-zA-Z0-9_-])/g;
    const result: TemplateShorthandOccurrence[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(value)) !== null) {
      const rawMatch = match[0];
      const name = match[1];
      const rawArgs = match[2];
      const leadOffset = rawMatch.startsWith("#") ? 0 : 1;
      const start = match.index + leadOffset;
      const end = match.index + rawMatch.length;
      result.push({
        name,
        params: parseShorthandParams(rawArgs),
        start,
        end,
      });
    }
    return result;
  }, [value]);

  const removeTemplateShorthand = (occ: TemplateShorthandOccurrence) => {
    onChange(value.substring(0, occ.start) + value.substring(occ.end));
  };

  const updateTemplateShorthandVar = (
    occ: TemplateShorthandOccurrence,
    varKey: string,
    varVal: string,
  ) => {
    const tplDef = availableTemplates.find((t) => t.name === occ.name);
    const declaredOrder = tplDef ? tplDef.variables : [];
    const nextParams: Record<string, string> = {
      ...occ.params,
      [varKey]: varVal,
    };

    const orderedKeys = [
      ...declaredOrder,
      ...Object.keys(nextParams).filter((k) => !declaredOrder.includes(k)),
    ];

    const entries = orderedKeys
      .map((k) => [k, nextParams[k] ?? ""] as const)
      .filter(([, v]) => String(v).trim() !== "");

    let replacement = `#${occ.name}`;
    if (entries.length > 0) {
      const formattedArgs = entries
        .map(([k, v]) => {
          const escaped = String(v)
            .replace(/"/g, '\\"')
            .replace(/\r?\n/g, " ");
          return `${k}="${escaped}"`;
        })
        .join(", ");
      replacement = `#${occ.name}(${formattedArgs})`;
    }

    onChange(
      value.substring(0, occ.start) + replacement + value.substring(occ.end),
    );
  };

  const filteredTemplates = useMemo(() => {
    const q = templateQuery.trim().toLowerCase();
    if (!q) return availableTemplates;
    return availableTemplates.filter((t) =>
      t.name.toLowerCase().includes(q),
    );
  }, [availableTemplates, templateQuery]);

  const closeTemplateMenu = useCallback(() => {
    setIsTemplateMenuOpen(false);
    setTemplateQuery("");
    setTemplateHashRange(null);
    setSelectedTemplateIdx(0);
  }, []);

  const insertTemplateShorthand = useCallback(
    (templateName: string) => {
      const el = node;
      const tag = `#${templateName} `;
      if (!el) {
        onChange(value ? `${value} ${tag}` : tag);
        closeTemplateMenu();
        return;
      }

      const currentVal = el.value ?? value;
      let replaceStart: number;
      let replaceEnd: number;

      if (templateHashRange) {
        replaceStart = templateHashRange.start;
        replaceEnd = templateHashRange.end;
      } else {
        const start = el.selectionStart ?? currentVal.length;
        const end = el.selectionEnd ?? currentVal.length;
        const before = currentVal.substring(0, start);
        const hashMatch = before.match(/(?:^|\s)(#[a-zA-Z0-9_-]*)$/);
        replaceStart = hashMatch ? start - hashMatch[1].length : start;
        replaceEnd = end;
      }

      const prefix = currentVal.substring(0, replaceStart);
      const needsLeadSpace =
        prefix.length > 0 && !/\s$/.test(prefix) && !templateHashRange;
      const insertion = `${needsLeadSpace ? " " : ""}${tag}`;
      const nextVal =
        prefix + insertion + currentVal.substring(replaceEnd);

      setFieldValue(el, nextVal);
      closeTemplateMenu();
      setTimeout(() => {
        el.focus();
        const nextPos = replaceStart + insertion.length;
        el.setSelectionRange(nextPos, nextPos);
      }, 0);
    },
    [node, value, onChange, closeTemplateMenu, templateHashRange],
  );

  /**
   * Evaluates whether the caret in `el` is currently inside a `#<query>` token
   * and updates the VS Code Intellisense popup position & filter query live.
   */
  const syncHashIntellisense = useCallback(
    (el: HTMLInputElement | HTMLTextAreaElement) => {
      const caret = el.selectionStart ?? 0;
      const selEnd = el.selectionEnd ?? caret;
      if (caret !== selEnd) {
        if (isTemplateMenuOpen && templateHashRange) closeTemplateMenu();
        return;
      }

      const textBefore = (el.value || "").substring(0, caret);
      const match = textBefore.match(/(?:^|\s)#([a-zA-Z0-9_-]*)$/);
      if (match) {
        const query = match[1] || "";
        const hashIdx = caret - query.length - 1;
        setTemplateQuery(query);
        setTemplateHashRange({ start: hashIdx, end: caret });
        setSelectedTemplateIdx(0);
        setTemplateMenuCoords(getCaretPopupCoords(el, hashIdx));
        setIsTemplateMenuOpen(true);
      } else if (isTemplateMenuOpen && templateHashRange !== null) {
        closeTemplateMenu();
      }
    },
    [isTemplateMenuOpen, templateHashRange, closeTemplateMenu],
  );

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const el = e.currentTarget;
    onChange(el.value);
    syncHashIntellisense(el);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (isTemplateMenuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (filteredTemplates.length > 0) {
          setSelectedTemplateIdx((prev) =>
            (prev + 1) % filteredTemplates.length,
          );
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (filteredTemplates.length > 0) {
          setSelectedTemplateIdx((prev) =>
            (prev - 1 + filteredTemplates.length) % filteredTemplates.length,
          );
        }
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        const picked =
          filteredTemplates[selectedTemplateIdx] ?? filteredTemplates[0];
        if (picked) {
          e.preventDefault();
          insertTemplateShorthand(picked.name);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeTemplateMenu();
        return;
      }
    }

    if (e.key === "@" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const el = e.currentTarget;
      const start = el.selectionStart ?? 0;
      const val = el.value || "";
      const prevChar = start > 0 ? val[start - 1] : " ";
      if (start === 0 || /\s/.test(prevChar)) {
        setTimeout(() => {
          openMentionPicker(el, { start, end: start + 1 });
        }, 0);
      }
    }
  };

  return (
    <div className={cn("space-y-1.5 relative group/field", className)}>
      <div className="relative">
        {as === "textarea" ? (
          <textarea
            ref={setNode}
            rows={rows}
            value={value}
            onChange={handleFieldChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(fieldClasses, "pr-20")}
          />
        ) : (
          <input
            ref={setNode}
            type="text"
            value={value}
            onChange={handleFieldChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(fieldClasses, "pr-20")}
          />
        )}

        {/* Quick Actions (Mention User, Insert Template & Insert Icon) inside the field */}
        <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover/field:opacity-100 focus-within:opacity-100 transition-all z-10">
          <button
            ref={templateBtnRef}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (isTemplateMenuOpen) {
                closeTemplateMenu();
              } else {
                const coords = templateBtnRef.current
                  ? getAnchorButtonCoords(templateBtnRef.current)
                  : node
                    ? getCaretPopupCoords(node, node.selectionStart ?? 0)
                    : null;
                setTemplateQuery("");
                setTemplateHashRange(null);
                setSelectedTemplateIdx(0);
                setTemplateMenuCoords(coords);
                setIsTemplateMenuOpen(true);
              }
            }}
            title="Insert Template (#name)"
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer",
              isTemplateMenuOpen
                ? "text-indigo-300 bg-indigo-500/20"
                : "text-neutral-500 hover:text-indigo-400 hover:bg-indigo-400/15",
            )}
          >
            <LuBlocks className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (node) {
                openMentionPicker(node);
              } else {
                openMentionPicker();
              }
            }}
            title="Mention User (@name)"
            className="p-1 rounded-md text-neutral-500 hover:text-sky-400 hover:bg-sky-400/15 transition-all cursor-pointer"
          >
            <LuAtSign className="w-3.5 h-3.5" />
          </button>
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
            className="p-1 rounded-md text-neutral-500 hover:text-amber-400 hover:bg-amber-400/15 transition-all cursor-pointer"
          >
            <LuSmile className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* VS Code-Style Floating Template Intellisense Portal (Never clipped by parent overflow-hidden) */}
        <TemplateIntellisensePortal
          isOpen={isTemplateMenuOpen}
          coords={templateMenuCoords}
          query={templateQuery}
          templates={filteredTemplates}
          selectedIndex={selectedTemplateIdx}
          onSelectIndex={setSelectedTemplateIdx}
          onPickTemplate={insertTemplateShorthand}
          onClose={closeTemplateMenu}
        />
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

      {/* Embedded User Mention Pills */}
      {userMentions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            Mentions:
          </span>
          {userMentions.map((m, idx) => (
            <span
              key={`user-mention-${idx}`}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-200 text-[11px] font-medium"
            >
              {m.avatar ? (
                <img
                  src={m.avatar}
                  alt=""
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full bg-sky-400/25 text-[9px] flex items-center justify-center font-bold">
                  {m.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-28 truncate">{m.name}</span>
              <button
                type="button"
                onClick={() =>
                  openMentionPicker(node, { start: m.start, end: m.end })
                }
                title="Edit mention"
                className="p-0.5 rounded-full hover:bg-sky-400/20 text-sky-300 transition-colors cursor-pointer"
              >
                <LuPencil className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={() => removeUserMention(m)}
                title="Remove mention"
                className="p-0.5 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LuX className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Embedded Template Shorthand Pills & Variable Rows */}
      {templateShorthands.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          {/* Compact pills for 0-variable template shorthands */}
          {templateShorthands.some((t) => {
            const def = availableTemplates.find((d) => d.name === t.name);
            const hasVars =
              (def && def.variables.length > 0) ||
              Object.keys(t.params).length > 0;
            return !hasVars;
          }) && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Templates:
              </span>
              {templateShorthands.map((t, idx) => {
                const def = availableTemplates.find((d) => d.name === t.name);
                const hasVars =
                  (def && def.variables.length > 0) ||
                  Object.keys(t.params).length > 0;
                if (hasVars) return null;
                return (
                  <span
                    key={`tpl-pill-${t.name}-${idx}`}
                    className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-mono font-medium bg-indigo-500/10 border border-indigo-400/20 text-indigo-200"
                  >
                    <span>#{t.name}</span>
                    <button
                      type="button"
                      onClick={() => removeTemplateShorthand(t)}
                      title={`Remove #${t.name}`}
                      className="p-0.5 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <LuX className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Embedded Variable Editor Rows for templates with {{variables}} */}
          {templateShorthands.map((t, idx) => {
            const def = availableTemplates.find((d) => d.name === t.name);
            const declaredVars = def ? def.variables : [];
            const extraVars = Object.keys(t.params).filter(
              (k) => !declaredVars.includes(k),
            );
            const allVars = [...declaredVars, ...extraVars];
            if (allVars.length === 0) return null;

            return (
              <div
                key={`tpl-vars-row-${idx}`}
                className="rounded-xl border border-indigo-400/20 bg-indigo-500/6 p-2.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <LuBlocks className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <span className="text-[11px] font-mono font-semibold text-indigo-200 truncate">
                      #{t.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-400/20 text-indigo-300">
                      {allVars.length} {allVars.length === 1 ? "var" : "vars"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTemplateShorthand(t)}
                    title={`Remove #${t.name}`}
                    className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                  >
                    <LuX className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allVars.map((varKey) => (
                    <div
                      key={varKey}
                      className="flex items-center gap-1.5 bg-black/35 border border-white/10 focus-within:border-indigo-400/60 rounded-lg px-2 py-1 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-indigo-300 shrink-0 select-none">
                        {`{{${varKey}}}`}
                      </span>
                      <input
                        type="text"
                        data-format-role="plain"
                        value={t.params[varKey] ?? ""}
                        onChange={(e) =>
                          updateTemplateShorthandVar(t, varKey, e.target.value)
                        }
                        placeholder={`Value for ${varKey}...`}
                        className="flex-1 min-w-0 bg-transparent text-[11px] text-white placeholder:text-neutral-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
