"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@heroui/styles";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before the reveal starts (seconds). */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
}

/** First-time scroll reveal with the site's signature easing. */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  delay = 0,
  y = 28,
}) => {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};
