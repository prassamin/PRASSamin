"use client";
import { Link } from "@/components/Link";
import React from "react";
import { motion } from "framer-motion";
import { cardItemVariants } from "./motion";

export const FirstCard = () => {
  return (
    <motion.div variants={cardItemVariants} className="z-30">
      <Link
        className="group aspect-square py-10 px-8 rounded-xl bg-neutral-950 border border-neutral-900 text-left flex flex-col justify-end overflow-hidden transition duration-500 hover:brightness-[150%] w-80 lg:rotate-[5deg]"
        href="/#concurrency"
        style={
          {
            background:
              "radial-gradient(ellipse at 50% 38%, #1c1c1c 0%, #0a0a0a 75%)",
            boxShadow: "0 0 100px 20px rgba(0, 0, 0, 0.35) inset",
          } as React.CSSProperties
        }
      >
        {/* Top SVG Graphic: Concurrency (Sophisticated Parallel Pipeline, Zero Hover Color Shift) */}
        <div className="relative h-[7.5rem] w-full flex items-center justify-center mb-auto overflow-hidden">
          <svg
            viewBox="0 0 240 100"
            className="w-full h-full max-w-[240px] overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Silver / White Specular Gradient for Data Packets */}
              <linearGradient
                id="conc-pulse-glass"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#888888" stopOpacity="0.1" />
              </linearGradient>

              {/* Smoky Glass Gradient for Worker Chassis */}
              <linearGradient
                id="worker-chassis-bg"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
                <stop offset="100%" stopColor="rgba(20, 20, 20, 0.9)" />
              </linearGradient>
            </defs>

            {/* Subtle Background Circuit Grid Dots for Architectural Depth */}
            <g opacity="0.18">
              <circle cx="45" cy="24" r="1.2" fill="#ffffff" />
              <circle cx="65" cy="24" r="1.2" fill="#ffffff" />
              <circle cx="175" cy="24" r="1.2" fill="#ffffff" />
              <circle cx="195" cy="24" r="1.2" fill="#ffffff" />

              <circle cx="45" cy="50" r="1.2" fill="#ffffff" />
              <circle cx="65" cy="50" r="1.2" fill="#ffffff" />
              <circle cx="175" cy="50" r="1.2" fill="#ffffff" />
              <circle cx="195" cy="50" r="1.2" fill="#ffffff" />

              <circle cx="45" cy="76" r="1.2" fill="#ffffff" />
              <circle cx="65" cy="76" r="1.2" fill="#ffffff" />
              <circle cx="175" cy="76" r="1.2" fill="#ffffff" />
              <circle cx="195" cy="76" r="1.2" fill="#ffffff" />
            </g>

            {/* Subtle Dual-Rail Conduit Channel Tracks */}
            <path
              d="M 22 50 C 44 50, 52 24, 76 24 H 164 C 188 24, 196 50, 218 50"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 22 50 H 218"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 22 50 C 44 50, 52 76, 76 76 H 164 C 188 76, 196 50, 218 50"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Base Rails (Guide Lines) */}
            <path
              d="M 22 50 C 44 50, 52 24, 76 24 H 164 C 188 24, 196 50, 218 50"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 22 50 H 218"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 22 50 C 44 50, 52 76, 76 76 H 164 C 188 76, 196 50, 218 50"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Dispatcher Scheduler Ingress Hub (Left) */}
            <g
              className="origin-center  animate-ingress-hub"
              style={{ transformOrigin: "20px 50px" }}
            >
              <circle
                cx="20"
                cy="50"
                r="6"
                fill="#181818"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />
              <circle cx="20" cy="50" r="2.2" fill="#ffffff" />
            </g>

            {/* 3 Staggered Architecture Worker Modules */}
            {/* Worker Node 1 (Top Lane - Staggered Left) */}
            <g
              className="origin-center  animate-worker-1"
              style={{ transformOrigin: "109px 24px" }}
            >
              <rect
                x="90"
                y="12"
                width="38"
                height="24"
                rx="6"
                fill="url(#worker-chassis-bg)"
                stroke="rgba(255,255,255,0.26)"
                strokeWidth="1.2"
              />
              <circle cx="100" cy="24" r="3" fill="#ffffff" />
              <line
                x1="108"
                y1="19"
                x2="120"
                y2="19"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="108"
                y1="24"
                x2="122"
                y2="24"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="108"
                y1="29"
                x2="116"
                y2="29"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Worker Node 2 (Middle Lane - Staggered Right) */}
            <g
              className="origin-center  animate-worker-2"
              style={{ transformOrigin: "139px 50px" }}
            >
              <rect
                x="120"
                y="38"
                width="38"
                height="24"
                rx="6"
                fill="url(#worker-chassis-bg)"
                stroke="rgba(255,255,255,0.26)"
                strokeWidth="1.2"
              />
              <circle cx="130" cy="50" r="3" fill="#ffffff" />
              <line
                x1="138"
                y1="45"
                x2="150"
                y2="45"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="138"
                y1="50"
                x2="152"
                y2="50"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="138"
                y1="55"
                x2="146"
                y2="55"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Worker Node 3 (Bottom Lane - Centered) */}
            <g
              className="origin-center  animate-worker-3"
              style={{ transformOrigin: "104px 76px" }}
            >
              <rect
                x="85"
                y="64"
                width="38"
                height="24"
                rx="6"
                fill="url(#worker-chassis-bg)"
                stroke="rgba(255,255,255,0.26)"
                strokeWidth="1.2"
              />
              <circle cx="95" cy="76" r="3" fill="#ffffff" />
              <line
                x1="103"
                y1="71"
                x2="115"
                y2="71"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="103"
                y1="76"
                x2="117"
                y2="76"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="103"
                y1="81"
                x2="111"
                y2="81"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Collector Synchronizer Egress Hub (Right) */}
            <circle
              cx="220"
              cy="50"
              r="6"
              fill="#181818"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />
            <circle cx="220" cy="50" r="2.2" fill="#ffffff" />

            {/* Continuous Streaming Parallel Packets (Staggered Staged Intervals) */}
            <path
              d="M 22 50 C 44 50, 52 24, 76 24 H 164 C 188 24, 196 50, 218 50"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              className="animate-conduit-1"
              style={{
                filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))",
              }}
            />
            <path
              d="M 22 50 H 218"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              className="animate-conduit-2"
              style={{
                filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))",
              }}
            />
            <path
              d="M 22 50 C 44 50, 52 76, 76 76 H 164 C 188 76, 196 50, 218 50"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              className="animate-conduit-3"
              style={{
                filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))",
              }}
            />
          </svg>
        </div>

        <h2 className="underline decoration-transparent group-hover:decoration-current group-focus:decoration-current transition-colors duration-200 text-2xl sm:text-[1.75rem] font-bold tracking-tight text-white leading-tight">
          Concurrency
        </h2>
        <p className="b2 text-neutral-500 mt-2">
          Mental Model for Parallel &amp; Async Systems
        </p>
      </Link>
    </motion.div>
  );
};
