"use client";

import React from "react";
import {
  LuHeading,
  LuAlignLeft,
  LuList,
  LuMinus,
  LuLightbulb,
  LuCreditCard,
  LuLayers,
  LuCircleHelp,
  LuListOrdered,
  LuTag,
  LuMegaphone,
  LuCode,
  LuCodeXml,
  LuImage,
  LuTable,
  LuTableProperties,
  LuFolderTree,
  LuCircleUser,
  LuUser,
  LuUsers,
  LuQuote,
  LuCornerDownLeft,
  LuTerminal,
  LuBlocks,
  LuCopyPlus,
} from "react-icons/lu";
import { MdxBlockType } from "../types";

/**
 * Icons rendered in the left Component Tray sidebar.
 */
export const TRAY_ICONS: Record<MdxBlockType, React.ReactNode> = {
  heading: <LuHeading className="w-4 h-4 text-sky-400" />,
  paragraph: <LuAlignLeft className="w-4 h-4 text-neutral-300" />,
  list: <LuList className="w-4 h-4 text-emerald-400" />,
  divider: <LuMinus className="w-4 h-4 text-neutral-400" />,
  callout: <LuLightbulb className="w-4 h-4 text-accent" />,
  card: <LuCreditCard className="w-4 h-4 text-emerald-400" />,
  cards: <LuLayers className="w-4 h-4 text-emerald-400" />,
  accordion: <LuCircleHelp className="w-4 h-4 text-purple-400" />,
  steps: <LuListOrdered className="w-4 h-4 text-orange-400" />,
  tabs: <LuLayers className="w-4 h-4 text-amber-400" />,
  chipGroup: <LuTag className="w-4 h-4 text-rose-400" />,
  banner: <LuMegaphone className="w-4 h-4 text-pink-400" />,
  code: <LuCode className="w-4 h-4 text-amber-400" />,
  image: <LuImage className="w-4 h-4 text-blue-400" />,
  table: <LuTable className="w-4 h-4 text-teal-400" />,
  typeTable: <LuTableProperties className="w-4 h-4 text-emerald-400" />,
  files: <LuFolderTree className="w-4 h-4 text-amber-400" />,
  avatar: <LuUsers className="w-4 h-4 text-violet-400" />,
  profile: <LuCircleUser className="w-4 h-4 text-cyan-400" />,
  blockquote: <LuQuote className="w-4 h-4 text-emerald-400" />,
  break: <LuCornerDownLeft className="w-4 h-4 text-neutral-400" />,
  codeBlockTabs: <LuTerminal className="w-4 h-4 text-cyan-400" />,
  template: <LuBlocks className="w-4 h-4 text-indigo-400" />,
  useTemplate: <LuCopyPlus className="w-4 h-4 text-fuchsia-400" />,
  user: <LuCircleUser className="w-4 h-4 text-sky-400" />,
  html: <LuCodeXml className="w-4 h-4 text-pink-400" />,
};

/**
 * Icons rendered in each Canvas Block Item header bar.
 */
export const BLOCK_ICONS: Record<MdxBlockType, React.ReactNode> = {
  heading: <LuHeading className="w-3.5 h-3.5 text-sky-400" />,
  paragraph: <LuAlignLeft className="w-3.5 h-3.5 text-neutral-300" />,
  divider: <LuMinus className="w-3.5 h-3.5 text-neutral-400" />,
  callout: <LuLightbulb className="w-3.5 h-3.5 text-accent" />,
  card: <LuCreditCard className="w-3.5 h-3.5 text-emerald-400" />,
  cards: <LuLayers className="w-3.5 h-3.5 text-emerald-400" />,
  accordion: <LuCircleHelp className="w-3.5 h-3.5 text-purple-400" />,
  steps: <LuListOrdered className="w-3.5 h-3.5 text-orange-400" />,
  tabs: <LuLayers className="w-3.5 h-3.5 text-amber-400" />,
  chipGroup: <LuTag className="w-3.5 h-3.5 text-rose-400" />,
  banner: <LuMegaphone className="w-3.5 h-3.5 text-pink-400" />,
  code: <LuCodeXml className="w-3.5 h-3.5 text-amber-400" />,
  image: <LuImage className="w-3.5 h-3.5 text-blue-400" />,
  table: <LuTable className="w-3.5 h-3.5 text-teal-400" />,
  typeTable: <LuTableProperties className="w-3.5 h-3.5 text-emerald-400" />,
  files: <LuFolderTree className="w-3.5 h-3.5 text-amber-400" />,
  avatar: <LuUsers className="w-3.5 h-3.5 text-violet-400" />,
  profile: <LuCircleUser className="w-3.5 h-3.5 text-cyan-400" />,
  blockquote: <LuQuote className="w-3.5 h-3.5 text-emerald-400" />,
  break: <LuCornerDownLeft className="w-3.5 h-3.5 text-neutral-400" />,
  list: <LuList className="w-3.5 h-3.5 text-emerald-400" />,
  codeBlockTabs: <LuTerminal className="w-3.5 h-3.5 text-cyan-400" />,
  template: <LuBlocks className="w-3.5 h-3.5 text-indigo-400" />,
  useTemplate: <LuCopyPlus className="w-3.5 h-3.5 text-fuchsia-400" />,
  user: <LuUser className="w-3.5 h-3.5 text-sky-400" />,
  html: <LuCodeXml className="w-3.5 h-3.5 text-pink-400" />,
};

/**
 * Display titles rendered in each Canvas Block Item header bar.
 */
export const BLOCK_TITLES: Record<MdxBlockType, string> = {
  heading: "Heading",
  paragraph: "Text Paragraph",
  divider: "Divider",
  callout: "Callout Alert",
  card: "Card",
  cards: "Cards Group",
  accordion: "Accordion / FAQ",
  steps: "Steps Guide",
  tabs: "Tabs Container",
  chipGroup: "Tag Badges",
  banner: "Announcement Banner",
  code: "Code Snippet",
  image: "Image Embed",
  table: "Table",
  typeTable: "Type Table",
  files: "Files Tree",
  avatar: "Avatar Group",
  profile: "Profile Card",
  blockquote: "Blockquote",
  break: "Line Break",
  list: "List / Checklist",
  codeBlockTabs: "Code Tabs",
  template: "Template Definition",
  useTemplate: "Use Template",
  user: "Inline User",
  html: "Custom HTML / JSX",
};

/**
 * Inline-only components cannot sit independently at root or in tabs;
 * they belong inside an `<Template inline>` definition.
 */
const INLINE_ONLY_BLOCKS = new Set<MdxBlockType>(["user"]);

export function isInlineOnlyBlock(blockType: MdxBlockType): boolean {
  return INLINE_ONLY_BLOCKS.has(blockType);
}

export function canDropBlockInTab(
  blockType: MdxBlockType,
  insideTemplate: boolean,
): boolean {
  return (
    blockType !== "tabs" &&
    blockType !== "template" &&
    !INLINE_ONLY_BLOCKS.has(blockType) &&
    !(insideTemplate && blockType === "useTemplate")
  );
}

export function canDropBlockInTemplate(blockType: MdxBlockType): boolean {
  return blockType !== "template" && blockType !== "useTemplate";
}
