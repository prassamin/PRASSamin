"use client";
import React, { useState } from "react";
import { cn } from "@heroui/react";

interface ExpandableTextProps {
  text: string;
  maxLength?: number | "max";
  className?: string;
  expandButtonText?: string;
  collapseButtonText?: string;
  expandable?: boolean;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLength = 100,
  className,
  expandButtonText = "...",
  collapseButtonText = "...",
  expandable = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const displayText = isExpanded
    ? text
    : typeof maxLength === "number"
      ? `${text.slice(0, maxLength)}${text.length > maxLength ? "..." : ""}`
      : maxLength === "max" && text;

  return (
    <div className={cn(className)}>
      <p>
        {displayText}{" "}
        {typeof maxLength === "number" &&
          text.length > maxLength &&
          expandable && (
            <button
              onClick={toggleExpanded}
              className="text-purple-500 hover:underline font-medium text-xs"
            >
              {isExpanded ? collapseButtonText : expandButtonText}
            </button>
          )}
      </p>
    </div>
  );
};

export default ExpandableText;
