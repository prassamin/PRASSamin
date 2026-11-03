"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import type { QueryProjects } from "@/lib/get-projects";
import SectionHeader from "./components/section-header";
import ProjectCard from "./components/project-card";
import { ProjectsBackgroundIcon } from "./components/projects-background-icon";
import ProjectsLayoutContainer from "./components/projects-layout-container";

interface ProjectsViewProps {
  initialProjects?: QueryProjects["projects"];
  totalPages?: number;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const ProjectsView = ({ initialProjects = [] }: ProjectsViewProps) => {
  return (
    <ProjectsLayoutContainer blur={true}>
      <div className="relative">
        {/* Drafting/Architectural Blueprint Top Background */}
        <div
          className="absolute inset-0 z-[-1] h-112.5 w-full overflow-hidden bg-neutral-950"
          style={{
            maskImage:
              "linear-gradient(rgb(0, 0, 0) 30%, rgba(0, 0, 0, 0) 100%)",
            WebkitMaskImage:
              "linear-gradient(rgb(0, 0, 0) 30%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          <ProjectsBackgroundIcon className="opacity-60 md:w-full" />
        </div>

        {/* Header and Project Showcase Section */}
        <motion.div
          className="pt-36 pb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="mb-10 md:mb-20" variants={itemVariants}>
            <SectionHeader />
          </motion.div>

          <div className="relative">
            {/* Center Dashed Vertical Divider with top/bottom fade */}
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-1/2 hidden -translate-x-1/2 lg:block"
            >
              <div className="h-full w-px border-neutral-800 border-l border-dashed" />
              <div className="absolute top-0 -left-px h-18 w-0.75 bg-linear-to-b from-neutral-950 to-transparent" />
              <div className="absolute bottom-0 -left-px h-18 w-0.75 bg-linear-to-t from-neutral-950 to-transparent" />
            </div>

            {/* 2-Column Staggered Project Grid */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-24 lg:grid-cols-2 lg:gap-y-0">
              {initialProjects.map((project, index) => (
                <div key={project.slug || index}>
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </ProjectsLayoutContainer>
  );
};

ProjectsView.displayName = "ProjectsView";

export default ProjectsView;
