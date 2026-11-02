"use client";

import React, { useEffect } from "react";
import { StudioHeader } from "./components/StudioHeader";
import { MdxBuilder } from "./builder";
import { useMdxStudio } from "./MdxStudioContext";
import { MdxStudioModalProps } from "./types";
import { cn } from "@/lib/utils";

export const MdxStudioModal: React.FC<MdxStudioModalProps> = ({
  informationSlot,
  insertBlockListenerRef,
}) => {
  const studio = useMdxStudio();
  const {
    isOpen,
    title,
    documentName,
    activeTab,
    hasInformationTab,
    mdx,
    setMdx,
    save,
    closeStudio,
  } = studio;

  // Keyboard shortcuts: Cmd+S / Ctrl+S to save, Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        closeStudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, save, closeStudio]);

  if (!isOpen) return null;

  const currentDocLabel = documentName || title;

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in-0 duration-200">
      {/* Ambient Top Glow */}
      <div
        className="pointer-events-none absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-[120px]"
        aria-hidden="true"
      />

      {/* Header with Step Switcher */}
      <StudioHeader />

      {/* Main Work Area (Tabs preserved in memory across switches) */}
      <div className="flex-1 rounded-t-3xl border-t border-white/[0.06] flex overflow-hidden relative bg-muted/35">
        {hasInformationTab && (
          <div
            className={cn(
              "w-full h-full flex flex-col overflow-y-auto transition-opacity duration-200",
              activeTab === "details"
                ? "relative z-10 opacity-100 flex"
                : "hidden opacity-0 pointer-events-none -z-10",
            )}
          >
            {typeof informationSlot === "function"
              ? informationSlot(studio)
              : informationSlot}
          </div>
        )}

        <div
          className={cn(
            "w-full h-full flex flex-col overflow-hidden transition-opacity duration-200",
            activeTab === "builder" || !hasInformationTab
              ? "relative z-10 opacity-100 flex"
              : "hidden opacity-0 pointer-events-none -z-10",
          )}
        >
          {/* Wix-Style Visual MDX Builder Canvas */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <MdxBuilder
              title={title}
              documentName={currentDocLabel}
              value={mdx}
              onChange={setMdx}
              className="rounded-none border-none shadow-none h-full"
              minHeight="100%"
              onRegisterInsertBlock={(fn) => {
                if (insertBlockListenerRef) {
                  insertBlockListenerRef.current = fn;
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MdxStudioModal;
