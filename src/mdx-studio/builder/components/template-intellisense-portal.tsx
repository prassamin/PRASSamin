"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuBlocks, LuCornerDownLeft } from "react-icons/lu";
import { cn } from "@heroui/react";
import { TemplateDefinitionInfo } from "../types";

export interface CaretPopupCoords {
  left: number;
  top: number;
  placement: "top" | "bottom";
}

/**
 * Computes exact viewport-clamped (position: fixed) coordinates for a caret index
 * inside an <input> or <textarea>, automatically flipping above the line if too
 * close to the bottom edge of the screen.
 */
export function getCaretPopupCoords(
  el: HTMLInputElement | HTMLTextAreaElement,
  caretIndex: number,
  popupWidth = 288,
  popupMaxHeight = 240,
): CaretPopupCoords {
  const elRect = el.getBoundingClientRect();
  let caretTop = elRect.top + 8;
  let caretLeft = elRect.left + 12;
  let lineHeight = 22;

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

    const value = el.value || "";
    const textBefore = document.createTextNode(
      value.substring(0, Math.max(0, caretIndex)),
    );
    const marker = document.createElement("span");
    marker.textContent = "\u200b";

    mirror.appendChild(textBefore);
    mirror.appendChild(marker);
    document.body.appendChild(mirror);

    const borderTop = parseFloat(computed.borderTopWidth) || 0;
    const borderLeft = parseFloat(computed.borderLeftWidth) || 0;

    caretTop = elRect.top + borderTop + marker.offsetTop - el.scrollTop;
    caretLeft = elRect.left + borderLeft + marker.offsetLeft - el.scrollLeft;
    lineHeight = marker.offsetHeight > 0 ? marker.offsetHeight : 22;

    document.body.removeChild(mirror);
  } catch {
    caretTop = elRect.top + 8;
    caretLeft = elRect.left + 12;
  }

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const clampedLeft = Math.max(12, Math.min(vw - popupWidth - 12, caretLeft));
  const spaceBelow = vh - (caretTop + lineHeight + 6);
  const spaceAbove = caretTop - 6;

  if (spaceBelow < popupMaxHeight && spaceAbove > spaceBelow) {
    return {
      left: clampedLeft,
      top: Math.max(12, caretTop - 6),
      placement: "top",
    };
  }

  return {
    left: clampedLeft,
    top: Math.min(vh - 24, caretTop + lineHeight + 6),
    placement: "bottom",
  };
}

/**
 * Computes viewport-clamped coordinates anchored to a trigger button element.
 */
export function getAnchorButtonCoords(
  btnEl: HTMLElement,
  popupWidth = 288,
  popupMaxHeight = 240,
): CaretPopupCoords {
  const rect = btnEl.getBoundingClientRect();
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const left = Math.max(
    12,
    Math.min(vw - popupWidth - 12, rect.right - popupWidth),
  );
  const spaceBelow = vh - (rect.bottom + 6);
  const spaceAbove = rect.top - 6;

  if (spaceBelow < popupMaxHeight && spaceAbove > spaceBelow) {
    return {
      left,
      top: Math.max(12, rect.top - 6),
      placement: "top",
    };
  }

  return {
    left,
    top: rect.bottom + 6,
    placement: "bottom",
  };
}

interface TemplateIntellisensePortalProps {
  isOpen: boolean;
  coords: CaretPopupCoords | null;
  query: string;
  templates: TemplateDefinitionInfo[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  onPickTemplate: (name: string) => void;
  onClose: () => void;
}

export const TemplateIntellisensePortal: React.FC<TemplateIntellisensePortalProps> =
  React.memo(
    ({
      isOpen,
      coords,
      query,
      templates,
      selectedIndex,
      onSelectIndex,
      onPickTemplate,
      onClose,
    }) => {
      const listRef = useRef<HTMLDivElement | null>(null);
      const containerRef = useRef<HTMLDivElement | null>(null);

      // Keep active item scrolled into view during ArrowUp / ArrowDown navigation
      useEffect(() => {
        if (!isOpen || !listRef.current) return;
        const activeRow = listRef.current.querySelector<HTMLElement>(
          `[data-intellisense-idx="${selectedIndex}"]`,
        );
        if (activeRow) {
          activeRow.scrollIntoView({ block: "nearest" });
        }
      }, [isOpen, selectedIndex]);

      // Close on outside mousedown or window scroll/resize
      useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (e: MouseEvent) => {
          if (
            containerRef.current &&
            containerRef.current.contains(e.target as Node)
          ) {
            return;
          }
          onClose();
        };

        const handleScrollOrResize = (e: Event) => {
          if (
            containerRef.current &&
            e.target instanceof Node &&
            containerRef.current.contains(e.target)
          ) {
            return;
          }
          onClose();
        };

        window.addEventListener("mousedown", handleMouseDown, true);
        window.addEventListener("scroll", handleScrollOrResize, {
          capture: true,
          passive: true,
        });
        window.addEventListener("resize", handleScrollOrResize, {
          passive: true,
        });

        return () => {
          window.removeEventListener("mousedown", handleMouseDown, true);
          window.removeEventListener("scroll", handleScrollOrResize, true);
          window.removeEventListener("resize", handleScrollOrResize);
        };
      }, [isOpen, onClose]);

      if (!isOpen || !coords || typeof document === "undefined") return null;

      return createPortal(
        <div
          ref={containerRef}
          data-template-menu="true"
          style={{
            position: "fixed",
            left: `${coords.left}px`,
            top: `${coords.top}px`,
            transform:
              coords.placement === "top" ? "translateY(-100%)" : "none",
            zIndex: 9999,
          }}
          onMouseDown={(e) => {
            // Prevent blurring the active input/textarea when clicking inside Intellisense
            e.preventDefault();
          }}
          className="w-72 rounded-xl bg-[#131317]/98 border border-white/14 shadow-[0_18px_48px_rgba(0,0,0,0.88)] backdrop-blur-xl overflow-hidden text-white animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {/* VS Code Intellisense Header Bar */}
          <div className="flex items-center justify-start gap-2 px-3 py-1.5 bg-white/3 border-b border-white/8">
            <LuBlocks className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 font-semibold">
              Templates
            </span>
          </div>

          {/* Suggestions List */}
          {templates.length === 0 ? (
            <div className="px-3 py-4 text-center text-[11px] text-neutral-400">
              {query ? (
                <>
                  No template matching{" "}
                  <code className="font-mono text-neutral-200">#{query}</code>
                </>
              ) : (
                "No templates defined yet. Add a Template block first."
              )}
            </div>
          ) : (
            <div
              ref={listRef}
              data-lenis-prevent
              className="max-h-52 overflow-y-auto p-1 space-y-0.5"
            >
              {templates.map((t, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={t.id}
                    type="button"
                    data-intellisense-idx={idx}
                    onMouseEnter={() => onSelectIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onPickTemplate(t.name);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs",
                      isSelected
                        ? "bg-indigo-500/22 text-white ring-1 ring-indigo-400/35"
                        : "text-neutral-300 hover:bg-white/6 hover:text-white",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border text-[11px] font-mono font-bold",
                          isSelected
                            ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200"
                            : "bg-white/5 border-white/10 text-indigo-400",
                        )}
                      >
                        #
                      </span>
                      <span className="font-mono text-xs truncate font-medium">
                        {t.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {t.variables.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/15 border border-fuchsia-400/25 text-[10px] font-mono text-fuchsia-300">
                          {t.variables.length}{" "}
                          {t.variables.length === 1 ? "var" : "vars"}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-neutral-400">
                        {t.blockCount} {t.blockCount === 1 ? "block" : "blocks"}
                      </span>
                      {isSelected && (
                        <LuCornerDownLeft className="w-3 h-3 text-indigo-300 ml-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>,
        document.body,
      );
    },
  );

TemplateIntellisensePortal.displayName = "TemplateIntellisensePortal";
