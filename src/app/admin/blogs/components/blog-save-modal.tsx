"use client";

import React, { useState } from "react";
import { Modal, Button, toast } from "@heroui/react";
import {
  LuSave,
  LuCopy,
  LuDownload,
  LuCheck,
  LuX,
} from "react-icons/lu";
import type { MdxStudioContextValue } from "@/mdx-studio";
import { useMdxStudio } from "@/mdx-studio";
import { ShikiMdxCode } from "@/components/shiki-mdx-code";
import { cn } from "@heroui/react";

interface BlogSaveModalProps {
  controller?: MdxStudioContextValue | null;
  filename?: string;
  /** Called at click time to gate opening (e.g. required fields). */
  isValid?: () => boolean;
  /**
   * Rebuild the full document (frontmatter + body) from the latest form
   * state. Falls back to the studio's frontmatter when omitted.
   */
  buildDocument?: (body: string) => string;
}

export const BlogSaveModal: React.FC<BlogSaveModalProps> = ({
  controller: controllerProp,
  filename = "blog",
  isValid,
  buildDocument,
}) => {
  // Always read live values from the context (never a snapshot).
  const liveController = useMdxStudio();
  const controller = controllerProp ?? liveController;
  const { mdx, frontmatter, save, isSaving } = controller;
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Recompose on every open so latest form state is reflected.
  const fullDoc = React.useMemo(() => {
    if (buildDocument) return buildDocument(mdx);
    return frontmatter ? `${frontmatter}\n\n${mdx}` : mdx;
  }, [isOpen, mdx, frontmatter, buildDocument]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullDoc);
      setCopied(true);
      toast.success("MDX code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.danger("Failed to copy code");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fullDoc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.mdx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Trigger button — replaces the default Save button */}
      <button
        type="button"
        onClick={() => {
          if (isValid && !isValid()) {
            toast.danger("Add a title and at least one tag first");
            return;
          }
          setIsOpen(true);
        }}
        className="flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-xl bg-accent text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-accent/90 transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <LuSave className="w-4 h-4" />
        <span>Save</span>
      </button>

      <Modal isOpen={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
        <Modal.Backdrop data-lenis-prevent>
          <Modal.Container data-lenis-prevent>
            <Modal.Dialog
              data-lenis-prevent
              className="max-w-2xl w-[calc(100vw-32px)] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-muted border border-border rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
                <div className="flex flex-col justify-center">
                  <h2 className="text-sm font-bold text-foreground font-rethink tracking-tight">
                    Ready to save?
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Review the generated MDX before finalizing
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="p-2 hover:bg-secondary/60 rounded-lg transition-colors cursor-pointer"
                >
                  <LuX className="w-4.5 h-4.5 text-muted-foreground" />
                </button>
              </div>

              {/* Body: readonly code area (Shiki-highlighted) */}
              <div
                className="flex-1 min-h-0 overflow-auto bg-background/35 overscroll-contain"
                data-lenis-prevent
              >
                <ShikiMdxCode code={fullDoc || "// Nothing to save yet"} />
              </div>

              {/* Footer: actions */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    className="rounded-xl text-xs font-medium bg-background/75 transition-colors cursor-pointer"
                    onPress={handleCopy}
                  >
                    {copied ? (
                      <>
                        <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <LuCopy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </Button>

                  <Button
                    className="rounded-xl text-xs font-medium bg-background/75 text-foreground transition-colors cursor-pointer"
                    onPress={handleDownload}
                  >
                    <LuDownload className="w-3.5 h-3.5" />
                    Download
                  </Button>

                  <Button
                    className={cn(
                      "rounded-xl bg-accent text-neutral-950 font-semibold text-xs",
                      "hover:bg-accent/90 transition-all shadow-sm active:scale-95",
                      "disabled:opacity-50 cursor-pointer",
                    )}
                    isDisabled={isSaving}
                    onPress={() => save()}
                  >
                    Finish
                  </Button>
                </div>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default BlogSaveModal;
