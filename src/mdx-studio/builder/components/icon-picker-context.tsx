"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useBuilderUiStore } from "../store/use-builder-ui-store";

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

    const isInsideCollapsed =
      start === end && start > iconStart && start < iconEnd;
    const isOverlappingRange =
      start !== end && Math.max(start, iconStart) < Math.min(end, iconEnd);
    const isExactSelection = start === iconStart && end === iconEnd;

    if (isInsideCollapsed || isOverlappingRange || isExactSelection) {
      const fullTag = match[0];
      const iconName = match[1];

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

export const useIconPicker = () =>
  useBuilderUiStore(
    useShallow((s) => ({
      isOpen: s.isIconPickerOpen,
      target: s.iconPickerTarget,
      openIconPicker: s.openIconPicker,
      closeIconPicker: s.closeIconPicker,
      insertIcon: s.insertIcon,
    })),
  );

/** Action-only selector so text fields never re-render when the icon modal opens/closes */
export const useOpenIconPicker = () =>
  useBuilderUiStore((s) => s.openIconPicker);

export const IconPickerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
