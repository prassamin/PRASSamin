"use client";

import React from "react";
import { Link } from "@/components/Link";
import { motion, type Variants } from "motion/react";
import { Scribble } from "./scribble";
import { PenSwoopUnderline } from "./pen-swoop-underline";
import ProjectCard from "@/app/(fuma)/projects/components/project-card";
import { QueryProjects } from "@/lib/get-projects";
import { LuChevronRight } from "react-icons/lu";

type Props = {
  projects?: QueryProjects["projects"];
};

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

export const FeaturedProjects: React.FC<Props> = ({ projects = [] }) => {
  // Filter out any index or empty metadata files
  const filteredProjects = projects
    .filter(
      (p) =>
        p.slug &&
        p.slug !== "" &&
        p.slug !== "index" &&
        p.category !== "Route Root",
    )
    .slice(0, 2);

  return (
    <motion.section
      id="featured-projects"
      className="relative overflow-hidden w-full"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {/* Background Hand-drawn Scribble */}
      <Scribble />

      <div className="layout py-12 md:py-20 flex flex-col">
        {/* Section Heading with Underline SVG */}
        <motion.div variants={titleVariants} className="self-start">
          <h2 className="relative flex items-center gap-2 self-start h2 sm:h1 text-white">
            <span>
              Featured{" "}
              <span className="relative transition-colors bg-gradient-to-br from-accent/30 via-accent/90 to-accent/30 bg-clip-text text-transparent">
                Projects
                {/* Pen-written Swoop Underline */}
                <PenSwoopUnderline />
              </span>
            </span>
          </h2>
          <p className="b1 text-neutral-300 mt-3 sm:mt-4">
            A selection of projects that I&apos;ve worked on.
          </p>
        </motion.div>

        {/* Projects — same blueprint card UI as the projects list page (cards self-reveal) */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2 w-full">
          {filteredProjects.map((project, index) => (
            <div key={project.slug || index} className="h-full">
              <ProjectCard project={project} index={index} standalone />
            </div>
          ))}
        </div>

        {/* See More Projects Link */}
        <motion.div
          variants={titleVariants}
          className="mt-14 sm:mt-16 self-center"
        >
          <Link
            href="/projects"
            className="flex items-center gap-2 hover:text-neutral-100 transition-colors text-neutral-300 text-sm sm:text-base group"
          >
            <span>See more projects</span>
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

export default FeaturedProjects;
