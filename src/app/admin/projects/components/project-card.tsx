"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LuArrowUpRight,
  LuPencil,
  LuChartColumn,
  LuChevronDown,
  LuGitCompare,
  LuTrash2,
  LuSend,
} from "react-icons/lu";
import type { QueryProjects } from "@/lib/get-projects";
import { cn } from "@heroui/react";
import { ProjectAnalytics } from "./project-analytics";

type ProjectPost = QueryProjects["projects"][number];

export const ProjectCard: React.FC<{
  project: ProjectPost;
  isDraft?: boolean;
  hasRevisionDraft?: boolean;
  onEdit?: (
    project: ProjectPost,
    onLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  ) => void;
  onReviewRevision?: () => void;
  onPublishDraft?: () => void;
  onDeleteDraft?: () => void;
}> = ({
  project,
  isDraft = false,
  hasRevisionDraft = false,
  onEdit,
  onReviewRevision,
  onPublishDraft,
  onDeleteDraft,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/3 bg-muted/40",
        "p-3 md:p-6 transition-all duration-300 shadow-md overflow-hidden",
        "hover:border-white/5 hover:bg-muted/60",
        isDraft &&
          "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1.5 before:rounded-r-full before:bg-linear-to-b before:from-amber-400 before:via-amber-500 before:to-amber-500/30",
        showAnalytics && "bg-muted/60",
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        {/* Thumbnail */}
        <figure className="relative shrink-0 overflow-hidden rounded-xl border border-white/6 bg-neutral-950 w-full sm:w-40 aspect-5/3">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-white/4 to-transparent" />
          )}
        </figure>

        {/* Content */}
        <div className="flex flex-col gap-2.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isDraft && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-mono font-semibold bg-amber-500/15 border border-amber-500/10 text-amber-300">
                Draft
              </span>
            )}
            {!isDraft && hasRevisionDraft && (
              <button
                type="button"
                onClick={onReviewRevision}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] md:text-[11px] font-mono font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/20 text-amber-300 shadow-xs cursor-pointer transition-all animate-pulse"
              >
                <LuGitCompare className="w-3 h-3 text-amber-400" />
                <span>Revision</span>
              </button>
            )}
            {project.category && (
              <span className="px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/5 text-accent text-[10px] font-medium">
                {project.category}
              </span>
            )}
            <span className="text-[11px] text-neutral-500">
              {project.tools?.slice(0, 4).join(" · ") || ""}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white font-rethink tracking-tight leading-snug">
            {project.title}
          </h3>

          {project.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Actions — always visible */}
          <div className="flex not-sm:flex-wrap items-center justify-between gap-2 mt-auto pt-2">
            <div className="flex items-center gap-2 w-full flex-wrap">
              {isDraft ? (
                <>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(project, setIsEditing)}
                      className="inline-flex justify-center items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-white/6 bg-white/4 text-neutral-300 hover:text-white"
                    >
                      <LuPencil className="size-3.5" />
                      Review in Studio
                    </button>
                  )}
                  {onPublishDraft && (
                    <button
                      type="button"
                      onClick={onPublishDraft}
                      className="inline-flex justify-center items-center gap-1.5 h-8 px-3 rounded-lg bg-accent text-neutral-950 text-xs font-bold transition-all hover:bg-accent/90 shadow-sm cursor-pointer"
                    >
                      <LuSend className="size-3.5" />
                      Publish
                    </button>
                  )}
                  {onDeleteDraft && (
                    <button
                      type="button"
                      onClick={onDeleteDraft}
                      className="inline-flex justify-center items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 ml-auto"
                      title="Discard draft"
                    >
                      <LuTrash2 className="size-3.5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(project, setIsEditing)}
                      className="inline-flex justify-center items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-white/4 bg-white/3 text-neutral-300 hover:text-foreground not-sm:w-full"
                    >
                      <LuPencil className="size-3.5" />
                      Edit
                    </button>
                  )}
                  <Link
                    href={project.url || `/projects/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-white/4 bg-white/3 text-neutral-300 hover:text-foreground not-sm:w-full"
                  >
                    <LuArrowUpRight className="size-3.5" />
                    Open
                  </Link>
                </>
              )}
            </div>

            {!isDraft && project.slug && (
              <button
                type="button"
                onClick={() => setShowAnalytics((v) => !v)}
                aria-expanded={showAnalytics}
                className={cn(
                  "inline-flex justify-center items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer not-sm:w-full",
                  showAnalytics
                    ? "bg-accent/10 border-accent/5 text-accent"
                    : "border-white/4 bg-white/3 text-neutral-300 hover:text-foreground",
                )}
              >
                <LuChartColumn className="size-3.5" />
                Analytics
                <LuChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    showAnalytics && "rotate-180",
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline analytics — expands at the bottom */}
      {!isDraft && (
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            showAnalytics
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            {project.slug && <ProjectAnalytics slug={project.slug} />}
          </div>
        </div>
      )}

      {isEditing && (
        <div
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-muted/40 backdrop-blur-[1px] animate-fd-fade-in ease-in-out"
          />
          <div
            className="absolute inset-y-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/5 to-transparent"
            style={{ animation: "shimmer 1.4s infinite linear" }}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
