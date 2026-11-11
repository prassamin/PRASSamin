"use client";

import React, { useState, useRef, useCallback } from "react";
import { LuPlus } from "react-icons/lu";
import { MdxBlock, MdxBlockType } from "../types";
import { CanvasBlockItem } from "./canvas-block-item";
import { DropIndicator } from "./drop-indicator";
import { TextSelectionMenu } from "./text-selection-menu";
import { InlineTooltipProvider } from "./inline-tooltip-context";
import { IconPickerProvider } from "./icon-picker-context";
import { IconPickerModal } from "./icon-picker-modal";
import { cn } from "@heroui/react";

interface CanvasAreaProps {
  blocks: MdxBlock[];
  activeBlockId?: string | null;
  onActiveBlockChange?: (id: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onUpdateProps: (id: string, props: Record<string, any>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (sourceIndex: number, targetIndex: number) => void;
  onDropNewBlock: (type: MdxBlockType, targetIndex?: number) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  scrollRef,
  onScroll,
  onUpdateProps,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onReorder,
  onDropNewBlock,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    position: "top" | "bottom";
  } | null>(null);

  const internalCanvasRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = scrollRef || internalCanvasRef;
  const isNestedDragActiveRef = useRef(false);

  const handleNestedDragChange = useCallback((active: boolean) => {
    isNestedDragActiveRef.current = active;
    if (active) {
      setDropIndicator(null);
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("application/mdx-canvas-reorder", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (isNestedDragActiveRef.current) {
      setDropIndicator(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "top" | "bottom" = e.clientY < midY ? "top" : "bottom";

    if (
      dropIndicator?.index !== index ||
      dropIndicator?.position !== position
    ) {
      setDropIndicator({ index, position });
    }
  };

  const handleItemDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndicator(null);
    }
  };

  const handleItemDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    isNestedDragActiveRef.current = false;
    const position = dropIndicator?.position || "bottom";
    setDropIndicator(null);
    setIsDropTargetActive(false);

    const targetIndex = position === "top" ? index : index + 1;

    // Case 1: Reordering existing blocks
    const reorderData = e.dataTransfer.getData(
      "application/mdx-canvas-reorder",
    );
    if (reorderData !== "") {
      const srcIdx = parseInt(reorderData, 10);
      if (!isNaN(srcIdx)) {
        const finalTarget =
          srcIdx < targetIndex ? targetIndex - 1 : targetIndex;
        if (srcIdx !== finalTarget) {
          onReorder(srcIdx, finalTarget);
        }
      }
      setDraggedIndex(null);
      return;
    }

    // Case 2: Dropping new block from the component tray
    const newBlockType = e.dataTransfer.getData(
      "application/mdx-block-type",
    ) as MdxBlockType;
    if (newBlockType) {
      onDropNewBlock(newBlockType, targetIndex);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isNestedDragActiveRef.current = false;
    setDropIndicator(null);
    setIsDropTargetActive(false);

    const reorderData = e.dataTransfer.getData(
      "application/mdx-canvas-reorder",
    );
    if (reorderData !== "") {
      const srcIdx = parseInt(reorderData, 10);
      if (!isNaN(srcIdx) && srcIdx !== blocks.length - 1) {
        onReorder(srcIdx, blocks.length);
      }
      setDraggedIndex(null);
      return;
    }

    const newBlockType = e.dataTransfer.getData(
      "application/mdx-block-type",
    ) as MdxBlockType;
    if (newBlockType) {
      onDropNewBlock(newBlockType, blocks.length);
    }
  };

  return (
    <div
      ref={canvasRef}
      onScroll={onScroll}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDropTargetActive(false)}
      onDrop={handleContainerDrop}
      className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 select-text relative"
    >
      {/* Floating Rich Formatting Toolbar on Text Selection across all blocks */}
      <InlineTooltipProvider>
        <IconPickerProvider>
          <TextSelectionMenu containerRef={canvasRef} />
          <IconPickerModal />

          {blocks.length === 0 ? (
            /* Empty State Drop Target */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDropTargetActive(true);
              }}
              onDragLeave={() => setIsDropTargetActive(false)}
              onDrop={handleContainerDrop}
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center transition-all min-h-75",
                isDropTargetActive
                  ? "border-accent bg-accent/5 scale-[1.01]"
                  : "border-white/10 bg-white/1",
              )}
            >
              <h3 className="text-sm font-semibold text-white font-rethink">
                Your Canvas is Empty
              </h3>
              <p className="text-xs text-neutral-400 font-inter mt-1 max-w-sm mx-auto leading-relaxed">
                Drag components from the library panel on the left or click on
                them to start building your MDX content visually!
              </p>
            </div>
          ) : (
            /* Blocks Stack */
            <div className="space-y-4 max-w-3xl mx-auto">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  data-canvas-block-id={block.id}
                  onClickCapture={() => onActiveBlockChange?.(block.id)}
                  onFocusCapture={() => onActiveBlockChange?.(block.id)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, index)}
                  className="relative transition-all"
                >
                  {/* Drop Indicator (Insert Above) */}
                  {dropIndicator?.index === index &&
                    dropIndicator?.position === "top" && (
                      <DropIndicator className="absolute -top-3.5 left-0 right-0" />
                    )}

                  <CanvasBlockItem
                    block={block}
                    index={index}
                    totalBlocks={blocks.length}
                    onUpdateProps={onUpdateProps}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onDragStart={handleDragStart}
                    onNestedDragChange={handleNestedDragChange}
                  />

                  {/* Drop Indicator (Insert Below) */}
                  {dropIndicator?.index === index &&
                    dropIndicator?.position === "bottom" && (
                      <DropIndicator className="absolute -bottom-3.5 left-0 right-0" />
                    )}
                </div>
              ))}

              {/* End of list drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDropTargetActive(true);
                }}
                onDragLeave={() => setIsDropTargetActive(false)}
                onDrop={handleContainerDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-4 text-center text-xs font-medium transition-all flex items-center justify-center gap-2 select-none",
                  isDropTargetActive
                    ? "border-accent text-accent bg-accent/5 scale-[1.01]"
                    : "border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-400",
                )}
              >
                <LuPlus className="w-4 h-4" />
                <span>Drop next block here from library</span>
              </div>
            </div>
          )}
        </IconPickerProvider>
      </InlineTooltipProvider>
    </div>
  );
};

export default CanvasArea;
