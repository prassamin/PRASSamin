import React from "react";
import { cn } from "@heroui/react";
import { getStack } from "@/lib/stacks";

export interface StacksProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Stacks: React.FC<StacksProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "my-6 flex flex-wrap items-center gap-2 not-prose",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StackProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  icon?: React.ComponentType<any>;
}

export const Stack: React.FC<StackProps> = ({
  name,
  icon: CustomIcon,
  className,
  children,
  ...props
}) => {
  const stack = getStack(name);
  const StackIcon = CustomIcon || stack?.icon;
  const displayName = stack?.name || name;

  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit bg-muted/50 items-center justify-center whitespace-nowrap text-neutral-300 transition-[color,box-shadow] gap-1.5 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] md:text-xs font-medium capitalize gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)]",
        className,
      )}
      {...props}
    >
      {StackIcon && <StackIcon className="size-3.5 shrink-0" />}
      {children || displayName}
    </span>
  );
};

export const MdxStacks = Stacks;
export const MdxStack = Stack;
