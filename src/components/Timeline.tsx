"use client";

import React, { createContext, HTMLAttributes, useContext } from "react";
import { cn } from "@heroui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Element } from "@pras-ui/slot";

const iconVariants = cva(
  "flex items-center justify-center min-w-8 aspect-square rounded-full select-none p-2",
  {
    variants: {
      variant: {
        default: "bg-accent text-white",
        outline: "border border-border/40 bg-card text-card-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const contentVariants = cva(
  "flex flex-col gap-1.5 w-full space-y-1.5 p-2.5 shadow rounded-lg bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "",
        outline: "border border-border/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface TimelineVariantsProps extends VariantProps<typeof iconVariants> {
  type: "icon" | "content";
}

const TimelineVariants = ({ type, ...props }: TimelineVariantsProps) => {
  return type === "icon" ? iconVariants(props) : contentVariants(props);
};

type variant = "default" | "outline";
const TimelineContext = createContext<{
  index: number;
  isLast: boolean;
  position: string;
  variant: variant;
}>({
  index: 0,
  isLast: false,
  position: "right",
  variant: "default",
});

// Timeline Root
interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: number | string;
  position?: "left" | "right";
  align?: "start" | "center" | "end";
  variant?: variant;
  gap?: number;
}
const Timeline: React.FC<TimelineProps> = ({
  children,
  position = "right",
  maxWidth = 350,
  align = "center",
  variant = "default",
  gap = 12,
  className,
  ...props
}) => {
  const childrenCount = React.Children.count(children);

  const childWithContext = React.Children.map(children, (child, index) => (
    <TimelineContext.Provider
      value={{
        index: index + 1,
        isLast: index === childrenCount - 1,
        position,
        variant,
      }}
    >
      {child}
    </TimelineContext.Provider>
  ));

  return (
    <div
      className={cn(`w-full relative flex flex-col items-${align}`, className)}
      {...props}
    >
      <div
        style={{
          maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : undefined,
          gap: `${gap}px`,
        }}
        className={cn(
          `flex flex-col`,
          typeof maxWidth === "string" ? maxWidth : "",
        )}
      >
        {childWithContext}
      </div>
    </div>
  );
};

Timeline.displayName = "Timeline";

// Timeline Item
const TimelineItem: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  const { position } = useContext(TimelineContext);
  return (
    <div
      className={cn(
        `relative flex items-start gap-4`,
        position === "left" ? "flex-row-reverse" : "flex-row",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

TimelineItem.displayName = "TimelineItem";

// Timeline Icon
interface TimelineIconProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}
const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ icon, className, ...props }, ref) => {
    const { index, variant } = useContext(TimelineContext);

    return (
      <div
        ref={ref}
        {...props}
        className={cn(TimelineVariants({ type: "icon", variant }), className)}
      >
        {icon || index}
      </div>
    );
  },
);
TimelineIcon.displayName = "TimelineIcon";

// Timeline Content
const TimelineContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  const { position, variant } = useContext(TimelineContext);

  return (
    <div
      {...props}
      className={cn(
        TimelineVariants({ type: "content", variant }),
        position === "left" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </div>
  );
};
TimelineContent.displayName = "TimelineContent";

// Timeline Title
const TimelineTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3
    {...props}
    className={cn(`text-xl font-semibold leading-none`, className)}
  >
    {children}
  </h3>
);
TimelineTitle.displayName = "TimelineTitle";

// Timeline Period
const TimelinePeriod: React.FC<HTMLAttributes<HTMLSpanElement>> = ({
  children,
  className,
  ...props
}) => (
  <span
    {...props}
    className={cn(`text-xs font-medium text-muted-foreground/60`, className)}
  >
    {children}
  </span>
);
TimelinePeriod.displayName = "TimelinePeriod";

// Timeline Role
const TimelineRole: React.FC<HTMLAttributes<HTMLSpanElement>> = ({
  children,
  className,
  ...props
}) => (
  <span
    {...props}
    className={cn(`text-sm font-medium text-foreground/80`, className)}
  >
    {children}
  </span>
);
TimelineRole.displayName = "TimelineRole";

// Timeline Description
const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof Element.p>
>(({ children, className, ...props }, ref) => (
  <Element.p
    ref={ref}
    className={cn(
      `text-sm text-foreground/70 max-h-full min-w-full max-w-full overflow-y-auto`,
      className,
    )}
    {...props}
  >
    {children}
  </Element.p>
));
TimelineDescription.displayName = "TimelineDescription";

// Timeline Connector
const TimelineConnector: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const { isLast, position } = useContext(TimelineContext);

  return (
    !isLast && (
      <div
        {...props}
        className={cn(
          `absolute top-8 w-0.5 bg-border h-full -z-10`,
          position === "left" ? "right-[17px]" : "left-[17px]",
          className,
        )}
      />
    )
  );
};
TimelineConnector.displayName = "TimelineConnector";

export {
  Timeline,
  TimelineItem,
  TimelineIcon,
  TimelineContent,
  TimelineTitle,
  TimelinePeriod,
  TimelineRole,
  TimelineDescription,
  TimelineConnector,
};
