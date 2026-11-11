"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { setFieldValue } from "./inline-tooltip-utils";

export interface ExistingIconInfo {
  tag: string;
  start: number;
  end: number;
  name?: string;
  size?: string;
  color?: string;
}

export interface IconInsertionTarget {
  element: HTMLInputElement | HTMLTextAreaElement;
  start: number;
  end: number;
  existingIcon?: ExistingIconInfo | null;
}

/**
 * Detects if the selection or cursor position falls inside an existing icon tag,
 * or overlaps an icon tag.
 */
export function findOverlappingIcon(
  value: string,
  start: number,
  end: number,
): ExistingIconInfo | null {
  const ICON_REGEX =
    /<((?:Lu|Si)[A-Z][a-zA-Z0-9]*)(?:[^>]*?)?(?:\/>|>\s*<\/\1>)/g;
  let match: RegExpExecArray | null;

  while ((match = ICON_REGEX.exec(value)) !== null) {
    const iconStart = match.index;
    const iconEnd = match.index + match[0].length;

    // Inside collapsed cursor (e.g. cursor at index between iconStart and iconEnd)
    const isInsideCollapsed =
      start === end && start > iconStart && start < iconEnd;
    // Overlapping selection range
    const isOverlappingRange =
      start !== end && Math.max(start, iconStart) < Math.min(end, iconEnd);
    // Exact selection of the icon
    const isExactSelection = start === iconStart && end === iconEnd;

    if (isInsideCollapsed || isOverlappingRange || isExactSelection) {
      const fullTag = match[0];
      const iconName = match[1];

      // Extract existing size and color if present
      const sizeMatch = fullTag.match(/className="[^"]*(w-\d+\s+h-\d+)/);
      const colorMatch = fullTag.match(
        /style=\{\{\s*color:\s*["']([^"']+)["']/,
      );

      return {
        tag: fullTag,
        start: iconStart,
        end: iconEnd,
        name: iconName,
        size: sizeMatch?.[1],
        color: colorMatch?.[1],
      };
    }
  }

  return null;
}

interface IconPickerContextValue {
  isOpen: boolean;
  target: IconInsertionTarget | null;
  /** Opens the icon picker, capturing the target element and cursor range */
  openIconPicker: (element?: HTMLInputElement | HTMLTextAreaElement) => void;
  closeIconPicker: () => void;
  /** Inserts the chosen icon JSX tag into the target element at cursor */
  insertIcon: (iconTag: string) => void;
}

const IconPickerContext = createContext<IconPickerContextValue>({
  isOpen: false,
  target: null,
  openIconPicker: () => {},
  closeIconPicker: () => {},
  insertIcon: () => {},
});

export const useIconPicker = () => useContext(IconPickerContext);

export const IconPickerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<IconInsertionTarget | null>(null);

  const openIconPicker = useCallback(
    (element?: HTMLInputElement | HTMLTextAreaElement) => {
      let active = element;
      if (!active) {
        const docActive = document.activeElement;
        if (
          docActive instanceof HTMLInputElement ||
          docActive instanceof HTMLTextAreaElement
        ) {
          active = docActive;
        }
      }

      if (active) {
        const start = active.selectionStart ?? active.value.length;
        const end = active.selectionEnd ?? active.value.length;
        const existing = findOverlappingIcon(active.value || "", start, end);

        if (existing) {
          // If cursor is placed inside an existing icon, select the whole tag for safe replacement
          setTarget({
            element: active,
            start: existing.start,
            end: existing.end,
            existingIcon: existing,
          });
        } else {
          setTarget({ element: active, start, end, existingIcon: null });
        }
      } else {
        setTarget(null);
      }
      setIsOpen(true);
    },
    [],
  );

  const closeIconPicker = useCallback(() => {
    setIsOpen(false);
    setTarget(null);
  }, []);

  const insertIcon = useCallback(
    (iconTag: string) => {
      if (!target?.element) {
        closeIconPicker();
        return;
      }

      const el = target.element;
      const currentValue = el.value || "";

      // Double check whether current position overlaps an existing icon tag
      const existing =
        target.existingIcon ||
        findOverlappingIcon(currentValue, target.start, target.end);

      const replaceStart = existing ? existing.start : target.start;
      const replaceEnd = existing ? existing.end : target.end;

      const before = currentValue.slice(0, replaceStart);
      const after = currentValue.slice(replaceEnd);

      const needsLeadingSpace = before.length > 0 && !/\s$/.test(before);
      const needsTrailingSpace = after.length > 0 && !/^\s/.test(after);

      const insertion = `${needsLeadingSpace ? " " : ""}${iconTag}${needsTrailingSpace ? " " : ""}`;
      const nextValue = `${before}${insertion}${after}`;

      setFieldValue(el, nextValue);

      // Place cursor right after the newly inserted/replaced tag
      const newCursorPos = before.length + (needsLeadingSpace ? 1 : 0) + iconTag.length + (needsTrailingSpace ? 1 : 0);
      requestAnimationFrame(() => {
        try {
          el.focus();
          el.setSelectionRange(newCursorPos, newCursorPos);
        } catch {}
      });

      closeIconPicker();
    },
    [target, closeIconPicker],
  );

  return (
    <IconPickerContext.Provider
      value={{
        isOpen,
        target,
        openIconPicker,
        closeIconPicker,
        insertIcon,
      }}
    >
      {children}
    </IconPickerContext.Provider>
  );
};
