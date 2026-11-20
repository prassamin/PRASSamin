"use client";

import React from "react";
import {
  LuLayoutTemplate,
  LuCode,
  LuCopy,
  LuCheck,
  LuUndo2,
  LuRedo2,
  LuEye,
  LuMenu,
} from "react-icons/lu";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { BuilderMode } from "../mdx-builder";

interface BuilderToolbarProps {
  title: string;
  documentName?: string;
  mode: BuilderMode;
  isSmallScreen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  copied: boolean;
  onModeChange: (newMode: BuilderMode) => void;
  onOpenFloatingTray: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopyCode: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = React.memo(
  ({
    title,
    documentName,
    mode,
    isSmallScreen,
    canUndo,
    canRedo,
    copied,
    onModeChange,
    onOpenFloatingTray,
    onUndo,
    onRedo,
    onCopyCode,
  }) => {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white/2 border-b border-white/8 flex-wrap select-none">
        {/* Left branding & Mobile block sidebar trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {mode === "builder" && (
            <button
              type="button"
              onClick={onOpenFloatingTray}
              className="flex lg:hidden items-center gap-1.5 p-2 rounded-xl bg-white/6 hover:bg-white/12 active:scale-95 border border-white/10 text-xs font-medium text-neutral-200 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Open Block Library"
              aria-label="Open Block Library"
            >
              <LuMenu className="w-3.5 h-3.5 text-accent" />
            </button>
          )}

          <div className="h-4 w-px bg-white/10 hidden sm:block shrink-0" />

          <div className="not-sm:hidden flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-white font-rethink truncate">
              {title}
            </span>
            {documentName && (
              <span className="text-xs text-neutral-400 font-mono truncate hidden md:inline">
                / {documentName}
              </span>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <SegmentedControl
            value={mode}
            onValueChange={(val) => onModeChange(val as BuilderMode)}
            options={[
              {
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuLayoutTemplate className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Builder</span>
                  </span>
                ),
                value: "builder",
              },
              {
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuCode className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">MDX Code</span>
                  </span>
                ),
                value: "code",
              },
              ...(isSmallScreen
                ? [
                    {
                      label: (
                        <span className="flex items-center gap-1.5 font-medium">
                          <LuEye className="w-3.5 h-3.5 text-accent" />
                          <span className="hidden sm:inline">Preview</span>
                        </span>
                      ),
                      value: "preview",
                    },
                  ]
                : []),
            ]}
          />

          {/* History Undo / Redo controls */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Undo"
            >
              <LuUndo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
              className="p-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Redo"
            >
              <LuRedo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy MDX button */}
          <button
            type="button"
            onClick={onCopyCode}
            title="Copy compiled MDX"
            className="p-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <LuCheck className="w-3.5 h-3.5 text-accent" />
            ) : (
              <LuCopy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  },
);
BuilderToolbar.displayName = "BuilderToolbar";
