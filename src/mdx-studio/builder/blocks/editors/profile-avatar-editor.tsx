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

export const ProfileBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number | null>(null);
  return (
          <div className="space-y-4">
            {/* Modal Image Picker */}
            <ImagePicker
              isOpen={isImagePickerOpen && selectedAvatarIdx === null}
              onClose={() => setIsImagePickerOpen(false)}
              onSelectImage={(data) => {
                updateProp({
                  ...props,
                  src: data.src,
                  ...(!props.name && data.alt ? { name: data.alt } : {}),
                });
              }}
              currentSrc={props.src}
            />

            {/* Live Interactive Preview */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/8 flex flex-col items-center justify-center text-center gap-2">
              <MdxProfile
                src={props.src}
                name={props.name}
                description={props.description}
                size={props.size || "md"}
                shape={props.shape || "circle"}
                bordered={props.bordered !== false}
                color={props.color || "default"}
                href={props.href}
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Display Name</span>
                </label>
                <input
                  type="text"
                  value={props.name || ""}
                  onChange={(e) => updateProp("name", e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Role / Bio</span>
                </label>
                <input
                  type="text"
                  value={props.description || ""}
                  onChange={(e) => updateProp("description", e.target.value)}
                  placeholder="e.g. Software Engineer & Designer"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Avatar Photo</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatarIdx(null);
                      setIsImagePickerOpen(true);
                    }}
                    className="text-[11px] text-accent hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Browse / Upload</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={props.src || ""}
                    onChange={(e) => updateProp("src", e.target.value)}
                    placeholder="https://... or choose from media"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {props.src && (
                    <button
                      type="button"
                      onClick={() => updateProp("src", "")}
                      title="Clear photo"
                      className="p-2 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Profile Link (optional)</span>
                </label>
                <input
                  type="text"
                  value={props.href || ""}
                  onChange={(e) => updateProp("href", e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>
          </div>
  );
});
ProfileBlockEditor.displayName = "ProfileBlockEditor";

export const AvatarGroupBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number | null>(null);
            const avatarItems: Array<{
              name?: string;
              src?: string;
              href?: string;
            }> = Array.isArray(props.items) ? props.items : [];

            const handleAddAvatarItem = () => {
              const next = [
                ...avatarItems,
                {
                  name: `User ${avatarItems.length + 1}`,
                  src: "",
                  href: "",
                },
              ];
              updateProp("items", next);
            };

            const handleUpdateAvatarItem = (
              index: number,
              key: string,
              val: string,
            ) => {
              const next = [...avatarItems];
              next[index] = { ...next[index], [key]: val };
              updateProp("items", next);
            };

            const handleRemoveAvatarItem = (index: number) => {
              updateProp(
                "items",
                avatarItems.filter((_, i) => i !== index),
              );
            };

            return (
              <div className="space-y-4">
                <ImagePicker
                  isOpen={isImagePickerOpen && selectedAvatarIdx !== null}
                  onClose={() => {
                    setIsImagePickerOpen(false);
                    setSelectedAvatarIdx(null);
                  }}
                  onSelectImage={(data) => {
                    if (selectedAvatarIdx !== null) {
                      const next = [...avatarItems];
                      next[selectedAvatarIdx] = {
                        ...next[selectedAvatarIdx],
                        src: data.src,
                        ...(!next[selectedAvatarIdx]?.name && data.alt
                          ? { name: data.alt }
                          : {}),
                      };
                      updateProp("items", next);
                    }
                    setIsImagePickerOpen(false);
                    setSelectedAvatarIdx(null);
                  }}
                  currentSrc={
                    selectedAvatarIdx !== null
                      ? avatarItems[selectedAvatarIdx]?.src
                      : undefined
                  }
                />

                {/* Live Interactive Preview */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/8 flex flex-col gap-2 w-full">
                  <MdxAvatarGroup
                    items={avatarItems}
                    max={props.max}
                    size={props.size || "md"}
                    shape={props.shape || "circle"}
                    bordered={props.bordered !== false}
                    align={props.align || "left"}
                  />
                </div>

                {/* Avatars List Header */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    <span>Avatars ({avatarItems.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAvatarItem}
                    className="px-2.5 py-1 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-violet-400" />
                    <span>Add Avatar</span>
                  </button>
                </div>

                {/* Avatars Items (Rendered in reverse order so latest avatar input appears at the top) */}
                <div className="space-y-2">
                  {avatarItems
                    .slice()
                    .reverse()
                    .map((item, revIdx) => {
                      const actualIdx = avatarItems.length - 1 - revIdx;
                      return (
                        <div
                          key={actualIdx}
                          className="p-2.5 rounded-xl bg-white/2 border border-white/6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 group hover:border-white/15 transition-colors"
                        >
                          {/* Thumbnail preview / Image picker trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAvatarIdx(actualIdx);
                              setIsImagePickerOpen(true);
                            }}
                            title="Choose avatar image"
                            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border border-white/15 overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                          >
                            {item.src ? (
                              <img
                                src={item.src}
                                alt={item.name || "Avatar"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-semibold text-neutral-400 font-mono">
                                {item.name ? (
                                  item.name.slice(0, 2).toUpperCase()
                                ) : (
                                  <User className="w-3.5 h-3.5" />
                                )}
                              </span>
                            )}
                          </button>

                          {/* Name input */}
                          <input
                            type="text"
                            value={item.name || ""}
                            onChange={(e) =>
                              handleUpdateAvatarItem(
                                actualIdx,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="Name"
                            className="px-2.5 py-1.5 text-xs rounded-lg bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 sm:w-36 transition-colors"
                          />

                          {/* Image URL input */}
                          <div className="flex-1 flex items-center gap-1">
                            <input
                              type="text"
                              value={item.src || ""}
                              onChange={(e) =>
                                handleUpdateAvatarItem(
                                  actualIdx,
                                  "src",
                                  e.target.value,
                                )
                              }
                              placeholder="Image URL or pick from media"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAvatarIdx(actualIdx);
                                setIsImagePickerOpen(true);
                              }}
                              title="Pick from media library"
                              className="p-1.5 rounded-lg bg-white/4 hover:bg-white/8 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                            >
                              <ImageIcon className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Link URL input */}
                          <input
                            type="text"
                            value={item.href || ""}
                            onChange={(e) =>
                              handleUpdateAvatarItem(
                                actualIdx,
                                "href",
                                e.target.value,
                              )
                            }
                            placeholder="Link URL (optional)"
                            className="px-2.5 py-1.5 text-xs rounded-lg bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 sm:w-36 transition-colors"
                          />

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveAvatarItem(actualIdx)}
                            title="Remove avatar"
                            className="p-1.5 rounded-lg bg-white/2 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                  {avatarItems.length === 0 && (
                    <div className="text-center py-5 border border-dashed border-white/10 rounded-xl bg-white/1.5">
                      <p className="text-xs text-neutral-500 m-0">
                        No avatars yet. Click &quot;Add Avatar&quot; to add one.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
});
AvatarGroupBlockEditor.displayName = "AvatarGroupBlockEditor";
