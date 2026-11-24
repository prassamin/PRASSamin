"use client";

import React, { useState, useMemo } from "react";
import { ExperienceType } from "@/types";
import { Modal, cn } from "@heroui/react";
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
  LuBriefcase,
  LuBuilding2,
  LuCalendar,
  LuBookOpen,
  LuMapPin,
  LuGlobe,
  LuLoaderCircle,
} from "react-icons/lu";

export interface ExperienceDraftData {
  targetId?: number;
  company?: string;
  role?: string;
  start?: string;
  end?: string | null;
  location?: string | null;
  companyUrl?: string | null;
  companyLogo?: string | null;
  description?: string;
}

interface ExperienceDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  published: ExperienceType;
  draftId: string;
  draftData: ExperienceDraftData;
  onAcceptAll: () => Promise<void>;
  onAcceptCustom: (finalDescription: string) => Promise<void>;
  onRejectAll: () => Promise<void>;
  onEditInStudio: (currentDescription: string) => void;
}

export const ExperienceDiffModal: React.FC<ExperienceDiffModalProps> = ({
  isOpen,
  onClose,
  published,
  draftData,
  onAcceptAll,
  onAcceptCustom,
  onRejectAll,
  onEditInStudio,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const isLoading = isAccepting || isRejecting;

  // Rejected hunks set. By default, all proposals are accepted unless explicitly reverted.
  const [rejectedHunkIds, setRejectedHunkIds] = useState<Set<string>>(
    new Set(),
  );

  const oldCompany = published.company || "";
  const newCompany = draftData.company ?? oldCompany;
  const companyChanged = oldCompany !== newCompany;

  const oldRole = published.role || "";
  const newRole = draftData.role ?? oldRole;
  const roleChanged = oldRole !== newRole;

  const oldLocation = published.location || "";
  const newLocation =
    draftData.location === null
      ? ""
      : draftData.location !== undefined
        ? draftData.location
        : oldLocation;
  const locationChanged = oldLocation !== newLocation;

  const oldCompanyUrl = published.companyUrl || "";
  const newCompanyUrl =
    draftData.companyUrl === null
      ? ""
      : draftData.companyUrl !== undefined
        ? draftData.companyUrl
        : oldCompanyUrl;
  const urlChanged = oldCompanyUrl !== newCompanyUrl;

  const oldStart = published.start
    ? new Date(published.start).toISOString().split("T")[0]
    : "";
  const newStart = draftData.start ?? oldStart;

  const oldEnd = published.end
    ? new Date(published.end).toISOString().split("T")[0]
    : "Present";
  const newEnd =
    draftData.end === null
      ? "Present"
      : draftData.end !== undefined
        ? draftData.end
        : oldEnd;

  const timelineChanged = oldStart !== newStart || oldEnd !== newEnd;
  const hasMetadataChanges =
    companyChanged ||
    roleChanged ||
    locationChanged ||
    urlChanged ||
    timelineChanged;

  const oldDescription = published.description || "";
  const newDescription = draftData.description ?? oldDescription;

  // Compute diffs and group into actionable hunks
  const rawDiffs = useMemo(
    () => computeLineDiff(oldDescription, newDescription),
    [oldDescription, newDescription],
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

  const handleApply = async () => {
    try {
      setIsAccepting(true);
      if (hasRejectedAny) {
        const decisions: Record<string, "accept" | "reject"> = {};
        for (const h of changeHunks) {
          decisions[h.id] = rejectedHunkIds.has(h.id) ? "reject" : "accept";
        }
        const compiled = reconstructTextFromHunks(hunks, decisions, "accept");
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
            <div className="flex items-center justify-between px-5 pt-3.5 pb-1.5 select-none shrink-0">
              <div className="flex items-center gap-2.5 truncate pr-4">
                <div className="size-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <LuGitPullRequest className="size-3.5" />
                </div>
                <span className="text-xs font-medium text-neutral-300 font-inter truncate">
                  Review Changes &middot; #{published.id} {published.role} at {published.company}
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
                  Proposed Revision
                </h3>
                <p className="text-xs text-neutral-400 font-inter mt-0.5 leading-relaxed">
                  Review the proposed edits below. All changes are accepted by default; click &ldquo;Revert&rdquo; on any line to preserve the published text.
                </p>
              </div>

              {/* Modified Metadata Properties (if any) */}
              {hasMetadataChanges && (
                <div className="rounded-2xl border border-white/6 bg-neutral-900/60 p-3.5 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
                    Modified Properties
                  </span>

                  <div className="divide-y divide-white/4 text-xs font-mono">
                    {roleChanged && (
                      <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <LuBriefcase className="w-3.5 h-3.5" /> Role:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-red-400 line-through opacity-70">
                            {oldRole}
                          </span>
                          <span className="text-neutral-500">&rarr;</span>
                          <span className="text-emerald-300 font-semibold">
                            {newRole}
                          </span>
                        </div>
                      </div>
                    )}

                    {companyChanged && (
                      <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <LuBuilding2 className="w-3.5 h-3.5" /> Company:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-red-400 line-through opacity-70">
                            {oldCompany}
                          </span>
                          <span className="text-neutral-500">&rarr;</span>
                          <span className="text-emerald-300 font-semibold">
                            {newCompany}
                          </span>
                        </div>
                      </div>
                    )}

                    {locationChanged && (
                      <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <LuMapPin className="w-3.5 h-3.5" /> Location:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-red-400 line-through opacity-70">
                            {oldLocation || "(None)"}
                          </span>
                          <span className="text-neutral-500">&rarr;</span>
                          <span className="text-emerald-300 font-semibold">
                            {newLocation || "(None)"}
                          </span>
                        </div>
                      </div>
                    )}

                    {urlChanged && (
                      <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <LuGlobe className="w-3.5 h-3.5" /> Website:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-red-400 line-through opacity-70">
                            {oldCompanyUrl || "(None)"}
                          </span>
                          <span className="text-neutral-500">&rarr;</span>
                          <span className="text-emerald-300 font-semibold">
                            {newCompanyUrl || "(None)"}
                          </span>
                        </div>
                      </div>
                    )}

                    {timelineChanged && (
                      <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <LuCalendar className="w-3.5 h-3.5" /> Timeline:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-red-400 line-through opacity-70">
                            {oldStart} &mdash; {oldEnd}
                          </span>
                          <span className="text-neutral-500">&rarr;</span>
                          <span className="text-emerald-300 font-semibold">
                            {newStart} &mdash; {newEnd}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description Body Diff Viewer */}
              <div className="rounded-xl border border-white/10 bg-neutral-800 overflow-hidden shadow-inner flex flex-col">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/6 bg-neutral-900 text-[11px] font-mono text-neutral-400 select-none">
                  <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                    <LuBookOpen className="w-3.5 h-3.5 text-neutral-400" /> Responsibilities & Achievements
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Hover changed segments to revert
                  </span>
                </div>

                <div className="divide-y divide-white/4 max-h-[380px] overflow-y-auto">
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
                  {isRejecting ? "Discarding..." : "Discard All Changes"}
                </button>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      onClose();
                      const decisions: Record<string, "accept" | "reject"> = {};
                      for (const h of changeHunks) {
                        decisions[h.id] = rejectedHunkIds.has(h.id)
                          ? "reject"
                          : "accept";
                      }
                      const compiled = reconstructTextFromHunks(
                        hunks,
                        decisions,
                        "accept",
                      );
                      onEditInStudio(compiled);
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
                    <span>{isAccepting ? "Applying..." : "Accept & Apply"}</span>
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
