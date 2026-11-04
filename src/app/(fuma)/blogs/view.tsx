"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuBookText,
  LuSearch,
  LuX,
  LuClock,
  LuEye,
  LuCalendar,
} from "react-icons/lu";
import Footer from "@/components/Footer";
import Select from "@/components/ui/select";
import type { QueryBlogs } from "@/lib/get-blogs";
import { useShortcuts } from "@keybindy/react";
import { Kbd } from "@heroui/react";

interface BlogsViewProps {
  blogs?: QueryBlogs["blogs"];
}

/** Highlight case-insensitive matches of `query` inside `text`. */
function Highlighted({ text, query }: { text: string; query: string }) {
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

export default function BlogsView({ blogs }: BlogsViewProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "views">("date");

  const searchRef = useRef<HTMLInputElement | null>(null);

  useShortcuts([
    {
      keys: [
        ["Ctrl", "K"],
        ["Meta", "K"],
      ],
      handler: (e) => {
        e.preventDefault();
        searchRef.current?.focus();
      },
      options: {
        ignoreInputs: true,
      },
    },
    {
      keys: ["Esc"],
      handler: (e) => {
        e.preventDefault();
        searchRef.current?.blur();
      },
    },
  ]);

  // All topics derived from real posts
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    (blogs || []).forEach((post) => {
      post.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [blogs]);

  // Filter and sort real posts
  const filteredPosts = useMemo(() => {
    const list = (blogs || []).filter((post) => {
      // Topic tag filter — post must contain ALL selected topics
      if (selectedTopics.length > 0) {
        const hasAll = selectedTopics.every((topic) =>
          post.tags?.some((t) => t.toLowerCase() === topic.toLowerCase()),
        );
        if (!hasAll) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.title?.toLowerCase().includes(q);
        const inDesc = post.description?.toLowerCase().includes(q);
        const inTags = post.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inTags) return false;
      }

      return true;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
  }, [blogs, searchQuery, selectedTopics, sortBy]);

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 selection:bg-accent/30 selection:text-white">
      {/* Background Architectural Glow and Wireframe Header */}
      <div
        className="absolute overflow-hidden inset-0 h-[450px] bg-neutral-950 pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="h-[25px] w-[400px] rounded-r-[50%] bg-gradient-to-r from-accent via-accent to-[color-mix(in_srgb,var(--accent)_50%,var(--foreground))]/80 blur-[32px] absolute -top-4 -translate-y-1/2 rotate-45 origin-left -left-4 z-[-1]"
        />
        <div
          aria-hidden="true"
          className="h-[400px] w-[650px] rounded-full bg-gradient-to-r from-accent-dark/30 to-accent-deep/30 blur-[150px] absolute top-0 -translate-y-full rotate-45 origin-left z-[-2] left-[15%]"
        />
        <div
          className="opacity-20 absolute z-[-1] md:w-full bottom-[-5rem] inset-x-0 h-[337px] bg-contain bg-bottom bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/images/blog-header-bg.svg')",
            maskImage:
              "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 140%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 140%)",
          }}
        />
      </div>

      {/* Main Header Content */}
      <div className="relative">
        <div className="layout text-center pb-12 pt-28 md:pb-20 md:pt-36 flex flex-col items-center justify-center">
          {/* Glass Icon Squircle Badge with Gradient Border */}
          <div
            className="isolate before:transition-opacity glass-icon size-11 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
          >
            <LuBookText className="size-[45%] text-neutral-300" />
          </div>

          {/* Heading: The Blog */}
          <h1 className="mt-4 h2 sm:h1">
            The{" "}
            <span className="transition-colors bg-gradient-to-br from-accent/30 via-accent/90 to-accent/30 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>

          {/* Subtitle */}
          <p className="b1 mt-3">
            <span className="transition-colors bg-gradient-to-r from-neutral-300/[35%] via-neutral-300/90 to-neutral-300/[35%] bg-clip-text text-transparent">
              Thoughts, mental models, and tutorials about front-end
              development.
            </span>
          </p>

          {/* Search Box */}
          <div className="mt-7 w-full">
            <div
              className="relative isolate before:transition-opacity rounded-xl bg-muted/10 backdrop-blur-sm w-full max-w-[500px] mx-auto group gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
            >
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="b2 placeholder:neutral-500 rounded-[inherit] bg-transparent border-0 w-full py-3 px-5 pl-12 focus:outline-none focus:ring-0 text-sm text-neutral-200"
              />
              <LuSearch className="lucide lucide-search text-neutral-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none size-5" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center flex-col">
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchRef.current?.focus();
                    }}
                    className="text-neutral-400 hover:text-white transition p-0.5"
                    aria-label="Clear search"
                  >
                    <LuX className="size-4" />
                  </button>
                ) : (
                  <Kbd className="text-muted-foreground">
                    <Kbd.Abbr keyValue="command" />
                    <Kbd.Content>K</Kbd.Content>
                  </Kbd>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="border-t border-neutral-900">
        <div className="layout pb-16 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_18rem] md:gap-8 min-h-[calc(100vh-28rem)]">
            {/* BLOG POSTS LIST - Column 1 on desktop, Column 2 on mobile */}
            <ul className="order-2 md:order-1 md:border-r border-neutral-900 md:pr-8 grid gap-8 py-6">
              {filteredPosts.length === 0 ? (
                <div className="py-20 text-center text-neutral-500 text-sm">
                  No posts found matching your search.
                </div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredPosts.map((post) => (
                    <motion.li
                      key={post.slug}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -16 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full py-6 sm:py-7 group"
                    >
                      <Link
                        className="block rounded-md px-2 -mx-2 transition duration-200"
                        href={`/blogs/${post.slug}`}
                      >
                        <div className="flex flex-col gap-5 lg:flex-row-reverse lg:gap-8 lg:items-center">
                          {/* Thumbnail */}
                          <figure className="relative isolate z-10 shrink-0 overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-950 w-full lg:w-44 aspect-[5/3] shadow-md transition-colors">
                            <Image
                              src={post.thumbnail}
                              alt={post.title}
                              fill
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 176px"
                            />
                          </figure>

                          {/* Post Content */}
                          <div className="w-full flex-1">
                            <div className="flex items-center gap-3">
                              <p className="b2 text-neutral-300">
                                {new Date(post.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>

                            <h3 className="h5 mt-3 relative inline-block">
                              <span
                                aria-hidden="true"
                                className="bg-gradient-to-r from-accent/30 via-accent/90 to-accent/30 box-decoration-clone group-hover:opacity-30 opacity-0 transition duration-200 text-transparent"
                              >
                                <Highlighted
                                  text={post.title}
                                  query={searchQuery}
                                />
                              </span>
                              <span className="absolute left-0 top-0 text-white font-rethink">
                                <Highlighted
                                  text={post.title}
                                  query={searchQuery}
                                />
                              </span>
                            </h3>

                            <p className="b2 text-neutral-300 mt-1 leading-relaxed max-w-2xl line-clamp-2">
                              <Highlighted
                                text={post.description || ""}
                                query={searchQuery}
                              />
                            </p>

                            {/* Metadata Footer */}
                            <div className="flex justify-between mt-5 flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                  <LuClock className="size-3.5 text-accent shrink-0" />
                                  <p className="c1 text-neutral-400">
                                    {post.readingTime}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <LuEye className="size-3.5 text-accent shrink-0" />
                                  <p className="c1 text-neutral-400">
                                    {post.views}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-x-2 gap-y-1">
                                {(post.tags || []).map((tag) => {
                                  const isTagActive = selectedTopics.some(
                                    (t) =>
                                      t.toLowerCase() === tag.toLowerCase(),
                                  );
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedTopics((prev) =>
                                          prev.some(
                                            (t) =>
                                              t.toLowerCase() ===
                                              tag.toLowerCase(),
                                          )
                                            ? prev.filter(
                                                (t) =>
                                                  t.toLowerCase() !==
                                                  tag.toLowerCase(),
                                              )
                                            : [...prev, tag],
                                        );
                                      }}
                                      className={`inline-block rounded-md px-2 py-0.5 font-medium transition cursor-pointer text-xs ${
                                        isTagActive
                                          ? "bg-accent/15 text-accent"
                                          : "bg-neutral-900 text-neutral-500 hover:text-white"
                                      }`}
                                      data-selected={
                                        isTagActive ? "true" : "false"
                                      }
                                    >
                                      <Highlighted
                                        text={tag}
                                        query={searchQuery}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </AnimatePresence>
              )}
            </ul>

            {/* ASIDE (Filter Section) - Column 2 on desktop, Column 1 on mobile */}
            <aside className="isolate order-1 md:order-2 mt-8 md:sticky md:top-24 md:h-fit md:self-start">
              {/* Sort Dropdown Button */}
              <Select
                triggerClassName="py-5"
                options={[
                  {
                    value: "views",
                    label: (
                      <div className="flex items-center gap-2">
                        <LuEye className="size-4 shrink-0" />
                        <span>Sort by views</span>
                      </div>
                    ),
                  },
                  {
                    value: "date",
                    label: (
                      <div className="flex items-center gap-2">
                        <LuCalendar className="size-4 shrink-0" />
                        <span>Sort by date</span>
                      </div>
                    ),
                  },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as "views" | "date")}
              />
              {/* Choose Topics Filter */}
              <p className="b2 mt-6 md:mt-12 text-neutral-200">Choose topics</p>
              <div className="mt-6 flex flex-wrap items-baseline justify-start gap-2 text-sm text-gray-600 dark:text-gray-300 c1">
                {allTopics.map((topic) => {
                  const isSelected = selectedTopics.some(
                    (t) => t.toLowerCase() === topic.toLowerCase(),
                  );

                  // A tag is disabled only if NO post that already contains ALL
                  // selected topics also contains this tag (partner co-occurrence).
                  const isDisabled =
                    selectedTopics.length > 0 &&
                    !isSelected &&
                    !filteredPosts.some((post) =>
                      (post.tags || []).some(
                        (t) => t.toLowerCase() === topic.toLowerCase(),
                      ),
                    );

                  return (
                    <button
                      key={topic}
                      disabled={isDisabled}
                      onClick={() =>
                        setSelectedTopics((prev) =>
                          isSelected
                            ? prev.filter(
                                (t) => t.toLowerCase() !== topic.toLowerCase(),
                              )
                            : [...prev, topic],
                        )
                      }
                      className={`inline-block rounded-md px-2 py-0.5 font-medium transition cursor-pointer text-sm disabled:grayscale disabled:opacity-25 ${
                        isSelected
                          ? "bg-accent-deep text-accent"
                          : "bg-neutral-900 text-neutral-500 not-disabled:hover:text-white"
                      }`}
                      data-selected={isSelected ? "true" : "false"}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
