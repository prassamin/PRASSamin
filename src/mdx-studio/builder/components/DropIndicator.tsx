import React from "react";
import { cn } from "@/lib/utils";

interface DropIndicatorProps {
  className?: string;
}

export const DropIndicator: React.FC<DropIndicatorProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "relative w-full h-1 my-1 flex items-center justify-center pointer-events-none z-50 animate-in fade-in-0 duration-150",
        className
      )}
    >
      {/* Central Glowing Beam */}
      <div className="w-full h-[2px] rounded-full bg-accent shadow-[0_0_10px_rgba(112,255,195,0.9)]" />

      {/* Left Glowing Node */}
      <div className="absolute left-0 w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_rgba(112,255,195,1)] -translate-x-0.5" />

      {/* Right Glowing Node */}
      <div className="absolute right-0 w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_rgba(112,255,195,1)] translate-x-0.5" />
    </div>
  );
};

export default DropIndicator;
