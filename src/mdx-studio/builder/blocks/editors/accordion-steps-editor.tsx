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

interface BlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

export const AccordionBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => (
          <div className="space-y-3">
            {(props.items || []).map((item: any, itIdx: number) => (
              <div
                key={itIdx}
                className="group/item rounded-2xl border border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/[0.035] transition-all duration-200 overflow-hidden shadow-sm"
              >
                {/* Header row with item pill badge, title input and controls */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-white/1.5 border-b border-white/5">
                  <div className="w-6 h-6 rounded-full bg-white/6 text-accent flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                    #{itIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const newItems = (props.items || []).map(
                        (it: any, i: number) =>
                          i === itIdx ? { ...it, title: newTitle } : it,
                      );
                      updateProp("items", newItems);
                    }}
                    placeholder={`Question / Panel ${itIdx + 1}...`}
                    className="flex-1 w-full text-xs font-semibold bg-transparent border-none text-white focus:outline-none placeholder:text-neutral-500 h-8 px-1"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move up */}
                    {itIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...props.items];
                          const temp = newItems[itIdx - 1];
                          newItems[itIdx - 1] = newItems[itIdx];
                          newItems[itIdx] = temp;
                          updateProp("items", newItems);
                        }}
                        title="Move panel up"
                        className="p-1 rounded text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Move down */}
                    {itIdx < (props.items?.length || 0) - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...props.items];
                          const temp = newItems[itIdx + 1];
                          newItems[itIdx + 1] = newItems[itIdx];
                          newItems[itIdx] = temp;
                          updateProp("items", newItems);
                        }}
                        title="Move panel down"
                        className="p-1 rounded text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Delete panel */}
                    {props.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = props.items.filter(
                            (_: any, i: number) => i !== itIdx,
                          );
                          updateProp("items", newItems);
                        }}
                        title="Remove panel"
                        className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content body textarea */}
                <div className="p-3">
                  <InlineTooltipField
                    rows={2}
                    variant="dark"
                    value={item.content || ""}
                    onChange={(v) => {
                      const newItems = (props.items || []).map(
                        (it: any, i: number) =>
                          i === itIdx ? { ...it, content: v } : it,
                      );
                      updateProp("items", newItems);
                    }}
                    placeholder="Panel explanation / answer..."
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newItems = [
                  ...(props.items || []),
                  {
                    title: `Question ${(props.items?.length || 0) + 1}`,
                    content: "Detailed answer / step description.",
                  },
                ];
                updateProp("items", newItems);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/1.5 hover:bg-accent/4 text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Accordion Item</span>
            </button>
          </div>
));
AccordionBlockEditor.displayName = "AccordionBlockEditor";

export const StepsBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => (
          <div className="space-y-3">
            {(props.steps || []).map((step: any, stIdx: number) => (
              <div
                key={stIdx}
                className="group/item rounded-2xl border border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/[0.035] transition-all duration-200 overflow-hidden shadow-sm"
              >
                {/* Header row with step number, title input and controls */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-white/1.5 border-b border-white/5">
                  <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                    {stIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={step.title || ""}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const newSteps = (props.steps || []).map(
                        (s: any, i: number) =>
                          i === stIdx ? { ...s, title: newTitle } : s,
                      );
                      updateProp("steps", newSteps);
                    }}
                    placeholder={`Step ${stIdx + 1} title...`}
                    className="flex-1 w-full text-xs font-semibold bg-transparent border-none text-white focus:outline-none placeholder:text-neutral-500 h-8 px-1"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move up */}
                    {stIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = [...props.steps];
                          const temp = newSteps[stIdx - 1];
                          newSteps[stIdx - 1] = newSteps[stIdx];
                          newSteps[stIdx] = temp;
                          updateProp("steps", newSteps);
                        }}
                        title="Move step up"
                        className="p-1 rounded text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Move down */}
                    {stIdx < (props.steps?.length || 0) - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = [...props.steps];
                          const temp = newSteps[stIdx + 1];
                          newSteps[stIdx + 1] = newSteps[stIdx];
                          newSteps[stIdx] = temp;
                          updateProp("steps", newSteps);
                        }}
                        title="Move step down"
                        className="p-1 rounded text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Delete step */}
                    {props.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = props.steps.filter(
                            (_: any, i: number) => i !== stIdx,
                          );
                          updateProp("steps", newSteps);
                        }}
                        title="Remove step"
                        className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Step body textarea */}
                <div className="p-3">
                  <InlineTooltipField
                    rows={2}
                    variant="dark"
                    value={step.content || ""}
                    onChange={(v) => {
                      const newSteps = (props.steps || []).map(
                        (s: any, i: number) =>
                          i === stIdx ? { ...s, content: v } : s,
                      );
                      updateProp("steps", newSteps);
                    }}
                    placeholder="Step details / instructions..."
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newSteps = [
                  ...(props.steps || []),
                  {
                    title: `Step ${(props.steps?.length || 0) + 1}`,
                    content: "Describe this step clearly.",
                  },
                ];
                updateProp("steps", newSteps);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/1.5 hover:bg-accent/4 text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Step</span>
            </button>
          </div>
));
StepsBlockEditor.displayName = "StepsBlockEditor";
