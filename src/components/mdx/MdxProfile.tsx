"use client";

import React, { useState } from "react";
import { User, ExternalLink } from "lucide-react";
import { cn } from "@heroui/react";

export interface MdxProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  bordered?: boolean;
  color?: "default" | "accent" | "sky" | "emerald" | "amber" | "rose";
  href?: string;
  fallback?: string;
  alt?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: {
    avatar: "w-8 h-8 text-xs",
    icon: "w-4 h-4",
    textName: "text-xs font-semibold",
    textDesc: "text-[11px]",
  },
  md: {
    avatar: "w-11 h-11 text-sm",
    icon: "w-5 h-5",
    textName: "text-sm font-semibold",
    textDesc: "text-xs",
  },
  lg: {
    avatar: "w-14 h-14 text-base",
    icon: "w-7 h-7",
    textName: "text-base font-semibold",
    textDesc: "text-xs sm:text-sm",
  },
  xl: {
    avatar: "w-20 h-20 text-lg",
    icon: "w-10 h-10",
    textName: "text-lg font-bold",
    textDesc: "text-sm",
  },
};

const BORDER_COLORS = {
  default: "ring-white/15",
  accent: "ring-accent/70",
  sky: "ring-sky-400/70",
  emerald: "ring-emerald-400/70",
  amber: "ring-amber-400/70",
  rose: "ring-rose-400/70",
};

function getInitials(name?: string, fallback?: string): string {
  if (fallback) return fallback.slice(0, 2).toUpperCase();
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const MdxProfile: React.FC<MdxProfileProps> = ({
  src,
  name = "Author Name",
  description,
  size = "md",
  shape = "circle",
  bordered = true,
  color = "default",
  href,
  fallback,
  alt,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = getInitials(name, fallback);
  const isCircle = shape === "circle";

  const avatarNode = (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center overflow-hidden select-none bg-neutral-900 border border-white/10 transition-transform group-hover:scale-[1.03]",
        isCircle ? "rounded-full" : "rounded-2xl",
        sizeConfig.avatar,
        bordered &&
          cn(
            "ring-2 ring-offset-2 ring-offset-[#121212]",
            BORDER_COLORS[color] || BORDER_COLORS.default,
          ),
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span className="font-semibold font-mono text-neutral-200 select-none">
          {initials}
        </span>
      ) : (
        <User className={cn(sizeConfig.icon, "text-neutral-400")} />
      )}
    </div>
  );

  const card = (
    <div
      className={cn(
        "inline-flex items-center gap-3.5 my-3 p-3 rounded-2xl border border-white/[0.08] bg-[#141414]/90 backdrop-blur-sm shadow-sm not-prose font-sans transition-all duration-200",
        href &&
          "hover:border-white/20 hover:bg-[#1a1a1a]/95 cursor-pointer group",
        className,
      )}
      {...props}
    >
      {avatarNode}

      <div className="flex flex-col min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-white truncate font-sans tracking-tight",
              sizeConfig.textName,
              href && "group-hover:text-accent transition-colors",
            )}
          >
            {name}
          </span>
          {href && (
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors shrink-0" />
          )}
        </div>

        {description && (
          <span
            className={cn(
              "text-neutral-400 font-sans truncate leading-normal mt-0.5",
              sizeConfig.textDesc,
            )}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block not-prose no-underline focus:outline-none"
      >
        {card}
      </a>
    );
  }

  return card;
};

export { MdxProfile as Profile };
export default MdxProfile;
