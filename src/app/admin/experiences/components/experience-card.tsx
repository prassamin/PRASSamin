"use client";

import React, { useState } from "react";
import { ExperienceType } from "@/types";
import MDXContent from "@/components/mdx/mdx-content";
import {
  LuBriefcase,
  LuCalendar,
  LuPencil,
  LuTrash2,
  LuBuilding2,
  LuMapPin,
  LuGlobe,
  LuChevronDown,
  LuChevronUp,
  LuGitCompare,
} from "react-icons/lu";
import { cn } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

interface ExperienceCardProps {
  experience: ExperienceType;
  isDraft?: boolean;
  hasRevisionDraft?: boolean;
  onEdit: (exp: ExperienceType) => void;
  onDelete: (exp: ExperienceType) => void;
  onReviewRevision?: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  isDraft = false,
  hasRevisionDraft = false,
  onEdit,
  onDelete,
  onReviewRevision,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const isCurrent =
    !isDraft &&
    (!experience.end ||
      String(experience.end).toLowerCase() === "present" ||
      Boolean(experience.period?.toLowerCase().includes("present")));

  const hasDescription =
    Boolean(experience.description) && experience.description!.trim() !== "";

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/8 bg-muted/40 hover:bg-muted/60 hover:border-white/16",
        "p-5 md:p-6 transition-all duration-300 shadow-md group overflow-hidden",
        isDraft
          ? "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1.5 before:rounded-r-full before:bg-linear-to-b before:from-amber-400 before:via-amber-500 before:to-amber-500/30"
          : isCurrent
            ? "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-r-full before:bg-linear-to-b before:from-emerald-400 before:to-emerald-500/20"
            : "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-r-full before:bg-linear-to-b before:from-white/20 before:to-transparent",
      )}
    >
      {/* Top ambient hover glow */}
      <div
        className={cn(
          "absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-500",
          isDraft
            ? "bg-amber-500/10 group-hover:bg-amber-500/15"
            : isCurrent
              ? "bg-emerald-500/5 group-hover:bg-emerald-500/10"
              : "bg-white/2 group-hover:bg-white/5",
        )}
      />

      <div className="flex flex-col gap-4">
        {/* Header Row: Info on Left, Actions & Period on Right */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start justify-between md:gap-4">
          {/* Left: Icon + Titles */}
          <div className="flex items-start gap-3.5 md:gap-4 min-w-0">
            <div
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105",
                isDraft
                  ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-amber-500/10"
                  : isCurrent
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                    : "bg-white/6 border border-white/10 text-neutral-300",
              )}
            >
              <LuBriefcase className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isDraft && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] md:text-[11px] font-mono font-semibold bg-amber-500/15 border border-amber-500/10 text-amber-300 shadow-xs">
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

                <h3 className="text-[15px] md:text-xl font-bold text-white font-rethink tracking-tight min-w-0 wrap-break-word">
                  {experience.role}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-[13px] md:text-sm font-medium text-neutral-300 font-inter mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <LuBuilding2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400 shrink-0" />
                  <span className="truncate">{experience.company}</span>
                </div>

                {experience.location && (
                  <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                    <LuMapPin className="w-3 h-3 shrink-0" />
                    <span>{experience.location}</span>
                  </div>
                )}

                {experience.companyUrl && (
                  <a
                    href={experience.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-mono transition-colors"
                  >
                    <LuGlobe className="w-3 h-3 shrink-0" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Period Badge + Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto md:self-center shrink-0 justify-between">
            {/* Period Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-xs font-mono text-neutral-300 shadow-xs md:flex-none justify-center md:justify-start min-w-0">
              <LuCalendar
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isDraft ? "text-amber-400/80" : "text-emerald-400/80",
                )}
              />
              <span className="truncate min-w-0">
                {experience.period || "Present"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit / Review Button */}
              <button
                type="button"
                onClick={() => onEdit(experience)}
                title={isDraft ? `Review ${experience.role}` : `Edit ${experience.role} at ${experience.company}`}
                aria-label={isDraft ? `Review ${experience.role}` : `Edit ${experience.role} at ${experience.company}`}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border",
                  isDraft
                    ? "text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30"
                    : "text-neutral-400 hover:text-white bg-white/3 hover:bg-white/8 border-white/6 hover:border-white/15",
                )}
              >
                <LuPencil className="w-3.5 h-3.5" />
              </button>

              {/* Delete / Discard Button */}
              <button
                type="button"
                onClick={() => onDelete(experience)}
                title={isDraft ? `Discard draft for ${experience.role}` : `Delete ${experience.role} at ${experience.company}`}
                aria-label={isDraft ? `Discard draft for ${experience.role}` : `Delete ${experience.role} at ${experience.company}`}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-400 bg-white/3 hover:bg-red-500/10 border border-white/6 hover:border-red-500/20 transition-all cursor-pointer shrink-0"
              >
                <LuTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Description MDX section (if present) */}
        {hasDescription && (
          <div className="pt-3 border-t border-white/6">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center justify-between w-full py-1 text-left group/toggle cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <LuBriefcase
                  className={cn(
                    "w-3.5 h-3.5",
                    isDraft ? "text-amber-400" : "text-emerald-400",
                  )}
                />
                <span className="text-xs font-medium font-inter text-neutral-300 group-hover/toggle:text-white transition-colors">
                  Responsibilities & Achievements
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 group-hover/toggle:text-neutral-300 transition-colors">
                <span className="text-[11px] font-mono">
                  {isExpanded ? "Collapse" : "Expand"}
                </span>
                {isExpanded ? (
                  <LuChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <LuChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 prose prose-invert prose-sm max-w-none text-neutral-300 font-inter">
                    <MDXContent content={experience.description!} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
