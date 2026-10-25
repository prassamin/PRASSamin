"use client";

import React, { useState } from "react";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./tooltip";

export interface AvatarItem {
  name?: string;
  src?: string;
  href?: string;
  fallback?: string;
}

export interface MdxAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  href?: string;
  fallback?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  bordered?: boolean;
  className?: string;
}

export interface MdxAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: AvatarItem[];
  max?: number | "infinity" | "∞";
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  bordered?: boolean;
  showCount?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  children?: React.ReactNode;
}

const AVATAR_SIZES = {
  sm: {
    avatar: "w-7 h-7 text-[10px]",
    icon: "w-3.5 h-3.5",
    spacing: "-space-x-2",
    ring: "ring-2",
  },
  md: {
    avatar: "w-9 h-9 text-xs",
    icon: "w-4 h-4",
    spacing: "-space-x-2.5",
    ring: "ring-2",
  },
  lg: {
    avatar: "w-11 h-11 text-sm",
    icon: "w-5 h-5",
    spacing: "-space-x-3",
    ring: "ring-[2.5px]",
  },
};

const ALIGN_MAP = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function getInitials(name?: string, fallback?: string): string {
  if (fallback) return fallback.slice(0, 2).toUpperCase();
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Individual Avatar with fallback initials and hover tooltip
 */
export const MdxAvatar: React.FC<MdxAvatarProps> = ({
  src,
  name,
  href,
  fallback,
  alt,
  size = "md",
  shape = "circle",
  bordered = true,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = AVATAR_SIZES[size] || AVATAR_SIZES.md;
  const initials = getInitials(name, fallback);
  const isCircle = shape === "circle";

  const content = (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center overflow-hidden select-none bg-neutral-900 border border-white/10 transition-all duration-200",
        isCircle ? "rounded-full" : "rounded-xl",
        sizeConfig.avatar,
        bordered && cn(sizeConfig.ring, "ring-[#121212]"),
        href && "cursor-pointer hover:scale-115 hover:z-30 hover:shadow-lg hover:border-white/30",
        className,
      )}
      {...props}
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

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={name || "Avatar profile"}
        className="inline-flex focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return content;
};

/**
 * AvatarGroup for showcasing overlapping avatars
 */
export const MdxAvatarGroup: React.FC<MdxAvatarGroupProps> = ({
  items = [],
  max = Infinity,
  size = "md",
  shape = "circle",
  bordered = true,
  align = "left",
  className,
  children,
  ...props
}) => {
  const sizeConfig = AVATAR_SIZES[size] || AVATAR_SIZES.md;
  const isCircle = shape === "circle";

  // If items are provided in props
  if (items && items.length > 0) {
    const isInfinite =
      max === Infinity ||
      (typeof max === "number" && !Number.isFinite(max)) ||
      (typeof max === "string" && (max.toLowerCase() === "infinity" || max === "∞"));
    const maxCount = typeof max === "number" && Number.isFinite(max) ? max : items.length;
    const visibleItems = isInfinite ? items : items.slice(0, maxCount);
    const excess = isInfinite ? 0 : items.length - maxCount;

    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-y-2.5 my-3 not-prose select-none max-w-full",
          ALIGN_MAP[align] || "justify-start",
          sizeConfig.spacing,
          className,
        )}
        {...props}
      >
        {visibleItems.map((item, idx) => (
            <Tooltip key={idx} content={item.name} noDelay>
              <MdxAvatar
                src={item.src}
                name={item.name}
                href={item.href}
                fallback={item.fallback}
                size={size}
                shape={shape}
                bordered={bordered}
              /> 
            </Tooltip>
        ))}

        {excess > 0 && (
          <div
            className={cn(
              "relative shrink-0 flex items-center justify-center font-mono font-medium text-neutral-300 bg-neutral-800 border border-white/10 shadow-sm",
              isCircle ? "rounded-full" : "rounded-xl",
              sizeConfig.avatar,
              bordered && cn(sizeConfig.ring, "ring-[#121212]"),
            )}
          >
            +{excess}
          </div>
        )}
      </div>
    );
  }

  // If children (e.g. nested <Avatar /> components) are provided
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-y-2.5 my-3 not-prose select-none max-w-full",
        ALIGN_MAP[align] || "justify-start",
        sizeConfig.spacing,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { MdxAvatar as Avatar, MdxAvatarGroup as AvatarGroup };
export default MdxAvatar;
