"use client";

import React, { useState, useRef } from "react";
import {
  LuGripVertical as GripVertical,
  LuTrash2 as Trash2,
  LuCopy as Copy,
  LuExternalLink as ExternalLink,
  LuChevronUp as ChevronUp,
  LuChevronDown as ChevronDown,
  LuPlus as Plus,
  LuX as X,
  LuHeading as Heading,
  LuAlignLeft as AlignLeft,
  LuAlignCenter as AlignCenter,
  LuAlignRight as AlignRight,
  LuMinus as Minus,
  LuLightbulb as Lightbulb,
  LuCreditCard as CreditCard,
  LuLayers as Layers,
  LuCodeXml as CodeXml,
  LuImage as ImageIcon,
  LuTable as TableIcon,
  LuTag as Tag,
  LuMegaphone as Megaphone,
  LuCircleHelp as HelpCircle,
  LuListOrdered as ListOrdered,
  LuSlidersHorizontal as SlidersHorizontal,
  LuBold as Bold,
  LuItalic as Italic,
  LuRefreshCw as RefreshCw,
  LuHighlighter as Highlighter,
  LuEye as Eye,
  LuCircleAlert as AlertCircle,
  LuTriangleAlert as AlertTriangle,
  LuWholeWord as WholeWord,
  LuWandSparkles as WandSparkles,
  LuTableProperties as TableProperties,
  LuFolderTree as FolderTree,
  LuFolder as Folder,
  LuFolderOpen as FolderOpen,
  LuFolderPlus as FolderPlus,
  LuFileText as FileText,
  LuFilePlus as FilePlus,
  LuCircleUser as CircleUser,
  LuUser as User,
  LuUsers as Users,
  LuLink as LinkIcon,
  LuQuote as Quote,
  LuCornerDownLeft as CornerDownLeft,
  LuTerminal as Terminal,
  LuBlocks as BlocksIcon,
  LuCopyPlus as CopyPlus,
  LuEyeOff as EyeOff,
  LuSparkles as Sparkles,
  LuTag as TagIcon,
  LuType as TypeIcon,
  LuAlignStartHorizontal,
  LuAlignStartVertical,
} from "react-icons/lu";
import {
  MdxBlock,
  MdxBlockType,
  TypeTableProperty,
  FileTreeNode,
  ListType,
  ListItem,
  TemplateDefinitionInfo,
} from "../../types";
import { LuList, LuListOrdered, LuListTodo, LuCheck } from "react-icons/lu";
import { createBlock, extractTemplateVariables } from "../../compiler";
import { cn } from "@heroui/react";
import { DropIndicator } from "../../components/drop-indicator";
import { ImagePicker } from "@/components/image-picker";
import { InlineTooltipField } from "../../components/inline-tooltip-field";
import { Input } from "@heroui/react";
import { MdxChip } from "@/mdx-components";
import { MdxAvatarGroup } from "@/components/mdx/mdx-avatar";
import { MdxProfile } from "@/components/mdx/mdx-profile";
import { MdxBlockquote } from "@/components/mdx/mdx-blockquote";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { canDropBlockInTab, canDropBlockInTemplate } from "../registry";

interface ListBlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

export const ListBlockEditor: React.FC<ListBlockEditorProps> = React.memo(({ props, updateProp }) => {
            const listType: ListType = props.listType || "bullet";
            const items: ListItem[] = Array.isArray(props.items)
              ? props.items
              : [];

            const handleUpdateItem = (
              itemIdx: number,
              patch: Partial<ListItem>,
            ) => {
              const next = items.map((it, i) =>
                i === itemIdx ? { ...it, ...patch } : it,
              );
              updateProp("items", next);
            };

            const handleAddItem = () => {
              const newItem: ListItem = {
                id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                text: "",
                ...(listType === "task" ? { checked: false } : {}),
              };
              updateProp("items", [...items, newItem]);
            };

            const handleRemoveItem = (itemIdx: number) => {
              if (items.length <= 1) {
                updateProp("items", [
                  {
                    id: `li-${Date.now()}`,
                    text: "",
                    ...(listType === "task" ? { checked: false } : {}),
                  },
                ]);
                return;
              }
              updateProp(
                "items",
                items.filter((_, i) => i !== itemIdx),
              );
            };

            const handleMoveItem = (
              fromIdx: number,
              direction: "up" | "down",
            ) => {
              const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
              if (toIdx < 0 || toIdx >= items.length) return;
              const reordered = [...items];
              const [moved] = reordered.splice(fromIdx, 1);
              reordered.splice(toIdx, 0, moved);
              updateProp("items", reordered);
            };

            return (
              <div className="space-y-3">
                {/* List Header: Type Switcher & Count */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-white/6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Type:
                    </span>
                    <SegmentedControl
                      options={[
                        {
                          label: (
                            <span className="flex items-center gap-1.5 text-xs">
                              <LuList className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Bullet</span>
                            </span>
                          ),
                          value: "bullet" as const,
                        },
                        {
                          label: (
                            <span className="flex items-center gap-1.5 text-xs">
                              <LuListOrdered className="w-3.5 h-3.5 text-blue-400" />
                              <span>Numbered</span>
                            </span>
                          ),
                          value: "ordered" as const,
                        },
                        {
                          label: (
                            <span className="flex items-center gap-1.5 text-xs">
                              <LuListTodo className="w-3.5 h-3.5 text-amber-400" />
                              <span>Task</span>
                            </span>
                          ),
                          value: "task" as const,
                        },
                      ]}
                      size="sm"
                      value={listType}
                      onValueChange={(val) => updateProp("listType", val)}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {items.map((item, itemIdx) => (
                    <div
                      key={item.id || `li-${itemIdx}`}
                      className="group/item flex items-center gap-2 p-1.5 rounded-xl border border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/3 transition-all"
                    >
                      {/* Prefix Indicator */}
                      <div className="flex items-center justify-center shrink-0 pl-1">
                        {listType === "bullet" && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400/80 mx-1" />
                        )}

                        {listType === "ordered" && (
                          <div className="w-5 h-5 rounded-md bg-white/6 border border-white/10 text-[11px] font-mono text-neutral-300 flex items-center justify-center">
                            {itemIdx + 1}
                          </div>
                        )}

                        {listType === "task" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItem(itemIdx, {
                                checked: !item.checked,
                              })
                            }
                            title={
                              item.checked
                                ? "Mark as uncompleted"
                                : "Mark as completed"
                            }
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer",
                              item.checked
                                ? "bg-emerald-500 border-emerald-400 text-black shadow-sm shadow-emerald-500/20"
                                : "border-white/20 bg-white/4 text-transparent hover:border-white/40",
                            )}
                          >
                            <LuCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>

                      {/* Inline Text Input */}
                      <div className="flex-1 min-w-0">
                        <InlineTooltipField
                          as="input"
                          variant="dark"
                          value={item.text || ""}
                          onChange={(val) =>
                            handleUpdateItem(itemIdx, { text: val })
                          }
                          placeholder={`Item ${itemIdx + 1}...`}
                        />
                      </div>

                      {/* Item Controls */}
                      <div className="flex items-center gap-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(itemIdx, "up")}
                          disabled={itemIdx === 0}
                          title="Move Up"
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(itemIdx, "down")}
                          disabled={itemIdx === items.length - 1}
                          title="Move Down"
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(itemIdx)}
                          title="Delete Item"
                          className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-dashed border-white/10 hover:border-emerald-500/40 bg-white/2 hover:bg-emerald-500/4 text-xs font-medium text-neutral-400 hover:text-emerald-400 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add List Item</span>
                </button>
              </div>
            );
});
ListBlockEditor.displayName = "ListBlockEditor";
