"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LuClock, LuEye, LuArrowUpRight, LuPencil } from "react-icons/lu";
import type { QueryBlogs } from "@/lib/get-blogs";
import { cn } from "@heroui/react";

type BlogPost = QueryBlogs["blogs"][number];

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const BlogCard: React.FC<{
  blog: BlogPost;
  onEdit?: (blog: BlogPost) => void;
}> = ({ blog, onEdit }) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/8 bg-muted/40 hover:bg-muted/60 hover:border-white/16",
        "p-5 transition-all duration-300 shadow-md group overflow-hidden",
      )}
    >
      {/* Top ambient hover glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-500 bg-white/2 group-hover:bg-white/5" />

      <div className="flex flex-col gap-4">
        {/* Thumbnail */}
        {blog.thumbnail && (
          <figure className="relative overflow-hidden rounded-xl border border-white/6 bg-neutral-950 aspect-5/3">
            <Image
              src={blog.thumbnail}
              alt={blog.title}
              fill
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </figure>
        )}

        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground font-rethink leading-snug">
            {blog.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(blog)}
                aria-label={`Edit ${blog.title}`}
                className="size-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors cursor-pointer"
              >
                <LuPencil className="size-3.5" />
              </button>
            )}
            <Link
              href={blog.url || `/blogs/${blog.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${blog.title}`}
              className="size-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/16 transition-colors"
            >
              <LuArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Description */}
        {blog.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {blog.description}
          </p>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {blog.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/6 text-[11px] text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-white/6 pt-3">
          <span className="flex items-center gap-1.5">
            <LuClock className="size-3.5" />
            {blog.readingTime || "—"}
          </span>
          <span>{formatDate(blog.updatedAt || blog.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
