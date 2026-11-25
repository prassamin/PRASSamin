"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Modal, cn, toast } from "@heroui/react";
import {
  computeLineDiff,
  groupDiffIntoHunks,
  reconstructTextFromHunks,
} from "@/lib/diff-utils";
import { ShikiDiffLine } from "@/components/shiki-diff-line";
import {
  LuCheck,
  LuX,
  LuPencil,
  LuGitPullRequest,
  LuBookOpen,
  LuLoaderCircle,
  LuCopy,
  LuDownload,
} from "react-icons/lu";

export interface DiffMetadataProperty {
  label: string;
  icon?: React.ReactNode;
  oldValue: string;
  newValue: string;
}

export interface RevisionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;

  // The text being diffed (body description or full MDX document)
  oldText: string;
  newText: string;
  diffSectionTitle?: string;

  // Optional relational metadata properties (e.g. for Education/Experience columns)
  metadataProperties?: DiffMetadataProperty[];

  // Action callbacks
  onAcceptAll: () => Promise<void>;
  onAcceptCustom: (finalText: string) => Promise<void>;
  onRejectAll: () => Promise<void>;
  onEditInStudio: (compiledText: string) => void;

  // Optional export tools
  allowCopyMdx?: boolean;
  downloadFilename?: string;

  // Customization labels & toggles for new drafts vs revisions
  headingTitle?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  hideRevertButton?: boolean;
}

export const RevisionDiffModal: React.FC<RevisionDiffModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIcon,
  oldText,
  newText,
  diffSectionTitle = "Description",
  metadataProperties,
  onAcceptAll,
  onAcceptCustom,
  onRejectAll,
  onEditInStudio,
  allowCopyMdx = false,
  downloadFilename,
  headingTitle,
  acceptLabel = "Accept & Apply",
  rejectLabel = "Discard All Changes",
  hideRevertButton,
}) => {
  const isNew = !oldText;
  const shouldHideRevert = hideRevertButton ?? isNew;
  const resolvedSubtitle =
    subtitle ||
    (isNew
      ? "Review the proposed content for this new draft."
      : "Review the proposed edits below. All changes are accepted by default; click “Revert” on any line to preserve the published text.");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLoading = isAccepting || isRejecting;

  // Rejected hunks set. By default, all proposals are accepted unless explicitly reverted.
  const [rejectedHunkIds, setRejectedHunkIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (isOpen) {
      setRejectedHunkIds(new Set());
    }
  }, [isOpen, oldText, newText]);

  // Compute diffs and group into actionable hunks
  const rawDiffs = useMemo(
    () => computeLineDiff(oldText || "", newText || ""),
    [oldText, newText],
  );

  const hunks = useMemo(() => groupDiffIntoHunks(rawDiffs), [rawDiffs]);

  const changeHunks = useMemo(
    () => hunks.filter((h) => h.isPending),
    [hunks],
  );

  const additionsCount = rawDiffs.filter((l) => l.type === "added").length;
  const deletionsCount = rawDiffs.filter((l) => l.type === "removed").length;

  const toggleRejectHunk = (hunkId: string) => {
    setRejectedHunkIds((prev) => {
      const next = new Set(prev);
      if (next.has(hunkId)) {
        next.delete(hunkId);
      } else {
        next.add(hunkId);
      }
      return next;
    });
  };

  const hasRejectedAny = rejectedHunkIds.size > 0;

  const buildFinalText = () => {
    if (!hasRejectedAny) return newText;
    const decisions: Record<string, "accept" | "reject"> = {};
    for (const h of changeHunks) {
      decisions[h.id] = rejectedHunkIds.has(h.id) ? "reject" : "accept";
    }
    return reconstructTextFromHunks(hunks, decisions, "accept");
  };

  const handleCopyText = async () => {
    try {
      const finalDoc = buildFinalText();
      await navigator.clipboard.writeText(finalDoc);
      setCopied(true);
      toast.success(
        downloadFilename
          ? `Copied content for ${downloadFilename} to clipboard!`
          : "Copied diff content to clipboard!",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.danger("Failed to copy content.");
    }
  };

  const handleDownloadFile = () => {
    const finalDoc = buildFinalText();
    const blob = new Blob([finalDoc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename || "revision.mdx";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${downloadFilename || "revision.mdx"}`);
  };

  const handleApply = async () => {
    try {
      setIsAccepting(true);
      if (hasRejectedAny) {
        const compiled = buildFinalText();
        await onAcceptCustom(compiled);
      } else {
        await onAcceptAll();
      }
      onClose();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      setIsRejecting(true);
      await onRejectAll();
      onClose();
    } finally {
      setIsRejecting(false);
    }
  };

  const visibleMetadata = useMemo(() => {
    if (!metadataProperties || metadataProperties.length === 0) return [];
    return metadataProperties.filter(
      (p) => p.oldValue.trim() !== p.newValue.trim(),
    );
  }, [metadataProperties]);

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && !isLoading && onClose()}
        isDismissable={!isLoading}
        variant="opaque"
      >
        <Modal.Container data-lenis-prevent className="w-full p-3 sm:p-5">
          <Modal.Dialog
            data-lenis-prevent
            className="p-0! overflow-hidden rounded-[26px] max-w-4xl bg-neutral-900/80 backdrop-blur-2xl border border-white/6 shadow-2xl text-foreground w-full flex flex-col max-h-[92vh]"
          >
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-5 pt-3.5 pb-1.5 shrink-0">
              <div className="flex items-center gap-2.5 truncate pr-4">
                <div className="size-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  {headerIcon || <LuGitPullRequest className="size-3.5" />}
                </div>
                <span className="text-xs font-medium text-neutral-300 font-inter truncate">
                  {title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">
                    +{additionsCount}
                  </span>
                  <span className="text-neutral-500">/</span>
                  <span className="text-red-400 font-semibold">
                    -{deletionsCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  aria-label="Close"
                  className="size-6 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                >
                  <LuX className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Inner Inset Content Card */}
            <div className="mx-2 my-2 p-4 sm:p-5 rounded-3xl bg-neutral-800/40 border border-white/5 flex flex-col gap-4 overflow-y-auto flex-1">
              {/* Header Title block */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-rethink text-white tracking-tight leading-snug">
                  {headingTitle || (isNew ? "Proposed New Draft" : "Proposed Revision")}
                </h3>
                <p className="text-xs text-neutral-400 font-inter mt-0.5 leading-relaxed">
                  {resolvedSubtitle}
                </p>
              </div>

              {/* Modified Metadata Properties (if any) */}
              {visibleMetadata.length > 0 && (
                <div className="rounded-2xl border border-white/6 bg-neutral-900/60 p-3.5 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
                    {isNew ? "Properties" : "Modified Properties"}
                  </span>

                  <div className="divide-y divide-white/4 text-xs font-mono">
                    {visibleMetadata.map((prop, idx) => (
                      <div
                        key={idx}
                        className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          {prop.icon}
                          {prop.label}:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {prop.oldValue && prop.oldValue !== "(None)" ? (
                            <>
                              <span className="text-red-400 line-through opacity-70">
                                {prop.oldValue}
                              </span>
                              <span className="text-neutral-500">&rarr;</span>
                            </>
                          ) : null}
                          <span className="text-emerald-300 font-semibold">
                            {prop.newValue || "(None)"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Body Diff Viewer */}
              <div className="rounded-xl border border-white/10 bg-neutral-800 overflow-hidden shadow-inner flex flex-col flex-1 min-h-[280px]">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/6 bg-neutral-900 text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                    <LuBookOpen className="w-3.5 h-3.5 text-neutral-400" /> {diffSectionTitle}
                  </span>
                  {!shouldHideRevert && (
                    <span className="text-[10px] text-neutral-400">
                      Hover changed segments to revert
                    </span>
                  )}
                </div>

                <div className="divide-y divide-white/4 max-h-[420px] overflow-y-auto">
                  {hunks.map((hunk) => {
                    if (!hunk.isPending) {
                      return (
                        <div key={hunk.id}>
                          {hunk.lines.map((line) => (
                            <ShikiDiffLine
                              key={line.id}
                              code={line.value}
                              type="unchanged"
                              oldLineNumber={line.oldLineNumber}
                              newLineNumber={line.newLineNumber}
                              lang="markdown"
                            />
                          ))}
                        </div>
                      );
                    }

                    const isReverted = rejectedHunkIds.has(hunk.id);

                    return (
                      <div
                        key={hunk.id}
                        className={cn(
                          "relative group/hunk transition-colors",
                          isReverted && "opacity-60 grayscale-[30%]",
                        )}
                      >
                        {/* Inline Quick Action Badge */}
                        {!shouldHideRevert && (
                          <div className="absolute right-2 top-1.5 z-10 opacity-80 group-hover/hunk:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => toggleRejectHunk(hunk.id)}
                              className={cn(
                                "px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs",
                                isReverted
                                  ? "bg-neutral-800 text-neutral-300 hover:text-emerald-300 border border-white/10"
                                  : "bg-neutral-900 text-neutral-400 hover:text-red-400 border border-white/10",
                              )}
                            >
                              {isReverted ? (
                                <>
                                  <LuCheck className="w-3 h-3 text-emerald-400" />
                                  <span>Include Change</span>
                                </>
                              ) : (
                                <>
                                  <LuX className="w-3 h-3 text-red-400" />
                                  <span>Revert</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        <div>
                          {hunk.lines.map((line) => (
                            <ShikiDiffLine
                              key={line.id}
                              code={line.value}
                              type={line.type}
                              oldLineNumber={line.oldLineNumber}
                              newLineNumber={line.newLineNumber}
                              lang="markdown"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirmReject}
                  className="text-xs font-medium text-neutral-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 text-center sm:text-left"
                >
                  {isRejecting ? "Discarding..." : rejectLabel}
                </button>

                <div className="flex items-center justify-end gap-2.5 flex-wrap">
                  {allowCopyMdx && (
                    <>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleCopyText}
                        className="text-xs font-medium text-neutral-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {copied ? (
                          <>
                            <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <LuCopy className="w-3.5 h-3.5" />
                            <span>Copy MDX</span>
                          </>
                        )}
                      </button>

                      {downloadFilename && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={handleDownloadFile}
                          className="text-xs font-medium text-neutral-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <LuDownload className="w-3.5 h-3.5" />
                          <span>.mdx</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      onClose();
                      onEditInStudio(buildFinalText());
                    }}
                    className="text-xs font-medium text-neutral-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LuPencil className="w-3.5 h-3.5" />
                    <span>Edit in Studio</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleApply}
                    className="rounded-full px-5 py-2 text-xs font-semibold bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAccepting ? (
                      <LuLoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <LuCheck className="size-3.5" />
                    )}
                    <span>{isAccepting ? "Applying..." : acceptLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default RevisionDiffModal;
