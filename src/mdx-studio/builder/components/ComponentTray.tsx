"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  LuHeading,
  LuAlignLeft,
  LuMinus,
  LuLightbulb,
  LuCreditCard,
  LuLayers,
  LuCode,
  LuImage as LuImageIcon,
  LuTag,
  LuMegaphone,
  LuPlus,
  LuCircleHelp,
  LuList,
  LuListOrdered,
  LuTable as LuTableIcon,
  LuTableProperties,
  LuFolderTree,
  LuCircleUser,
  LuUsers,
  LuQuote,
  LuCornerDownLeft,
  LuSearch,
  LuX,
} from "react-icons/lu";
import {
  COMPONENT_TRAY_ITEMS,
  ComponentTrayItem,
  MdxBlockType,
} from "../types";
import { cn } from "@heroui/react";

interface ComponentTrayProps {
  onAddBlock: (type: MdxBlockType) => void;
  className?: string;
}

const ICONS: Record<MdxBlockType, React.ReactNode> = {
  heading: <LuHeading className="w-4 h-4 text-sky-400" />,
  paragraph: <LuAlignLeft className="w-4 h-4 text-neutral-300" />,
  list: <LuList className="w-4 h-4 text-emerald-400" />,
  divider: <LuMinus className="w-4 h-4 text-neutral-400" />,
  callout: <LuLightbulb className="w-4 h-4 text-accent" />,
  card: <LuCreditCard className="w-4 h-4 text-emerald-400" />,
  accordion: <LuCircleHelp className="w-4 h-4 text-purple-400" />,
  steps: <LuListOrdered className="w-4 h-4 text-orange-400" />,
  tabs: <LuLayers className="w-4 h-4 text-amber-400" />,
  chipGroup: <LuTag className="w-4 h-4 text-rose-400" />,
  banner: <LuMegaphone className="w-4 h-4 text-pink-400" />,
  code: <LuCode className="w-4 h-4 text-amber-400" />,
  image: <LuImageIcon className="w-4 h-4 text-blue-400" />,
  table: <LuTableIcon className="w-4 h-4 text-teal-400" />,
  typeTable: <LuTableProperties className="w-4 h-4 text-emerald-400" />,
  files: <LuFolderTree className="w-4 h-4 text-amber-400" />,
  avatar: <LuUsers className="w-4 h-4 text-violet-400" />,
  profile: <LuCircleUser className="w-4 h-4 text-cyan-400" />,
  blockquote: <LuQuote className="w-4 h-4 text-emerald-400" />,
  break: <LuCornerDownLeft className="w-4 h-4 text-neutral-400" />,
};

export const ComponentTray: React.FC<ComponentTrayProps> = ({
  onAddBlock,
  className,
}) => {
  const isDraggingRef = useRef(false);
  const [search, setSearch] = useState("");

  const categories: ComponentTrayItem["category"][] = [
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
};

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
      className="relative group aspect-[1/0.92] flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.07] border border-white/[0.07] hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-150 cursor-grab active:cursor-grabbing text-center select-none active:scale-[0.98]"
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
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-150 shrink-0">
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
