"use client";

import React, { useState, useRef } from "react";
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Lightbulb,
  CreditCard,
  Layers,
  Code2,
  Image as ImageIcon,
  Tag,
  Megaphone,
  HelpCircle,
  ListOrdered,
  SlidersHorizontal,
  Bold,
  Italic,
  Type,
  RefreshCw,
  ZoomIn,
  Highlighter,
  Eye,
  AlertCircle,
  AlertTriangle,
  WholeWord,
  Wand2,
  Table as TableIcon,
  TableProperties,
  FolderTree,
  Folder,
  FolderOpen,
  FolderPlus,
  FileText,
  FilePlus,
  CircleUser,
  User,
  Users,
  UserPlus,
  Link as LinkIcon,
  Quote,
  CornerDownLeft,
} from "lucide-react";
import {
  MdxBlock,
  MdxBlockType,
  TypeTableProperty,
  FileTreeNode,
  ListType,
  ListItem,
} from "../types";
import { LuList, LuListOrdered, LuListTodo, LuCheck } from "react-icons/lu";
import { createBlock } from "../compiler";
import { cn } from "@heroui/react";
import { DropIndicator } from "./DropIndicator";
import { ImagePicker } from "@/components/ImagePicker";
import { InlineTooltipField } from "./InlineTooltipField";
import { Input } from "@heroui/react";
import { MdxChip } from "@/mdx-components";
import { MdxAvatar, MdxAvatarGroup } from "@/components/MdxAvatar";
import { MdxProfile } from "@/components/MdxProfile";
import { MdxBlockquote } from "@/components/MdxBlockquote";
import { HeroSelect } from "../../components/HeroSelect";
import { motion, AnimatePresence } from "motion/react";
import { SegmentedControl } from "@/components/SegmentedControl";

const CODE_LANGUAGES = [
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Bash / Shell", value: "bash" },
  { label: "HTML", value: "html" },
  { label: "CSS / Tailwind", value: "css" },
  { label: "JSON", value: "json" },
  { label: "SQL", value: "sql" },
  { label: "Markdown", value: "markdown" },
];

interface CanvasBlockItemProps {
  block: MdxBlock;
  index: number;
  totalBlocks: number;
  onUpdateProps: (id: string, props: Record<string, any>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  depth?: number;
  onNestedDragChange?: (active: boolean) => void;
}

const BLOCK_ICONS: Record<MdxBlockType, React.ReactNode> = {
  heading: <Heading className="w-3.5 h-3.5 text-sky-400" />,
  paragraph: <AlignLeft className="w-3.5 h-3.5 text-neutral-300" />,
  divider: <Minus className="w-3.5 h-3.5 text-neutral-400" />,
  callout: <Lightbulb className="w-3.5 h-3.5 text-accent" />,
  card: <CreditCard className="w-3.5 h-3.5 text-emerald-400" />,
  accordion: <HelpCircle className="w-3.5 h-3.5 text-purple-400" />,
  steps: <ListOrdered className="w-3.5 h-3.5 text-orange-400" />,
  tabs: <Layers className="w-3.5 h-3.5 text-amber-400" />,
  chipGroup: <Tag className="w-3.5 h-3.5 text-rose-400" />,
  banner: <Megaphone className="w-3.5 h-3.5 text-pink-400" />,
  code: <Code2 className="w-3.5 h-3.5 text-amber-400" />,
  image: <ImageIcon className="w-3.5 h-3.5 text-blue-400" />,
  table: <TableIcon className="w-3.5 h-3.5 text-teal-400" />,
  typeTable: <TableProperties className="w-3.5 h-3.5 text-emerald-400" />,
  files: <FolderTree className="w-3.5 h-3.5 text-amber-400" />,
  avatar: <Users className="w-3.5 h-3.5 text-violet-400" />,
  profile: <CircleUser className="w-3.5 h-3.5 text-cyan-400" />,
  blockquote: <Quote className="w-3.5 h-3.5 text-emerald-400" />,
  break: <CornerDownLeft className="w-3.5 h-3.5 text-neutral-400" />,
  list: <LuList className="w-3.5 h-3.5 text-emerald-400" />,
};

const BLOCK_TITLES: Record<MdxBlockType, string> = {
  heading: "Heading",
  paragraph: "Text Paragraph",
  divider: "Divider",
  callout: "Callout Alert",
  card: "Card",
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
};

export const CanvasBlockItem: React.FC<CanvasBlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdateProps,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  depth = 0,
  onNestedDragChange,
}) => {
  const { id, type, props } = block;

  const updateProp = (key: string, value: any) => {
    onUpdateProps(id, { ...props, [key]: value });
  };

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isTabDropActive, setIsTabDropActive] = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number | null>(
    null,
  );
  const [nestedDropIndicator, setNestedDropIndicator] = useState<{
    index: number;
    position: "top" | "bottom";
  } | null>(null);

  // Code Block Shiki Tools helpers
  const codeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [hasSelectedCodeWord, setHasSelectedCodeWord] = useState(false);
  const [codeSelection, setCodeSelection] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });

  const syncCodeWordSelection = () => {
    const textarea = codeTextareaRef.current;
    if (!textarea) {
      setHasSelectedCodeWord(false);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setCodeSelection({ start, end });
    const selected = (textarea.value || "").substring(start, end).trim();
    setHasSelectedCodeWord(
      Boolean(selected && !selected.includes("\n") && selected.length < 50),
    );
  };

  // Determine which Shiki notations are active on the currently selected line(s)
  const activeNotations = React.useMemo(() => {
    const currentCode = props.code || "";
    const lines = currentCode.split("\n");
    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;
    const { start, end } = codeSelection;

    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length;
      const lineEnd = currentPos + lineLen;
      if (currentPos <= start && start <= lineEnd) {
        startLine = i;
      }
      if (currentPos <= end && end <= lineEnd) {
        endLine = i;
        break;
      }
      currentPos = lineEnd + 1;
    }

    const active = new Set<string>();
    for (let i = startLine; i <= endLine; i++) {
      const line = lines[i] || "";
      if (line.includes("[!code highlight]")) active.add("highlight");
      if (line.includes("[!code ++]")) active.add("++");
      if (line.includes("[!code --]")) active.add("--");
      if (line.includes("[!code focus]")) active.add("focus");
      if (line.includes("[!code error]")) active.add("error");
      if (line.includes("[!code warning]")) active.add("warning");
      if (/\[!code\s+word:[^\]]+\]/.test(line)) active.add("word");
    }
    return active;
  }, [props.code, codeSelection]);

  const getAutoCommentPrefix = (lang?: string): string => {
    const l = (lang || "").toLowerCase();
    if (["jsx", "tsx"].includes(l)) {
      return "{/* */}";
    }
    if (["sql"].includes(l)) {
      return "--";
    }
    if (
      [
        "python",
        "py",
        "bash",
        "sh",
        "shell",
        "yaml",
        "yml",
        "dockerfile",
        "ruby",
        "rb",
      ].includes(l)
    ) {
      return "#";
    }
    if (["html", "xml", "svg", "markdown", "md"].includes(l)) {
      return "<!-- -->";
    }
    return "//";
  };

  const insertShikiNotation = (notation: string) => {
    const textarea = codeTextareaRef.current;
    const currentCode = props.code || "";
    const prefix = getAutoCommentPrefix(props.language);

    let start = 0;
    let end = 0;
    if (textarea) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }

    const selectedText = currentCode.substring(start, end).trim();

    let actualNotation = notation;
    if (notation === "word") {
      if (
        selectedText &&
        !selectedText.includes("\n") &&
        selectedText.length < 50
      ) {
        actualNotation = `word:${selectedText}`;
      } else if (activeNotations.has("word")) {
        actualNotation = "word:";
      } else {
        return;
      }
    }

    const commentTag =
      prefix === "<!-- -->"
        ? `<!-- [!code ${actualNotation}] -->`
        : prefix === "{/* */}"
          ? `{/* [!code ${actualNotation}] */}`
          : `${prefix} [!code ${actualNotation}]`;

    const lines = currentCode.split("\n");
    let currentPos = 0;
    let startLine = 0;
    let startCol = 0;
    let endLine = 0;
    let endCol = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length;
      const lineEnd = currentPos + lineLen;
      if (currentPos <= start && start <= lineEnd) {
        startLine = i;
        startCol = start - currentPos;
      }
      if (currentPos <= end && end <= lineEnd) {
        endLine = i;
        endCol = end - currentPos;
        break;
      }
      currentPos = lineEnd + 1;
    }

    const ANY_NOTATION_REGEX =
      /\s*(?:\/\/|--|#|\/\*|<!--|\{\/\*)\s*\[!code\s+[^\]]+\](?:\s*\*\/|-->|\*\/\}|\s*)?$/;

    const newLines = [...lines];
    for (let i = startLine; i <= endLine; i++) {
      const line = newLines[i];
      const hasExact =
        actualNotation === "word:"
          ? /\[!code\s+word:[^\]]+\]/.test(line)
          : line.includes(`[!code ${actualNotation}]`);
      if (hasExact) {
        // Toggle off if clicking the same notation
        newLines[i] = line.replace(ANY_NOTATION_REGEX, "");
      } else {
        // Replace any existing notation with the new one
        const cleanLine = line.replace(ANY_NOTATION_REGEX, "");
        newLines[i] = `${cleanLine} ${commentTag}`;
      }
    }

    // Calculate new cursor position preserving character offset
    let newStart = 0;
    for (let i = 0; i < startLine; i++) {
      newStart += newLines[i].length + 1;
    }
    newStart += Math.min(startCol, newLines[startLine].length);

    let newEnd = 0;
    for (let i = 0; i < endLine; i++) {
      newEnd += newLines[i].length + 1;
    }
    newEnd += Math.min(endCol, newLines[endLine].length);

    const nextCode = newLines.join("\n");
    updateProp("code", nextCode);
    setCodeSelection({ start: newStart, end: newEnd });

    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }, 0);
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentCode = props.code || "";
      const newCode =
        currentCode.substring(0, start) + "  " + currentCode.substring(end);
      updateProp("code", newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Table block helpers
  const tableHeaders: string[] =
    Array.isArray(props.headers) && props.headers.length > 0
      ? props.headers
      : ["Column 1", "Column 2"];
  const tableAlignments: ("left" | "center" | "right")[] = Array.isArray(
    props.alignments,
  )
    ? props.alignments
    : tableHeaders.map(() => "left");
  const tableRows: string[][] = Array.isArray(props.rows) ? props.rows : [];

  const handleAddTableColumn = () => {
    const colNum = tableHeaders.length + 1;
    const newHeaders = [...tableHeaders, `Header ${colNum}`];
    const newAlignments: ("left" | "center" | "right")[] = [
      ...tableAlignments,
      "left",
    ];
    const newRows = tableRows.map((r) => [...r, ""]);
    onUpdateProps(id, {
      ...props,
      headers: newHeaders,
      alignments: newAlignments,
      rows: newRows,
    });
  };

  const handleDeleteTableColumn = (cIdx: number) => {
    if (tableHeaders.length <= 1) return;
    const newHeaders = tableHeaders.filter((_, i) => i !== cIdx);
    const newAlignments = tableAlignments.filter((_, i) => i !== cIdx);
    const newRows = tableRows.map((r) => r.filter((_, i) => i !== cIdx));
    onUpdateProps(id, {
      ...props,
      headers: newHeaders,
      alignments: newAlignments,
      rows: newRows,
    });
  };

  const handleUpdateTableHeader = (cIdx: number, val: string) => {
    const newHeaders = [...tableHeaders];
    newHeaders[cIdx] = val;
    updateProp("headers", newHeaders);
  };

  const handleUpdateTableAlignment = (
    cIdx: number,
    align: "left" | "center" | "right",
  ) => {
    const newAlignments = [...tableAlignments];
    newAlignments[cIdx] = align;
    updateProp("alignments", newAlignments);
  };

  const handleAddTableRow = () => {
    const emptyRow = tableHeaders.map(() => "");
    updateProp("rows", [...tableRows, emptyRow]);
  };

  const handleDeleteTableRow = (rIdx: number) => {
    const newRows = tableRows.filter((_, i) => i !== rIdx);
    updateProp("rows", newRows);
  };

  const handleUpdateTableCell = (rIdx: number, cIdx: number, val: string) => {
    const newRows = tableRows.map((r, ri) => {
      if (ri !== rIdx) return r;
      const copy = [...r];
      while (copy.length < tableHeaders.length) copy.push("");
      copy[cIdx] = val;
      return copy;
    });
    updateProp("rows", newRows);
  };

  // TypeTable block helpers
  const typeTableParams: TypeTableProperty[] = Array.isArray(props.parameters)
    ? props.parameters
    : [];

  const handleAddTypeTableProp = () => {
    const next: TypeTableProperty[] = [
      ...typeTableParams,
      {
        name: `prop${typeTableParams.length + 1}`,
        type: "string",
        description: "",
        default: "",
        required: false,
        deprecated: false,
      },
    ];
    updateProp("parameters", next);
  };

  const handleUpdateTypeTableProp = (
    propIdx: number,
    field: keyof TypeTableProperty,
    val: any,
  ) => {
    const next = typeTableParams.map((item, idx) =>
      idx === propIdx ? { ...item, [field]: val } : item,
    );
    updateProp("parameters", next);
  };

  const handleDeleteTypeTableProp = (propIdx: number) => {
    const next = typeTableParams.filter((_, idx) => idx !== propIdx);
    updateProp("parameters", next);
  };

  const handleMoveTypeTableProp = (
    propIdx: number,
    direction: "up" | "down",
  ) => {
    const targetIdx = direction === "up" ? propIdx - 1 : propIdx + 1;
    if (targetIdx < 0 || targetIdx >= typeTableParams.length) return;
    const next = [...typeTableParams];
    const [moved] = next.splice(propIdx, 1);
    next.splice(targetIdx, 0, moved);
    updateProp("parameters", next);
  };

  // Files block helpers
  const fileTreeItems: FileTreeNode[] = Array.isArray(props.items)
    ? props.items
    : [];

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
            "bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12]",
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
              "flex-1 min-w-[120px] px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono focus:outline-none transition-colors",
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
                  : "bg-white/[0.03] text-neutral-500 border-white/5 hover:text-neutral-300",
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

  const handleInsertNestedBlock = (
    blockType: MdxBlockType,
    targetIdx?: number,
  ) => {
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
    if (blockType && blockType !== "tabs") {
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

  return (
    <div
      data-block-type={type}
      draggable={Boolean(onDragStart) && isHandleHovered}
      onDragStart={onDragStart ? (e) => onDragStart(e, index) : undefined}
      onDragOver={
        onDragOver
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onDragOver(e, index);
            }
          : undefined
      }
      onDrop={
        onDrop
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onDrop(e, index);
            }
          : undefined
      }
      className={cn(
        "transition-all shadow-sm group relative overflow-hidden [&_*::placeholder]:text-neutral-500",
        depth === 0
          ? "rounded-2xl border border-white/[0.08] bg-muted/40 hover:border-white/[0.14]"
          : "rounded-xl border border-white/[0.08] bg-neutral-900/80 hover:border-white/[0.16] my-2",
      )}
    >
      {/* Block Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] select-none">
        <div className="flex items-center gap-2">
          {onDragStart && (
            <div
              title="Drag to reorder"
              onMouseEnter={() => setIsHandleHovered(true)}
              onMouseLeave={() => setIsHandleHovered(false)}
              onMouseDown={() => setIsHandleHovered(true)}
              onMouseUp={() => setIsHandleHovered(false)}
              className="p-1 rounded text-neutral-400 hover:text-white cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          <div className="p-1 rounded-md bg-white/[0.04]">
            {BLOCK_ICONS[type]}
          </div>

          <span className="text-xs font-semibold text-neutral-200 font-inter">
            {BLOCK_TITLES[type]}
          </span>
        </div>

        {/* Action Buttons: Move Up/Down, Duplicate, Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            title="Move Up"
            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === totalBlocks - 1}
            title="Move Down"
            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowStyles((prev) => !prev)}
            title={`${BLOCK_TITLES[type]} Properties`}
            disabled={
              type === "callout" ||
              type === "card" ||
              type === "steps" ||
              type === "banner" ||
              type === "table" ||
              type === "break" ||
              type === "list"
            }
            className={cn(
              "p-1 rounded transition-colors disabled:opacity-20",
              showStyles
                ? "text-accent bg-accent/15"
                : "text-neutral-400 not-disabled:hover:text-white not-disabled:hover:bg-white/10",
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            title="Duplicate"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            title="Delete Block"
            className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block-Specific Properties Drawer */}
      <AnimatePresence initial={false}>
        {showStyles && (
          <motion.div
            key="block-properties-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white/[0.03] border-b border-white/[0.06] select-none"
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
                          : "bg-white/[0.04] text-neutral-400 hover:text-white",
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
                          : "bg-white/[0.04] text-neutral-400 hover:text-white",
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
                          : "bg-white/[0.04] text-neutral-400 hover:text-white",
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
                            onUpdateProps(id, {
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

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 border-t border-white/[0.06]">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 border-t border-white/[0.06]">
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
                          onUpdateProps(id, {
                            ...props,
                            width: val ? Number(val) : "",
                            ...(val ? { size: "custom" } : {}),
                          });
                        }}
                        placeholder="Auto (px)"
                        className="w-full text-xs bg-white/3 h-[32px] border border-white/10 text-white"
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
                          onUpdateProps(id, {
                            ...props,
                            height: val ? Number(val) : "",
                            ...(val ? { size: "custom" } : {}),
                          });
                        }}
                        placeholder="Auto (px)"
                        className="w-full text-xs bg-white/3 h-[32px] border border-white/10 text-white"
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
                      className="px-2 py-0.5 text-xs bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-accent font-mono w-48"
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

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
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
                            : "bg-white/[0.04] border-white/10 text-neutral-400",
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

      {/* Block Form Fields (Fill the values) */}
      <div
        onMouseEnter={() => setIsHandleHovered(false)}
        onDragStart={(e) => {
          e.stopPropagation();
        }}
        className="p-4 space-y-3"
      >
        {/* Heading Fields */}
        {type === "heading" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-inter">
                Level:
              </span>
              <SegmentedControl
                options={[
                  { label: "H1", value: "1" },
                  { label: "H2", value: "2" },
                  { label: "H3", value: "3" },
                  { label: "H4", value: "4" },
                  { label: "H5", value: "5" },
                  { label: "H6", value: "6" },
                ]}
                size="sm"
                defaultValue={"2"}
                value={(props.level || 2).toString()}
                onValueChange={(value) => updateProp("level", Number(value))}
              />
            </div>
            <InlineTooltipField
              as="input"
              value={props.text || ""}
              onChange={(v) => updateProp("text", v)}
              placeholder="Enter heading text..."
            />
          </div>
        )}

        {/* Paragraph Fields */}
        {type === "paragraph" && (
          <div>
            <InlineTooltipField
              rows={3}
              value={props.text || ""}
              onChange={(v) => updateProp("text", v)}
              placeholder="Enter paragraph text (supports markdown, links, bold, italic)..."
            />
          </div>
        )}

        {/* 2a. List & Checklist Block */}
        {type === "list" &&
          (() => {
            const listType: ListType = props.listType || "bullet";
            const items: ListItem[] = Array.isArray(props.items)
              ? props.items
              : [];

            const handleUpdateItem = (
              itemIdx: number,
              patch: Partial<ListItem>,
            ) => {
              const next = items.map((it, i) =>
                i === itemIdx ? { ...it, ...patch } : it,
              );
              updateProp("items", next);
            };

            const handleAddItem = () => {
              const newItem: ListItem = {
                id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                text: "",
                ...(listType === "task" ? { checked: false } : {}),
              };
              updateProp("items", [...items, newItem]);
            };

            const handleRemoveItem = (itemIdx: number) => {
              if (items.length <= 1) {
                updateProp("items", [
                  {
                    id: `li-${Date.now()}`,
                    text: "",
                    ...(listType === "task" ? { checked: false } : {}),
                  },
                ]);
                return;
              }
              updateProp(
                "items",
                items.filter((_, i) => i !== itemIdx),
              );
            };

            const handleMoveItem = (
              fromIdx: number,
              direction: "up" | "down",
            ) => {
              const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
              if (toIdx < 0 || toIdx >= items.length) return;
              const reordered = [...items];
              const [moved] = reordered.splice(fromIdx, 1);
              reordered.splice(toIdx, 0, moved);
              updateProp("items", reordered);
            };

            return (
              <div className="space-y-3">
                {/* List Header: Type Switcher & Count */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Type:
                    </span>
                    <SegmentedControl
                      options={[
                        {
                          label: (
                            <span className="flex items-center gap-1.5 text-xs">
                              <LuList className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Bullet</span>
                            </span>
                          ),
                          value: "bullet" as const,
                        },
                        {
                          label: (
                            <span className="flex items-center gap-1.5 text-xs">
                              <LuListOrdered className="w-3.5 h-3.5 text-blue-400" />
                              <span>Numbered</span>
                            </span>
                          ),
                          value: "ordered" as const,
                        },
                        {
                          label: (
                            <span className="flex items-center gap-1.5 text-xs">
                              <LuListTodo className="w-3.5 h-3.5 text-amber-400" />
                              <span>Task</span>
                            </span>
                          ),
                          value: "task" as const,
                        },
                      ]}
                      size="sm"
                      value={listType}
                      onValueChange={(val) => updateProp("listType", val)}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {items.map((item, itemIdx) => (
                    <div
                      key={item.id || `li-${itemIdx}`}
                      className="group/item flex items-center gap-2 p-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
                    >
                      {/* Prefix Indicator */}
                      <div className="flex items-center justify-center shrink-0 pl-1">
                        {listType === "bullet" && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400/80 mx-1" />
                        )}

                        {listType === "ordered" && (
                          <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-mono text-neutral-300 flex items-center justify-center">
                            {itemIdx + 1}
                          </div>
                        )}

                        {listType === "task" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItem(itemIdx, {
                                checked: !item.checked,
                              })
                            }
                            title={
                              item.checked
                                ? "Mark as uncompleted"
                                : "Mark as completed"
                            }
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer",
                              item.checked
                                ? "bg-emerald-500 border-emerald-400 text-black shadow-sm shadow-emerald-500/20"
                                : "border-white/20 bg-white/[0.04] text-transparent hover:border-white/40",
                            )}
                          >
                            <LuCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>

                      {/* Inline Text Input */}
                      <div className="flex-1 min-w-0">
                        <InlineTooltipField
                          as="input"
                          variant="dark"
                          value={item.text || ""}
                          onChange={(val) =>
                            handleUpdateItem(itemIdx, { text: val })
                          }
                          placeholder={`Item ${itemIdx + 1}...`}
                        />
                      </div>

                      {/* Item Controls */}
                      <div className="flex items-center gap-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(itemIdx, "up")}
                          disabled={itemIdx === 0}
                          title="Move Up"
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(itemIdx, "down")}
                          disabled={itemIdx === items.length - 1}
                          title="Move Down"
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(itemIdx)}
                          title="Delete Item"
                          className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-dashed border-white/10 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/[0.04] text-xs font-medium text-neutral-400 hover:text-emerald-400 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add List Item</span>
                </button>
              </div>
            );
          })()}

        {/* 2b. Announcement Banner Fields */}
        {type === "banner" && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-pink-400/25 transition-all duration-200 overflow-hidden shadow-sm">
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
                    className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-white/3 border border-white/[0.08] focus:border-accent/40 rounded-lg text-neutral-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        {type === "divider" && (
          <div className="py-2">
            <div className="h-px bg-white/10 w-full" />
          </div>
        )}

        {/* 3b. Line Break (<br/>) */}
        {type === "break" && (
          <div className="py-2 flex items-center justify-center">
            <div className="w-full flex items-center gap-2">
              <div className="h-px bg-white/[0.06] flex-1 border-t border-dashed border-white/15" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-neutral-400 bg-white/[0.03] border border-white/[0.08] select-none">
                <CornerDownLeft className="w-3 h-3 text-neutral-500" />
              </span>
              <div className="h-px bg-white/[0.06] flex-1 border-t border-dashed border-white/15" />
            </div>
          </div>
        )}

        {/* Callout Alert */}
        {type === "callout" && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Type:</span>
              <SegmentedControl
                options={["Info", "Warning", "Danger"]}
                value={props.calloutType}
                defaultValue="info"
                size="sm"
                onValueChange={(v) => updateProp("calloutType", v)}
              />
            </div>
            <Input
              type="text"
              value={props.title || ""}
              onChange={(e) => updateProp("title", e.target.value)}
              placeholder="Callout title (optional)..."
              className="w-full text-xs bg-white/3 h-[38px] border border-white/10 text-white"
            />
            <InlineTooltipField
              rows={2}
              value={props.content || ""}
              onChange={(v) => updateProp("content", v)}
              placeholder="Callout body text..."
            />
          </div>
        )}

        {/* Showcase Card */}
        {type === "card" && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.035] transition-all duration-200 overflow-hidden shadow-sm">
            {/* Card Header row with Title on left, Badge on right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 bg-white/[0.015] border-b border-white/[0.05]">
              <input
                type="text"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Card Title (e.g. Feature Overview)..."
                className="flex-1 text-xs font-semibold bg-transparent border-none text-white focus:outline-none placeholder:text-neutral-500 h-8 px-1 font-rethink"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  Badge:
                </span>
                <input
                  type="text"
                  value={props.badge || ""}
                  onChange={(e) => updateProp("badge", e.target.value)}
                  placeholder="Optional badge label..."
                  className="px-2.5 py-1 text-[11px] font-mono bg-accent/10 border border-accent/20 rounded-full text-accent placeholder:text-neutral-600 focus:outline-none focus:border-accent w-36"
                />
              </div>
            </div>

            {/* Card Body Content */}
            <div className="p-3">
              <InlineTooltipField
                rows={2}
                variant="dark"
                value={props.content || ""}
                onChange={(v) => updateProp("content", v)}
                placeholder="Card description / body text..."
              />
            </div>
          </div>
        )}

        {/* Accordion / FAQ */}
        {type === "accordion" && (
          <div className="space-y-3">
            {(props.items || []).map((item: any, itIdx: number) => (
              <div
                key={itIdx}
                className="group/item rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.035] transition-all duration-200 overflow-hidden shadow-sm"
              >
                {/* Header row with item pill badge, title input and controls */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.015] border-b border-white/[0.05]">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] text-accent flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
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
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/[0.015] hover:bg-accent/[0.04] text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Accordion Item</span>
            </button>
          </div>
        )}

        {/* 6b. Steps Guide */}
        {type === "steps" && (
          <div className="space-y-3">
            {(props.steps || []).map((step: any, stIdx: number) => (
              <div
                key={stIdx}
                className="group/item rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.035] transition-all duration-200 overflow-hidden shadow-sm"
              >
                {/* Header row with step number, title input and controls */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.015] border-b border-white/[0.05]">
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
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/[0.015] hover:bg-accent/[0.04] text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Step</span>
            </button>
          </div>
        )}

        {/* Tabs Container (With Nested Blocks) */}
        {type === "tabs" &&
          (depth > 0 ? (
            <div className="p-3 text-xs text-neutral-400 italic">
              Nested tabs within tabs are not supported.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Tab Bar Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/[0.08] select-none">
                {tabsList.map((tab: any, tIdx: number) => (
                  <div
                    key={tab.id || tIdx}
                    onClick={() => setActiveTabIdx(tIdx)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shrink-0 border",
                      safeTabIdx === tIdx
                        ? "bg-accent/15 border-accent/40 text-accent font-semibold shadow-xs"
                        : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.06]",
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
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tab</span>
                </button>
              </div>

              {/* Active Tab Configuration & Nested Blocks */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
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
                    className="flex-1 w-full text-xs bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/40 transition-colors"
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
                  className="space-y-3 pt-2 border-t border-white/[0.06]"
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
                        if (blockType && blockType !== "tabs") {
                          handleInsertNestedBlock(blockType);
                        }
                      }}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center gap-1.5 select-none",
                        isTabDropActive
                          ? "border-accent bg-accent/10 text-accent scale-[1.01]"
                          : "border-white/10 bg-white/[0.01] text-neutral-400 hover:border-white/20",
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
                          if (blockType && blockType !== "tabs") {
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
          ))}

        {/* Chip Tag Badges */}
        {type === "chipGroup" && (
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

            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/10">
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
                className="w-full text-xs bg-white/3 h-[38px] border border-white/10 text-white min-w-[140px]"
              />
            </div>
          </div>
        )}

        {/* Code Snippet */}
        {type === "code" && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <HeroSelect
                options={CODE_LANGUAGES}
                value={props.language || "typescript"}
                onChange={(val) => updateProp("language", val)}
                placeholder="Select Language..."
              />

              <Input
                type="text"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="File title (e.g. main.ts)..."
                className="w-full text-xs bg-white/3 h-[38px] border border-white/10 text-white"
              />
            </div>

            {/* Shiki Transformation Tools Top Bar & Code Editor */}
            <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-accent/60 transition-colors bg-neutral-950/80">
              <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 bg-white/[0.03] border-b border-white/10 text-xs select-none">
                <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider mr-1 flex items-center gap-1">
                    Transform:
                  </span>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertShikiNotation("highlight")}
                    title="Highlight Line (// [!code highlight])"
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all",
                      !activeNotations.has("highlight") &&
                        "grayscale opacity-70",
                    )}
                  >
                    <Highlighter className="w-3 h-3 text-amber-400" />
                    <span>Highlight</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertShikiNotation("++")}
                    title="Diff Add (+ // [!code ++])"
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all",
                      !activeNotations.has("++") && "grayscale opacity-70",
                    )}
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>Diff +</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertShikiNotation("--")}
                    title="Diff Remove (- // [!code --])"
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-all",
                      !activeNotations.has("--") && "grayscale opacity-70",
                    )}
                  >
                    <Minus className="w-3 h-3 text-rose-400" />
                    <span>Diff -</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertShikiNotation("focus")}
                    title="Focus Line (// [!code focus])"
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition-all",
                      !activeNotations.has("focus") && "grayscale opacity-70",
                    )}
                  >
                    <Eye className="w-3 h-3 text-sky-400" />
                    <span>Focus</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertShikiNotation("error")}
                    title="Error Line (// [!code error])"
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all",
                      !activeNotations.has("error") && "grayscale opacity-70",
                    )}
                  >
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span>Error</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertShikiNotation("warning")}
                    title="Warning Line (// [!code warning])"
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all",
                      !activeNotations.has("warning") && "grayscale opacity-70",
                    )}
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Warn</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasSelectedCodeWord && !activeNotations.has("word")
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertShikiNotation("word")}
                    title={
                      hasSelectedCodeWord || activeNotations.has("word")
                        ? "Highlight selected word"
                        : "Select a word in the code editor first"
                    }
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed",
                      !activeNotations.has("word") && "grayscale opacity-70",
                    )}
                  >
                    <WholeWord className="w-3 h-3 text-purple-400" />
                    <span>Word</span>
                  </button>
                </div>
              </div>

              <textarea
                ref={codeTextareaRef}
                rows={12}
                value={props.code || ""}
                onChange={(e) => {
                  updateProp("code", e.target.value);
                  syncCodeWordSelection();
                }}
                onSelect={syncCodeWordSelection}
                onKeyUp={syncCodeWordSelection}
                onMouseUp={syncCodeWordSelection}
                onBlur={() => setHasSelectedCodeWord(false)}
                onKeyDown={handleCodeKeyDown}
                placeholder="Paste or write code snippet here..."
                className="w-full text-xs bg-transparent border-0 font-mono text-emerald-400 p-3 min-h-[260px] leading-relaxed resize-y focus:outline-none placeholder:text-neutral-600 block"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Image Embed */}
        {type === "image" && (
          <div className="space-y-3">
            {/* Modal Image Picker */}
            <ImagePicker
              isOpen={isImagePickerOpen}
              onClose={() => setIsImagePickerOpen(false)}
              onSelectImage={(data) => {
                onUpdateProps(id, {
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
                className="border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 hover:bg-white/[0.02] transition-all group select-none"
              >
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-neutral-300 group-hover:scale-105 group-hover:text-accent transition-all mb-2">
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
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border-t border-white/[0.08]">
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
                className="w-full text-xs bg-white/3 h-[38px] border border-white/10 text-white"
              />
              <Input
                type="text"
                value={props.caption || ""}
                onChange={(e) => updateProp("caption", e.target.value)}
                placeholder="Caption text (optional)..."
                className="w-full text-xs bg-white/3 h-[38px] border border-white/10 text-white"
              />
            </div>
          </div>
        )}

        {/* Table */}
        {type === "table" && (
          <div className="space-y-3">
            {/* Table meta bar */}
            <div className="flex items-center justify-end gap-2 px-1">
              <button
                type="button"
                onClick={handleAddTableColumn}
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-accent" />
                <span>Add Column</span>
              </button>
            </div>

            {/* Scrollable table grid container */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] overflow-x-auto p-2.5 space-y-2">
              {/* Header row */}
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${tableHeaders.length}, minmax(140px, 1fr)) 36px`,
                }}
              >
                {tableHeaders.map((header, cIdx) => {
                  const align = tableAlignments[cIdx] || "left";
                  return (
                    <div
                      key={cIdx}
                      className="flex flex-col gap-1.5 p-2 rounded-xl bg-white/[0.035] border border-white/[0.08]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-0.5 bg-black/30 p-0.5 rounded-lg border border-white/5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTableAlignment(cIdx, "left")
                            }
                            title="Align Left"
                            className={cn(
                              "p-1 rounded text-[10px] transition-colors",
                              align === "left"
                                ? "bg-accent/20 text-accent font-bold"
                                : "text-neutral-400 hover:text-white hover:bg-white/10",
                            )}
                          >
                            <AlignLeft className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTableAlignment(cIdx, "center")
                            }
                            title="Align Center"
                            className={cn(
                              "p-1 rounded text-[10px] transition-colors",
                              align === "center"
                                ? "bg-accent/20 text-accent font-bold"
                                : "text-neutral-400 hover:text-white hover:bg-white/10",
                            )}
                          >
                            <AlignCenter className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTableAlignment(cIdx, "right")
                            }
                            title="Align Right"
                            className={cn(
                              "p-1 rounded text-[10px] transition-colors",
                              align === "right"
                                ? "bg-accent/20 text-accent font-bold"
                                : "text-neutral-400 hover:text-white hover:bg-white/10",
                            )}
                          >
                            <AlignRight className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {tableHeaders.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTableColumn(cIdx)}
                            title="Delete Column"
                            className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={header}
                        onChange={(e) =>
                          handleUpdateTableHeader(cIdx, e.target.value)
                        }
                        placeholder={`Column ${cIdx + 1}`}
                        className={cn(
                          "w-full px-2 py-1 bg-white/[0.04] border border-white/10 focus:border-accent/40 rounded-lg text-xs font-semibold text-white placeholder:text-neutral-500 focus:outline-none transition-colors",
                          align === "center" && "text-center",
                          align === "right" && "text-right",
                        )}
                      />
                    </div>
                  );
                })}

                {/* Header spacer aligned with delete row button */}
                <div className="w-9" />
              </div>

              {/* Data rows */}
              {tableRows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="grid gap-2 items-center"
                  style={{
                    gridTemplateColumns: `repeat(${tableHeaders.length}, minmax(140px, 1fr)) 36px`,
                  }}
                >
                  {tableHeaders.map((_, cIdx) => {
                    const align = tableAlignments[cIdx] || "left";
                    return (
                      <input
                        key={cIdx}
                        type="text"
                        value={row[cIdx] ?? ""}
                        onChange={(e) =>
                          handleUpdateTableCell(rIdx, cIdx, e.target.value)
                        }
                        placeholder="Cell value..."
                        className={cn(
                          "w-full px-2.5 py-1.5 bg-black/30 border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none transition-colors",
                          align === "center" && "text-center",
                          align === "right" && "text-right",
                        )}
                      />
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleDeleteTableRow(rIdx)}
                    title="Delete Row"
                    className="w-9 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add row button */}
            <button
              type="button"
              onClick={handleAddTableRow}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/[0.015] hover:bg-accent/[0.04] text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Row</span>
            </button>
          </div>
        )}

        {/* TypeTable */}
        {type === "typeTable" && (
          <div className="space-y-3">
            {/* List of properties */}
            <div className="space-y-2.5">
              {typeTableParams.map((param, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3 rounded-2xl bg-white/[0.025] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-2.5"
                >
                  {/* Top row: Name, Type, Default, Toggles, Reorder & Delete */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reorder arrows */}
                    <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/5">
                      <button
                        type="button"
                        disabled={pIdx === 0}
                        onClick={() => handleMoveTypeTableProp(pIdx, "up")}
                        title="Move Up"
                        className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={pIdx === typeTableParams.length - 1}
                        onClick={() => handleMoveTypeTableProp(pIdx, "down")}
                        title="Move Down"
                        className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Prop Name */}
                    <div className="flex-1 min-w-[130px]">
                      <input
                        type="text"
                        data-format-role="plain"
                        value={param.name}
                        onChange={(e) =>
                          handleUpdateTypeTableProp(
                            pIdx,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="Prop name (e.g. title)"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 focus:border-accent/40 rounded-xl text-xs font-mono font-bold text-accent placeholder:text-neutral-600 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Prop Type */}
                    <div className="flex-1 min-w-[130px]">
                      <input
                        type="text"
                        data-format-role="plain"
                        value={param.type}
                        onChange={(e) =>
                          handleUpdateTypeTableProp(
                            pIdx,
                            "type",
                            e.target.value,
                          )
                        }
                        placeholder="Type (e.g. string)"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 focus:border-sky-400/40 rounded-xl text-xs font-mono text-sky-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Default value */}
                    <div className="w-28 min-w-[90px]">
                      <input
                        type="text"
                        data-format-role="plain"
                        value={param.default ?? ""}
                        onChange={(e) =>
                          handleUpdateTypeTableProp(
                            pIdx,
                            "default",
                            e.target.value,
                          )
                        }
                        placeholder="Default (-)"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 focus:border-white/30 rounded-xl text-xs font-mono text-neutral-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Required Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTypeTableProp(
                          pIdx,
                          "required",
                          !param.required,
                        )
                      }
                      title={
                        param.required ? "Mark as Optional" : "Mark as Required"
                      }
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold transition-all border cursor-pointer",
                        param.required
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                          : "bg-white/[0.03] text-neutral-500 border-white/5 hover:text-neutral-300 hover:border-white/15",
                      )}
                    >
                      {param.required ? "Req" : "Opt"}
                    </button>

                    {/* Deprecated Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTypeTableProp(
                          pIdx,
                          "deprecated",
                          !param.deprecated,
                        )
                      }
                      title={
                        param.deprecated
                          ? "Remove Deprecated Flag"
                          : "Mark as Deprecated"
                      }
                      className={cn(
                        "px-2 py-1.5 rounded-xl text-[11px] font-mono transition-all border cursor-pointer",
                        param.deprecated
                          ? "bg-red-500/20 text-red-300 border-red-500/40 line-through"
                          : "bg-white/[0.03] text-neutral-500 border-white/5 hover:text-neutral-300 hover:border-white/15",
                      )}
                    >
                      Dep
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTypeTableProp(pIdx)}
                      title="Delete Property"
                      className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom row: Description */}
                  <div>
                    <input
                      type="text"
                      value={param.description ?? ""}
                      onChange={(e) =>
                        handleUpdateTypeTableProp(
                          pIdx,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder="Description of this prop (optional)..."
                      className="w-full px-3 py-1.5 bg-black/20 border border-white/[0.06] focus:border-accent/30 rounded-xl text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Property Bottom Button */}
            <button
              type="button"
              onClick={handleAddTypeTableProp}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-white/15 hover:border-accent/40 bg-white/[0.015] hover:bg-accent/[0.04] text-neutral-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent transition-colors" />
              <span>Add Property</span>
            </button>
          </div>
        )}

        {/* Files Tree */}
        {type === "files" && (
          <div className="space-y-3">
            {/* Header action bar */}
            <div className="flex items-center justify-end px-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddFileTreeNode(null, "file")}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Add File</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFileTreeNode(null, "folder")}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Folder</span>
                </button>
              </div>
            </div>

            {/* Tree nodes list */}
            {fileTreeItems.length > 0 ? (
              <div className="space-y-1.5 p-2 rounded-2xl bg-black/20 border border-white/[0.06]">
                {fileTreeItems.map((item) => renderFileTreeNode(item, 0))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.015] space-y-2">
                <p className="text-xs text-neutral-500 m-0">
                  Empty file tree. Start by adding a folder or a file.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Profile Card Block */}
        {type === "profile" && (
          <div className="space-y-4">
            {/* Modal Image Picker */}
            <ImagePicker
              isOpen={isImagePickerOpen && selectedAvatarIdx === null}
              onClose={() => setIsImagePickerOpen(false)}
              onSelectImage={(data) => {
                onUpdateProps(id, {
                  ...props,
                  src: data.src,
                  ...(!props.name && data.alt ? { name: data.alt } : {}),
                });
              }}
              currentSrc={props.src}
            />

            {/* Live Interactive Preview */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08] flex flex-col items-center justify-center text-center gap-2">
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
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
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {props.src && (
                    <button
                      type="button"
                      onClick={() => updateProp("src", "")}
                      title="Clear photo"
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Avatar Group Block */}
        {type === "avatar" &&
          (() => {
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
                <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08] flex flex-col gap-2 w-full">
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
                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
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
                          className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 group hover:border-white/15 transition-colors"
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
                            className="px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 sm:w-36 transition-colors"
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
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAvatarIdx(actualIdx);
                                setIsImagePickerOpen(true);
                              }}
                              title="Pick from media library"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
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
                            className="px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 sm:w-36 transition-colors"
                          />

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveAvatarItem(actualIdx)}
                            title="Remove avatar"
                            className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                  {avatarItems.length === 0 && (
                    <div className="text-center py-5 border border-dashed border-white/10 rounded-xl bg-white/[0.015]">
                      <p className="text-xs text-neutral-500 m-0">
                        No avatars yet. Click &quot;Add Avatar&quot; to add one.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {/* Blockquote Block */}
        {type === "blockquote" && (
          <div className="space-y-4">
            {/* Modal Image Picker for Author Avatar */}
            <ImagePicker
              isOpen={isImagePickerOpen && selectedAvatarIdx === -2}
              onClose={() => {
                setIsImagePickerOpen(false);
                setSelectedAvatarIdx(null);
              }}
              onSelectImage={(data) => {
                onUpdateProps(id, {
                  ...props,
                  avatar: data.src,
                });
                setSelectedAvatarIdx(null);
              }}
              currentSrc={props.avatar}
            />

            {/* Live Interactive Preview */}
            <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/[0.08]">
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
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
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
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatarIdx(-2);
                      setIsImagePickerOpen(true);
                    }}
                    title="Choose from media library"
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  {props.avatar && (
                    <button
                      type="button"
                      onClick={() => updateProp("avatar", "")}
                      title="Clear avatar"
                      className="p-2 rounded-xl bg-white/[0.06] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasBlockItem;
