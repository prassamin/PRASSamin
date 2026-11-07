"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useMemo, useRef, useState } from "react";
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
import { BlogCard } from "@/components/blog-card";
import type { QueryBlogs } from "@/lib/get-blogs";
import { useShortcuts } from "@keybindy/react";
import { Kbd } from "@heroui/react";

interface BlogsViewProps {
  blogs?: QueryBlogs["blogs"];
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

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen bg-neutral-950 text-neutral-100 selection:bg-accent/30 selection:text-white"
    >
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
      </div>

      {/* Main Header Content */}
      <motion.div variants={itemVariants} className="relative">
        <div className="layout text-center pb-12 pt-28 md:pb-20 md:pt-36 flex flex-col items-center justify-center">
          {/* Glass Icon Squircle Badge with Gradient Border */}
          <div className="isolate before:transition-opacity size-11 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent">
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
            <div className="relative isolate before:transition-opacity rounded-xl bg-muted/50 backdrop-blur-sm w-full max-w-[500px] mx-auto group gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent">
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
      </motion.div>

      {/* 2-Column Content Layout */}
      <motion.div
        variants={itemVariants}
        className="border-t border-neutral-900"
      >
        <div className="layout pb-16 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_18rem] md:gap-8 min-h-[calc(100vh-28rem)]">
            {/* BLOG POSTS LIST - Column 1 on desktop, Column 2 on mobile */}
            <ul className="order-2 md:order-1 md:border-r border-neutral-900 md:pr-8 grid gap-8 py-2">
              {filteredPosts.length === 0 ? (
                <div className="py-20 text-center text-neutral-500 text-sm">
                  No posts found matching your search.
                </div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredPosts.map((post) => (
                    <motion.li
                      key={post.slug}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{
                        y: { type: "spring", stiffness: 380, damping: 32 },
                        opacity: { duration: 0.25 },
                      }}
                      className="w-full py-6 sm:py-7 group"
                    >
                      <BlogCard
                        post={post}
                        highlightQuery={searchQuery}
                        selectedTags={selectedTopics}
                        onToggleTag={(tag) =>
                          setSelectedTopics((prev) =>
                            prev.some(
                              (t) => t.toLowerCase() === tag.toLowerCase(),
                            )
                              ? prev.filter(
                                  (t) => t.toLowerCase() !== tag.toLowerCase(),
                                )
                              : [...prev, tag],
                          )
                        }
                      />
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
      </motion.div>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
}
