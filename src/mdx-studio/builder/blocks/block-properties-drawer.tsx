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
} from "../types";
import { LuList, LuListOrdered, LuListTodo, LuCheck } from "react-icons/lu";
import { createBlock, extractTemplateVariables } from "../compiler";
import { cn } from "@heroui/react";
import { DropIndicator } from "../components/drop-indicator";
import { ImagePicker } from "@/components/image-picker";
import { InlineTooltipField } from "../components/inline-tooltip-field";
import { Input } from "@heroui/react";
import { MdxChip } from "@/mdx-components";
import { MdxAvatarGroup } from "@/components/mdx/mdx-avatar";
import { MdxProfile } from "@/components/mdx/mdx-profile";
import { MdxUser } from "@/components/mdx/mdx-user";
import { MdxBlockquote } from "@/components/mdx/mdx-blockquote";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { canDropBlockInTab, canDropBlockInTemplate } from "./registry";

interface BlockPropertiesDrawerProps {
  showStyles: boolean;
  type: MdxBlockType;
  props: Record<string, any>;
  updateProp: (keyOrPatch: string | Record<string, any>, value?: any) => void;
}

export const BlockPropertiesDrawer: React.FC<BlockPropertiesDrawerProps> = React.memo(({
  showStyles,
  type,
  props,
  updateProp,
}) => {
  return (
    <AnimatePresence initial={false}>
        {showStyles && (
          <motion.div
            key="block-properties-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white/3 border-b border-white/6 select-none"
          >
            <div className="px-4 py-2.5 text-xs">
              {/* Heading Properties (Level is in main block; Alignment, Style, and Anchor ID are here) */}
              {type === "heading" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Align:
                    </span>
                    <SegmentedControl
                      options={[
                        {
                          label: <AlignLeft className="w-3 h-3" />,
                          value: "left",
                        },
                        {
                          label: <AlignCenter className="w-3 h-3" />,
                          value: "center",
                        },
                        {
                          label: <AlignRight className="w-3 h-3" />,
                          value: "right",
                        },
                      ]}
                      size="sm"
                      defaultValue={"left"}
                      value={props.align}
                      onValueChange={(value) => updateProp("align", value)}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateProp("isItalic", !props.isItalic)}
                      title="Toggle Italic"
                      className={cn(
                        "p-1 rounded text-xs transition-colors",
                        props.isItalic
                          ? "bg-accent/20 text-accent border border-accent/40"
                          : "bg-white/4 text-neutral-400 hover:text-white",
                      )}
                    >
                      <Italic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Paragraph Properties */}
              {type === "paragraph" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Size:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "Small", value: "sm" },
                        { label: "Base", value: "base" },
                        { label: "Large", value: "lg" },
                        { label: "Lead", value: "xl" },
                      ]}
                      size="sm"
                      defaultValue={"base"}
                      value={props.fontSize}
                      onValueChange={(value) => updateProp("fontSize", value)}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Align:
                    </span>
                    <SegmentedControl
                      options={[
                        {
                          label: <AlignLeft className="w-3 h-3" />,
                          value: "left",
                        },
                        {
                          label: <AlignCenter className="w-3 h-3" />,
                          value: "center",
                        },
                        {
                          label: <AlignRight className="w-3 h-3" />,
                          value: "right",
                        },
                      ]}
                      size="sm"
                      defaultValue={"left"}
                      value={props.align}
                      onValueChange={(value) => updateProp("align", value)}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateProp("isBold", !props.isBold)}
                      title="Toggle Bold"
                      className={cn(
                        "p-1 rounded text-xs transition-colors",
                        props.isBold
                          ? "bg-accent/20 text-accent font-bold"
                          : "bg-white/4 text-neutral-400 hover:text-white",
                      )}
                    >
                      <Bold className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProp("isItalic", !props.isItalic)}
                      title="Toggle Italic"
                      className={cn(
                        "p-1 rounded text-xs transition-colors",
                        props.isItalic
                          ? "bg-accent/20 text-accent"
                          : "bg-white/4 text-neutral-400 hover:text-white",
                      )}
                    >
                      <Italic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Code Block Properties (Language and Title are in the main block; Line Numbers, Highlight, and Wrap are here) */}
              {type === "code" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Line Numbers:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "ON", value: "on" },
                        { label: "OFF", value: "off" },
                      ]}
                      size="sm"
                      value={props.showLineNumbers ? "on" : "off"}
                      onValueChange={(val) =>
                        updateProp("showLineNumbers", val === "on")
                      }
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Wrap Lines:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "ON", value: "on" },
                        { label: "OFF", value: "off" },
                      ]}
                      size="sm"
                      value={props.wrapLines ? "on" : "off"}
                      onValueChange={(val) =>
                        updateProp("wrapLines", val === "on")
                      }
                    />
                  </div>
                </div>
              )}

              {/* Image Properties */}
              {type === "image" && (
                <div className="space-y-2.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Size:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "100%", value: "full" },
                          { label: "75%", value: "lg" },
                          { label: "50%", value: "md" },
                          { label: "33%", value: "sm" },
                          { label: "Custom", value: "custom" },
                        ]}
                        size="sm"
                        value={props.size || "full"}
                        onValueChange={(val) => {
                          if (val !== "custom") {
                            updateProp({
                              ...props,
                              size: val,
                              width: "",
                              height: "",
                            });
                          } else {
                            updateProp("size", val);
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Align:
                      </span>
                      <SegmentedControl
                        options={[
                          {
                            label: <AlignLeft className="w-3 h-3" />,
                            value: "left",
                          },
                          {
                            label: <AlignCenter className="w-3 h-3" />,
                            value: "center",
                          },
                          {
                            label: <AlignRight className="w-3 h-3" />,
                            value: "right",
                          },
                        ]}
                        size="sm"
                        defaultValue="center"
                        value={props.align || "center"}
                        onValueChange={(value) => updateProp("align", value)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Zoomable:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "ON", value: "on" },
                          { label: "OFF", value: "off" },
                        ]}
                        size="sm"
                        value={props.zoomable ? "on" : "off"}
                        onValueChange={(val) =>
                          updateProp("zoomable", val === "on")
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 border-t border-white/6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Aspect:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "Auto", value: "auto" },
                          { label: "16:9", value: "16/9" },
                          { label: "4:3", value: "4/3" },
                          { label: "1:1", value: "1/1" },
                          { label: "21:9", value: "21/9" },
                        ]}
                        size="sm"
                        value={props.aspectRatio || "auto"}
                        onValueChange={(val) => updateProp("aspectRatio", val)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Fit:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "Cover", value: "cover" },
                          { label: "Contain", value: "contain" },
                        ]}
                        size="sm"
                        value={props.objectFit || "cover"}
                        onValueChange={(val) => updateProp("objectFit", val)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Radius:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "None", value: "none" },
                          { label: "MD", value: "md" },
                          { label: "XL", value: "xl" },
                          { label: "2XL", value: "2xl" },
                          { label: "Full", value: "full" },
                        ]}
                        size="sm"
                        value={props.rounded || "md"}
                        onValueChange={(val) => updateProp("rounded", val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 border-t border-white/6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 shrink-0">
                        Width:
                      </span>
                      <Input
                        type="number"
                        min={1}
                        value={props.width || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateProp({
                            ...props,
                            width: val ? Number(val) : "",
                            ...(val ? { size: "custom" } : {}),
                          });
                        }}
                        placeholder="Auto (px)"
                        className="w-full text-xs bg-white/3 h-8 border border-white/10 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 shrink-0">
                        Height:
                      </span>
                      <Input
                        type="number"
                        min={1}
                        value={props.height || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateProp({
                            ...props,
                            height: val ? Number(val) : "",
                            ...(val ? { size: "custom" } : {}),
                          });
                        }}
                        placeholder="Auto (px)"
                        className="w-full text-xs bg-white/3 h-8 border border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Divider Properties */}
              {type === "divider" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Line Style:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "Solid", value: "solid" },
                        { label: "Dashed", value: "dashed" },
                        { label: "Dotted", value: "dotted" },
                      ]}
                      size="sm"
                      defaultValue={"solid"}
                      value={props.style}
                      onValueChange={(value) => updateProp("style", value)}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Vertical Spacing:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "Small", value: "sm" },
                        { label: "Normal", value: "md" },
                        { label: "Large", value: "lg" },
                      ]}
                      size="sm"
                      defaultValue={"md"}
                      value={props.spacing}
                      onValueChange={(value) => updateProp("spacing", value)}
                    />
                  </div>
                </div>
              )}

              {/* Accordion Properties */}
              {type === "accordion" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Expansion Mode:
                    </span>
                    <SegmentedControl
                      options={["Single", "Multiple"]}
                      value={
                        props.allowMultiple === false ? "single" : "multiple"
                      }
                      size="sm"
                      onValueChange={(value) =>
                        updateProp("allowMultiple", value === "multiple")
                      }
                    />
                  </div>
                </div>
              )}

              {/* Tabs Properties (Active tab switching is already in the main tab bar; Sync Group ID is here) */}
              {type === "tabs" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Sync Group ID:
                    </span>
                    <input
                      type="text"
                      data-format-role="plain"
                      value={props.groupId || ""}
                      onChange={(e) => updateProp("groupId", e.target.value)}
                      placeholder="e.g. package-manager"
                      className="px-2 py-0.5 text-xs bg-white/4 border border-white/10 rounded-md text-white focus:outline-none focus:border-accent font-mono w-48"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    Syncs tab choice across other tab blocks with the same Group
                    ID
                  </span>
                </div>
              )}

              {/* 10. Chip Group Properties (Color is in the main block; Variant and Size are here) */}
              {type === "chipGroup" && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Variant:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "Soft", value: "soft" },
                        { label: "Outline", value: "outline" },
                        { label: "Solid", value: "solid" },
                        { label: "Ghost", value: "ghost" },
                      ]}
                      size="sm"
                      defaultValue="soft"
                      value={
                        props.variant === "secondary"
                          ? "outline"
                          : props.variant === "primary"
                            ? "solid"
                            : props.variant === "tertiary"
                              ? "ghost"
                              : props.variant || "soft"
                      }
                      onValueChange={(v) => updateProp("variant", v)}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Size:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "SM", value: "sm" },
                        { label: "MD", value: "md" },
                      ]}
                      size="sm"
                      defaultValue="sm"
                      value={props.size || "sm"}
                      onValueChange={(sz) => updateProp("size", sz)}
                    />
                  </div>
                </div>
              )}

              {/* 1Profile Card Properties */}
              {type === "profile" && (
                <div className="space-y-3 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Size:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "SM", value: "sm" },
                          { label: "MD", value: "md" },
                          { label: "LG", value: "lg" },
                          { label: "XL", value: "xl" },
                        ]}
                        size="sm"
                        defaultValue="md"
                        value={props.size || "md"}
                        onValueChange={(sz) => updateProp("size", sz)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Shape:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "Circle", value: "circle" },
                          { label: "Square", value: "square" },
                        ]}
                        size="sm"
                        defaultValue="circle"
                        value={props.shape || "circle"}
                        onValueChange={(sh) => updateProp("shape", sh)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Ring Color:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "Default", value: "default" },
                          { label: "Accent", value: "accent" },
                          { label: "Sky", value: "sky" },
                          { label: "Emerald", value: "emerald" },
                          { label: "Amber", value: "amber" },
                          { label: "Rose", value: "rose" },
                        ]}
                        size="sm"
                        defaultValue="default"
                        value={props.color || "default"}
                        onValueChange={(cl) => updateProp("color", cl)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Border:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateProp(
                            "bordered",
                            props.bordered === false ? true : false,
                          )
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                          props.bordered !== false
                            ? "bg-accent/20 border-accent/40 text-accent"
                            : "bg-white/4 border-white/10 text-neutral-400",
                        )}
                      >
                        {props.bordered !== false ? "Bordered" : "No Border"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Avatar Group (Contributors) Properties */}
              {type === "avatar" && (
                <div className="space-y-3 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Size:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "SM", value: "sm" },
                          { label: "MD", value: "md" },
                          { label: "LG", value: "lg" },
                        ]}
                        size="sm"
                        defaultValue="md"
                        value={props.size || "md"}
                        onValueChange={(sz) => updateProp("size", sz)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Max:
                      </span>
                      <SegmentedControl
                        options={
                          [
                            { label: "3", value: "3" },
                            { label: "5", value: "5" },
                            { label: "8", value: "8" },
                            { label: "12", value: "12" },
                            { label: "∞", value: "infinity" },
                          ] as const
                        }
                        size="sm"
                        value={
                          props.max === undefined ||
                          props.max === Infinity ||
                          props.max === "infinity" ||
                          props.max === "∞"
                            ? "infinity"
                            : (String(props.max) as
                                | "3"
                                | "5"
                                | "8"
                                | "12"
                                | "infinity")
                        }
                        onValueChange={(m) =>
                          updateProp(
                            "max",
                            m === "infinity" ? Infinity : Number(m),
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Shape:
                      </span>
                      <SegmentedControl
                        options={[
                          { label: "Circle", value: "circle" },
                          { label: "Square", value: "square" },
                        ]}
                        size="sm"
                        defaultValue="circle"
                        value={props.shape || "circle"}
                        onValueChange={(sh) => updateProp("shape", sh)}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        Align:
                      </span>
                      <SegmentedControl
                        options={[
                          {
                            label: <AlignLeft className="w-3 h-3" />,
                            value: "left",
                          },
                          {
                            label: <AlignCenter className="w-3 h-3" />,
                            value: "center",
                          },
                          {
                            label: <AlignRight className="w-3 h-3" />,
                            value: "right",
                          },
                        ]}
                        size="sm"
                        defaultValue="left"
                        value={props.align || "left"}
                        onValueChange={(al) => updateProp("align", al)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 1Blockquote Properties */}
              {type === "blockquote" && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Style:
                    </span>
                    <SegmentedControl
                      options={[
                        { label: "Left Accent", value: "left-accent" },
                        { label: "Left Subtle", value: "left-subtle" },
                        { label: "Card", value: "card" },
                        { label: "Minimal", value: "minimal" },
                      ]}
                      size="sm"
                      defaultValue="left-accent"
                      value={props.borderStyle || "left-accent"}
                      onValueChange={(s) => updateProp("borderStyle", s)}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  );
});
BlockPropertiesDrawer.displayName = "BlockPropertiesDrawer";
