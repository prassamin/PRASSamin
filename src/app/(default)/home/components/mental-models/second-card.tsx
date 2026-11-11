"use client";

import { Link } from "@/components/link";
import { cardItemVariants } from "./motion";
import { motion, Variants } from "framer-motion";

export const SecondCard = () => {
  return (
    <motion.div variants={cardItemVariants as Variants} className="z-20">
      <Link
        className="relative group aspect-square py-10 px-8 rounded-xl bg-neutral-950 border border-neutral-900 text-left flex flex-col justify-end overflow-hidden transition duration-500 hover:brightness-150 w-80 lg:-rotate-3 lg:translate-y-12"
        href="/#cache-invalidation"
        style={
          {
            background:
              "radial-gradient(ellipse at 50% 38%, #1c1c1c 0%, #0a0a0a 75%)",
            boxShadow: "0 0 100px 20px rgba(0, 0, 0, 0.35) inset",
          } as React.CSSProperties
        }
      >
        {/* Top SVG Graphic: Pure Invalidation Architecture */}
        <div className="relative h-30 w-full flex items-center justify-center mb-auto overflow-hidden">
          <svg
            viewBox="0 0 240 100"
            className="w-full h-full max-w-60 overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glass Cache Chassis Background Gradient */}
              <linearGradient
                id="cache-chassis-bg"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.16)" />
                <stop offset="40%" stopColor="rgba(35, 35, 35, 0.7)" />
                <stop offset="100%" stopColor="rgba(12, 12, 12, 0.96)" />
              </linearGradient>

              {/* Active Cache Slot Data Gradient */}
              <linearGradient
                id="slot-data-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.28)" />
              </linearGradient>

              {/* 3D Database Server Cylinder Body Gradient */}
              <linearGradient
                id="origin-db-cylinder"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.24)" />
                <stop offset="35%" stopColor="rgba(45, 45, 45, 0.85)" />
                <stop offset="100%" stopColor="rgba(10, 10, 10, 0.98)" />
              </linearGradient>

              {/* Specular Platter Face Gradient */}
              <radialGradient id="origin-db-platter" cx="50%" cy="35%" r="65%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
                <stop offset="45%" stopColor="rgba(85, 85, 85, 0.6)" />
                <stop offset="100%" stopColor="rgba(16, 16, 16, 0.95)" />
              </radialGradient>

              {/* Luminous Specular Glow Filter (userSpaceOnUse to avoid zero-height clipping) */}
              <filter
                id="cache-stream-glow"
                filterUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="240"
                height="100"
              >
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle Background Matrix Dots */}
            <g opacity="0.12">
              <circle cx="14" cy="14" r="1.2" fill="#ffffff" />
              <circle cx="14" cy="86" r="1.2" fill="#ffffff" />
              <circle cx="226" cy="14" r="1.2" fill="#ffffff" />
              <circle cx="226" cy="86" r="1.2" fill="#ffffff" />
            </g>

            {/* ARCHITECTURAL CONDUIT RAILS */}
            {/* Rail 1: Top Write Highway (Client -> Origin DB, arching high above cache) */}
            <path
              d="M 24 50 C 40 14, 60 12, 100 12 H 132 C 158 12, 172 24, 184 38"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 24 50 C 40 14, 60 12, 100 12 H 132 C 158 12, 172 24, 184 38"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <text
              x="114"
              y="8.5"
              fill="rgba(255,255,255,0.65)"
              fontSize="4.5"
              fontWeight="600"
              letterSpacing="0.5px"
              fontFamily="monospace"
              textAnchor="middle"
            >
              WRITE
            </text>

            {/* Rail 0: Client <-> Cache Ingress Line */}
            <line
              x1="24"
              y1="50"
              x2="70"
              y2="50"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="24"
              y1="50"
              x2="70"
              y2="50"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Rail 2: Purge Laser Optical Conduit (Origin DB -> Cache Slot 2) */}
            <line
              x1="176"
              y1="63.5"
              x2="122"
              y2="63.5"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="176"
              y1="63.5"
              x2="122"
              y2="63.5"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.4"
              strokeDasharray="3 2"
              strokeLinecap="round"
            />
            <text
              x="149"
              y="58"
              fill="#ffffff"
              fontSize="4.6"
              fontWeight="700"
              letterSpacing="0.6px"
              fontFamily="monospace"
              textAnchor="middle"
              style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))" }}
            >
              PURGE
            </text>

            {/* Rail 3: Refill Highway Conduit (Origin DB -> Cache Slot 2) */}
            <path
              d="M 182 70 C 168 86, 142 86, 122 68"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 182 70 C 168 86, 142 86, 122 68"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <text
              x="154"
              y="92"
              fill="rgba(255,255,255,0.6)"
              fontSize="4.5"
              fontWeight="600"
              letterSpacing="0.5px"
              fontFamily="monospace"
              textAnchor="middle"
            >
              REFILL
            </text>

            {/* CLIENT NODE (LEFT) */}
            <circle
              cx="24"
              cy="50"
              r="6"
              fill="#161616"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.3"
            />
            <circle
              cx="24"
              cy="50"
              r="2.2"
              fill="#ffffff"
              style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.9))" }}
            />
            <text
              x="24"
              y="64"
              fill="rgba(255,255,255,0.5)"
              fontSize="4.5"
              fontWeight="600"
              fontFamily="monospace"
              textAnchor="middle"
            >
              CLIENT
            </text>

            {/* IN-MEMORY FROSTED GLASS CACHE LAYER (CENTER) */}
            <rect
              x="70"
              y="20"
              width="52"
              height="60"
              rx="8"
              fill="url(#cache-chassis-bg)"
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="1.2"
            />
            <line
              x1="70"
              y1="32"
              x2="122"
              y2="32"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1"
            />
            <text
              x="75"
              y="28"
              fill="rgba(255,255,255,0.85)"
              fontSize="5"
              fontWeight="700"
              letterSpacing="0.6px"
              fontFamily="monospace"
            >
              CACHE
            </text>
            <circle
              cx="114"
              cy="27"
              r="1.8"
              fill="#ffffff"
              style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.9))" }}
            />

            {/* Cache Slot 1 (Top: Stable Warm Key) */}
            <rect
              x="75"
              y="36"
              width="42"
              height="12"
              rx="3"
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
            <line
              x1="79"
              y1="42"
              x2="95"
              y2="42"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="110" cy="42" r="1.4" fill="rgba(255,255,255,0.4)" />

            {/* Cache Slot 2 (Bottom: Target Invalidation Slot) */}
            {/* Dashed Empty Receptacle Base (Always visible when evicted) */}
            <rect
              x="75"
              y="53"
              width="42"
              height="21"
              rx="3.5"
              fill="rgba(0,0,0,0.5)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Live Cached Data Block */}
            <g className="animate-target-slot">
              <rect
                x="76"
                y="54"
                width="40"
                height="19"
                rx="3"
                fill="#161616"
              />
              <rect
                x="76"
                y="54"
                width="40"
                height="19"
                rx="3"
                fill="url(#slot-data-gradient)"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="1.1"
              />
              <line
                x1="81"
                y1="60"
                x2="98"
                y2="60"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <line
                x1="81"
                y1="66"
                x2="92"
                y2="66"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle
                cx="109"
                cy="63.5"
                r="2"
                fill="#ffffff"
                style={{
                  filter: "drop-shadow(0 0 3px rgba(255,255,255,0.9))",
                }}
              />
            </g>

            {/* Purge Eviction Shockwave Ripple (centered at cx=96, cy=63.5) */}
            <circle
              cx="96"
              cy="63.5"
              r="7"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              className="animate-evict-shockwave"
            />

            {/* ORIGIN DATABASE SERVER TOWER (RIGHT) */}
            <g className="animate-db-commit">
              <text
                x="198"
                y="20"
                fill="rgba(255,255,255,0.85)"
                fontSize="5"
                fontWeight="700"
                letterSpacing="0.6px"
                fontFamily="monospace"
                textAnchor="middle"
              >
                ORIGIN DB
              </text>

              {/* Cylinder Tier 3 (Base) */}
              <path
                d="M 176 60 A 22 6 0 0 0 220 60 V 68 A 22 6 0 0 1 176 68 Z"
                fill="url(#origin-db-cylinder)"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.1"
              />
              <ellipse
                cx="198"
                cy="68"
                rx="22"
                ry="6"
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />

              {/* Cylinder Tier 2 (Middle) */}
              <path
                d="M 176 50 A 22 6 0 0 0 220 50 V 58 A 22 6 0 0 1 176 58 Z"
                fill="url(#origin-db-cylinder)"
                stroke="rgba(255,255,255,0.26)"
                strokeWidth="1.1"
              />
              <ellipse
                cx="198"
                cy="58"
                rx="22"
                ry="6"
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />

              {/* Cylinder Tier 1 (Top Platter) */}
              <path
                d="M 176 40 A 22 6 0 0 0 220 40 V 48 A 22 6 0 0 1 176 48 Z"
                fill="url(#origin-db-cylinder)"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="1.2"
              />
              <ellipse
                cx="198"
                cy="40"
                rx="22"
                ry="6"
                fill="url(#origin-db-platter)"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.2"
              />

              {/* Spindle Core */}
              <circle
                cx="198"
                cy="40"
                r="3.2"
                fill="#ffffff"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(255,255,255,0.95))",
                }}
              />
              <line
                x1="188"
                y1="45"
                x2="208"
                y2="45"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="188"
                y1="55"
                x2="204"
                y2="55"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {/* CLEAN SEQUENTIAL FLOW STREAMS (3-ACT PACED LIFECYCLE) */}
            {/* Stream 1: Query Ingress (Client -> Cache: Hit & Miss queries) */}
            <path
              d="M 24 50 L 70 50"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              className="animate-query-stream"
              filter="url(#cache-stream-glow)"
              style={{
                filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))",
              }}
            />

            {/* Stream 2: Response Egress (Cache -> Client: Hit & Miss responses) */}
            <path
              d="M 70 50 L 24 50"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              className="animate-return-stream"
              filter="url(#cache-stream-glow)"
              style={{
                filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))",
              }}
            />

            {/* Stream 3: Mutation Write Stream (Client -> Origin DB over top highway) */}
            <path
              d="M 24 50 C 40 14, 60 12, 100 12 H 132 C 158 12, 172 24, 184 38"
              stroke="#ffffff"
              strokeWidth="3.6"
              strokeLinecap="round"
              fill="none"
              className="animate-put-write"
              filter="url(#cache-stream-glow)"
              style={{
                filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.85))",
              }}
            />

            {/* Stream 4: PURGE Invalidation Laser (Origin DB -> Cache Slot 2) */}
            <path
              d="M 176 63.5 L 122 63.5"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-purge-laser"
              filter="url(#cache-stream-glow)"
              style={{
                filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.95))",
              }}
            />

            {/* Stream 5: On-Demand Refill Stream (Origin DB -> Cache Slot 2 over bottom highway) */}
            <path
              d="M 182 70 C 168 86, 142 86, 122 68"
              stroke="#ffffff"
              strokeWidth="3.6"
              strokeLinecap="round"
              fill="none"
              className="animate-refill-stream"
              filter="url(#cache-stream-glow)"
              style={{
                filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.85))",
              }}
            />
          </svg>
        </div>

        <h2 className="underline decoration-transparent group-hover:decoration-current group-focus:decoration-current transition-colors duration-200 text-2xl sm:text-[1.75rem] font-bold tracking-tight text-white leading-tight">
          Cache Invalidation
        </h2>
        <p className="b2 text-neutral-500 mt-2">
          Mental Model for Stale Data, Purging &amp; Rehydration
        </p>
      </Link>
    </motion.div>
  );
};
