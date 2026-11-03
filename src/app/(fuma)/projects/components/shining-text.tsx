"use client";

import { motion } from "framer-motion";
import { cn } from "@heroui/react";

export function ShiningText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <motion.p
      className={cn(
        "bg-[linear-gradient(110deg,#909090,35%,#fff,50%,#909090,75%,#909090)] bg-size-[200%_100%] bg-clip-text text-base text-transparent select-none",
        className
      )}
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
    >
      {text}
    </motion.p>
  );
}
