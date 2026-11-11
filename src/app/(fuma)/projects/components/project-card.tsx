"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { LuArrowRight as ArrowRight, LuLink as LinkIcon } from "react-icons/lu";
import { FaGithub } from "react-icons/fa6";
import { ShiningText } from "./shining-text";
import type { QueryProjects } from "@/lib/get-projects";
import { getStack } from "@/lib/stacks";

type Project = QueryProjects["projects"][number];

interface ProjectCardProps {
  project: Project;
  index: number;
  /** Render without the blueprint grid extras (connector + stagger) — for standalone grids. */
  standalone?: boolean;
}

const cardContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardSectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function ProjectCard({
  project,
  index,
  standalone = false,
}: ProjectCardProps) {
  const slug = project.slug;
  const isLeftCol = index % 2 === 0;

  const projectHref = `/projects/${slug}`;

  return (
    <div
      className={`relative flex flex-col ${
        standalone
          ? ""
          : index === 0
            ? ""
            : index % 2 === 1
              ? "lg:mt-48"
              : "lg:-mt-12"
      }`}
    >
      {/* Branch connector line to center dashed vertical divider on desktop */}
      {!standalone && (
        <div
          className={`absolute top-16 hidden w-[calc(100%+2.35rem)] items-center lg:flex ${
            isLeftCol
              ? "right-[-1.35rem] flex-row xl:right-[-1.35rem]"
              : "left-[-1.35rem] flex-row-reverse xl:left-[-1.35rem]"
          }`}
        >
          <div
            aria-hidden="true"
            className="h-px flex-1 border-neutral-800 border-t border-dashed transition-colors duration-500 group-hover:border-neutral-700"
          />
          <div
            aria-hidden="true"
            className="relative flex size-3 items-center justify-center rounded-full bg-neutral-950 ring-1 ring-neutral-700 transition-all duration-500 group-hover:scale-125 group-hover:ring-neutral-600"
          >
            <div className="size-1 rounded-full bg-neutral-600" />
          </div>
        </div>
      )}

      <motion.div
        className="relative z-10 flex flex-col gap-4"
        variants={cardContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Card Header: 01 -- Title, Category Badge */}
        <motion.div
          className="flex flex-col gap-4"
          variants={cardSectionVariants}
        >
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <div className="h-px w-8 bg-neutral-800" />
                <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider">
                  {project.category}
                </span>
              </div>
              <Link
                className="group flex items-center gap-2"
                href={projectHref}
              >
                <h2 className="font-bold text-3xl text-foreground leading-tight line-clamp-1 tracking-tight">
                  {project.title}
                </h2>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Interactive Visual Showcase Box */}
        <motion.div variants={cardSectionVariants}>
          <Link
            className="group relative block aspect-16/11 w-full cursor-pointer rounded-2xl bg-[#f2f2f20c] p-1 border border-neutral-800/80 sm:aspect-video md:aspect-16/10 lg:aspect-16/11 lg:rounded-3xl lg:p-2 hover:-translate-y-2 transition-transform duration-300 ease-in-out lg:mt-2.5"
            href={projectHref}
          >
            {/* Top highlight border line */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(0,0,0,0)_5%,rgba(255,255,255,0.8)_35%,rgb(255,255,255)_50%,rgba(255,255,255,0.8)_65%,rgba(0,0,0,0)_95%)]"
            />

            {/* Inside Container */}
            <div className="relative flex size-full flex-col items-center justify-between overflow-hidden rounded-xl bg-black max-lg:pt-2 lg:rounded-2xl from-black/20 to-black/45 transition-colors duration-300 hover:from-black/20 lg:from-black/35 bg-linear-to-b">
              {/* Landscape Thumbnail */}
              {project?.thumbnail ? (
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
                  <span className="font-mono text-xs text-neutral-600 uppercase tracking-wider">
                    {project.title}
                  </span>
                </div>
              )}

              {/* Top gradient scrim for text legibility */}
              <div className="absolute inset-x-0 top-0 z-10 h-2/3 bg-linear-to-b from-black/70 via-black/20 to-transparent" />

              {/* Inner top subtle line */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 z-10 h-[0.8px] bg-[linear-gradient(90deg,rgba(0,0,0,0)_20%,rgb(255,255,255)_50%,rgba(0,0,0,0)_80%)] opacity-70"
              />

              {/* Heading text + ArrowRight (top-aligned) */}
              <div className="relative z-20 flex w-full flex-row items-center justify-between gap-8 px-4 py-3 text-white/90 md:px-6 md:py-4 lg:px-5 lg:py-5">
                <p className="text-sm sm:text-base md:text-lg line-clamp-2">
                  {project.description}
                </p>
                <ArrowRight className="size-5 shrink-0 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Links: Live Preview & Source Code */}
        {(project.links?.live || project.links?.github) && (
          <motion.div
            className="flex items-center w-fit gap-4 *:whitespace-nowrap"
            variants={cardSectionVariants}
          >
            {project.links?.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-300 font-light flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <LinkIcon className="text-foreground size-4 stroke-[1.5px]" />
                <ShiningText
                  text="Live Preview"
                  className="text-[14px] sm:text-base"
                />
              </a>
            )}
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-300 font-light flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <FaGithub className="text-foreground size-4 stroke-[1.5px] sm:stroke-2" />
                <ShiningText
                  text="Source Code"
                  className="text-[14px] sm:text-base"
                />
              </a>
            )}
          </motion.div>
        )}

        {/* Tech Stack Pills */}
        {project.tools && project.tools.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-1.5 sm:gap-2"
            variants={cardSectionVariants}
          >
            {project.tools.map((tool, idx) => {
              const stack = getStack(tool);
              const StackIcon = stack?.icon;
              return (
                <span
                  key={idx}
                  data-slot="badge"
                  className="inline-flex w-fit bg-muted/50 items-center justify-center whitespace-nowrap text-neutral-300 transition-[color,box-shadow] gap-1.5 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] md:text-xs font-medium capitalize gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)]"
                >
                  {StackIcon && <StackIcon className="size-3.5" />}
                  {tool}
                </span>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
