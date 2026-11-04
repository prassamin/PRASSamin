import React from "react";
import { WireframeSvg } from "./wireframe-svg";

export function ProjectDetailBackground() {
  return (
    <div
      className="absolute overflow-hidden -z-10 inset-0 h-[450px] bg-neutral-950 pointer-events-none"
      style={{
        maskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
      }}
    >
      <WireframeSvg />
      <img
        alt="crumpled paper texture"
        src="/assets/crumpled-paper.webp"
        className="pointer-events-none select-none absolute mix-blend-overlay inset-0 w-full h-[450px] object-cover -z-10"
      />
    </div>
  );
}
