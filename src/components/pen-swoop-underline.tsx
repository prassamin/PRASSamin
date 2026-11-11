"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@heroui/styles";

const swoopVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
      opacity: { duration: 0.2, delay: 0.2 },
    },
  },
};

const inkTextureVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 0.4,
    transition: {
      pathLength: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 },
      opacity: { duration: 0.25, delay: 0.35 },
    },
  },
};

export const PenSwoopUnderline: React.FC<
  React.ComponentProps<typeof motion.svg & { height?: string }>
> = ({ className, height = "2.6", ...props }) => {
  return (
    <motion.svg
      className={cn(
        "absolute -left-0.5 sm:-left-1 -bottom-0.5 w-[calc(100%+4px)] sm:w-[calc(100%+8px)] h-4 sm:h-4.5 overflow-visible pointer-events-none select-none",
        className,
      )}
      viewBox="0 0 220 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      <defs>
        <linearGradient
          id="pen-swoop-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#4cffb4" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#70ffc3" stopOpacity="1" />
          <stop offset="100%" stopColor="#4cffb4" stopOpacity="0.9" />
        </linearGradient>
        <filter id="pen-glow" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="3"
            floodColor="#4cffb4"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      <g filter="url(#pen-glow)">
        {/* Secondary ink sketch layer for authentic hand-inked texture */}
        <motion.path
          d="M 10 13 C 45 3.5, 160 3.5, 212 13"
          stroke="url(#pen-swoop-gradient)"
          strokeWidth="1.2"
          strokeLinecap="round"
          variants={inkTextureVariants}
        />

        {/* Primary pen-drawn reverse curve (arched upward in center, tapering at ends) */}
        <motion.path
          d="M 3 15 C 45 2.5, 165 2.5, 217 15"
          stroke="url(#pen-swoop-gradient)"
          strokeWidth={height}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={swoopVariants}
        />
      </g>
    </motion.svg>
  );
};

export default PenSwoopUnderline;
