"use client";

import Image from "next/image";
import Link from "next/link";
import { LuClock, LuEye } from "react-icons/lu";
import type { QueryBlogs } from "@/lib/get-blogs";

type BlogPost = QueryBlogs["blogs"][number];

/** Highlight case-insensitive matches of `query` inside `text`. */
export function Highlighted({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  if (!q || !text) return <>{text}</>;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark key={idx} className="bg-accent/25 text-accent rounded-[3px] px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    i = idx + q.length;
  }
  return <>{parts}</>;
}

export interface BlogCardProps {
  post: BlogPost;
  /** Link target. Defaults to `/blogs/${slug}`. */
  href?: string;
  /** Optional search query to highlight matches inside the card. */
  highlightQuery?: string;
  /** Tags currently active in the filter (accent highlight). */
  selectedTags?: string[];
  /** When provided, tags render as toggleable buttons. Omit for static tags. */
  onToggleTag?: (tag: string) => void;
}

export function BlogCard({
  post,
  href = `/blogs/${post.slug}`,
  highlightQuery = "",
  selectedTags = [],
  onToggleTag,
}: BlogCardProps) {
  const q = highlightQuery;

  return (
    <Link
      href={href}
      className="group block rounded-md px-2 -mx-2 transition duration-200"
    >      <div className="flex flex-col gap-5 lg:flex-row-reverse lg:gap-8 lg:items-center">
        {/* Thumbnail */}
        <figure className="relative isolate z-10 shrink-0 overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-950 w-full lg:w-44 aspect-[5/3] shadow-md transition-colors">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 176px"
          />
        </figure>

        {/* Post Content */}
        <div className="w-full flex-1">
          <div className="flex items-center gap-3">
            <p className="b2 text-neutral-300">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <h3 className="h5 mt-3 relative inline-block">
            <span
              aria-hidden="true"
              className="bg-gradient-to-r from-accent/30 via-accent/90 to-accent/30 box-decoration-clone group-hover:opacity-30 opacity-0 transition duration-200 text-transparent"
            >
              <Highlighted text={post.title} query={q} />
            </span>
            <span className="absolute left-0 top-0 text-white font-rethink">
              <Highlighted text={post.title} query={q} />
            </span>
          </h3>

          <p className="b2 text-neutral-300 mt-1 leading-relaxed max-w-2xl line-clamp-2">
            <Highlighted text={post.description || ""} query={q} />
          </p>

          {/* Metadata Footer */}
          <div className="flex justify-between mt-5 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <LuClock className="size-3.5 text-accent shrink-0" />
                <p className="c1 text-neutral-400">{post.readingTime}</p>
              </div>
              <div className="flex items-center gap-2">
                <LuEye className="size-3.5 text-accent shrink-0" />
                <p className="c1 text-neutral-400">{post.views}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {(post.tags || []).map((tag) => {
                const isTagActive = selectedTags.some(
                  (t) => t.toLowerCase() === tag.toLowerCase(),
                );
                const className = `inline-block rounded-md px-2 py-0.5 font-medium transition cursor-pointer text-xs ${
                  isTagActive
                    ? "bg-accent/15 text-accent"
                    : "bg-neutral-900 text-neutral-500 hover:text-white"
                }`;

                return onToggleTag ? (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleTag(tag);
                    }}
                    className={className}
                    data-selected={isTagActive ? "true" : "false"}
                  >
                    <Highlighted text={tag} query={q} />
                  </button>
                ) : (
                  <span key={tag} className={className}>
                    <Highlighted text={tag} query={q} />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
