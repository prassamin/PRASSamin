"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/components/Link";
import { LuClock, LuEye, LuChevronRight } from "react-icons/lu";
import { motion, type Variants } from "motion/react";
import { Scribble } from "./scribble";
import { QueryBlogs } from "@/lib/get-blogs";
import { formatDate } from "@/lib/utils";

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
  const posts = [
    {
      date: "December 17, 2024",
      title: "List Animation using Motion for React",
      description:
        "An in-depth guide on how to animate enter and exit animation for list using Motion for React (previously Framer Motion).",
      readTime: "6 min read",
      views: "10,715 views",
      tags: ["react", "animation"],
      image: "/images/posts/post-1.jpg",
      link: "/blogs/list-animation-motion",
    },
    {
      date: "March 03, 2024",
      title: "Advanced React Patterns",
      description: "List of react advanced patterns complete with examples.",
      readTime: "10 min read",
      views: "10,035 views",
      tags: ["nextjs", "react"],
      image: "/images/posts/post-2.jpg",
      link: "/blogs/advanced-react-patterns",
    },
    {
      date: "March 10, 2023",
      title: "Next.js Authentication using Higher-Order Components",
      description: "Solve problems such as colocation, and error-prone code",
      readTime: "7 min read",
      views: "15,256 views",
      tags: ["nextjs"],
      image: "/images/posts/post-3.jpg",
      link: "/blogs/nextjs-auth-hoc",
    },
  ];

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
              <Link
                href={`/blogs/${blog.slug}`}
                className="block rounded-md px-2 -mx-2 transition duration-200"
              >
                <div className="flex flex-col gap-5 md:flex-row-reverse md:gap-8 md:items-center">
                  {/* Thumbnail Image */}
                  <figure className="relative isolate z-10 shrink-0 overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-950 w-full md:w-56 aspect-[5/3] shadow-md transition-colors">
                    <Image
                      src={blog.thumbnail}
                      alt={blog.title}
                      fill
                      className="h-full w-full object-cover transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, 224px"
                    />
                  </figure>

                  {/* Post Content */}
                  <div className="w-full flex-1">
                    <div className="flex items-center gap-3">
                      <p className="b2 text-neutral-300">
                        {formatDate(blog.createdAt, blog.updatedAt)}
                      </p>
                    </div>

                    <h3 className="h5 mt-3 relative inline-block">
                      <span
                        className="bg-gradient-to-r from-accent/30 via-accent/90 to-accent/30 box-decoration-clone group-hover:opacity-30 opacity-0 transition duration-200 text-transparent"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(76, 255, 180, 0.3), rgba(76, 255, 180, 0.9), rgba(76, 255, 180, 0.3))",
                        }}
                        aria-hidden="true"
                      >
                        {blog.title}
                      </span>
                      <span className="absolute left-0 top-0 text-white font-rethink">
                        {blog.title}
                      </span>
                    </h3>

                    <p className="b2 text-neutral-300 mt-1 leading-relaxed max-w-2xl">
                      {blog.description}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex justify-between mt-5 flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <LuClock className="size-3.5 text-accent shrink-0" />
                          <p className="c1 text-neutral-400">
                            {blog.readingTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <LuEye className="size-3.5 text-accent shrink-0" />
                          <p className="c1 text-neutral-400">{blog.views}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {blog.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-md px-2 py-0.5 text-xs font-mono bg-neutral-900/90 text-neutral-400 border border-neutral-800/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
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
            <div
              className="isolate before:transition-opacity glass-icon size-6 flex items-center justify-center relative bg-white/5 backdrop-blur-sm rounded-[10px] gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] group-hover:scale-105 transition-transform"
            >
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
