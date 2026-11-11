"use client";

import React, { useRef, useState } from "react";
import { Link } from "@/components/link";
import { HeroGrid } from "./hero-grid";
import { FaGithub, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { LuArrowDown } from "react-icons/lu";
import { motion, type Variants } from "motion/react";
import { useOwner } from "@/providers/owner-provider";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const textVariants: Variants = {
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

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const HeroSection: React.FC = () => {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const { owner } = useOwner();

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="relative w-full">
      {/* Ambient Emerald Glow Blob */}
      <div className="absolute overflow-hidden inset-0 select-none pointer-events-none">
        <div
          aria-hidden="true"
          className="h-[100px] w-[850px] rounded-full bg-gradient-to-r from-[#2E996C]/30 to-[#0F3324]/20 blur-[130px] absolute top-[12%] left-[85%] -translate-y-1/2 -translate-x-1/2 rotate-45 origin-left z-0"
        />
      </div>

      {/* 3D CSS Isometric Perspective Grid Canvas with Framer Motion Fade-in */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="select-none"
      >
        <HeroGrid />
      </motion.div>

      {/* Hero Content */}
      <div className="layout relative z-10 pb-12 pt-12 min-h-[calc(100vh-80px)] md:pb-20 md:pt-36 flex flex-col justify-center items-start text-left pointer-events-none">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pointer-events-auto flex flex-col items-start"
        >
          {/* Main Title & Subtitle */}
          <div className="max-w-[40rem]">
            <motion.h1
              variants={textVariants}
              className="h1 text-4xl sm:text-6xl md:text-7xl font-bold font-rethink text-white tracking-tight leading-[1.15] flex flex-wrap items-center gap-x-3.5 gap-y-2"
            >
              <span>I&apos;m</span>
              <span className="relative inline-block -rotate-1 hover:rotate-0 transition-transform duration-300 ease-out group cursor-default">
                {/* Frosted Tape Accent */}
                <span
                  aria-hidden="true"
                  className="absolute -top-3 left-4 w-9 sm:w-11 h-3.5 sm:h-4 bg-white/20 backdrop-blur-[2px] -rotate-6 border-t border-b border-white/30 z-20 pointer-events-none rounded-[1px] shadow-xs"
                />
                {/* Tactile Torn Paper Cutout */}
                <span className="torn-paper bg-gradient-to-br from-[#faf8f5] via-[#f4f1ea] to-[#e8e4d8] text-neutral-950 font-extrabold px-3 py-1 sm:px-5 sm:py-1.5 inline-block shadow-[0_12px_28px_rgba(0,0,0,0.85),_0_2px_4px_rgba(0,0,0,0.4)] relative z-10 selection:bg-neutral-900 selection:text-white">
                  {owner?.name}
                </span>
              </span>
            </motion.h1>
            <motion.p
              variants={textVariants}
              className="b1 text-neutral-400 mt-6 leading-relaxed text-base sm:text-lg"
            >
              Full-stack developer &amp; open-source enthusiast. I build modern
              web applications, TypeScript tools, and craft high-performance
              digital experiences through thoughtful engineering.
            </motion.p>
          </div>

          {/* Interactive CTA Buttons */}
          <motion.div
            variants={textVariants}
            className="mt-10 flex flex-wrap items-center gap-2.5"
          >
            {/* Primary Button with cursor spotlight, rotating gradient border, and glass arrow badge */}
            <Link
              ref={btnRef}
              onMouseMove={handleMouseMove}
              href="/resume"
              target="_blank"
              rel="noopener noreferrer"
              style={
                {
                  "--cursorX": `${cursorPos.x}px`,
                  "--cursorY": `${cursorPos.y}px`,
                } as React.CSSProperties
              }
              className="relative group px-4 py-3 rounded-xl backdrop-blur-sm border border-transparent inline-flex items-center gap-3 supports-safari:[&_.glass-icon]:backdrop-blur-[0px] text-white font-rethink text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              {/* Inner cursor spotlight background */}
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

              <span>Resume</span>

              {/* Glass Icon with Down Arrow */}
              <div className="isolate before:transition-opacity size-6 rounded-lg flex items-center justify-center relative bg-white/5 backdrop-blur-sm z-10 gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent">
                <LuArrowDown className="text-accent-300 group-hover:translate-y-0.5 transition-transform duration-200" />
              </div>
            </Link>

            {/* Secondary Button: More about me with matching gradient border */}
            <Link
              href="/about"
              className="flex items-center px-4 py-3 relative rounded-xl transition-colors hover:bg-neutral-600/10 focus:bg-neutral-600/10 backdrop-blur-sm text-neutral-300 hover:text-white font-rethink text-sm font-medium"
            >
              <div className="isolate before:transition-opacity absolute inset-0 rounded-xl opacity-60 gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent" />
              <span className="relative z-10">More about me</span>
            </Link>
          </motion.div>

          {/* Social Links Bar */}
          <motion.div
            variants={textVariants}
            className="mt-8 flex items-center gap-4 text-neutral-500"
          >
            <Link
              href="https://github.com/PRASSamin"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-neutral-200 transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="GitHub"
            >
              <FaGithub className="size-4" />
              <span>GitHub</span>
            </Link>
            <span className="text-neutral-700">•</span>
            <Link
              href="https://twitter.com/prassamin78"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-neutral-200 transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Twitter"
            >
              <FaXTwitter className="size-4" />
              <span>Twitter</span>
            </Link>
            <span className="text-neutral-700">•</span>
            <Link
              href="https://www.linkedin.com/in/prassamin/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-neutral-200 transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Instagram"
            >
              <FaInstagram className="size-4" />
              <span>Instagram</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
