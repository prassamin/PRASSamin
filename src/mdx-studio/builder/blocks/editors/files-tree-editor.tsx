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

interface FilesTreeBlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

export const FilesTreeBlockEditor: React.FC<FilesTreeBlockEditorProps> = React.memo(({ props, updateProp }) => {
  const fileTreeItems: FileTreeNode[] = Array.isArray(props.items) ? props.items : [];

  const handleAddFileTreeNode = (
    parentId: string | null,
    nodeType: "file" | "folder",
  ) => {
    const newNode: FileTreeNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: nodeType,
      name: nodeType === "folder" ? "new-folder" : "new-file.ts",
      defaultOpen: true,
      ...(nodeType === "folder" ? { children: [] } : {}),
    };

    const addRecursive = (
      nodes: FileTreeNode[],
      pId: string | null,
    ): FileTreeNode[] => {
      if (pId === null) {
        return [...nodes, newNode];
      }
      return nodes.map((node) => {
        if (node.id === pId) {
          return {
            ...node,
            children: [...(node.children || []), newNode],
            defaultOpen: true,
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addRecursive(node.children, pId),
          };
        }
        return node;
      });
    };

    updateProp("items", addRecursive(fileTreeItems, parentId));
  };

  const handleUpdateFileTreeNode = (
    targetId: string,
    updater: (node: FileTreeNode) => FileTreeNode,
  ) => {
    const updateRecursive = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === targetId) {
          return updater(node);
        }
        if (node.children) {
          return {
            ...node,
            children: updateRecursive(node.children),
          };
        }
        return node;
      });
    };

    updateProp("items", updateRecursive(fileTreeItems));
  };

  const handleDeleteFileTreeNode = (targetId: string) => {
    const deleteRecursive = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes
        .filter((node) => node.id !== targetId)
        .map((node) => {
          if (node.children) {
            return {
              ...node,
              children: deleteRecursive(node.children),
            };
          }
          return node;
        });
    };

    updateProp("items", deleteRecursive(fileTreeItems));
  };

  const renderFileTreeNode = (
    node: FileTreeNode,
    treeDepth = 0,
  ): React.ReactNode => {
    const isFolder = node.type === "folder";
    return (
      <div key={node.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-2 p-1.5 rounded-xl transition-all group/node",
            "bg-white/2.5 hover:bg-white/5 border border-white/6 hover:border-white/12",
          )}
          style={{ marginLeft: `${treeDepth * 18}px` }}
        >
          {/* Node icon */}
          <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-black/40 border border-white/5">
            {isFolder ? (
              node.defaultOpen ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-amber-400" />
              )
            ) : (
              <FileText className="w-3.5 h-3.5 text-sky-400" />
            )}
          </div>

          {/* Name input */}
          <input
            type="text"
            data-format-role="plain"
            value={node.name}
            onChange={(e) =>
              handleUpdateFileTreeNode(node.id, (n) => ({
                ...n,
                name: e.target.value,
              }))
            }
            placeholder={isFolder ? "folder-name" : "file-name.ts"}
            className={cn(
              "flex-1 min-w-30 px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono focus:outline-none transition-colors",
              isFolder
                ? "font-semibold text-amber-200 focus:border-amber-400/40"
                : "text-neutral-200 focus:border-sky-400/40",
            )}
          />

          {/* If folder: Toggle defaultOpen */}
          {isFolder && (
            <button
              type="button"
              onClick={() =>
                handleUpdateFileTreeNode(node.id, (n) => ({
                  ...n,
                  defaultOpen: !n.defaultOpen,
                }))
              }
              title={
                node.defaultOpen
                  ? "Folder open by default (click to close)"
                  : "Folder closed by default (click to open)"
              }
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-mono font-medium transition-all border cursor-pointer",
                node.defaultOpen
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-white/3 text-neutral-500 border-white/5 hover:text-neutral-300",
              )}
            >
              {node.defaultOpen ? "Open" : "Closed"}
            </button>
          )}

          {/* If folder: Add Child File / Subfolder */}
          {isFolder && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleAddFileTreeNode(node.id, "file")}
                title="Add File in this folder"
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5 text-sky-400" />
              </button>
              <button
                type="button"
                onClick={() => handleAddFileTreeNode(node.id, "folder")}
                title="Add Subfolder in this folder"
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          )}

          {/* Delete node */}
          <button
            type="button"
            onClick={() => handleDeleteFileTreeNode(node.id)}
            title={isFolder ? "Delete Folder" : "Delete File"}
            className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* If folder: Render children */}
        {isFolder && (
          <div className="space-y-1">
            {node.children && node.children.length > 0 ? (
              node.children.map((child) =>
                renderFileTreeNode(child, treeDepth + 1),
              )
            ) : (
              <div
                className="text-[11px] text-neutral-500 italic py-0.5 pl-6"
                style={{ marginLeft: `${treeDepth * 18}px` }}
              >
                Empty folder. Click + to add files.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  return (
          <div className="space-y-3">
            {/* Header action bar */}
            <div className="flex items-center justify-end px-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddFileTreeNode(null, "file")}
                  className="px-2.5 py-1 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Add File</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFileTreeNode(null, "folder")}
                  className="px-2.5 py-1 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Folder</span>
                </button>
              </div>
            </div>

            {/* Tree nodes list */}
            {fileTreeItems.length > 0 ? (
              <div className="space-y-1.5 p-2 rounded-2xl bg-black/20 border border-white/6">
                {fileTreeItems.map((item) => renderFileTreeNode(item, 0))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/1.5 space-y-2">
                <p className="text-xs text-neutral-500 m-0">
                  Empty file tree. Start by adding a folder or a file.
                </p>
              </div>
            )}
          </div>
  );
});
FilesTreeBlockEditor.displayName = "FilesTreeBlockEditor";
