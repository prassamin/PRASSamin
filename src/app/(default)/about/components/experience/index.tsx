"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/components/Link";
import { BriefcaseBusiness } from "lucide-react";
import MDXContent from "@/components/mdx/mdx-content";
import { ExperiencesWatermark } from "./watermark";
import { Reveal } from "@/components/reveal";
import type { ExperienceType } from "@/types";

interface Props {
  experiences: ExperienceType[];
}

interface PillProps {
  startDate: string;
  endDate: string;
  duration: string;
}

const DateDurationPill: React.FC<PillProps> = ({
  startDate,
  endDate,
  duration,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <p
      className="b2 text-neutral-400 tracking-wide uppercase self-start py-2 -mt-1 flex items-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{startDate}</span>
      <span
        className="overflow-hidden inline-flex flex-col justify-center items-center relative transition-[max-width] duration-700 ease-out h-5"
        style={{ maxWidth: isHovered ? 240 : 25 }}
      >
        <span
          className="text-xs lowercase px-1.5 whitespace-nowrap inline-block text-green-300 font-sans transition-opacity duration-500 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(5px)",
            transition: "opacity 500ms ease-out, transform 500ms ease-out",
          }}
        >
          {duration}
        </span>
        <span
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-opacity duration-500 ease-out"
          style={{
            opacity: isHovered ? 0 : 1,
          }}
        >
          —
        </span>
      </span>
      <span>{endDate}</span>
    </p>
  );
};

export const AboutExperience: React.FC<Props> = ({ experiences }) => {
  if (experiences.length === 0) return null;

  return (
    <section
      id="experiences"
      className="overflow-x-hidden relative w-full scroll-mt-24"
    >
      {/* Background Outline Typography SVG */}
      <ExperiencesWatermark />

      <div className="layout relative pb-12 pt-24 md:pb-20 md:pt-32">
        {/* Section Header */}
        <Reveal>
          <div className="flex items-center justify-center flex-col gap-2">
            <div className="isolate before:transition-opacity size-11 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
              <BriefcaseBusiness
                className="size-[45%] text-neutral-300"
                strokeWidth={1.3}
                aria-hidden="true"
              />
            </div>
            <h2 className="h4 text-center">Experiences</h2>
          </div>
        </Reveal>

        {/* Timeline Entries */}
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-20 mt-16">
            {experiences.map((exp) => {
              const periodParts = (exp.period || "")
                .split("•")
                .map((p) => p.trim());
              const startDate = periodParts[0]?.split(" - ")[0] || "";
              const endDate = periodParts[0]?.split(" - ")[1] || "";
              const duration = periodParts[1] || "";

              return (
                <div
                  key={exp.id}
                  id={`experience-${exp.id}`}
                  className="grid gap-4 md:grid-cols-[250px_1fr] md:gap-8 scroll-mt-24"
                >
                  <DateDurationPill
                    startDate={startDate}
                    endDate={endDate}
                    duration={duration}
                  />

                  <div>
                    <h3 className="h5">{exp.role}</h3>

                    <p className="b2 text-neutral-300 mt-1 flex items-center gap-1.5 text-sm">
                      {exp.companyLogo ? (
                        <Image
                          src={exp.companyLogo}
                          alt={`${exp.company} Logo`}
                          width={200}
                          height={200}
                          className="w-4 h-4 rounded object-contain inline-block"
                        />
                      ) : null}
                      {exp.companyUrl ? (
                        <Link
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-neutral-300 transition-colors decoration-[color-mix(in_srgb,currentColor_30%,#171717)] hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,currentColor_65%,#171717)] flex items-center gap-1.5"
                        >
                          <span>{exp.company}</span>
                        </Link>
                      ) : (
                        <span className="text-neutral-200 font-medium">
                          {exp.company}
                        </span>
                      )}
                      {exp.location && (
                        <span className="text-neutral-400">
                          - {exp.location}
                        </span>
                      )}
                    </p>

                    {exp.description && (
                      <div className="mt-4 b2 text-neutral-400 space-y-3 leading-relaxed [&>ul]:list-disc [&>ul]:list-outside [&>ul]:space-y-1.5 [&>ul]:pl-3">
                        <MDXContent content={exp.description} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
