"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LuBold,
  LuItalic,
  LuStrikethrough,
  LuCode,
  LuLink as LuLinkIcon,
  LuSparkles,
  LuRemoveFormatting,
  LuType,
  LuMessageSquareQuote,
  LuChevronDown,
} from "react-icons/lu";
import { useInlineTooltip } from "./InlineTooltipContext";
import {
  parseInlineTooltips,
  rangesOverlap,
  setFieldValue,
  stripInlineTooltips,
} from "./inline-tooltip-utils";

interface ToolbarCapabilities {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  code: boolean;
  fontSize: boolean;
  link: boolean;
  accent: boolean;
  tooltip: boolean;
  clear: boolean;
}

interface SelectionPosition {
  x: number;
  y: number;
  placement: "top" | "bottom";
  element: HTMLInputElement | HTMLTextAreaElement;
  capabilities: ToolbarCapabilities;
}

/**
 * Calculates the exact pixel bounding box of the active text selection
 * inside an <input> or <textarea>, and determines whether the toolbar should
 * sit above or below the selected text line so it never covers the text.
 */
function getSelectionCoordinates(el: HTMLInputElement | HTMLTextAreaElement): {
  x: number;
  y: number;
  placement: "top" | "bottom";
} {
  const elRect = el.getBoundingClientRect();
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;

  let spanTop = elRect.top;
  let spanHeight = 24;
  let spanCenterX = elRect.left + elRect.width / 2;

  try {
    const isInput = el instanceof HTMLInputElement;
    const computed = window.getComputedStyle(el);
    const mirror = document.createElement("div");

    mirror.style.position = "fixed";
    mirror.style.top = "-9999px";
    mirror.style.left = "-9999px";
    mirror.style.visibility = "hidden";
    mirror.style.pointerEvents = "none";
    mirror.style.width = `${el.clientWidth}px`;
    mirror.style.boxSizing = computed.boxSizing;
    mirror.style.fontFamily = computed.fontFamily;
    mirror.style.fontSize = computed.fontSize;
    mirror.style.fontWeight = computed.fontWeight;
    mirror.style.fontStyle = computed.fontStyle;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.style.lineHeight = computed.lineHeight;
    mirror.style.textTransform = computed.textTransform;
    mirror.style.wordSpacing = computed.wordSpacing;
    mirror.style.textIndent = computed.textIndent;
    mirror.style.paddingTop = computed.paddingTop;
    mirror.style.paddingRight = computed.paddingRight;
    mirror.style.paddingBottom = computed.paddingBottom;
    mirror.style.paddingLeft = computed.paddingLeft;
    mirror.style.borderTopWidth = computed.borderTopWidth;
    mirror.style.borderRightWidth = computed.borderRightWidth;
    mirror.style.borderBottomWidth = computed.borderBottomWidth;
    mirror.style.borderLeftWidth = computed.borderLeftWidth;
    mirror.style.whiteSpace = isInput ? "pre" : "pre-wrap";
    mirror.style.wordBreak = isInput ? "normal" : "break-word";
    mirror.style.overflowWrap = isInput ? "normal" : "break-word";

    const value = el.value;
    const textBefore = document.createTextNode(value.substring(0, start));
    const span = document.createElement("span");
    span.textContent = value.substring(start, end) || " ";
    const textAfter = document.createTextNode(value.substring(end));

    mirror.appendChild(textBefore);
    mirror.appendChild(span);
    mirror.appendChild(textAfter);

    document.body.appendChild(mirror);

    const borderTop = parseFloat(computed.borderTopWidth) || 0;
    const borderLeft = parseFloat(computed.borderLeftWidth) || 0;

    const spanOffsetTop = span.offsetTop;
    const spanOffsetLeft = span.offsetLeft;
    const measuredWidth = span.offsetWidth;
    const measuredHeight = span.offsetHeight;

    document.body.removeChild(mirror);

    spanTop = elRect.top + borderTop + spanOffsetTop - el.scrollTop;
    spanHeight = measuredHeight > 0 ? measuredHeight : 24;
    const spanLeft = elRect.left + borderLeft + spanOffsetLeft - el.scrollLeft;
    spanCenterX = spanLeft + measuredWidth / 2;
  } catch {
    spanTop = elRect.top;
    spanHeight = 24;
    spanCenterX = elRect.left + elRect.width / 2;
  }

  // Constrain horizontally so toolbar stays within viewport bounds (toolbar is ~340px wide)
  const minX = 175;
  const maxX = window.innerWidth - 175;
  const x = Math.max(minX, Math.min(maxX, spanCenterX));

  // Toolbar height is ~42px. We maintain a clean 10px visual clearance gap.
  const TOOLBAR_HEIGHT = 42;
  const GAP = 10;
  const spaceAbove = spanTop - (TOOLBAR_HEIGHT + GAP);

  if (spaceAbove >= 10) {
    // Position above the selected text:
    // With transform translate(-50%, -100%), 'y' marks the bottom edge of the toolbar,
    // placing it exactly GAP pixels above the top of the selected text line.
    return {
      x,
      y: spanTop - GAP,
      placement: "top",
    };
  } else {
    // If not enough room above (e.g. input scrolled to top of window), flip below the text
    // With transform translate(-50%, 0), 'y' marks the top edge of the toolbar,
    // placing it exactly GAP pixels below the bottom of the selected text line.
    return {
      x,
      y: spanTop + spanHeight + GAP,
      placement: "bottom",
    };
  }
}

/**
 * Detects if the current selection range [start, end) touches, contains,
 * or is situated inside any tag (e.g. <Tag>, </Tag>, <LuIcon ... />, <span ...>, <InlineTooltip ...>).
 * Selecting tags or text inside tags should never display the formatting toolbar.
 */
function selectionOverlapsTag(
  value: string,
  start: number,
  end: number,
): boolean {
  if (start >= end) return false;

  const selectedText = value.substring(start, end);
  // If the selected text itself contains tag delimiters '<' or '>'
  if (selectedText.includes("<") || selectedText.includes(">")) {
    return true;
  }

  // Check if cursor/selection is inside an unclosed tag '<' before start without matching '>' before start
  const before = value.substring(0, start);
  const lastOpen = before.lastIndexOf("<");
  const lastClose = before.lastIndexOf(">");
  if (lastOpen > lastClose) {
    const nextClose = value.indexOf(">", start);
    if (nextClose !== -1) {
      return true;
    }
  }

  // Check overlap against all HTML/JSX/MDX tags matching <tag ...> or </tag>
  const TAG_REGEX = /<(?:\/?[a-zA-Z][^>]*?)>/g;
  let match: RegExpExecArray | null;
  while ((match = TAG_REGEX.exec(value)) !== null) {
    const tagStart = match.index;
    const tagEnd = match.index + match[0].length;
    if (rangesOverlap(tagStart, tagEnd, start, end)) {
      return true;
    }
  }

  return false;
}

function getCapabilities(
  el: HTMLInputElement | HTMLTextAreaElement,
): ToolbarCapabilities | null {
  // Never format non-text input types like URLs, numbers, search
  if (el.type === "url" || el.type === "number" || el.type === "search") {
    return null;
  }

  const formatRole = el.getAttribute("data-format-role");
  if (formatRole === "plain") return null;

  // Never format inside inline tooltip blocks
  if (
    el.closest("[data-inline-tooltip-block]") ||
    el.closest("[data-inline-tooltip]") ||
    el.hasAttribute("data-inline-tooltip-input") ||
    el.getAttribute("data-inline-tooltip") === "true"
  ) {
    return null;
  }

  // Find enclosing block type
  const blockCard = el.closest("[data-block-type]");
  const blockType = blockCard?.getAttribute("data-block-type") || "paragraph";

  // Code snippets, chips, avatar, profile, and dividers do not support rich text formatting
  if (
    blockType === "code" ||
    blockType === "divider" ||
    blockType === "chipGroup" ||
    blockType === "avatar" ||
    blockType === "profile"
  ) {
    return null;
  }

  // Tab labels and configuration inputs do not support rich formatting tools
  if (
    blockType === "tabs" ||
    el.getAttribute("data-tab-label") === "true" ||
    el.placeholder?.toLowerCase().includes("tab title") ||
    el.placeholder?.toLowerCase().includes("package-manager")
  ) {
    return null;
  }

  // Heading Block: Headings have their own native anchor slugging in Fumadocs,
  // so manual anchoring/links are disallowed to prevent invalid nested anchors.
  // Headings also have fixed semantic sizing (H1/H2/H3) and are font-bold by default.
  if (blockType === "heading" || formatRole === "heading") {
    return {
      bold: false,
      italic: true,
      strike: false,
      code: true,
      fontSize: false,
      link: false, // NO anchoring on headings
      accent: true,
      tooltip: true, // headings are markdown - inline JSX is valid
      clear: true,
    };
  }

  // Table Cells: Bold, Italic, Strikethrough, Code, Links, Accent
  if (blockType === "table") {
    return {
      bold: true,
      italic: true,
      strike: true,
      code: true,
      fontSize: false,
      link: true,
      accent: true,
      tooltip: false,
      clear: true,
    };
  }

  // Single-line input titles & labels (Card title, Accordion title, Callout title, Tab title)
  if (el.tagName === "INPUT" || formatRole === "title") {
    // Image caption allows attribution links and italics
    if (
      formatRole === "caption" ||
      el.placeholder?.toLowerCase().includes("caption")
    ) {
      return {
        bold: false,
        italic: true,
        strike: false,
        code: true,
        fontSize: false,
        link: true, // attribution links permitted in caption
        accent: false,
        tooltip: false,
        clear: true,
      };
    }

    return {
      bold: true,
      italic: true,
      strike: false,
      code: true,
      fontSize: false,
      link: false, // titles/headers do not support anchoring
      accent: true,
      tooltip: false, // titles emit into JSX attributes - inline components are not valid there
      clear: true,
    };
  }

  // Callout Alert Content Body
  if (blockType === "callout") {
    return {
      bold: true,
      italic: true,
      strike: true,
      code: true,
      fontSize: false, // callouts have standardized font sizing
      link: true,
      accent: true,
      tooltip: true,
      clear: true,
    };
  }

  // Paragraph and general rich body text (Card content, Accordion content, Paragraph)
  return {
    bold: true,
    italic: true,
    strike: true,
    code: true,
    fontSize: true,
    link: true, // full anchoring supported
    accent: true,
    tooltip: true,
    clear: true,
  };
}

export const TextSelectionMenu: React.FC<{
  containerRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const [position, setPosition] = useState<SelectionPosition | null>(null);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isMouseDownRef = useRef(false);

  // Floating menu only LAUNCHES tooltip editing - the actual editor is
  // pushed into the responsible block (under its main input) through context
  const { open: openTooltipEditor } = useInlineTooltip();

  useEffect(() => {
    const checkAndShowMenu = () => {
      // Never show while the user is actively dragging the mouse to select text!
      if (isMouseDownRef.current) return;

      const activeEl = document.activeElement;
      if (
        !activeEl ||
        !(
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement
        )
      ) {
        setPosition(null);
        setShowSizeDropdown(false);
        return;
      }

      // Check if the input is within our builder canvas/container if provided
      if (containerRef?.current && !containerRef.current.contains(activeEl)) {
        setPosition(null);
        setShowSizeDropdown(false);
        return;
      }

      const start = activeEl.selectionStart ?? 0;
      const end = activeEl.selectionEnd ?? 0;

      // Only show when there is an actual non-empty selection
      if (start === end || activeEl.value.substring(start, end).trim() === "") {
        setPosition(null);
        setShowSizeDropdown(false);
        return;
      }

      // Never trigger tools panel if selection is inside an inline tooltip block
      if (
        activeEl.closest("[data-inline-tooltip-block]") ||
        activeEl.closest("[data-inline-tooltip]") ||
        activeEl.hasAttribute("data-inline-tooltip-input") ||
        activeEl.getAttribute("data-inline-tooltip") === "true"
      ) {
        setPosition(null);
        setShowSizeDropdown(false);
        return;
      }

      // Check if global document/window selection is inside an inline tooltip block
      const winSel = window.getSelection();
      if (winSel && !winSel.isCollapsed && winSel.rangeCount > 0) {
        const anchorNode = winSel.anchorNode;
        const anchorEl =
          anchorNode instanceof Element
            ? anchorNode
            : anchorNode?.parentElement;
        if (anchorEl?.closest("[data-inline-tooltip-block]")) {
          setPosition(null);
          setShowSizeDropdown(false);
          return;
        }
      }

      // Never trigger toolbar if selection touches, overlaps, or is inside any tag (e.g. <Tag>, </Tag>, <LuIcon />, etc.)
      if (selectionOverlapsTag(activeEl.value, start, end)) {
        setPosition(null);
        setShowSizeDropdown(false);
        return;
      }

      // If selection is inside or touches an inline tooltip tag in the field, don't trigger tools panel
      if (activeEl.value.includes("<InlineTooltip")) {
        const occurrences = parseInlineTooltips(activeEl.value);
        const insideTooltip = occurrences.some((o) =>
          rangesOverlap(o.start, o.end, start, end),
        );
        if (insideTooltip) {
          setPosition(null);
          setShowSizeDropdown(false);
          return;
        }
      }

      // Determine capabilities for this specific input / block type
      const capabilities = getCapabilities(activeEl);
      if (!capabilities) {
        setPosition(null);
        setShowSizeDropdown(false);
        return;
      }

      const coords = getSelectionCoordinates(activeEl);

      setPosition({
        x: coords.x,
        y: coords.y,
        placement: coords.placement,
        element: activeEl,
        capabilities,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking inside the floating menu itself, do not close it
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      isMouseDownRef.current = true;
      // Close menu immediately on mouse down so it never interferes with selection
      setPosition(null);
      setShowSizeDropdown(false);
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      // Wait for mouseup to finalize the native selection range before evaluating
      setTimeout(checkAndShowMenu, 40);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Check for keyboard selections (e.g. Shift + Arrow keys, Cmd/Ctrl + A)
      checkAndShowMenu();
    };

    const handleBlur = () => {
      // Small timeout to allow clicking menu buttons without prematurely hiding
      setTimeout(() => {
        const active = document.activeElement;
        if (
          !active ||
          !(
            active instanceof HTMLInputElement ||
            active instanceof HTMLTextAreaElement
          )
        ) {
          setPosition(null);
          setShowSizeDropdown(false);
        }
      }, 150);
    };

    window.addEventListener("mousedown", handleMouseDown, true);
    window.addEventListener("mouseup", handleMouseUp, true);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("scroll", checkAndShowMenu, true);
    window.addEventListener("resize", checkAndShowMenu);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("mouseup", handleMouseUp, true);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("scroll", checkAndShowMenu, true);
      window.removeEventListener("resize", checkAndShowMenu);
    };
  }, [containerRef]);

  if (!position || !position.capabilities) return null;

  const caps = position.capabilities;

  const applyFormat = (
    formatter: (selected: string) => { text: string; selectOffset?: number },
  ) => {
    const el = position.element;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = el.value;
    const selected = value.substring(start, end);

    if (!selected) return;

    const { text: formatted } = formatter(selected);
    const newValue =
      value.substring(0, start) + formatted + value.substring(end);

    // Use native prototype setter to guarantee React synthetic onChange fires
    const prototype =
      el instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (setter) {
      setter.call(el, newValue);
    } else {
      el.value = newValue;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();

    // Re-select formatted text
    setTimeout(() => {
      el.setSelectionRange(start, start + formatted.length);
    }, 0);
  };

  const handleBold = () => {
    applyFormat((sel) => {
      if (sel.startsWith("**") && sel.endsWith("**") && sel.length >= 4) {
        return { text: sel.slice(2, -2) };
      }
      return { text: `**${sel}**` };
    });
  };

  const handleItalic = () => {
    applyFormat((sel) => {
      if (
        sel.startsWith("*") &&
        sel.endsWith("*") &&
        sel.length >= 2 &&
        !sel.startsWith("**")
      ) {
        return { text: sel.slice(1, -1) };
      }
      return { text: `*${sel}*` };
    });
  };

  const handleStrike = () => {
    applyFormat((sel) => {
      if (sel.startsWith("~~") && sel.endsWith("~~") && sel.length >= 4) {
        return { text: sel.slice(2, -2) };
      }
      return { text: `~~${sel}~~` };
    });
  };

  const handleCode = () => {
    applyFormat((sel) => {
      if (sel.startsWith("`") && sel.endsWith("`") && sel.length >= 2) {
        return { text: sel.slice(1, -1) };
      }
      return { text: `\`${sel}\`` };
    });
  };

  const handleFontSize = (size: "sm" | "base" | "lg" | "xl") => {
    setShowSizeDropdown(false);
    applyFormat((sel) => {
      // Clean previous size wrappers
      const clean = sel
        .replace(/<small>(.*?)<\/small>/g, "$1")
        .replace(/<span className="text-[^"]+">(.*?)<\/span>/g, "$1");

      if (size === "sm") {
        return { text: `<small>${clean}</small>` };
      } else if (size === "lg") {
        return {
          text: `<span className="text-lg font-medium">${clean}</span>`,
        };
      } else if (size === "xl") {
        return { text: `<span className="text-xl font-bold">${clean}</span>` };
      }
      return { text: clean };
    });
  };

  const handleLink = () => {
    const url = window.prompt("Enter link URL:", "https://");
    if (!url) return;
    applyFormat((sel) => ({
      text: `[${sel}](${url})`,
    }));
  };

  const handleAccent = () => {
    applyFormat((sel) => {
      if (
        sel.startsWith('<span className="text-accent">') &&
        sel.endsWith("</span>")
      ) {
        return { text: sel.slice(30, -7) };
      }
      return { text: `<span className="text-accent">${sel}</span>` };
    });
  };

  // Floating menu button action: unwrap when the selection touches existing
  // tooltip markup, or hand a plain-text selection to the owning block
  // (through context) so its inline editor opens under the main input
  const handleTooltip = () => {
    const el = position.element;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const core = el.value.substring(start, end).trim();
    if (!core) return;

    const occurrences = parseInlineTooltips(el.value);
    const touched = occurrences.filter((o) =>
      rangesOverlap(o.start, o.end, start, end),
    );

    // Selection fully inside ONE occurrence (incl. tag text itself):
    // unwrap the WHOLE tooltip - tag fragments are never re-wrapped
    if (touched.length === 1) {
      const o = touched[0];
      if (o.start <= start && end <= o.end) {
        const newValue =
          el.value.substring(0, o.start) + o.inner + el.value.substring(o.end);
        setFieldValue(el, newValue);

        // Collapse the caret after the unwrapped text
        const caret = o.start + o.inner.length;
        setTimeout(() => {
          el.setSelectionRange(caret, caret);
        }, 0);
        return;
      }
    }

    // Selection overlapping tag markup (crossing boundaries): never safe to
    // wrap or unwrap - block silently
    if (touched.length > 0) return;

    openTooltipEditor(el, core, start, end);
  };

  const handleClearFormat = () => {
    applyFormat((sel) => {
      const pre = sel
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/~~(.*?)~~/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/<small>(.*?)<\/small>/g, "$1")
        .replace(/<span[^>]*>(.*?)<\/span>/g, "$1")
        .replace(/\[(.*?)\]\([^)]+\)/g, "$1");
      // Shared unwrapper - identical tooltip understanding as the editor field
      return { text: stripInlineTooltips(pre) };
    });
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform:
          position.placement === "top"
            ? "translate(-50%, -100%)"
            : "translate(-50%, 0)",
        zIndex: 9999,
      }}
      className="flex items-center gap-0.5 rounded-xl bg-muted border border-white/10 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.85)] animate-in fade-in-0 zoom-in-95 duration-100 select-none text-white text-xs"
    >
      {/* Bold */}
      {caps.bold && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleBold();
          }}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LuBold className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Italic */}
      {caps.italic && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleItalic();
          }}
          title="Italic (*text*)"
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LuItalic className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Strikethrough */}
      {caps.strike && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleStrike();
          }}
          title="Strikethrough (~~text~~)"
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LuStrikethrough className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Inline Code */}
      {caps.code && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCode();
          }}
          title="Inline Code (`code`)"
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LuCode className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Font Size Dropdown (Only shown when block supports font size changes) */}
      {caps.fontSize && (
        <>
          <div className="w-px h-4 bg-white/15 mx-0.5" />
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowSizeDropdown((prev) => !prev);
              }}
              title="Font Size"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors text-[11px] font-mono font-medium"
            >
              <LuType className="w-3.5 h-3.5 text-accent" />
              <span>Size</span>
              <LuChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {showSizeDropdown && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute top-full left-0 mt-1.5 w-28 rounded-xl bg-neutral-900 border border-white/20 p-1 shadow-2xl z-50 flex flex-col gap-0.5"
              >
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFontSize("sm");
                  }}
                  className="px-2 py-1 text-left rounded-lg text-[11px] text-neutral-300 hover:text-white hover:bg-white/10"
                >
                  Small (small)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFontSize("base");
                  }}
                  className="px-2 py-1 text-left rounded-lg text-[11px] text-neutral-300 hover:text-white hover:bg-white/10 font-medium"
                >
                  Normal (base)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFontSize("lg");
                  }}
                  className="px-2 py-1 text-left rounded-lg text-xs text-neutral-200 hover:text-white hover:bg-white/10 font-semibold"
                >
                  Large (18px)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFontSize("xl");
                  }}
                  className="px-2 py-1 text-left rounded-lg text-xs text-neutral-100 hover:text-white hover:bg-white/10 font-bold"
                >
                  Extra Large
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {(caps.link || caps.accent) && (
        <div className="w-px h-4 bg-white/15 mx-0.5" />
      )}

      {/* Link / Anchoring (Excluded on headings, titles, etc.) */}
      {caps.link && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleLink();
          }}
          title="Insert Link ([text](url))"
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LuLinkIcon className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Accent Glow */}
      {caps.accent && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleAccent();
          }}
          title="Accent Highlight"
          className="p-1.5 rounded-lg text-accent hover:bg-accent/20 transition-colors"
        >
          <LuSparkles className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Inline Tooltip */}
      {caps.tooltip && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleTooltip();
          }}
          title="Inline Tooltip (<InlineTooltip>)"
          className="p-1.5 rounded-lg text-pink-300 hover:text-pink-200 hover:bg-pink-400/10 transition-colors"
        >
          <LuMessageSquareQuote className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Clear Formatting */}
      {caps.clear && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleClearFormat();
          }}
          title="Clear Formatting"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LuRemoveFormatting className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
