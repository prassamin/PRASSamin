"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuArrowUpRight,
  LuPencil,
  LuChartColumn,
  LuChevronDown,
} from "react-icons/lu";
import type { QueryBlogs } from "@/lib/get-blogs";
import { cn } from "@heroui/react";
import { BlogAnalytics } from "./blog-analytics";

type BlogPost = QueryBlogs["blogs"][number];

export const BlogCard: React.FC<{
  blog: BlogPost;
  onEdit?: (
    blog: BlogPost,
    onLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  ) => void;
}> = ({ blog, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/3 bg-muted/40",
        "p-5 md:p-6 transition-all duration-300 shadow-md overflow-hidden",
        "hover:border-white/5 hover:bg-muted/60",
        showAnalytics && "bg-muted/60",
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        {/* Thumbnail */}
        <figure className="relative shrink-0 overflow-hidden rounded-xl border border-white/6 bg-neutral-950 w-full sm:w-40 aspect-5/3">
          {blog.thumbnail ? (
            <Image
              src={blog.thumbnail}
              alt={blog.title}
              fill
              className="h-full w-full object-cover"
              sizes="(max-width: 640px) 100vw, 160px"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-white/4 to-transparent" />
          )}
        </figure>

        {/* Content */}
        <div className="flex flex-col gap-2.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {blog.tags && blog.tags.length > 0 && (
              <>
                {blog.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/5 text-accent text-[10px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {blog.tags.length > 3 && (
                  <span className="text-[11px] text-neutral-500">
                    +{blog.tags.length - 3}
                  </span>
                )}
              </>
            )}
          </div>

          <h3 className="text-lg font-bold text-white font-rethink tracking-tight leading-snug">
            {blog.title}
          </h3>

          {blog.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {blog.description}
            </p>
          )}

          {/* Actions — always visible */}
          <div className="flex not-sm:flex-wrap items-center justify-between gap-2 mt-auto pt-2">
            <div className="flex items-center gap-2 w-full">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(blog, setIsEditing)}
                  className="inline-flex justify-center items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-white/4 bg-white/3 text-neutral-300 hover:text-foreground not-sm:w-full"
                >
                  <LuPencil className="size-3.5" />
                  Edit
                </button>
              )}
              <Link
                href={blog.url || `/blogs/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-white/4 bg-white/3 text-neutral-300 hover:text-foreground not-sm:w-full"
              >
                <LuArrowUpRight className="size-3.5" />
                Open
              </Link>
            </div>

            {blog.slug && (
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
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          showAnalytics
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          {blog.slug && <BlogAnalytics slug={blog.slug} />}
        </div>
      </div>

      {isEditing && (
        <div
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-muted/40 backdrop-blur-[1px] animate-fd-fade-in ease-in-out" />
          <div
            className="absolute inset-y-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/5 to-transparent"
            style={{ animation: "shimmer 1.4s infinite linear" }}
          />
        </div>
      )}
    </div>
  );
};

export default BlogCard;
