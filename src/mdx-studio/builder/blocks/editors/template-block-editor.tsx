"use client";

import React, { useState } from "react";
import {
  LuChevronUp as ChevronUp,
  LuChevronDown as ChevronDown,
  LuPlus as Plus,
  LuTriangleAlert as AlertTriangle,
  LuBlocks as BlocksIcon,
} from "react-icons/lu";
import { cn } from "@heroui/react";
import {
  MdxBlock,
  MdxBlockType,
  TemplateDefinitionInfo,
} from "../../types";
import { createBlock, extractTemplateVariables } from "../../compiler";
import { DropIndicator } from "../../components/drop-indicator";
import { canDropBlockInTemplate } from "../registry";
import { CanvasBlockItem } from "../../components/canvas-block-item";

interface TemplateBlockEditorProps {
  props: Record<string, any>;
  depth: number;
  isDuplicateTemplate: boolean;
  availableTemplates: TemplateDefinitionInfo[];
  updateProp: (key: string, value: any) => void;
  onNestedDragChange?: (active: boolean) => void;
}

export const TemplateBlockEditor: React.FC<TemplateBlockEditorProps> =
  React.memo(
    ({
      props,
      depth,
      isDuplicateTemplate,
      availableTemplates,
      updateProp,
      onNestedDragChange,
    }) => {
      const [isTemplateCollapsed, setIsTemplateCollapsed] = useState(false);
      const [isTemplateDropActive, setIsTemplateDropActive] = useState(false);
      const [templateDropIndicator, setTemplateDropIndicator] = useState<{
        index: number;
        position: "top" | "bottom";
      } | null>(null);

      const templateBlocks: MdxBlock[] = React.useMemo(
        () => (Array.isArray(props.blocks) ? props.blocks : []),
        [props.blocks],
      );
      const detectedTemplateVars = React.useMemo(
        () => extractTemplateVariables(templateBlocks),
        [templateBlocks],
      );

      const updateTemplateBlocks = (nextBlocks: MdxBlock[]) => {
        updateProp("blocks", nextBlocks);
      };

      const handleInsertTemplateBlock = (
        blockType: MdxBlockType,
        targetIdx?: number,
      ) => {
        if (!canDropBlockInTemplate(blockType)) return;
        const newBlock = createBlock(blockType);
        const updated = [...templateBlocks];
        if (
          targetIdx !== undefined &&
          targetIdx >= 0 &&
          targetIdx <= updated.length
        ) {
          updated.splice(targetIdx, 0, newBlock);
        } else {
          updated.push(newBlock);
        }
        updateTemplateBlocks(updated);
      };

      const handleTemplateItemDragOver = (
        e: React.DragEvent,
        cIdx: number,
      ) => {
        e.preventDefault();
        e.stopPropagation();
        onNestedDragChange?.(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position: "top" | "bottom" = e.clientY < midY ? "top" : "bottom";

        if (
          templateDropIndicator?.index !== cIdx ||
          templateDropIndicator?.position !== position
        ) {
          setTemplateDropIndicator({ index: cIdx, position });
        }
      };

      const handleTemplateItemDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setTemplateDropIndicator(null);
        }
      };

      const handleTemplateItemDrop = (e: React.DragEvent, cIdx: number) => {
        e.preventDefault();
        e.stopPropagation();
        onNestedDragChange?.(false);
        const position = templateDropIndicator?.position || "bottom";
        setTemplateDropIndicator(null);
        setIsTemplateDropActive(false);

        const targetIndex = position === "top" ? cIdx : cIdx + 1;

        const reorderData = e.dataTransfer.getData(
          "application/mdx-template-reorder",
        );
        if (reorderData !== "") {
          const srcIdx = parseInt(reorderData, 10);
          if (!isNaN(srcIdx)) {
            const finalTarget =
              srcIdx < targetIndex ? targetIndex - 1 : targetIndex;
            if (srcIdx !== finalTarget) {
              const updated = [...templateBlocks];
              const [moved] = updated.splice(srcIdx, 1);
              updated.splice(finalTarget, 0, moved);
              updateTemplateBlocks(updated);
            }
          }
          return;
        }

        const blockType = e.dataTransfer.getData(
          "application/mdx-block-type",
        ) as MdxBlockType;
        if (blockType && canDropBlockInTemplate(blockType)) {
          handleInsertTemplateBlock(blockType, targetIndex);
        }
      };

      const handleUpdateTemplateBlock = (
        childId: string,
        newChildProps: Record<string, any>,
      ) => {
        updateTemplateBlocks(
          templateBlocks.map((b) =>
            b.id === childId ? { ...b, props: newChildProps } : b,
          ),
        );
      };

      const handleMoveTemplateBlock = (
        childIdx: number,
        direction: -1 | 1,
      ) => {
        const targetIdx = childIdx + direction;
        if (targetIdx < 0 || targetIdx >= templateBlocks.length) return;
        const updated = [...templateBlocks];
        const temp = updated[childIdx];
        updated[childIdx] = updated[targetIdx];
        updated[targetIdx] = temp;
        updateTemplateBlocks(updated);
      };

      const handleDuplicateTemplateBlock = (childIdx: number) => {
        const original = templateBlocks[childIdx];
        if (!original) return;
        const clone = createBlock(
          original.type,
          JSON.parse(JSON.stringify(original.props)),
        );
        const updated = [...templateBlocks];
        updated.splice(childIdx + 1, 0, clone);
        updateTemplateBlocks(updated);
      };

      const handleDeleteTemplateBlock = (childIdx: number) => {
        updateTemplateBlocks(templateBlocks.filter((_, i) => i !== childIdx));
      };

      return (
        <div className="space-y-3">
          {/* Template Name + Collapse Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-indigo-500/6 border border-indigo-400/20">
            <div className="flex items-center gap-2 flex-1 min-w-56">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold shrink-0">
                Name:
              </span>
              <input
                type="text"
                data-format-role="plain"
                value={props.name ?? ""}
                onChange={(e) =>
                  updateProp(
                    "name",
                    e.target.value.replace(/[^a-zA-Z0-9_-]/g, "-"),
                  )
                }
                placeholder="my-template"
                aria-invalid={
                  isDuplicateTemplate || !String(props.name || "").trim()
                }
                className={cn(
                  "flex-1 min-w-0 px-2.5 py-1 text-xs font-mono rounded-lg bg-black/30 border text-white placeholder:text-neutral-500 focus:outline-none transition-colors",
                  isDuplicateTemplate || !String(props.name || "").trim()
                    ? "border-red-500/60 focus:border-red-400"
                    : "border-white/10 focus:border-indigo-400/60",
                )}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsTemplateCollapsed((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-neutral-300 transition-colors cursor-pointer shrink-0"
              title={
                isTemplateCollapsed ? "Expand template" : "Collapse template"
              }
            >
              {isTemplateCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
              <span>
                {templateBlocks.length}{" "}
                {templateBlocks.length === 1 ? "block" : "blocks"}
              </span>
            </button>
          </div>

          {/* Duplicate warning */}
          {(isDuplicateTemplate || !String(props.name || "").trim()) && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-300 bg-red-500/10 border border-red-500/25 rounded-lg px-2.5 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isDuplicateTemplate ? (
                  <>
                    A template named{" "}
                    <code className="font-mono">&ldquo;{props.name}&rdquo;</code>{" "}
                    already exists above. This one will be ignored — rename it
                    to make it usable.
                  </>
                ) : (
                  "Template name is required."
                )}
              </span>
            </div>
          )}

          {/* Detected {{variables}} Bar */}
          {detectedTemplateVars.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Variables:
              </span>
              {detectedTemplateVars.map((varName) => (
                <span
                  key={varName}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-fuchsia-500/12 border border-fuchsia-400/25 text-[11px] font-mono text-fuchsia-300"
                >
                  {`{{${varName}}}`}
                </span>
              ))}
            </div>
          )}

          {/* Nested Blocks Area */}
          {!isTemplateCollapsed && (
            <div className="p-3 rounded-xl border bg-black/20 border-white/6 space-y-3">
              {templateBlocks.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNestedDragChange?.(true);
                    setIsTemplateDropActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      onNestedDragChange?.(false);
                      setIsTemplateDropActive(false);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNestedDragChange?.(false);
                    setIsTemplateDropActive(false);
                    const blockType = e.dataTransfer.getData(
                      "application/mdx-block-type",
                    ) as MdxBlockType;
                    if (blockType && canDropBlockInTemplate(blockType)) {
                      handleInsertTemplateBlock(blockType);
                    }
                  }}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-7 text-center transition-all flex flex-col items-center justify-center gap-1.5 select-none",
                    isTemplateDropActive
                      ? "border-indigo-400 bg-indigo-500/10 text-indigo-300 scale-[1.01]"
                      : "border-white/10 bg-white/1 text-neutral-400 hover:border-white/20",
                  )}
                >
                  <Plus className="w-5 h-5 opacity-60" />
                  <span className="text-xs font-semibold text-neutral-200">
                    Drop components here to build this template
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Drag any block or inline component from the sidebar into
                    &ldquo;{props.name || "my-template"}&rdquo;
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {templateBlocks.map((childBlock, cIdx) => (
                    <div
                      key={childBlock.id}
                      onDragOver={(e) => handleTemplateItemDragOver(e, cIdx)}
                      onDragLeave={handleTemplateItemDragLeave}
                      onDrop={(e) => handleTemplateItemDrop(e, cIdx)}
                      className="relative transition-all"
                    >
                      {templateDropIndicator?.index === cIdx &&
                        templateDropIndicator?.position === "top" && (
                          <DropIndicator className="absolute -top-3 left-0 right-0" />
                        )}

                      <CanvasBlockItem
                        block={childBlock}
                        index={cIdx}
                        totalBlocks={templateBlocks.length}
                        depth={depth + 1}
                        availableTemplates={availableTemplates}
                        insideTemplate={true}
                        onUpdateProps={handleUpdateTemplateBlock}
                        onMoveUp={(idx) => handleMoveTemplateBlock(idx, -1)}
                        onMoveDown={(idx) => handleMoveTemplateBlock(idx, 1)}
                        onDuplicate={handleDuplicateTemplateBlock}
                        onDelete={handleDeleteTemplateBlock}
                        onNestedDragChange={onNestedDragChange}
                        onDragStart={(e, idx) => {
                          e.stopPropagation();
                          e.dataTransfer.setData(
                            "application/mdx-template-reorder",
                            String(idx),
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      />

                      {templateDropIndicator?.index === cIdx &&
                        templateDropIndicator?.position === "bottom" && (
                          <DropIndicator className="absolute -bottom-3 left-0 right-0" />
                        )}
                    </div>
                  ))}

                  {/* Drop Target to append next block into this template */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onNestedDragChange?.(true);
                      setIsTemplateDropActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        onNestedDragChange?.(false);
                        setIsTemplateDropActive(false);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onNestedDragChange?.(false);
                      setIsTemplateDropActive(false);
                      const blockType = e.dataTransfer.getData(
                        "application/mdx-block-type",
                      ) as MdxBlockType;
                      if (blockType && canDropBlockInTemplate(blockType)) {
                        handleInsertTemplateBlock(blockType);
                      }
                    }}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-3 text-center text-xs font-medium transition-all flex items-center justify-center gap-2 select-none",
                      isTemplateDropActive
                        ? "border-indigo-400 text-indigo-300 bg-indigo-500/10"
                        : "border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-400",
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Drop component here to append to template</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  );

TemplateBlockEditor.displayName = "TemplateBlockEditor";
