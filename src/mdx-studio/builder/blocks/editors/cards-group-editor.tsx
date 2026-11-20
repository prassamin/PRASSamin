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

interface CardsGroupBlockEditorProps {
  props: Record<string, any>;
  index: number;
  updateProp: (key: string, value: any) => void;
  onNestedDragChange?: (active: boolean) => void;
  onAdoptBlock?: (rootIndex: number, cardTargetBlockIndex?: number) => void;
  onExtractCard?: (groupBlockIndex: number, cardIndex: number, targetRootIndex: number) => void;
  onMoveCardBetweenGroups?: (srcGroupIndex: number, srcCardIndex: number, targetGroupIndex: number, targetCardIndex?: number) => void;
}

export const CardsGroupBlockEditor: React.FC<CardsGroupBlockEditorProps> = React.memo(({
  props,
  index,
  updateProp,
  onNestedDragChange,
  onAdoptBlock,
  onExtractCard,
  onMoveCardBetweenGroups,
}) => {
  const [cardDropIndicator, setCardDropIndicator] = useState<{ index: number; position: "top" | "bottom" } | null>(null);
  const [isCardAppendDropActive, setIsCardAppendDropActive] = useState(false);
  // ── Cards Group helpers (flat list of cards: title + badge + content) ──
  const cardsList = props.cards || [];

  const updateCardsList = (newCards: any[]) => {
    updateProp("cards", newCards);
  };

  const handleUpdateCardTitle = (cIdx: number, newTitle: string) => {
    const updated = [...cardsList];
    updated[cIdx] = { ...updated[cIdx], title: newTitle };
    updateCardsList(updated);
  };

  const handleUpdateCardBadge = (cIdx: number, newBadge: string) => {
    const updated = [...cardsList];
    updated[cIdx] = { ...updated[cIdx], badge: newBadge };
    updateCardsList(updated);
  };

  const handleUpdateCardContent = (cIdx: number, newContent: string) => {
    const updated = [...cardsList];
    updated[cIdx] = { ...updated[cIdx], content: newContent };
    updateCardsList(updated);
  };

  const handleAddCard = () => {
    const newIdx = cardsList.length;
    const newCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Card ${newIdx + 1}`,
      badge: "",
      content: "Write card content here...",
    };
    updateCardsList([...cardsList, newCard]);
  };

  const handleRemoveCard = (cIdx: number) => {
    if (cardsList.length <= 1) return;
    updateCardsList(cardsList.filter((_: any, i: number) => i !== cIdx));
  };

  const handleMoveCard = (fromIdx: number, direction: -1 | 1) => {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= cardsList.length) return;
    const updated = [...cardsList];
    const temp = updated[fromIdx];
    updated[fromIdx] = updated[toIdx];
    updated[toIdx] = temp;
    updateCardsList(updated);
  };

  const handleCardItemDragOver = (e: React.DragEvent, cIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    onNestedDragChange?.(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "top" | "bottom" = e.clientY < midY ? "top" : "bottom";

    if (
      cardDropIndicator?.index !== cIdx ||
      cardDropIndicator?.position !== position
    ) {
      setCardDropIndicator({ index: cIdx, position });
    }
  };

  const handleCardItemDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setCardDropIndicator(null);
    }
  };

  const handleCardItemDrop = (e: React.DragEvent, cIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    onNestedDragChange?.(false);
    const position = cardDropIndicator?.position || "bottom";
    setCardDropIndicator(null);
    setIsCardAppendDropActive(false);

    const targetIndex = position === "top" ? cIdx : cIdx + 1;

    // Case 1: Reordering cards within this group
    const cardReorderData = e.dataTransfer.getData(
      "application/mdx-card-reorder",
    );
    if (cardReorderData !== "") {
      const srcCardIdx = parseInt(cardReorderData, 10);
      if (!isNaN(srcCardIdx)) {
        if (srcCardIdx === targetIndex || srcCardIdx === targetIndex - 1)
          return;
        const updated = [...cardsList];
        const [moved] = updated.splice(srcCardIdx, 1);
        const finalTarget =
          srcCardIdx < targetIndex ? targetIndex - 1 : targetIndex;
        updated.splice(finalTarget, 0, moved);
        updateCardsList(updated);
        return;
      }
    }

    // Case 2: Adopting a top-level block from canvas
    const rootReorderData = e.dataTransfer.getData(
      "application/mdx-canvas-reorder",
    );
    if (rootReorderData !== "") {
      const srcIdx = parseInt(rootReorderData, 10);
      if (!isNaN(srcIdx) && onAdoptBlock) {
        onAdoptBlock(srcIdx, targetIndex);
        return;
      }
    }

    // Case 3: Dropping a new block from the tray
    const blockType = e.dataTransfer.getData(
      "application/mdx-block-type",
    ) as MdxBlockType;
    if (blockType) {
      const newCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `Card ${cardsList.length + 1}`,
        badge: blockType === "card" ? "" : blockType,
        content: "Write card content here...",
      };
      const updated = [...cardsList];
      updated.splice(targetIndex, 0, newCard);
      updateCardsList(updated);
      return;
    }
  };
  return (
          <div
            className="space-y-3"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNestedDragChange?.(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                onNestedDragChange?.(false);
                setIsCardAppendDropActive(false);
                setCardDropIndicator(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNestedDragChange?.(false);
              setIsCardAppendDropActive(false);
              setCardDropIndicator(null);

              // Adopt a top-level canvas block (e.g. an existing Card) as a
              // new card in this group.
              const rootReorderData = e.dataTransfer.getData(
                "application/mdx-canvas-reorder",
              );
              if (rootReorderData !== "") {
                const srcIdx = parseInt(rootReorderData, 10);
                if (!isNaN(srcIdx) && onAdoptBlock) {
                  onAdoptBlock(srcIdx, cardsList.length);
                }
                return;
              }

              // Tray drop
              const blockType = e.dataTransfer.getData(
                "application/mdx-block-type",
              ) as MdxBlockType;
              if (blockType) {
                handleAddCard();
              }
            }}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/8">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                {cardsList.length} card{cardsList.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={handleAddCard}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/4 hover:bg-white/8 border border-dashed border-white/20 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>

            {cardsList.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNestedDragChange?.(true);
                  setIsCardAppendDropActive(true);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsCardAppendDropActive(false);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNestedDragChange?.(false);
                  setIsCardAppendDropActive(false);

                  const rootReorderData = e.dataTransfer.getData(
                    "application/mdx-canvas-reorder",
                  );
                  if (rootReorderData !== "") {
                    const srcIdx = parseInt(rootReorderData, 10);
                    if (!isNaN(srcIdx) && onAdoptBlock) {
                      onAdoptBlock(srcIdx, 0);
                    }
                    return;
                  }

                  const blockType = e.dataTransfer.getData(
                    "application/mdx-block-type",
                  ) as MdxBlockType;
                  if (blockType) {
                    handleAddCard();
                  }
                }}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center text-neutral-400 text-xs transition-all",
                  isCardAppendDropActive
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-300 scale-[1.01]"
                    : "border-white/10",
                )}
              >
                <Plus className="w-5 h-5 opacity-60 mx-auto mb-1.5" />
                <span className="font-semibold text-neutral-200">
                  No cards yet
                </span>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Add a card, or drag an existing Card block onto this group.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cardsList.map((card: any, cIdx: number) => (
                  <div
                    key={card.id || cIdx}
                    onDragOver={(e) => handleCardItemDragOver(e, cIdx)}
                    onDragLeave={handleCardItemDragLeave}
                    onDrop={(e) => handleCardItemDrop(e, cIdx)}
                    className="relative transition-all"
                  >
                    {/* Drop Indicator (Insert Above) */}
                    {cardDropIndicator?.index === cIdx &&
                      cardDropIndicator?.position === "top" && (
                        <DropIndicator className="absolute -top-3 left-0 right-0 z-20" />
                      )}

                    <div className="rounded-xl bg-white/2 border border-white/6 hover:border-white/14 transition-colors overflow-hidden">
                      {/* Card header: drag handle, title, badge, move/remove */}
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-white/2 border-b border-white/6">
                        <div
                          title="Drag to reorder cards"
                          className="p-1 rounded text-neutral-500 hover:text-white cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            // For reordering within the same group
                            e.dataTransfer.setData(
                              "application/mdx-card-reorder",
                              String(cIdx),
                            );
                            // For dragging out to the root canvas
                            e.dataTransfer.setData(
                              "application/mdx-card-extract",
                              JSON.stringify({
                                groupBlockIndex: index,
                                cardIndex: cIdx,
                              }),
                            );
                            e.dataTransfer.effectAllowed = "move";
                            // Allow root canvas drop indicators to show
                            onNestedDragChange?.(false);
                          }}
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          data-format-role="plain"
                          value={card.title || ""}
                          onChange={(e) =>
                            handleUpdateCardTitle(cIdx, e.target.value)
                          }
                          placeholder={`Card ${cIdx + 1} title...`}
                          className="flex-1 min-w-0 text-xs font-semibold bg-transparent border-none text-white placeholder:text-neutral-500 focus:outline-none h-7 px-1 font-rethink"
                        />
                        <input
                          type="text"
                          data-format-role="plain"
                          value={card.badge || ""}
                          onChange={(e) =>
                            handleUpdateCardBadge(cIdx, e.target.value)
                          }
                          placeholder="badge"
                          className="w-20 text-[10px] font-mono bg-accent/10 border border-accent/20 rounded-full text-accent placeholder:text-neutral-600 focus:outline-none focus:border-accent px-2 py-0.5 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleMoveCard(cIdx, -1)}
                          disabled={cIdx === 0}
                          title="Move up"
                          className="p-1 rounded text-neutral-500 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCard(cIdx, 1)}
                          disabled={cIdx === cardsList.length - 1}
                          title="Move down"
                          className="p-1 rounded text-neutral-500 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        {cardsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCard(cIdx)}
                            title="Remove card"
                            className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Card content */}
                      <div className="p-3">
                        <InlineTooltipField
                          rows={3}
                          variant="dark"
                          value={card.content || ""}
                          onChange={(v) => handleUpdateCardContent(cIdx, v)}
                          placeholder={`Card ${cIdx + 1} content...`}
                        />
                      </div>
                    </div>

                    {/* Drop Indicator (Insert Below) */}
                    {cardDropIndicator?.index === cIdx &&
                      cardDropIndicator?.position === "bottom" && (
                        <DropIndicator className="absolute -bottom-3 left-0 right-0 z-20" />
                      )}
                  </div>
                ))}

                {/* Drop Target to append next card into this group */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNestedDragChange?.(true);
                    setIsCardAppendDropActive(true);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setIsCardAppendDropActive(false);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNestedDragChange?.(false);
                    setIsCardAppendDropActive(false);

                    // Reorder inside group
                    const cardReorderData = e.dataTransfer.getData(
                      "application/mdx-card-reorder",
                    );
                    if (cardReorderData !== "") {
                      const srcCardIdx = parseInt(cardReorderData, 10);
                      if (!isNaN(srcCardIdx)) {
                        const updated = [...cardsList];
                        const [moved] = updated.splice(srcCardIdx, 1);
                        updated.push(moved);
                        updateCardsList(updated);
                        return;
                      }
                    }

                    // Adopt top-level block
                    const rootReorderData = e.dataTransfer.getData(
                      "application/mdx-canvas-reorder",
                    );
                    if (rootReorderData !== "") {
                      const srcIdx = parseInt(rootReorderData, 10);
                      if (!isNaN(srcIdx) && onAdoptBlock) {
                        onAdoptBlock(srcIdx, cardsList.length);
                        return;
                      }
                    }

                    // Dropping from tray
                    const blockType = e.dataTransfer.getData(
                      "application/mdx-block-type",
                    ) as MdxBlockType;
                    if (blockType) {
                      handleAddCard();
                    }
                  }}
                  className={cn(
                    "border border-dashed rounded-xl p-2.5 text-center text-xs font-medium transition-all flex items-center justify-center gap-1.5 select-none",
                    isCardAppendDropActive
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-300 scale-[1.01]"
                      : "border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-300 bg-white/1",
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Drop card here to place at the end of group</span>
                </div>
              </div>
            )}
          </div>
  );
});
CardsGroupBlockEditor.displayName = "CardsGroupBlockEditor";
