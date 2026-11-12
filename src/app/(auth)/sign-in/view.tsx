"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { GithubOAuthButton } from "@/app/(auth)/sign-in/components/github-oauth-button";
import { Tape } from "@/components/tape";
import { PenSwoopUnderline } from "@/components/pen-swoop-underline";
import { Tooltip } from "@/components/ui/tooltip";
import { LuLock, LuInfo } from "react-icons/lu";
import { motion, type Variants } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const SignInView: React.FC = () => {
  const isMobile = useIsMobile();
  const [isRevealed, setIsRevealed] = useState(true);

  // Trigger the reveal expansion shortly after the initial card drops in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center p-2 sm:p-4">
      {/* Ambient Radial Glow behind the card */}
      <div
        className="pointer-events-none absolute -top-24 -right-12 h-80 w-80 rounded-full bg-accent/5 blur-[100px] -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-white/2 blur-[100px] -z-10"
        aria-hidden="true"
      />

      {/* Main Tactile Access Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl border border-neutral-800 bg-muted/20 shadow-2xl backdrop-blur-2xl w-fit mx-auto"
      >
        <Tape className="absolute z-30 -top-3.5 -left-4 sm:-top-4 sm:-left-6 w-24! h-7! opacity-85 -rotate-12 pointer-events-none" />

        {/* Specular Top Hairline Reflection */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(0,0,0,0)_5%,rgba(255,255,255,0.4)_35%,rgb(255,255,255)_50%,rgba(255,255,255,0.4)_65%,rgba(0,0,0,0)_95%)] z-20 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Column */}
        <div className="relative w-85 sm:w-100 md:w-110 min-h-65 md:min-h-115 shrink-0 bg-muted/40 overflow-hidden border-b md:border-b-0 md:border-r border-neutral-800/80 rounded-3xl z-10 group">
          {/* Inset Image Container */}
          <div className="absolute inset-4 rounded-2xl overflow-hidden">
            <Image
              src="/assets/sign-in-image.webp"
              alt="Personal anime collage inspiration archive"
              fill
              sizes="(max-width: 768px) 100vw, 440px"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
              priority
            />

            {/* Vignette Overlay for dark depth */}
            <div
              className="absolute inset-0 bg-linear-to-t from-neutral-950/90 via-neutral-950/30 to-neutral-950/40 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* Inset Info Tooltip */}
          <div className="absolute bottom-8 left-8 z-20">
            <Tooltip
              noDelay
              content={
                <span className="break-normal leading-relaxed">
                  This background image is a custom collage featuring my
                  favorite anime characters. Since this website is a reflection
                  of my personality, I wanted to incorporate elements that
                  resonate with me, creating a unique and personal touch.
                </span>
              }
            >
              <button
                type="button"
                aria-label="About this artwork"
                className="size-7 rounded-lg bg-neutral-950/70 backdrop-blur-md border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <LuInfo className="size-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Right Column */}
        <motion.div
          initial={false}
          animate={{
            width: isRevealed ? (isMobile ? "100%" : 440) : 0,
            height: isRevealed ? "auto" : isMobile ? 0 : "auto",
            opacity: isRevealed ? 1 : 0,
          }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="overflow-hidden relative z-0"
        >
          <div className="w-85 sm:w-100 md:w-110 p-7 sm:p-10 min-h-65 md:min-h-115 flex flex-col justify-between gap-8 shrink-0">
            {/* Top Header */}
            <div className="space-y-4">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate={isRevealed ? "visible" : "hidden"}
                className="space-y-1"
              >
                <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-foreground tracking-tight whitespace-nowrap">
                  Welcome{" "}
                  <span className="relative transition-colors bg-linear-to-br from-accent/30 via-accent/90 to-accent/30 bg-clip-text text-transparent">
                    Back
                    <PenSwoopUnderline height="3.5" />
                  </span>
                </h1>
              </motion.div>

              <motion.p
                variants={itemVariants}
                initial="hidden"
                animate={isRevealed ? "visible" : "hidden"}
                className="text-xs sm:text-sm text-neutral-400 font-inter leading-relaxed"
              >
                Authenticate with your GitHub account to access the admin studio.
              </motion.p>
            </div>

            {/* Middle: Auth Action */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={isRevealed ? "visible" : "hidden"}
              className="space-y-5"
            >
              {/* Subtle Dashed Separator with Lock */}
              <div
                className="relative flex items-center gap-3"
                aria-hidden="true"
              >
                <div className="h-px flex-1 border-t border-dashed border-neutral-800" />
                <div className="size-6 rounded-md bg-white/2 border border-white/6 flex items-center justify-center text-neutral-500">
                  <LuLock className="size-3" />
                </div>
                <div className="h-px flex-1 border-t border-dashed border-neutral-800" />
              </div>

              {/* Tactile GitHub Button */}
              <Suspense
                fallback={
                  <div className="w-full h-13 rounded-xl bg-white/4 border border-white/8 animate-pulse" />
                }
              >
                <GithubOAuthButton />
              </Suspense>

              <p className="text-[11px] font-mono text-neutral-500 text-center tracking-tight">
                Restricted access
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
    </div>
  );
};

export default SignInView;
