"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StudioHeader } from "./components/StudioHeader";
import { MdxBuilder } from "./builder";
import { useMdxStudio } from "./MdxStudioContext";
import { MdxStudioModalProps } from "./types";
import { cn } from "@heroui/react";

const PANEL = {
  initial: { y: "100%", opacity: 0.8 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 38,
      mass: 1,
    }
  },
  exit: { 
    y: "100%", 
    opacity: 0.8,
    transition: {
      duration: 0.28,
      ease: [0.32, 0, 0.67, 0], 
    }
  },
};
const CONTENT = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  },
};

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
    frontmatter,
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

  const currentDocLabel = documentName || title;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...PANEL as any}
          className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden"
        >
          {/* Ambient Top Glow */}
          <div
            className="pointer-events-none absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-[120px]"
            aria-hidden="true"
          />

          {/* Header with Step Switcher */}
          <motion.div {...CONTENT as any}>
            <StudioHeader />
          </motion.div>

          {/* Main Work Area (Tabs preserved in memory across switches) */}
          <motion.div
            {...CONTENT as any}
            className="flex-1 min-h-0 rounded-t-3xl border-t border-white/6 flex overflow-hidden relative bg-muted/35"
          >
            {hasInformationTab && (
              <div
                className={cn(
                  "w-full h-full flex flex-col overflow-y-auto px-4 pt-8 sm:pt-12 after:content-[''] after:block after:h-8 after:sm:h-12 after:shrink-0 transition-opacity duration-200",
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
                  frontmatter={frontmatter}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MdxStudioModal;
