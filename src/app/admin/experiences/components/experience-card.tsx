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
  LuFileText,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import { cn } from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";

interface ExperienceCardProps {
  experience: ExperienceType;
  onEdit: (exp: ExperienceType) => void;
  onDelete: (exp: ExperienceType) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const isCurrent =
    !experience.end ||
    String(experience.end).toLowerCase() === "present" ||
    Boolean(experience.period?.toLowerCase().includes("present"));

  const hasDescription =
    Boolean(experience.description) && experience.description!.trim() !== "";

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/[0.08] bg-muted/40 hover:bg-muted/60 hover:border-white/[0.16]",
        "p-5 md:p-6 transition-all duration-300 shadow-md group overflow-hidden",
        isCurrent
          ? "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-emerald-400 before:to-emerald-500/20"
          : "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-white/20 before:to-transparent",
      )}
    >
      {/* Top ambient hover glow */}
      <div
        className={cn(
          "absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-500",
          isCurrent
            ? "bg-emerald-500/5 group-hover:bg-emerald-500/10"
            : "bg-white/[0.02] group-hover:bg-white/[0.05]",
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
                isCurrent
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                  : "bg-white/[0.06] border border-white/10 text-neutral-300",
              )}
            >
              <LuBriefcase className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[15px] md:text-xl font-bold text-white font-rethink tracking-tight min-w-0 break-words">
                  {experience.role}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-[13px] md:text-sm font-medium text-neutral-300 font-inter mt-1.5">
                <LuBuilding2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400 shrink-0" />
                <span className="truncate">{experience.company}</span>
              </div>
            </div>
          </div>

          {/* Right: Period Badge + Action Buttons — full-width row on mobile */}
          <div className="flex items-center gap-2 w-full md:w-auto md:self-center shrink-0 justify-between">
            {/* Period Badge — grows to fill on mobile */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300 shadow-xs md:flex-none justify-center md:justify-start min-w-0">
              <LuCalendar className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
              <span className="truncate min-w-0">
                {experience.period || "Present"}
              </span>
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(experience)}
                title={`Edit ${experience.role} at ${experience.company}`}
                aria-label={`Edit ${experience.role} at ${experience.company}`}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer shrink-0"
              >
                <LuPencil className="w-3.5 h-3.5" />
              </button>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => onDelete(experience)}
                title={`Delete ${experience.role} at ${experience.company}`}
                aria-label={`Delete ${experience.role} at ${experience.company}`}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-400 bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 transition-all cursor-pointer shrink-0"
              >
                <LuTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Description MDX section (if present) */}
        {hasDescription && (
          <div className="pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center justify-between w-full py-1 text-left group/toggle cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <LuFileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-neutral-300 tracking-wider uppercase font-mono group-hover/toggle:text-white transition-colors">
                  Responsibilities &amp; Impact
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 group-hover/toggle:text-neutral-200 transition-colors">
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
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-black/25 p-3.5 md:p-5 overflow-x-auto shadow-inner">
                    <div className="prose prose-invert prose-sm max-w-none text-neutral-200 font-inter leading-relaxed">
                      <MDXContent content={experience.description!} />
                    </div>
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

export default ExperienceCard;
