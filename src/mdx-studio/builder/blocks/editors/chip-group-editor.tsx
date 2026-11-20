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

interface ChipGroupBlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

export const ChipGroupBlockEditor: React.FC<ChipGroupBlockEditorProps> = React.memo(({ props, updateProp }) => (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-inter">
                Color:
              </span>
              <SegmentedControl
                options={[
                  { label: "Accent", value: "accent" },
                  { label: "Sky", value: "sky" },
                  { label: "Emerald", value: "emerald" },
                  { label: "Default", value: "default" },
                ]}
                size="sm"
                defaultValue="accent"
                value={props.color || "accent"}
                onValueChange={(c) => updateProp("color", c)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/2 border border-white/10">
              {(props.chips || []).map((chip: string, cIdx: number) => (
                <MdxChip
                  key={cIdx}
                  size={props.size || "sm"}
                  color={props.color || "accent"}
                  variant={props.variant || "soft"}
                >
                  <span>{chip}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newChips = props.chips.filter(
                        (_: string, i: number) => i !== cIdx,
                      );
                      updateProp("chips", newChips);
                    }}
                    className="ml-1 opacity-60 hover:opacity-100 hover:text-red-400 transition-opacity cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </MdxChip>
              ))}

              <Input
                type="text"
                placeholder="Type tag and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newChips = [
                      ...(props.chips || []),
                      e.currentTarget.value.trim(),
                    ];
                    updateProp("chips", newChips);
                    e.currentTarget.value = "";
                  }
                }}
                className="w-full text-xs bg-white/3 9.5 border border-white/10 text-white min-w-35"
              />
            </div>
          </div>
));
ChipGroupBlockEditor.displayName = "ChipGroupBlockEditor";
