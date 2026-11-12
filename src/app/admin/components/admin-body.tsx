"use client";

import React from "react";
import { cn } from "@heroui/react";

export interface AdminBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const AdminBody: React.FC<AdminBodyProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-muted/35 border border-white/6 p-4 sm:p-6 lg:p-7 shadow-lg not-sm:min-h-[calc(100dvh-100px)] min-h-[calc(100dvh-112px)] flex flex-col gap-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AdminBody;
