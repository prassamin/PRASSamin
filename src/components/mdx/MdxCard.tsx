"use client";

import React from "react";
import { cn } from "@heroui/react";

export interface MdxCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: React.ReactNode;
  badge?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export const MdxCard: React.FC<MdxCardProps> & {
  Header: typeof MdxCardHeader;
  Title: typeof MdxCardTitle;
  Description: typeof MdxCardDescription;
  Content: typeof MdxCardContent;
  Body: typeof MdxCardContent;
  Footer: typeof MdxCardFooter;
} = ({
  title,
  badge,
  description,
  children,
  className,
  ...props
}: MdxCardProps) => {
  // If prop-based usage (e.g. <Card title="..." badge="...">...)
  if (title || badge || description) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 my-6",
          "hover:border-white/[0.16] hover:bg-white/[0.035] transition-all duration-300",
          "shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
          className,
        )}
        {...props}
      >
        {/* Subtle ambient glow on hover */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full bg-accent/[0.06] blur-3xl group-hover:bg-accent/[0.12] transition-all duration-500" />

        <div className="not-prose flex items-center justify-between gap-3 mb-3.5 flex-wrap pb-3 border-b border-white/[0.05]">
          {title && (
            <h3 className="font-rethink text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>
          )}
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-accent/10 text-accent border border-accent/20">
              {badge}
            </span>
          )}
        </div>

        {description && (
          <p className="not-prose text-xs text-neutral-400 font-inter mb-3 leading-relaxed">
            {description}
          </p>
        )}

        <div className="text-sm text-neutral-300 font-inter leading-relaxed">
          {children}
        </div>
      </div>
    );
  }

  // Compound component usage (<Card><Card.Header>...</Card.Header><Card.Content>...</Card.Content></Card>)
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 my-6",
        "hover:border-white/[0.16] hover:bg-white/[0.035] transition-all duration-300",
        "shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    >
      {/* Subtle ambient glow on hover */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full bg-accent/[0.06] blur-3xl group-hover:bg-accent/[0.12] transition-all duration-500" />
      {children}
    </div>
  );
};

export const MdxCardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "not-prose flex items-center justify-between gap-3 mb-3.5 flex-wrap pb-3 border-b border-white/[0.05]",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const MdxCardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "font-rethink text-base sm:text-lg font-bold text-white tracking-tight leading-snug",
      className,
    )}
    {...props}
  >
    {children}
  </h3>
);

export const MdxCardDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "not-prose text-xs text-neutral-400 font-inter leading-relaxed",
      className,
    )}
    {...props}
  >
    {children}
  </p>
);

export const MdxCardContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "text-sm text-neutral-300 font-inter leading-relaxed",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const MdxCardFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center gap-3 pt-3 mt-3 border-t border-white/[0.05] text-xs text-neutral-400",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

// Compound component attachments
MdxCard.Header = MdxCardHeader;
MdxCard.Title = MdxCardTitle;
MdxCard.Description = MdxCardDescription;
MdxCard.Content = MdxCardContent;
MdxCard.Body = MdxCardContent;
MdxCard.Footer = MdxCardFooter;

export interface MdxCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const MdxCards = ({ children, className, ...props }: MdxCardsProps) => {
  return (
    <div className="@container w-full my-6">
      <div
        className={cn(
          "grid grid-cols-1 @[720px]:grid-cols-2 gap-4.5 [&>*]:my-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default MdxCard;
