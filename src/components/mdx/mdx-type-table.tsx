"use client";

import React, { useState } from "react";
import { LuChevronDown, LuExternalLink } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@heroui/react";

export interface TypeTableItem {
  type?: string;
  description?: React.ReactNode;
  typeDescription?: React.ReactNode;
  typeDescriptionLink?: string;
  default?: string;
  required?: boolean;
  deprecated?: boolean;
  parameters?: any;
  returns?: any;
  [key: string]: any;
}

export interface MdxTypeTableProps {
  type?: Record<string, TypeTableItem>;
  parameters?: Array<{ name: string } & TypeTableItem>;
  className?: string;
}

function isCustomType(typeStr: string): boolean {
  const trimmed = typeStr.trim();
  // Types like ReactNode, React.ReactNode, Record<...>, Component, or custom PascalCase interfaces
  return /^(React|Record|JSX|Promise|Array|Map|Set|[A-Z])/.test(trimmed);
}

export const MdxTypeTable: React.FC<MdxTypeTableProps> = ({
  type,
  parameters,
  className,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const entries: Array<{ name: string } & TypeTableItem> = type
    ? Object.entries(type).map(([name, item]) => ({
        name,
        ...item,
      }))
    : Array.isArray(parameters)
      ? parameters
      : [];

  if (entries.length === 0) return null;

  const toggleKey = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      className={cn(
        "my-6 w-full rounded-2xl border border-white/8 bg-[#141414]/90 shadow-sm overflow-hidden not-prose font-sans backdrop-blur-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <div className="min-w-105">
          {/* Table Header */}
          <div className="grid grid-cols-[180px_1fr_28px] sm:grid-cols-[220px_1fr_28px] items-center px-4 py-2.5 text-xs font-medium text-neutral-400 font-sans select-none bg-muted/35 border-b border-white/6">
            <span>Prop</span>
            <span>Type</span>
            <div />
          </div>

          <div className="p-1.5 sm:p-2 flex flex-col gap-0.5">
            {/* Rows with smooth rounded hover background and framer motion expand/collapse */}
            {entries.map((item, idx) => {
              const isRequired = Boolean(item.required);
              let displayName = item.name || `prop${idx + 1}`;
              if (!isRequired && !displayName.endsWith("?")) {
                displayName = `${displayName}?`;
              } else if (isRequired && displayName.endsWith("?")) {
                displayName = displayName.slice(0, -1);
              }

              const typeStr = item.type || "unknown";
              const isExpanded = Boolean(expandedKeys[item.name]);
              const isCustom = isCustomType(typeStr);

              const hasDetails =
                Boolean(item.description) ||
                Boolean(item.typeDescription) ||
                Boolean(item.typeDescriptionLink) ||
                (item.default !== undefined && item.default !== "");

              return (
                <div
                  key={item.name || idx}
                  className={cn(
                    "rounded-xl transition-colors",
                    isExpanded ? "bg-white/4" : "hover:bg-white/5",
                  )}
                >
                  {/* Row Header / Trigger */}
                  <div
                    onClick={() => toggleKey(item.name)}
                    className="grid grid-cols-[180px_1fr_28px] sm:grid-cols-[220px_1fr_28px] items-center px-3 py-2.5 cursor-pointer select-none"
                  >
                    {/* Prop Name */}
                    <span
                      className={cn(
                        "font-mono text-xs sm:text-sm font-medium text-sky-400 truncate pr-2",
                        item.deprecated &&
                          "line-through opacity-60 text-red-400/80",
                      )}
                    >
                      {displayName}
                    </span>

                    {/* Type aligned under the Type column */}
                    <span
                      className={cn(
                        "font-mono text-xs sm:text-sm truncate pr-2",
                        isCustom ? "text-[#ff9e64]" : "text-neutral-200",
                      )}
                    >
                      {typeStr}
                    </span>

                    {/* Chevron far right with Framer Motion rotation */}
                    <div className="flex items-center justify-end">
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center justify-center text-neutral-400"
                      >
                        <LuChevronDown className="w-3.5 h-3.5" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Smooth Animated Details Panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`details-${item.name}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3.5 pt-1 space-y-2.5 text-xs">
                          {item.description && (
                            <div className="text-neutral-300 leading-relaxed font-sans">
                              {typeof item.description === "string" ? (
                                <p className="m-0">{item.description}</p>
                              ) : (
                                item.description
                              )}
                            </div>
                          )}

                          {(item.typeDescription || item.type) && (
                            <div className="flex items-center gap-4 pt-0.5">
                              <span className="text-neutral-500 font-sans min-w-12.5">
                                Type
                              </span>
                              <span className="font-mono text-[#ff9e64] flex items-center gap-1.5">
                                {item.typeDescription || item.type}
                                {item.typeDescriptionLink && (
                                  <a
                                    href={item.typeDescriptionLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-400 hover:text-white inline-flex items-center transition-colors ml-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <LuExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </span>
                            </div>
                          )}

                          {item.default !== undefined &&
                            item.default !== "" && (
                              <div className="flex items-center gap-4">
                                <span className="text-neutral-500 font-sans min-w-12.5">
                                  Default
                                </span>
                                <span className="font-mono text-neutral-200 bg-white/6 px-1.5 py-0.5 rounded border border-white/10">
                                  {item.default}
                                </span>
                              </div>
                            )}

                          {!hasDetails && (
                            <p className="text-neutral-500 italic m-0">
                              No additional details provided.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MdxTypeTable;
