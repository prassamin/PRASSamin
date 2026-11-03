import React from "react";
import { LuFolderOpen } from "react-icons/lu";

export default function SectionHeader({
  className = "",
}: {
  className?: string;
  title?: string;
  desc?: string;
  gradientText?: string;
  as?: React.ElementType;
}) {
  return (
    <div
      className={`text-center flex flex-col items-center gap-1 ${className}`}
    >
      {/* Top squircle icon badge */}
      <div className="isolate before:transition-opacity glass-icon size-10.5 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)]">
        <LuFolderOpen className="size-[45%] text-foreground/75" />
      </div>

      {/* Main Title: Curated Projects */}
      <h1 className="mt-4 h3 sm:h1">
        Curated{" "}
        <span className="relative transition-colors bg-gradient-to-br from-accent/30 via-accent/90 to-accent/30 bg-clip-text text-transparent">
          Projects
        </span>
      </h1>

      {/* Subtitle */}
      <p className="transition-colors bg-gradient-to-r from-neutral-300/[35%] via-neutral-300/90 to-neutral-300/[35%] bg-clip-text text-transparent b1 mt-2">
        Showcase of my projects that I&apos;m proud of.
      </p>
    </div>
  );
}
