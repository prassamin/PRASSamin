"use client";

import React, { useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@heroui/react";
import { Link } from "../link";

export interface MdxUserProps {
  name?: string;
  avatar?: string;
  href?: string;
  role?: string;
  bio?: string;
  className?: string;
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

const AvatarImg: React.FC<{
  name: string;
  avatar?: string;
  size: "sm" | "lg" | "md";
}> = ({ name, avatar, size }) => {
  const [failed, setFailed] = useState(false);
  const dim =
    size === "sm"
      ? "size-[1.15em] text-[0.55em]"
      : size === "lg"
        ? "size-10 text-sm"
        : "size-4.5 text-[0.55em]";
  if (avatar && !failed) {
    return (
      <img
        src={avatar}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(dim, "rounded-full object-cover shrink-0 m-0!")}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        dim,
        "rounded-full relative bg-accent/25 text-accent font-semibold leading-0",
      )}
    >
      <span className="absolute top-1/2 left-1/2 -translate-1/2">
        {initials(name)}
      </span>
    </div>
  );
};

/**
 * Inline user mention for MDX: `<User name="Jane" avatar="..." href="..." role="..." bio="..." />`.
 * Renders as an inline pill that flows with paragraph text; hovering shows a
 * mini profile card when role/bio is provided.
 */
export function MdxUser({
  name,
  avatar,
  href,
  role,
  bio,
  className,
}: MdxUserProps) {
  const displayName = String(name || "").trim() || "User";

  const pill = (
    <span
      className={cn(
        "inline-flex items-center gap-[0.3em] align-[-0.2em] rounded-full",
        "bg-white/10 border border-white/5 pl-[0.15em] pr-[0.5em] py-[0.15em]",
        "text-xs font-medium leading-[1.3] text-neutral-100 whitespace-nowrap",
        href &&
          "hover:bg-white/12 hover:border-white/20 transition-colors cursor-pointer",
        className,
      )}
    >
      <AvatarImg name={displayName} avatar={avatar} size="md" />
      <span>{displayName}</span>
    </span>
  );

  const trigger = href ? (
    <Link href={href} className="no-underline!">
      {pill}
    </Link>
  ) : (
    pill
  );

  if (!role && !bio) return trigger;

  return (
    <Tooltip
      noDelay
      
      content={
        <span className="flex items-start gap-2 max-w-64">
          <AvatarImg name={displayName} avatar={avatar} size="lg" />
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              {displayName}
            </span>
            {role && (
              <span className="text-xs text-neutral-400 truncate">{role}</span>
            )}
            {bio && (
              <span className="text-xs text-neutral-300 mt-1 whitespace-pre-line leading-relaxed">
                {bio}
              </span>
            )}
          </span>
        </span>
      }
    >
      {trigger}
    </Tooltip>
  );
}

export { MdxUser as User };
