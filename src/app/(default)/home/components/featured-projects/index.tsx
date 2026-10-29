"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/components/Link";
import { motion, type Variants } from "motion/react";
import { Scribble } from "./scribble";
import { PenSwoopUnderline } from "./pen-swoop-underline";
import { QueryProjects } from "@/lib/get-projects";
import { getStack } from "@/lib/stacks";
import { FaGithub } from "react-icons/fa6";
import { LuChevronRight, LuLink } from "react-icons/lu";

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

const projectVariants: Variants = {
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

// Spotlight Link Button matching Hero Section Resume Button UI
const SpotlightProjectButton: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => {
  const btnRef = React.useRef<HTMLAnchorElement>(null);
  const [cursor, setCursor] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Link
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      style={
        {
          "--cursorX": `${cursor.x}px`,
          "--cursorY": `${cursor.y}px`,
        } as React.CSSProperties
      }
      className="relative group px-4 py-3 rounded-xl backdrop-blur-sm border border-transparent inline-flex items-center gap-3 supports-safari:[&_.glass-icon]:backdrop-blur-[0px] text-white font-rethink text-sm font-medium transition-all duration-300 cursor-pointer"
    >
      {/* Inner cursor spotlight background with emerald/mint glow */}
      <div className="pointer-events-none select-none isolate absolute inset-0 z-[-1] overflow-hidden rounded-[inherit] group-active:opacity-80 transition-opacity">
        <div
          className="absolute top-0 left-0 w-[200%] h-[400%]"
          style={{
            background:
              "radial-gradient(ellipse at center center, rgba(112, 255, 195, 0.16), transparent 45%)",
            opacity: 0.8,
            transform:
              "translateX(calc(var(--cursorX) - 50%)) translateY(calc(var(--cursorY) - 50%)) scale(1.7) rotate(-45deg)",
          }}
        />
      </div>

      {/* Gradient border rotating with cursor */}
      <div
        className="pointer-events-none select-none absolute inset-[-1px] p-px composite-exclude group-active:opacity-80 transition-opacity overflow-hidden"
        style={{ borderRadius: "13px" }}
      >
        <div
          className="w-[250px] h-[650px]"
          style={{
            transform:
              "translate(calc(var(--cursorX) - 50%), calc(var(--cursorY) - 50%)) rotate(80deg)",
            background:
              "#242424 radial-gradient(ellipse at center center, rgba(112, 255, 195, 0.45), rgba(40, 40, 40, 100%) 24%)",
          }}
        />
      </div>

      <span className="relative z-10">{children}</span>

      {/* Glass Icon with emerald chevron */}
      <div
        className="isolate before:transition-opacity glass-icon size-6 rounded-lg flex items-center justify-center relative bg-white/5 backdrop-blur-sm z-10 gradientBorder"
        style={
          {
            "--borderWidth": 1,
            "--background":
              "linear-gradient(to bottom right, rgba(23, 23, 23, 70%) 0%, #525252 62%, rgba(23, 23, 23, 70%) 100%)",
            border: "1px solid transparent",
          } as React.CSSProperties
        }
      >
        <LuChevronRight
          className="size-[70%] text-accent-300 group-hover:translate-x-0.5 transition-transform duration-200"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  );
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

  const displayProjects = filteredProjects.map((project, index) => {
    const rawThumb =
      typeof project.thumbnail === "string"
        ? project.thumbnail
        : project.thumbnail?.portrait ||
          project.thumbnail?.landscape ||
          project.banner ||
          "";

    const rawBanner =
      project.banner ||
      (typeof project.thumbnail === "string"
        ? project.thumbnail
        : project.thumbnail?.landscape ||
          project.thumbnail?.portrait ||
          rawThumb);

    return {
      ...project,
      projectUrl: project.url || `/projects/${project.slug}`,
      liveUrl: project.links?.live,
      githubUrl: project.links?.github,
      squareImage: rawThumb,
      landscapeImage: rawBanner,
      reversed: index % 2 === 1,
    };
  });

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

        {/* Projects Stack */}
        <ul className="mt-20 grid gap-8 w-full">
          {displayProjects.map((project) => (
            <motion.li
              key={project.title}
              variants={projectVariants}
              className={`lg:flex gap-8 ${
                project.reversed ? "flex-row-reverse" : ""
              } w-full`}
            >
              {/* Showcase Image Mockup Card */}
              <div className="shrink-0 relative aspect-video lg:aspect-square lg:h-full">
                {/* Desktop Square View */}
                <figure className="overflow-hidden shadow dark:shadow-none isolate z-[1] hidden lg:block lg:aspect-square pointer-events-none h-full border border-neutral-900 rounded-xl">
                  <div className="relative h-full w-full">
                    <Image
                      src={project.squareImage}
                      alt={project.title}
                      fill
                      className="h-full w-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  </div>
                </figure>

                {/* Mobile Landscape View */}
                <figure className="overflow-hidden shadow dark:shadow-none isolate z-[1] lg:hidden aspect-video pointer-events-none border border-neutral-900 rounded-xl border-b-0 rounded-b-none border-dashed lg:border-solid">
                  <div className="relative h-full w-full">
                    <Image
                      src={project.landscapeImage}
                      alt={project.title}
                      fill
                      className="h-full w-full object-cover"
                      sizes="100vw"
                    />
                  </div>
                </figure>
              </div>

              {/* Text & Specs Box */}
              <div className="grow p-6 lg:p-8 border-neutral-900 border border-dashed rounded-xl rounded-t-none lg:rounded-t-xl">
                <h3 className="h3">{project.title}</h3>
                <p className="b2 text-neutral-300 mt-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Tools Stack */}
                <div className="mt-6">
                  <ul className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {project.tools?.map((t) => {
                      const stack = getStack(t);
                      if (!stack) return null;
                      return (
                        <li
                          key={t}
                          className="relative isolate before:transition-opacity before:opacity-70 hover:before:opacity-100 flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white px-2.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md gradientBorder shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-200 cursor-default select-none"
                        >
                          <stack.icon className="size-4 shrink-0" size={16} />
                          <span className="leading-none">{stack.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Actions */}
                <div className="w-full flex flex-wrap justify-between gap-4 items-center mt-10">
                  <SpotlightProjectButton href={project.projectUrl}>
                    View Project
                  </SpotlightProjectButton>

                  <div className="flex items-center gap-4 sm:gap-6">
                    {project.liveUrl && (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={project.liveUrl}
                        className="underline text-neutral-300 transition-colors hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,_currentColor_65%,_#171717)] default-ring flex items-center gap-1.5 c1 group decoration-transparent cursor-newtab font-medium"
                      >
                        <LuLink className="size-4 text-neutral-500 group-hover:text-accent transition-colors" />
                        Open Live Site
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={project.githubUrl}
                        className="underline text-neutral-300 transition-colors hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,_currentColor_65%,_#171717)] default-ring flex items-center gap-1.5 c1 group decoration-transparent cursor-newtab font-medium"
                      >
                        <FaGithub className="size-4 text-neutral-500 group-hover:text-accent transition-colors" />
                        Repository
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

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
              className="isolate before:transition-opacity glass-icon size-6 flex items-center justify-center relative bg-white/5 backdrop-blur-sm rounded-[10px] gradientBorder group-hover:scale-105 transition-transform"
              style={
                {
                  "--borderWidth": 1,
                  "--background":
                    "linear-gradient(to bottom right, rgba(23, 23, 23, 70%) 0%, #525252 62%, rgba(23, 23, 23, 70%) 100%)",
                  border: "1px solid transparent",
                } as React.CSSProperties
              }
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
