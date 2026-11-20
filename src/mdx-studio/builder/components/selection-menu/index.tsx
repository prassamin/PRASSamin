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
  LuAtSign,
} from "react-icons/lu";
import { useInlineTooltip } from "../inline-tooltip-context";
import { useUserMention } from "../user-mention-context";
import {
  parseInlineTooltips,
  rangesOverlap,
  setFieldValue,
  stripInlineTooltips,
} from "../inline-tooltip-utils";
import {
  SelectionPosition,
  getSelectionCoordinates,
} from "./selection-coords";
import { selectionOverlapsTag, getCapabilities } from "./selection-rules";

export const TextSelectionMenu: React.FC<{
  containerRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const [position, setPosition] = useState<SelectionPosition | null>(null);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isMouseDownRef = useRef(false);
  const hasPositionRef = useRef(false);
  hasPositionRef.current = position !== null;

  const { open: openTooltipEditor } = useInlineTooltip();
  const { openMentionPicker } = useUserMention();

  useEffect(() => {
    const closeMenuIfOpen = () => {
      if (!hasPositionRef.current) return;
      hasPositionRef.current = false;
      setPosition(null);
      setShowSizeDropdown(false);
    };

    const checkAndShowMenu = () => {
      if (isMouseDownRef.current) return;

      const activeEl = document.activeElement;
      if (
        !activeEl ||
        !(
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement
        )
      ) {
        closeMenuIfOpen();
        return;
      }

      if (containerRef?.current && !containerRef.current.contains(activeEl)) {
        closeMenuIfOpen();
        return;
      }

      const start = activeEl.selectionStart ?? 0;
      const end = activeEl.selectionEnd ?? 0;

      if (start === end || activeEl.value.substring(start, end).trim() === "") {
        closeMenuIfOpen();
        return;
      }

      if (
        activeEl.closest("[data-inline-tooltip-block]") ||
        activeEl.closest("[data-inline-tooltip]") ||
        activeEl.hasAttribute("data-inline-tooltip-input") ||
        activeEl.getAttribute("data-inline-tooltip") === "true"
      ) {
        closeMenuIfOpen();
        return;
      }

      const winSel = window.getSelection();
      if (winSel && !winSel.isCollapsed && winSel.rangeCount > 0) {
        const anchorNode = winSel.anchorNode;
        const anchorEl =
          anchorNode instanceof Element
            ? anchorNode
            : anchorNode?.parentElement;
        if (anchorEl?.closest("[data-inline-tooltip-block]")) {
          closeMenuIfOpen();
          return;
        }
      }

      if (selectionOverlapsTag(activeEl.value, start, end)) {
        closeMenuIfOpen();
        return;
      }

      if (activeEl.value.includes("<InlineTooltip")) {
        const occurrences = parseInlineTooltips(activeEl.value);
        const insideTooltip = occurrences.some((o) =>
          rangesOverlap(o.start, o.end, start, end),
        );
        if (insideTooltip) {
          closeMenuIfOpen();
          return;
        }
      }

      const capabilities = getCapabilities(activeEl);
      if (!capabilities) {
        closeMenuIfOpen();
        return;
      }

      const coords = getSelectionCoordinates(activeEl);

      hasPositionRef.current = true;
      setPosition({
        x: coords.x,
        y: coords.y,
        placement: coords.placement,
        element: activeEl,
        capabilities,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      isMouseDownRef.current = true;
      closeMenuIfOpen();
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement
      ) {
        setTimeout(checkAndShowMenu, 30);
      } else {
        closeMenuIfOpen();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.shiftKey ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a")
      ) {
        checkAndShowMenu();
      } else if (hasPositionRef.current) {
        closeMenuIfOpen();
      }
    };

    const handleScroll = () => {
      if (!hasPositionRef.current) return;
      closeMenuIfOpen();
    };

    window.addEventListener("mousedown", handleMouseDown, {
      capture: true,
      passive: true,
    });
    window.addEventListener("mouseup", handleMouseUp, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keyup", handleKeyUp, { passive: true });
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("mouseup", handleMouseUp, true);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
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

    if (touched.length === 1) {
      const o = touched[0];
      if (o.start <= start && end <= o.end) {
        const newValue =
          el.value.substring(0, o.start) + o.inner + el.value.substring(o.end);
        setFieldValue(el, newValue);

        const caret = o.start + o.inner.length;
        setTimeout(() => {
          el.setSelectionRange(caret, caret);
        }, 0);
        return;
      }
    }

    if (touched.length > 0) return;

    openTooltipEditor(el, core, start, end);
  };

  const handleUserMention = () => {
    if (!position?.element) return;
    const el = position.element;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = el.value.substring(start, end).trim();
    openMentionPicker(el, {
      start,
      end,
      prefillName: selected || undefined,
    });
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

      {caps.userMention && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleUserMention();
          }}
          title="Mention User (@name)"
          className="p-1.5 rounded-lg text-sky-300 hover:text-sky-200 hover:bg-sky-400/10 transition-colors"
        >
          <LuAtSign className="w-3.5 h-3.5" />
        </button>
      )}

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
