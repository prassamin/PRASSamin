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
import { MdxUser } from "@/components/mdx/mdx-user";
import { MdxBlockquote } from "@/components/mdx/mdx-blockquote";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { canDropBlockInTab, canDropBlockInTemplate } from "../registry";
import { CanvasBlockItem } from "../../components/canvas-block-item";

interface TabsBlockEditorProps {
  props: Record<string, any>;
  depth: number;
  insideTemplate: boolean;
  availableTemplates: TemplateDefinitionInfo[];
  updateProp: (key: string, value: any) => void;
  onNestedDragChange?: (active: boolean) => void;
}

export const TabsBlockEditor: React.FC<TabsBlockEditorProps> = React.memo(({
  props,
  depth,
  insideTemplate,
  availableTemplates,
  updateProp,
  onNestedDragChange,
}) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isTabDropActive, setIsTabDropActive] = useState(false);
  const [nestedDropIndicator, setNestedDropIndicator] = useState<{ index: number; position: "top" | "bottom" } | null>(null);
  // Tabs helpers for nested blocks
  const tabsList = props.tabs || [];
  const safeTabIdx = Math.min(activeTabIdx, Math.max(0, tabsList.length - 1));
  const currentTab = tabsList[safeTabIdx] || { title: "Tab 1", blocks: [] };

  const currentTabBlocks: MdxBlock[] = Array.isArray(currentTab.blocks)
    ? currentTab.blocks
    : currentTab.content
      ? [createBlock("paragraph", { text: currentTab.content })]
      : [];

  const updateTabsList = (newTabs: any[]) => {
    updateProp("tabs", newTabs);
  };

  const handleUpdateTabTitle = (tIdx: number, newTitle: string) => {
    const updated = [...tabsList];
    updated[tIdx] = { ...updated[tIdx], title: newTitle };
    updateTabsList(updated);
  };

  const handleAddTab = () => {
    const newIdx = tabsList.length;
    const newTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Tab ${newIdx + 1}`,
      blocks: [createBlock("paragraph", { text: "Write tab content here..." })],
    };
    updateTabsList([...tabsList, newTab]);
    setActiveTabIdx(newIdx);
  };

  const handleRemoveTab = (tIdx: number) => {
    if (tabsList.length <= 1) return;
    const updated = tabsList.filter((_: any, i: number) => i !== tIdx);
    updateTabsList(updated);
    setActiveTabIdx(Math.max(0, tIdx - 1));
  };

  const canDropInTab = (blockType: MdxBlockType) =>
    canDropBlockInTab(blockType, insideTemplate);

  const handleInsertNestedBlock = (
    blockType: MdxBlockType,
    targetIdx?: number,
  ) => {
    if (!canDropInTab(blockType)) return;
    const newBlock = createBlock(blockType);
    const updatedBlocks = [...currentTabBlocks];
    if (
      targetIdx !== undefined &&
      targetIdx >= 0 &&
      targetIdx <= updatedBlocks.length
    ) {
      updatedBlocks.splice(targetIdx, 0, newBlock);
    } else {
      updatedBlocks.push(newBlock);
    }
    const updatedTabs = [...tabsList];
    const targetTab = { ...currentTab, blocks: updatedBlocks };
    updatedTabs[safeTabIdx] = targetTab;
    updateTabsList(updatedTabs);
  };

  const handleNestedItemDragOver = (e: React.DragEvent, cIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    onNestedDragChange?.(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "top" | "bottom" = e.clientY < midY ? "top" : "bottom";

    if (
      nestedDropIndicator?.index !== cIdx ||
      nestedDropIndicator?.position !== position
    ) {
      setNestedDropIndicator({ index: cIdx, position });
    }
  };

  const handleNestedItemDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setNestedDropIndicator(null);
    }
  };

  const handleNestedItemDrop = (e: React.DragEvent, cIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    onNestedDragChange?.(false);
    const position = nestedDropIndicator?.position || "bottom";
    setNestedDropIndicator(null);
    setIsTabDropActive(false);

    const targetIndex = position === "top" ? cIdx : cIdx + 1;

    // Case 1: Reordering within tab
    const nestedReorderData = e.dataTransfer.getData(
      "application/mdx-nested-reorder",
    );
    if (nestedReorderData !== "") {
      const srcIdx = parseInt(nestedReorderData, 10);
      if (!isNaN(srcIdx)) {
        const finalTarget =
          srcIdx < targetIndex ? targetIndex - 1 : targetIndex;
        if (srcIdx !== finalTarget) {
          const updated = [...currentTabBlocks];
          const [moved] = updated.splice(srcIdx, 1);
          updated.splice(finalTarget, 0, moved);
          const updatedTabs = [...tabsList];
          updatedTabs[safeTabIdx] = { ...currentTab, blocks: updated };
          updateTabsList(updatedTabs);
        }
      }
      return;
    }

    // Case 2: Dropping new block from sidebar into this tab position
    const blockType = e.dataTransfer.getData(
      "application/mdx-block-type",
    ) as MdxBlockType;
    if (blockType && canDropInTab(blockType)) {
      handleInsertNestedBlock(blockType, targetIndex);
    }
  };

  const handleUpdateNestedBlock = (
    childId: string,
    newChildProps: Record<string, any>,
  ) => {
    const updatedTabs = [...tabsList];
    const targetTab = { ...currentTab };
    targetTab.blocks = currentTabBlocks.map((b) =>
      b.id === childId ? { ...b, props: newChildProps } : b,
    );
    updatedTabs[safeTabIdx] = targetTab;
    updateTabsList(updatedTabs);
  };

  const handleMoveNestedBlock = (childIdx: number, direction: -1 | 1) => {
    const targetIdx = childIdx + direction;
    if (targetIdx < 0 || targetIdx >= currentTabBlocks.length) return;
    const updatedBlocks = [...currentTabBlocks];
    const temp = updatedBlocks[childIdx];
    updatedBlocks[childIdx] = updatedBlocks[targetIdx];
    updatedBlocks[targetIdx] = temp;

    const updatedTabs = [...tabsList];
    const targetTab = { ...currentTab, blocks: updatedBlocks };
    updatedTabs[safeTabIdx] = targetTab;
    updateTabsList(updatedTabs);
  };

  const handleDuplicateNestedBlock = (childIdx: number) => {
    const original = currentTabBlocks[childIdx];
    if (!original) return;
    const clone = createBlock(
      original.type,
      JSON.parse(JSON.stringify(original.props)),
    );
    const updatedBlocks = [...currentTabBlocks];
    updatedBlocks.splice(childIdx + 1, 0, clone);

    const updatedTabs = [...tabsList];
    const targetTab = { ...currentTab, blocks: updatedBlocks };
    updatedTabs[safeTabIdx] = targetTab;
    updateTabsList(updatedTabs);
  };

  const handleDeleteNestedBlock = (childIdx: number) => {
    const updatedBlocks = currentTabBlocks.filter((_, i) => i !== childIdx);
    const updatedTabs = [...tabsList];
    const targetTab = { ...currentTab, blocks: updatedBlocks };
    updatedTabs[safeTabIdx] = targetTab;
    updateTabsList(updatedTabs);
  };
  return depth > 0 ? (
            <div className="p-3 text-xs text-neutral-400 italic">
              Nested tabs within tabs are not supported.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Tab Bar Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/8 select-none">
                {tabsList.map((tab: any, tIdx: number) => (
                  <div
                    key={tab.id || tIdx}
                    onClick={() => setActiveTabIdx(tIdx)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shrink-0 border",
                      safeTabIdx === tIdx
                        ? "bg-accent/15 border-accent/40 text-accent font-semibold shadow-xs"
                        : "bg-white/3 border-white/8 text-neutral-400 hover:text-white hover:bg-white/6",
                    )}
                  >
                    <span>{tab.title || `Tab ${tIdx + 1}`}</span>
                    {tab.blocks && tab.blocks.length > 0 && (
                      <span className="text-[10px] font-mono opacity-60">
                        ({tab.blocks.length})
                      </span>
                    )}
                    {tabsList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTab(tIdx);
                        }}
                        title="Remove Tab"
                        className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddTab}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/4 hover:bg-white/8 border border-dashed border-white/20 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tab</span>
                </button>
              </div>

              {/* Active Tab Configuration & Nested Blocks */}
              <div className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-4">
                {/* Tab Title */}
                <div className="flex items-center gap-3">
                  <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0 font-medium">
                    Label:
                  </label>
                  <input
                    type="text"
                    data-format-role="plain"
                    data-tab-label="true"
                    value={currentTab.title || ""}
                    onChange={(e) =>
                      handleUpdateTabTitle(safeTabIdx, e.target.value)
                    }
                    placeholder="Tab Title..."
                    className="flex-1 w-full text-xs bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                {/* Nested Blocks List */}
                <div
                  onDragOver={(e) => {
                    e.stopPropagation();
                    onNestedDragChange?.(true);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      onNestedDragChange?.(false);
                    }
                  }}
                  className="space-y-3 pt-2 border-t border-white/6"
                >
                  {currentTabBlocks.length === 0 ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onNestedDragChange?.(true);
                        setIsTabDropActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (
                          !e.currentTarget.contains(e.relatedTarget as Node)
                        ) {
                          onNestedDragChange?.(false);
                          setIsTabDropActive(false);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onNestedDragChange?.(false);
                        setIsTabDropActive(false);
                        const blockType = e.dataTransfer.getData(
                          "application/mdx-block-type",
                        ) as MdxBlockType;
                        if (blockType && canDropInTab(blockType)) {
                          handleInsertNestedBlock(blockType);
                        }
                      }}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center gap-1.5 select-none",
                        isTabDropActive
                          ? "border-accent bg-accent/10 text-accent scale-[1.01]"
                          : "border-white/10 bg-white/1 text-neutral-400 hover:border-white/20",
                      )}
                    >
                      <Plus className="w-5 h-5 opacity-60" />
                      <span className="text-xs font-semibold text-neutral-200">
                        Drop components here from the sidebar
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Drag any block from the component library into &quot;
                        {currentTab.title || `Tab ${safeTabIdx + 1}`}&quot;
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentTabBlocks.map((childBlock, cIdx) => (
                        <div
                          key={childBlock.id}
                          onDragOver={(e) => handleNestedItemDragOver(e, cIdx)}
                          onDragLeave={handleNestedItemDragLeave}
                          onDrop={(e) => handleNestedItemDrop(e, cIdx)}
                          className="relative transition-all"
                        >
                          {nestedDropIndicator?.index === cIdx &&
                            nestedDropIndicator?.position === "top" && (
                              <DropIndicator className="absolute -top-3 left-0 right-0" />
                            )}

                          <CanvasBlockItem
                            block={childBlock}
                            index={cIdx}
                            totalBlocks={currentTabBlocks.length}
                            depth={depth + 1}
                            availableTemplates={availableTemplates}
                            insideTemplate={insideTemplate}
                            onUpdateProps={handleUpdateNestedBlock}
                            onMoveUp={(idx) => handleMoveNestedBlock(idx, -1)}
                            onMoveDown={(idx) => handleMoveNestedBlock(idx, 1)}
                            onDuplicate={handleDuplicateNestedBlock}
                            onDelete={handleDeleteNestedBlock}
                            onDragStart={(e, idx) => {
                              e.stopPropagation();
                              e.dataTransfer.setData(
                                "application/mdx-nested-reorder",
                                String(idx),
                              );
                              e.dataTransfer.effectAllowed = "move";
                            }}
                          />

                          {nestedDropIndicator?.index === cIdx &&
                            nestedDropIndicator?.position === "bottom" && (
                              <DropIndicator className="absolute -bottom-3 left-0 right-0" />
                            )}
                        </div>
                      ))}

                      {/* Drop Target to append next block into this tab */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onNestedDragChange?.(true);
                          setIsTabDropActive(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (
                            !e.currentTarget.contains(e.relatedTarget as Node)
                          ) {
                            onNestedDragChange?.(false);
                            setIsTabDropActive(false);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onNestedDragChange?.(false);
                          setIsTabDropActive(false);
                          const blockType = e.dataTransfer.getData(
                            "application/mdx-block-type",
                          ) as MdxBlockType;
                          if (blockType && canDropInTab(blockType)) {
                            handleInsertNestedBlock(blockType);
                          }
                        }}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-3 text-center text-xs font-medium transition-all flex items-center justify-center gap-2 select-none",
                          isTabDropActive
                            ? "border-accent text-accent bg-accent/10"
                            : "border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-400",
                        )}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Drop next block here from sidebar</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
  );
});
TabsBlockEditor.displayName = "TabsBlockEditor";
