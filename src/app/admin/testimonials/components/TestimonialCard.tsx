"use client";

import React from "react";
import Image from "next/image";
import { TestimonialType } from "@/types";
import { LuQuote, LuPencil, LuTrash2 } from "react-icons/lu";
import MDXContent from "@/components/MDXContent";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: TestimonialType;
  onEdit: (item: TestimonialType) => void;
  onDelete: (item: TestimonialType) => void;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = React.memo(
  function TestimonialCard({ testimonial, onEdit, onDelete }) {
    const initials = testimonial.name
    ? testimonial.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-white/[0.06] bg-muted/40 backdrop-blur-xl",
        "p-4 sm:p-5 transition-all duration-200 hover:bg-muted/60 hover:border-white/[0.14]",
        "shadow-sm hover:shadow-lg overflow-hidden",
      )}
    >
      {/* Ambient hover glow */}
      <div className="pointer-events-none absolute -top-14 -right-14 w-36 h-36 rounded-full bg-accent/5 blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      {/* Top row: quote glyph */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <LuQuote className="w-7 h-7 text-accent/40 -scale-x-100" />
      </div>

      {/* Quote hero (rendered MDX) */}
      <div className="flex-1 min-h-0 overflow-hidden [&_p]:my-0.5 [&_p]:text-[13px] [&_p]:leading-relaxed [&_p]:text-neutral-200 [&_p]:italic [&_strong]:text-white [&_em]:text-neutral-200 [&_a]:text-accent [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-2 [&_blockquote]:text-neutral-300 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_hr]:border-white/10">
        <MDXContent content={testimonial.quote} />
      </div>

      {/* Divider */}
      <div className="mt-4 h-px bg-gradient-to-r from-white/[0.08] via-white/[0.05] to-transparent" />

      {/* Author footer */}
      <div className="pt-3.5 flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-neutral-800">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-neutral-300 bg-linear-to-tr from-sky-500/30 to-indigo-500/30">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-white leading-snug font-rethink">
            {testimonial.name}
          </h4>
          <p className="truncate text-[11px] text-neutral-400 mt-0.5 font-inter">
            {testimonial.role}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(testimonial)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Edit"
          >
            <LuPencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(testimonial)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete"
          >
            <LuTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
},
);;
