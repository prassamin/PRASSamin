"use client";

import React from "react";
import { Link } from "@/components/link";
import { LuEye } from "react-icons/lu";
import { motion, type Variants } from "motion/react";
import { QueryBlogs } from "@/lib/get-blogs";

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

const cardVariants: Variants = {
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

interface Props {
  retros: (QueryBlogs["blogs"][number] & { year: string })[];
}

export const Retro: React.FC<Props> = ({ retros }) => {
  const [hoveredYear, setHoveredYear] = React.useState<string | null>(null);

  return (
    <motion.section
      id="retro"
      className="relative overflow-hidden w-full"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 -z-10 h-full w-full pointer-events-none select-none"
        style={
          {
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
            backgroundSize: "40px 40px",
          } as React.CSSProperties
        }
      />

      <div className="layout py-12 md:py-20 flex flex-col">
        {/* Section Header */}
        <motion.div variants={titleVariants}>
          <p className="c1 text-neutral-500 uppercase font-mono tracking-wider">
            the yearly
          </p>
          <h2 className="mt-1 h2 sm:h1 font-bold font-rethink text-white">
            Retro
          </h2>
          <p className="b1 text-neutral-300 mt-2">
            Every year, I share my progress both in career and personal life.
            Here&apos;s last 3 years of them.
          </p>
        </motion.div>

        {/* Retrospectives Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {retros.map((item) => (
            <motion.div
              key={item.year}
              variants={cardVariants}
              className="relative group"
              onMouseEnter={() => setHoveredYear(item.year)}
              onMouseLeave={() => setHoveredYear(null)}
            >
              <div className="group/retro-card-with-views h-full">
                <Link className="block h-full rounded-md" href={item.link}>
                  <div className="border border-neutral-900 rounded-xl inset h-full flex flex-col bg-neutral-950/40">
                    {/* Top Views Header */}
                    <div className="px-6 py-4 relative">
                      <p className="c1 text-neutral-300 flex items-center gap-2">
                        <LuEye className="size-4 text-neutral-600 shrink-0" />
                        <span>{item.views} views</span>
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="-mx-px min-h-[290px] isolate relative px-6 py-6 rounded-xl border border-neutral-900 bg-neutral-925 overflow-hidden flex flex-col justify-start grow">
                      {/* Big Background Outline Year */}
                      <span
                        className="absolute z-[-1] -right-4 -bottom-8 text-9xl font-rethink font-extrabold text-neutral-900 pointer-events-none select-none"
                        style={
                          {
                            maskImage:
                              "linear-gradient(to bottom, rgba(0, 0, 0, 0.70) 0%, rgba(0, 0, 0, 0) 110%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom, rgba(0, 0, 0, 0.70) 0%, rgba(0, 0, 0, 0) 110%)",
                            "--text-shadow-color": "rgba(82, 82, 82, 0.8)",
                            textShadow:
                              "-0.3px 0 var(--text-shadow-color), 0 0.3px var(--text-shadow-color), 0.3px 0 var(--text-shadow-color), 0 -0.3px var(--text-shadow-color)",
                          } as React.CSSProperties
                        }
                      >
                        {item.year}
                      </span>

                      {/* Title with authentic text hover highlight */}
                      <h3 className="h5 mt-3 relative inline-block">
                        <span
                          className="bg-gradient-to-r from-accent/30 via-accent/90 to-accent/30 box-decoration-clone group-hover/retro-card-with-views:opacity-30 opacity-0 transition duration-200 text-transparent"
                          style={{
                            backgroundImage:
                              "linear-gradient(to right, rgba(76, 255, 180, 0.3), rgba(76, 255, 180, 0.9), rgba(76, 255, 180, 0.3))",
                          }}
                          aria-hidden="true"
                        >
                          {item.title}
                        </span>
                        <span className="absolute left-0 top-0 text-white font-semibold">
                          {item.title}
                        </span>
                      </h3>

                      <p className="b2 text-neutral-300 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Timeline Divider & Year Navigation */}
        <motion.div
          variants={titleVariants}
          className="mt-8 flex items-center gap-4"
        >
          <div
            data-orientation="horizontal"
            role="none"
            className="shrink-0 h-[1px] grow w-auto bg-neutral-900"
          />
          {retros.map((item) => {
            const isHovered = hoveredYear === item.year;
            return (
              <motion.span
                key={item.year}
                className={`c1 transition-colors inline-block ${
                  isHovered ? "text-white font-semibold" : "text-neutral-500"
                }`}
                animate={
                  isHovered
                    ? {
                        y: -6,
                        scale: 1.25,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 14,
                        },
                      }
                    : {
                        y: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 24,
                        },
                      }
                }
              >
                {item.year}
              </motion.span>
            );
          })}
          <Link
            className="inline-block underline transition-colors hover:decoration-current focus:decoration-current c1 text-neutral-500 decoration-transparent hover:text-neutral-300"
            href="/about#retro"
          >
            more..
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Retro;
