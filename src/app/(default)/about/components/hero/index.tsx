"use client";

import React from "react";
import { LuCircleUserRound } from "react-icons/lu";
import { PolaroidCard } from "./polaroid-card";
import { TechStack } from "./tech-stack";
import { useOwner } from "@/providers/owner-provider";
import { Link } from "@/components/link";
import { Reveal } from "@/components/reveal";

export const HeroSection: React.FC = () => {
  const { owner } = useOwner();
  return (
    <div className="relative overflow-hidden w-full">
      {/* Top Header Badge & Titles */}
      <Reveal>
        <div className="layout text-center pb-12 pt-28 md:pb-20 md:pt-36 flex flex-col items-center justify-center">
          {/* Squircle Badge */}
          <div className="isolate before:transition-opacity size-11 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
            <LuCircleUserRound
              className="size-[45%] text-neutral-300"
              strokeWidth={1.3}
              aria-hidden="true"
            />
          </div>

          {/* Main Title */}
          <h1 className="mt-4 h2 sm:h1 font-bold font-rethink text-white">
            About{" "}
            <span className="transition-colors bg-linear-to-br from-accent/30 via-accent/90 to-accent/30 bg-clip-text text-transparent">
              Me
            </span>
          </h1>

          {/* Subtitle with subtle gradient */}
          <p className="b1 mt-3 font-normal">
            <span className="transition-colors bg-linear-to-r from-neutral-300/35 via-neutral-300/90 to-neutral-300/35 bg-clip-text text-transparent">
              A story of growth and discovery
            </span>
          </p>
        </div>
      </Reveal>

      {/* Main Content Area: Polaroid on Left, Bio on Right */}
      <section className="overflow-hidden relative">
        <Reveal delay={0.1}>
          <div className="layout relative pb-12 pt-10 md:pb-20 md:pt-10 flex items-center gap-20 flex-col md:flex-row">
            {/* Left: Polaroid Photo Frame */}
            <PolaroidCard />

            {/* Right: Bio Information */}
            <div className="[&_strong]:text-neutral-200">
              <h3 className="h3">
                {owner?.name || owner?.username || "PRAS Samin"}
              </h3>

              <Link
                href={`https://github.com/${owner?.username || "prassamin"}`}
                className="b1 text-neutral-400 mt-2"
              >
                @{owner?.username || "prassamin"}
              </Link>

              <p className="b1 text-neutral-400 mt-8 leading-relaxed">
                Hi, I&apos;m <span className="text-foreground">PRAS</span>. a
                developer who builds the kind of tools I wish already existed.
                CLIs that feel instant, libraries that just work, and
                open-source projects I genuinely use every day. I care about the
                details most people never notice, because those are the ones
                that make software{" "}
                <em className="text-foreground not-italic">feel</em> good.
              </p>

              <p className="b1 text-neutral-400 mt-4 leading-relaxed">
                I&apos;ve always been the person who takes the long way around a
                problem just to understand why it works. That curiosity pulled
                me from tinkering into building and it&apos;s the same reason
                I&apos;ll happily spend a weekend automating something that
                takes five minutes to do by hand.
              </p>

              <p className="b1 text-neutral-400 mt-4 leading-relaxed">
                This site is where I write it all down, what I&apos;m building,
                what I&apos;m learning, and the mistakes worth remembering. If
                one article saves you the hour it cost me, it&apos;s done its
                job.
              </p>

              {/* Favorite Tech Stack */}
              <TechStack />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
