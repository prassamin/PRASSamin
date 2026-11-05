import { cn } from "@heroui/react";
import { Placement } from "@/types/heroui";
import {
  TooltipContentProps,
  Tooltip as TooltipPrimitive,
} from "@heroui/react";
import React from "react";

type TooltipProps = React.ComponentPropsWithRef<typeof TooltipPrimitive> & {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: Placement;
  showArrow?: boolean;
  noDelay?: boolean;
  /**
   * The delay time for the tooltip to close. [See guidelines](https://spectrum.adobe.com/page/tooltip/#Warmup-and-cooldown).
   * @default 100
   */
  closeDelay?: number;
  /**
   * The delay time for the tooltip to show up. [See guidelines](https://spectrum.adobe.com/page/tooltip/#Immediate-or-delayed-appearance).
   * @default 400
   */
  delay?: number;
  /**
   * The props for the tooltip content.
   */
  contentProps?: Omit<
    TooltipContentProps,
    "children" | "placement" | "showArrow"
  >;
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement,
  showArrow,
  noDelay,
  delay,
  closeDelay,
  contentProps,
  ...props
}) => {
  return (
    <TooltipPrimitive
      delay={delay || (noDelay ? 0 : 400)}
      closeDelay={closeDelay || (noDelay ? 0 : 100)}
      {...props}
    >
      <TooltipPrimitive.Trigger>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        {...contentProps}
        data-slot="tooltip-content"
        className={cn(
          "bg-neutral-700/50 backdrop-blur-lg gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent",
          contentProps?.className,
        )}
        placement={placement}
        showArrow={showArrow}
      >
        {content}
      </TooltipPrimitive.Content>
    </TooltipPrimitive>
  );
};
