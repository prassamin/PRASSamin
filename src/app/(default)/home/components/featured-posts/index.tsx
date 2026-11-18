"use client";

import React from "react";
import { Link } from "@/components/link";
import { LuClock, LuEye, LuChevronRight } from "react-icons/lu";
import { motion, type Variants } from "framer-motion";
import { Scribble } from "./scribble";
import { QueryBlogs } from "@/lib/get-blogs";
import { formatDate } from "@/lib/utils";
import { BlogCard } from "@/app/(fuma)/blogs/components/blog-card";

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const postItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

type Props = {
  blogs?: QueryBlogs["blogs"];
};

export const FeaturedPosts: React.FC<Props> = ({ blogs = [] }) => {
  return (
    <motion.section
      id="featured-posts"
      className="relative overflow-hidden w-full"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {/* Background hand-drawn scribble texture behind the title */}
      <Scribble />

      <div className="layout relative z-10 text-left flex flex-col py-16 md:py-20">
        {/* Header with Title and Curved Dashed Arrow */}
        <motion.div
          variants={titleVariants}
          className="flex items-center gap-2"
        >
          <h2 className="flex items-center gap-2 h2 sm:h1">
            <span>
              Featured{" "}
              <span
                className="transition-colors bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(to right bottom, rgba(76, 255, 180, 0.3), rgba(76, 255, 180, 0.9), rgba(76, 255, 180, 0.3))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Posts
              </span>
            </span>

            {/* Hand-drawn curved dashed arrow */}
            <svg
              width="75"
              height="62"
              viewBox="0 0 75 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="translate-y-8 sm:translate-y-9 hidden sm:block pointer-events-none select-none shrink-0"
              aria-hidden="true"
            >
              <path
                d="M1 1C6.24431 1.21626 11.5365 2.05428 16.6516 3.13955C28.7596 5.70848 41.2898 9.45859 51.3287 17.0631C61.1747 24.5214 66.3737 34.4703 69.1034 46.2597C70.3557 51.6681 70.3959 56.1136 70.6176 61.434"
                stroke="#D4D4D4"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
              <path
                d="M63 57.185C65.135 58.2982 67.2076 59.4555 69.2541 60.7235C70.1813 61.2979 70.997 62.1916 71.624 60.9045C72.5057 59.0948 73.0026 57.3294 74.5536 56"
                stroke="#D4D4D4"
                strokeWidth="0.5"
                strokeLinecap="round"
              />
            </svg>
          </h2>
        </motion.div>

        {/* Featured Posts Stack */}
        <ul className="mt-8 sm:mt-12 divide-y divide-dashed divide-neutral-900 w-full">
          {blogs.map((blog) => (
            <motion.li
              key={blog.title}
              variants={postItemVariants}
              className="w-full py-6 sm:py-7 group"
            >
              <BlogCard post={blog} />
            </motion.li>
          ))}
        </ul>

        {/* See More Posts Button */}
        <motion.div
          variants={titleVariants}
          className="mt-8 sm:mt-10 self-center"
        >
          <Link
            href="/blogs"
            className="flex items-center gap-2 hover:text-neutral-100 transition-colors text-neutral-300 text-sm sm:text-base group"
          >
            <span>See more posts</span>
            <div className="isolate before:transition-opacity size-6 flex items-center justify-center relative bg-white/5 backdrop-blur-sm rounded-[10px] gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] group-hover:scale-105 transition-transform">
              <LuChevronRight
                className="size-[70%] text-neutral-300 group-hover:text-neutral-100 transition-colors"
                strokeWidth={1.3}
              />
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturedPosts;
