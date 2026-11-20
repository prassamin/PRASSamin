"use client";

import React, { useState, useMemo, useRef } from "react";
import { LuPlus, LuSearch, LuX } from "react-icons/lu";
import {
  COMPONENT_TRAY_ITEMS,
  ComponentTrayItem,
  MdxBlockType,
} from "../types";
import { TRAY_ICONS as ICONS } from "../blocks/registry";
import { cn } from "@heroui/react";

interface ComponentTrayProps {
  onAddBlock: (type: MdxBlockType) => void;
  className?: string;
}

export const ComponentTray: React.FC<ComponentTrayProps> = React.memo(({
  onAddBlock,
  className,
}) => {
  const isDraggingRef = useRef(false);
  const [search, setSearch] = useState("");

  const categories: ComponentTrayItem["category"][] = [
    "Templates",
    "Structure",
    "Interactive",
    "Code & Media",
  ];

  const handleDragStart = (e: React.DragEvent, type: MdxBlockType) => {
    isDraggingRef.current = true;
    e.dataTransfer.setData("application/mdx-block-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleClick = (type: MdxBlockType) => {
    if (isDraggingRef.current) return;
    onAddBlock(type);
  };

  // Filter items if searching
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return COMPONENT_TRAY_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div
      data-lenis-prevent
      className={cn("w-full h-full flex flex-col select-none", className)}
    >
      {/* Block Palette Area (Square Grid UI) */}
      <div
        data-lenis-prevent
        className="flex-1 overflow-y-auto p-3.5 space-y-4 overscroll-contain"
      >
        {filteredItems ? (
          /* Search Results */
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-2 px-1">
              Matching Blocks ({filteredItems.length})
            </span>
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No blocks matching &ldquo;{search}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(105px,1fr))] gap-2">
                {filteredItems.map((item) => (
                  <SquareBlockCard
                    key={item.type}
                    item={item}
                    icon={ICONS[item.type]}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onClick={handleClick}
                    onAddBlock={onAddBlock}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grouped by Categories in Square Grid */
          categories.map((cat) => {
            const items = COMPONENT_TRAY_ITEMS.filter(
              (i) => i.category === cat,
            );
            return (
              <div key={cat} className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block px-1">
                  {cat}
                </span>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(105px,1fr))] gap-2">
                  {items.map((item) => (
                    <SquareBlockCard
                      key={item.type}
                      item={item}
                      icon={ICONS[item.type]}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={handleClick}
                      onAddBlock={onAddBlock}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
ComponentTray.displayName = "ComponentTray";

interface SquareBlockCardProps {
  item: ComponentTrayItem;
  icon: React.ReactNode;
  onDragStart: (e: React.DragEvent, type: MdxBlockType) => void;
  onDragEnd: () => void;
  onClick: (type: MdxBlockType) => void;
  onAddBlock: (type: MdxBlockType) => void;
}

const SquareBlockCard: React.FC<SquareBlockCardProps> = ({
  item,
  icon,
  onDragStart,
  onDragEnd,
  onClick,
  onAddBlock,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.type)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(item.type)}
      title={`${item.label} • ${item.description}`}
      className="relative group aspect-[1/0.92] flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/2.5 hover:bg-white/7 border border-white/7 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-150 cursor-grab active:cursor-grabbing text-center select-none active:scale-[0.98]"
    >
      {/* Quick Add Pill Indicator on Hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddBlock(item.type);
        }}
        title={`Add ${item.label} to canvas`}
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-accent/15 text-accent hover:bg-accent/25 cursor-pointer"
      >
        <LuPlus className="w-3 h-3" />
      </button>

      {/* Prominent Square Icon Container */}
      <div className="w-9 h-9 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-150 shrink-0">
        {icon}
      </div>

      {/* Block Title */}
      <span className="text-xs font-medium text-neutral-300 group-hover:text-white truncate max-w-full px-1">
        {item.label}
      </span>
    </div>
  );
};

export default ComponentTray;
