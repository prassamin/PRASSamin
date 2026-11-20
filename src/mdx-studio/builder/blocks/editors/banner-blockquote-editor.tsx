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
  updateProp: (keyOrPatch: string | Record<string, any>, value?: any) => void;
}

export const BannerBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => (
          <div className="rounded-2xl border border-white/8 bg-white/2 hover:border-pink-400/25 transition-all duration-200 overflow-hidden shadow-sm">
            <div className="flex flex-col gap-2 px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">
                    Style:
                  </span>
                  <SegmentedControl
                    options={["Normal", "Rainbow"]}
                    size="sm"
                    value={props.variant || "normal"}
                    onValueChange={(v) => updateProp("variant", v)}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">
                    Close:
                  </span>
                  <SegmentedControl
                    options={[
                      { label: "ON", value: "on" },
                      { label: "OFF", value: "off" },
                    ]}
                    size="sm"
                    value={props.dismissible !== false ? "on" : "off"}
                    onValueChange={(v) => updateProp("dismissible", v === "on")}
                  />
                </div>
              </div>
              <InlineTooltipField
                rows={2}
                variant="dark"
                value={props.text || ""}
                onChange={(v) => updateProp("text", v)}
                placeholder="Announcement text (markdown supported: **bold**, links)..."
              />
              {props.dismissible !== false && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 shrink-0">
                    ID:
                  </span>
                  <input
                    type="text"
                    value={props.id || ""}
                    onChange={(e) => updateProp("id", e.target.value)}
                    placeholder="banner id (remembers dismissed state)..."
                    className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-white/3 border border-white/8 focus:border-accent/40 rounded-lg text-neutral-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
));
BannerBlockEditor.displayName = "BannerBlockEditor";

export const BlockquoteBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number | null>(null);
  return (
          <div className="space-y-4">
            {/* Modal Image Picker for Author Avatar */}
            <ImagePicker
              isOpen={isImagePickerOpen && selectedAvatarIdx === -2}
              onClose={() => {
                setIsImagePickerOpen(false);
                setSelectedAvatarIdx(null);
              }}
              onSelectImage={(data) => {
                updateProp({
                  ...props,
                  avatar: data.src,
                });
                setSelectedAvatarIdx(null);
              }}
              currentSrc={props.avatar}
            />

            {/* Live Interactive Preview */}
            <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/8">
              <MdxBlockquote
                quote={props.quote || "Enter your quote here..."}
                author={props.author}
                role={props.role}
                cite={props.cite}
                avatar={props.avatar}
                borderStyle={props.borderStyle || "left-accent"}
              />
            </div>

            {/* Quote Text Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-accent" />
                Quote Content
              </label>
              <InlineTooltipField
                rows={3}
                value={props.quote || ""}
                onChange={(v) => updateProp("quote", v)}
                placeholder="Enter quotation text..."
              />
            </div>

            {/* Author Attribution Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  Author Name
                </label>
                <InlineTooltipField
                  as="input"
                  value={props.author || ""}
                  onChange={(v) => updateProp("author", v)}
                  placeholder="e.g. Steve Jobs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">
                    Role / Title
                  </span>
                </label>
                <InlineTooltipField
                  as="input"
                  value={props.role || ""}
                  onChange={(v) => updateProp("role", v)}
                  placeholder="e.g. Co-founder, Apple"
                />
              </div>
            </div>

            {/* Citation & Avatar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
                  Source / Citation URL
                </label>
                <input
                  type="text"
                  value={props.cite || ""}
                  onChange={(e) => updateProp("cite", e.target.value)}
                  placeholder="https://... or Book Title"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                  Author Avatar URL
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={props.avatar || ""}
                    onChange={(e) => updateProp("avatar", e.target.value)}
                    placeholder="https://... image URL"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatarIdx(-2);
                      setIsImagePickerOpen(true);
                    }}
                    title="Choose from media library"
                    className="p-2 rounded-xl bg-white/6 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  {props.avatar && (
                    <button
                      type="button"
                      onClick={() => updateProp("avatar", "")}
                      title="Clear avatar"
                      className="p-2 rounded-xl bg-white/6 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
  );
});
BlockquoteBlockEditor.displayName = "BlockquoteBlockEditor";
