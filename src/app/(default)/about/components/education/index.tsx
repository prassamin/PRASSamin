"use client";

import React, { useState, useRef, useEffect } from "react";
import { LuGraduationCap, LuSchool } from "react-icons/lu";
import MDXContent from "@/components/mdx/MDXContent";
import { EducationWatermark } from "./watermark";
import { Reveal } from "../reveal";
import type { EducationType } from "@/types";

interface Props {
  educations: EducationType[];
}

interface PillProps {
  startDate: string;
  endDate: string;
}

interface SchoolFieldProps {
  school: string;
  field?: string | null;
}

const EducationSchoolField: React.FC<SchoolFieldProps> = ({
  school,
  field,
}) => {
  const ghostRef = useRef<HTMLDivElement>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  useEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost || !field) return;

    const checkWrap = () => {
      const children = ghost.children;
      if (children.length >= 2) {
        const first = children[0] as HTMLElement;
        const second = children[1] as HTMLElement;
        setIsWrapped(second.offsetTop - first.offsetTop > 5);
      }
    };

    checkWrap();
    const ro = new ResizeObserver(checkWrap);
    ro.observe(ghost);

    return () => ro.disconnect();
  }, [field, school]);

  return (
    <div className="b2 text-neutral-300 mt-1.5 flex items-start gap-1.5 text-sm">
      <LuSchool className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400 shrink-0 mt-0.5" />
      <div className="relative flex-1 min-w-0">
        {/* Invisible ghost tester: always includes the dash so wrap calculation never oscillates */}
        {field && (
          <div
            ref={ghostRef}
            aria-hidden="true"
            className="invisible pointer-events-none absolute top-0 left-0 w-full flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 select-none -z-10"
          >
            <span className="font-medium">{school}</span>
            <span>- {field}</span>
          </div>
        )}

        {/* Real visible element */}
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
          <span className="text-neutral-200 font-medium">{school}</span>
          {field && (
            <span className="text-neutral-400">
              {!isWrapped && "- "}
              {field}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const DateDurationPill: React.FC<PillProps> = ({ startDate, endDate }) => {
  return (
    <p className="b2 text-neutral-400 tracking-wide uppercase self-start py-2 -mt-1 flex items-center cursor-pointer select-none">
      <span>{startDate}</span>
      <span className="px-1.5">—</span>
      <span>{endDate}</span>
    </p>
  );
};

export const AboutEducation: React.FC<Props> = ({ educations }) => {
  if (educations.length === 0) return null;

  return (
    <section
      id="educations"
      className="overflow-x-hidden relative w-full scroll-mt-24"
    >
      {/* Background Outline Typography SVG */}
      <EducationWatermark />

      <div className="layout relative pb-12 pt-24 md:pb-20 md:pt-32">
        {/* Section Header */}
        <Reveal>
          <div className="flex items-center justify-center flex-col gap-2">
            <div className="isolate before:transition-opacity glass-icon size-11 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
              <LuGraduationCap className="size-[45%] text-neutral-300" />
            </div>
            <h2 className="h4 text-center">Education</h2>
          </div>
        </Reveal>

        {/* Timeline Entries */}
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-20 mt-16">
          {educations.map((edu) => {
            const periodParts = (edu.period || "")
              .split("-")
              .map((p) => p.trim());
            const startDate = periodParts[0] || "";
            const endDate = periodParts[1] || "";

            return (
              <div
                key={edu.id}
                id={`education-${edu.id}`}
                className="grid gap-4 md:grid-cols-[250px_1fr] md:gap-8 scroll-mt-24"
              >
                <DateDurationPill startDate={startDate} endDate={endDate} />

                <div>
                  <h3 className="h5">{edu.degree}</h3>

                  <EducationSchoolField
                    school={edu.school}
                    field={edu.field}
                  />

                  {edu.description && (
                    <div className="mt-4 b2 text-neutral-400 space-y-3 leading-relaxed [&>ul]:list-disc [&>ul]:list-outside [&>ul]:space-y-1.5 [&>ul]:pl-3">
                      <MDXContent content={edu.description} />
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
