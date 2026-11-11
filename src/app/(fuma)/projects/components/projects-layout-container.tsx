"use client";
import React from "react";
import { cn } from "@heroui/react";

export default function ProjectsLayoutContainer({
  className,
  children,
  bodyClassName,
  blur = true,
}: {
  className?: string;
  children: React.ReactNode;
  bodyClassName?: string;
  blur?: boolean;
}) {
  return (
    <section
      className={cn(
        "h-full mx-auto w-full lg:max-w-7xl px-0 md:px-4 xl:px-0",
        className
      )}
    >
      <div className="grid flex-1 grid-cols-[12px_minmax(0,1fr)_12px] lg:grid-cols-[32px_minmax(0,1fr)_32px] relative">
        <div
          className={cn(
            "w-full border-x bg-size-[5px_5px] opacity-75 border-neutral-800 bg-[linear-gradient(45deg,var(--color-neutral-800)_12.50%,transparent_12.50%,transparent_50%,var(--color-neutral-800)_50%,var(--color-neutral-800)_62.50%,transparent_62.50%,transparent_100%)]",
            blur && "mask-[linear-gradient(to_bottom,transparent,black_10rem)]"
          )}
          style={{ willChange: "auto" }}
        />
        <div
          className={cn(
            "relative col-span-1 mx-4 md:mx-6 min-w-0 overflow-x-clip",
            bodyClassName
          )}
        >
          {children}
        </div>
        <div
          className={cn(
            "w-full border-x bg-size-[5px_5px] opacity-75 border-neutral-800 bg-[linear-gradient(45deg,var(--color-neutral-800)_12.50%,transparent_12.50%,transparent_50%,var(--color-neutral-800)_50%,var(--color-neutral-800)_62.50%,transparent_62.50%,transparent_100%)] z-20",
            blur && "mask-[linear-gradient(to_bottom,transparent,black_10rem)]"
          )}
          style={{ willChange: "auto" }}
        />
      </div>
    </section>
  );
}
