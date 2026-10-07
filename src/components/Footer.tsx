"use client";

import React from "react";
import { Link } from "@/components/Link";
import { ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter, FaInstagram } from "react-icons/fa6";
import Image from "next/image";

export const Footer: React.FC = () => {
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
  ];

  const resourceLinks = [
    { label: "Blog", href: "/blogs" },
    { label: "Resume", href: "/resume" },
    { label: "Support", href: "/donate" },
  ];

  const socialLinks = [
    {
      label: "GitHub",
      href: "https://github.com/PRASSamin",
      icon: FaGithub,
      username: "@PRASSamin",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/prassamin/",
      icon: FaLinkedin,
      username: "in/prassamin",
    },
    {
      label: "Twitter / X",
      href: "https://twitter.com/prassamin78",
      icon: FaXTwitter,
      username: "@prassamin78",
    },
    {
      label: "Instagram",
      href: "https://instagram.com/prassamin",
      icon: FaInstagram,
      username: "@prassamin",
    },
  ];

  return (
    <footer className="relative pt-24 w-full z-20 overflow-hidden bg-transparent text-left">
      {/* Subtle Top Glowing Border Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* Ambient Background Glow matching Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#2E996C]/10 blur-[140px] select-none"
      />

      {/* Subtle Background Dot Grid */}
      <div
        className="absolute inset-0 -z-10 h-full w-full pointer-events-none select-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="layout relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-neutral-900">
          {/* Identity & Live Location (cols 1-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Image src="/logo.svg" alt="Logo" width={100} height={100} />
              <p className="text-neutral-400 mt-3 max-w-sm text-sm leading-relaxed font-rethink">
                Full-stack developer building modern web applications,
                high-performance developer tools, and exploring fundamental web
                systems.
              </p>
            </div>
          </div>

          {/* Navigation (cols 5-6) */}
          <div className="lg:col-span-2 flex flex-col gap-3 font-rethink">
            <p className="font-mono text-neutral-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              <span>Navigation</span>
            </p>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1.5 text-neutral-400 hover:text-white text-sm transition-colors py-0.5"
              >
                <span className="w-1.5 h-px bg-neutral-700 group-hover:w-3 group-hover:bg-accent-300 transition-all duration-200" />
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Resources (cols 7-8) */}
          <div className="lg:col-span-2 flex flex-col gap-3 font-rethink">
            <p className="font-mono text-neutral-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              <span>Resources</span>
            </p>
            {resourceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1.5 text-neutral-400 hover:text-white text-sm transition-colors py-0.5"
              >
                <span className="w-1.5 h-px bg-neutral-700 group-hover:w-3 group-hover:bg-accent-300 transition-all duration-200" />
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Connect (cols 9-12) */}
          <div className="lg:col-span-4 flex flex-col gap-3 font-rethink">
            <p className="font-mono text-neutral-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              <span>Connect</span>
            </p>
            {socialLinks.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between text-neutral-400 hover:text-white text-sm transition-colors py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 text-neutral-500 group-hover:text-accent-300 transition-colors" />
                    <span>{s.label}</span>
                  </div>
                  <span className="font-mono text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors flex items-center gap-1">
                    <span>{s.username}</span>
                    <ArrowUpRight className="size-3 text-neutral-600 group-hover:text-accent-300 transition-colors" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Tier 3: Elegant Architectural PRAS Signature Logo        */}
        {/* ======================================================== */}
        <div className="relative py-14 overflow-hidden select-none pointer-events-none w-full">
          {/* Shared Defs & Global Style */}
          <svg width="0" height="0" className="absolute pointer-events-none">
            <defs>
              <linearGradient id="prasGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{
                    stopColor:
                      "color-mix(in oklab, var(--color-accent) 75%, transparent)",
                  }}
                />
                <stop
                  offset="60%"
                  style={{
                    stopColor:
                      "color-mix(in oklab, var(--color-accent) 25%, transparent)",
                  }}
                />
                <stop
                  offset="100%"
                  style={{
                    stopColor:
                      "color-mix(in oklab, var(--color-accent) 0%, transparent)",
                  }}
                />
              </linearGradient>
            </defs>
            <style>{`
                .pras-path {
                  stroke: url(#prasGrad);
                  stroke-width: 0.5px;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  stroke-dasharray: 600;
                  stroke-dashoffset: 600;
                  fill: color-mix(in oklab, var(--color-accent) 50%, transparent);
                  fill-opacity: 0;
                  /* Reduced duration from 3s to 2s for snappier pacing */
                  animation: drawPras 2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate; 
                }

                .char-p { animation-delay: 0s; }
                .char-r1, .char-r2 { animation-delay: 0.4s; }
                .char-a1, .char-a2 { animation-delay: 0.8s; }
                .char-s { animation-delay: 1.2s; }

                @keyframes drawPras {
                  0% {
                    stroke-dashoffset: 600;
                    fill-opacity: 0;
                    opacity: 0.3;
                  }
                  /* The drawing now finishes much later, drastically cutting down the "hold" time */
                  80% {
                    stroke-dashoffset: 0;
                    fill-opacity: 0.08;
                    opacity: 0.75;
                  }
                  100% {
                    stroke-dashoffset: 0;
                    fill-opacity: 0.1;
                    opacity: 0.85;
                  }
                }

                @media (prefers-reduced-motion: reduce) {
                  .pras-path {
                    animation: none;
                    stroke-dashoffset: 0;
                    opacity: 0.65;
                    fill-opacity: 0.06;
                  }
                }
            `}</style>
          </svg>

          {/* Full Width Justify-Between Letter Track with max-h-44 */}
          <div
            className="w-full max-h-44 h-28 sm:h-36 md:h-44 flex items-center justify-evenly"
            style={{
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.15) 100%)",
            }}
          >
            {/* P */}
            <svg
              viewBox="124 196 90 108"
              className="h-full max-h-44 w-auto shrink-0 overflow-visible"
              aria-hidden="true"
            >
              <path
                className="pras-path char-p"
                d="m137.3 229.1l-0.3 73.9 17-8v-24h25c0 0 29.1-2.6 32-36 0 0 0.1-33.1-30-37h-55l8 16h43c0 0 14.4 2 16 19 0 0 0.6 17.7-18 21h-21l-0.1-24.9z"
              />
            </svg>

            {/* R */}
            <svg
              viewBox="217 196 85 108"
              className="h-full max-h-44 w-auto shrink-0 overflow-visible"
              aria-hidden="true"
            >
              <path
                className="pras-path char-r1"
                fillRule="evenodd"
                d="m219 197.9l14.6 15.8h38.2c0 0 6.9 0 6.9 7.7 0 0 0.6 7.4-6.9 7.4-7.4 0.1-23.5 0-23.5 0l29.2 41.3h22.5l-17.2-26.4c0 0 15.4-4 15.4-22.1 0 0 1.3-23.7-19.5-23.7z"
              />
              <path
                className="pras-path char-r2"
                fillRule="evenodd"
                d="m219.6 228.8v41.3h19.5v-41.3z"
              />
            </svg>

            {/* A */}
            <svg
              viewBox="304 196 100 108"
              className="h-full max-h-44 w-auto shrink-0 overflow-visible"
              aria-hidden="true"
            >
              <path
                className="pras-path char-a1"
                d="m309.6 197.9l8.4 16.1h34l26 51c0 0 2 4.7 11 6l13 1-37-72c0 0-0.9-2.1-4-2z"
              />
              <path
                className="pras-path char-a2"
                d="m306 270l20-37c0 0 2.1-2.6 4-2h14l12 23c0 0 0.8 2.8-2 3l-15-1c0 0-3.7-0.9-6 2l-7 12z"
              />
            </svg>

            {/* S */}
            <svg
              viewBox="406 196 84 108"
              className="h-full max-h-44 w-auto shrink-0 overflow-visible"
              aria-hidden="true"
            >
              <path
                className="pras-path char-s"
                d="m486.8 198.1h-61.1c0 0-16.8 2-17.5 22.3 0 0-1.1 17.3 17.6 21.4h34.8c0 0 4.9 1.6 4.9 6.8 0 0 0.6 5.7-5.9 6.8h-40.7l-8.8 16.5h53.4c0 0 21.4-1.8 21.4-25.3 0 0-0.6-19.6-18.7-20.4l-34.7 0.1c0 0-4.4-0.7-4.9-5.9 0 0-0.4-6 4.9-6.7h47.5z"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
