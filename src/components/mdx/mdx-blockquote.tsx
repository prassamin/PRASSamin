"use client";

import React from "react";
import { LuQuote } from "react-icons/lu";
import { cn } from "@heroui/react";

export interface MdxBlockquoteProps {
  children?: React.ReactNode;
  quote?: string;
  author?: string;
  role?: string;
  cite?: string;
  avatar?: string;
  borderStyle?: "left-accent" | "left-subtle" | "card" | "minimal";
  className?: string;
}

export const MdxBlockquote: React.FC<MdxBlockquoteProps> = ({
  children,
  quote,
  author,
  role,
  cite,
  avatar,
  borderStyle = "left-accent",
  className,
}) => {
  const content = children || quote;

  // Determine citation text or link
  const renderCite = () => {
    if (!cite) return null;
    const isUrl = cite.startsWith("http://") || cite.startsWith("https://");
    if (isUrl) {
      return (
        <a
          href={cite}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent/80 hover:text-accent hover:underline transition-colors"
        >
          {author ? ` (${new URL(cite).hostname})` : cite}
        </a>
      );
    }
    return <span className="text-neutral-400">, {cite}</span>;
  };

  if (borderStyle === "card") {
    return (
      <figure
        className={cn(
          "my-6 relative rounded-2xl border border-white/8 bg-white/2 p-5 sm:p-6 overflow-hidden not-prose backdrop-blur-sm group hover:border-white/14 transition-all duration-300",
          className,
        )}
      >
        <LuQuote className="absolute top-4 right-4 w-10 h-10 text-white/4 pointer-events-none group-hover:text-accent/8 transition-colors" />
        <blockquote className="relative z-10 text-base sm:text-lg text-neutral-200 italic font-serif leading-relaxed font-normal">
          {content}
        </blockquote>
        {(author || role || cite || avatar) && (
          <figcaption className="relative z-10 mt-4 pt-3.5 border-t border-white/6 flex items-center gap-3">
            {avatar && (
              <img
                src={avatar}
                alt={author || "Author"}
                className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
              />
            )}
            <div className="flex flex-col text-xs font-sans not-italic">
              {author && (
                <span className="font-medium text-white tracking-wide">
                  {author}
                </span>
              )}
              {(role || cite) && (
                <span className="text-neutral-400 text-[11px] mt-0.5">
                  {role}
                  {renderCite()}
                </span>
              )}
            </div>
          </figcaption>
        )}
      </figure>
    );
  }

  if (borderStyle === "minimal") {
    return (
      <figure
        className={cn("my-6 py-2 px-1 not-prose relative group", className)}
      >
        <LuQuote className="w-5 h-5 text-accent/60 mb-2" />
        <blockquote className="text-base sm:text-lg text-neutral-200 italic font-serif leading-relaxed">
          {content}
        </blockquote>
        {(author || role || cite || avatar) && (
          <figcaption className="mt-3 flex items-center gap-3 text-xs font-sans not-italic">
            {avatar && (
              <img
                src={avatar}
                alt={author || "Author"}
                className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
              />
            )}
            <div>
              {author && (
                <span className="font-medium text-white">{author}</span>
              )}
              {(role || cite) && (
                <span className="text-neutral-400 text-[11px] ms-1.5">
                  {role ? `— ${role}` : "—"}
                  {renderCite()}
                </span>
              )}
            </div>
          </figcaption>
        )}
      </figure>
    );
  }

  // "left-accent" (default) or "left-subtle"
  const isAccent = borderStyle === "left-accent";

  return (
    <figure
      className={cn(
        "my-6 relative pl-4 sm:pl-5 not-prose group transition-all duration-300",
        isAccent
          ? "border-l-2 border-accent bg-accent/2 py-2 rounded-r-xl"
          : "border-l-2 border-white/20 hover:border-white/40 py-2",
        className,
      )}
    >
      <blockquote className="text-base text-neutral-200 italic font-serif leading-relaxed">
        {content}
      </blockquote>
      {(author || role || cite || avatar) && (
        <figcaption className="mt-3 flex items-center gap-3 text-xs font-sans not-italic">
          {avatar && (
            <img
              src={avatar}
              alt={author || "Author"}
              className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
            />
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {author && (
              <span className="font-medium text-white tracking-wide">
                — {author}
              </span>
            )}
            {(role || cite) && (
              <span className="text-neutral-400 text-[11px]">
                {author && "• "}
                {role}
                {renderCite()}
              </span>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );
};

export const Blockquote = MdxBlockquote;
