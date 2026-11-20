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

interface ImageBlockEditorProps {
  props: Record<string, any>;
  updateProp: (keyOrPatch: string | Record<string, any>, value?: any) => void;
}

export const ImageBlockEditor: React.FC<ImageBlockEditorProps> = React.memo(({ props, updateProp }) => {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  return (
          <div className="space-y-3">
            {/* Modal Image Picker */}
            <ImagePicker
              isOpen={isImagePickerOpen}
              onClose={() => setIsImagePickerOpen(false)}
              onSelectImage={(data) => {
                updateProp({
                  ...props,
                  src: data.src,
                  ...(!props.alt && data.alt ? { alt: data.alt } : {}),
                });
              }}
              currentSrc={props.src}
            />

            {/* Launcher & Preview */}
            {!props.src ? (
              <div
                onClick={() => setIsImagePickerOpen(true)}
                className="border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 hover:bg-white/2 transition-all group select-none"
              >
                <div className="p-3 rounded-2xl bg-white/4 border border-white/10 text-neutral-300 group-hover:scale-105 group-hover:text-accent transition-all mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-white">
                  Choose or Upload Image
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5 max-w-xs">
                  Select from existing media library or upload a new file from
                  your device
                </span>
                <button
                  type="button"
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-accent text-neutral-950 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Open Image Picker</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/15 overflow-hidden bg-neutral-950/80 group/img relative">
                {/* Image display */}
                <div className="relative aspect-video max-h-56 w-full bg-black/60 overflow-hidden flex items-center justify-center">
                  <img
                    src={props.src}
                    alt={props.alt || "Preview"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Info bar & Actions */}
                <div className="flex items-center justify-between p-3 bg-white/2 border-t border-white/8">
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <div className="p-1 rounded-md bg-accent/10 text-accent">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className="text-xs font-mono text-neutral-300 truncate"
                      title={props.src}
                    >
                      {props.src.split("/").pop()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsImagePickerOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProp("src", "")}
                      className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alt & Caption Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                type="text"
                value={props.alt || ""}
                onChange={(e) => updateProp("alt", e.target.value)}
                placeholder="Alt description (for accessibility)..."
                className="w-full text-xs bg-white/3 9.5 border border-white/10 text-white"
              />
              <Input
                type="text"
                value={props.caption || ""}
                onChange={(e) => updateProp("caption", e.target.value)}
                placeholder="Caption text (optional)..."
                className="w-full text-xs bg-white/3 9.5 border border-white/10 text-white"
              />
            </div>
          </div>
  );
});
ImageBlockEditor.displayName = "ImageBlockEditor";
