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

interface BlockEditorProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
}

export const CodeBlockTabsEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  // CodeBlockTabs helpers
  const codeTabsList = props.tabs || [];
  const safeCodeTabIdx = Math.min(
    activeTabIdx,
    Math.max(0, codeTabsList.length - 1),
  );
  const currentCodeTab = codeTabsList[safeCodeTabIdx] || {
    id: "tab-1",
    value: "npm",
    label: "npm",
    language: "bash",
    code: "",
  };

  const updateCodeTabsList = (newTabs: any[]) => {
    updateProp("tabs", newTabs);
  };

  const handleUpdateCodeTab = (tIdx: number, patch: Partial<any>) => {
    const updated = [...codeTabsList];
    updated[tIdx] = { ...updated[tIdx], ...patch };
    updateCodeTabsList(updated);
  };

  const handleAddCodeTab = () => {
    const newIdx = codeTabsList.length;
    const newTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      value: `tab${newIdx + 1}`,
      label: `Tab ${newIdx + 1}`,
      language: "bash",
      code: "",
    };
    updateCodeTabsList([...codeTabsList, newTab]);
    setActiveTabIdx(newIdx);
  };

  const handleRemoveCodeTab = (tIdx: number) => {
    if (codeTabsList.length <= 1) return;
    const updated = codeTabsList.filter((_: any, i: number) => i !== tIdx);
    updateCodeTabsList(updated);
    setActiveTabIdx(Math.max(0, tIdx - 1));
  };
  return (
          <div className="space-y-4">
            {/* Top Tab Bar Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/8 select-none">
              {codeTabsList.map((tab: any, tIdx: number) => {
                const isActive = safeCodeTabIdx === tIdx;

                return (
                  <div
                    key={tab.id || tIdx}
                    onClick={() => setActiveTabIdx(tIdx)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shrink-0 border",
                      isActive
                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold shadow-xs"
                        : "bg-white/3 border-white/8 text-neutral-400 hover:text-white hover:bg-white/6",
                    )}
                  >
                    <span>{tab.label || tab.value || `Tab ${tIdx + 1}`}</span>
                    {codeTabsList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCodeTab(tIdx);
                        }}
                        title="Remove Tab"
                        className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddCodeTab}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/4 hover:bg-white/8 border border-dashed border-white/20 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tab</span>
              </button>
            </div>

            {/* Active Code Tab Configuration & Code Area */}
            <div className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1 font-medium">
                    Tab Label:
                  </label>
                  <Input
                    type="text"
                    value={currentCodeTab.label || currentCodeTab.value || ""}
                    onChange={(e) =>
                      handleUpdateCodeTab(safeCodeTabIdx, {
                        label: e.target.value,
                        value:
                          currentCodeTab.value ||
                          String(e.target.value || "").toLowerCase(),
                      })
                    }
                    placeholder="e.g. npm, yarn, pnpm..."
                    className="w-full text-xs h-10 bg-white/4 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1 font-medium">
                    Language:
                  </label>
                  <Select
                    options={CODE_LANGUAGES}
                    value={currentCodeTab.language || "bash"}
                    onChange={(val) =>
                      handleUpdateCodeTab(safeCodeTabIdx, { language: val })
                    }
                    placeholder="Select Language..."
                  />
                </div>
              </div>

              {/* Code Textarea Editor */}
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1 font-medium">
                  Code:
                </label>
                <textarea
                  data-format-role="plain"
                  value={currentCodeTab.code || ""}
                  onChange={(e) =>
                    handleUpdateCodeTab(safeCodeTabIdx, {
                      code: e.target.value,
                    })
                  }
                  placeholder={`Enter ${currentCodeTab.language || "code"} commands or script for this tab...`}
                  rows={6}
                  className="w-full text-xs bg-white/4 border border-white/10 rounded-2xl font-mono text-emerald-400 p-3 min-h-65 leading-relaxed resize-y focus:outline-none placeholder:text-neutral-600 block"
                />
              </div>
            </div>
          </div>
  );
});
CodeBlockTabsEditor.displayName = "CodeBlockTabsEditor";

export const CodeSnippetBlockEditor: React.FC<BlockEditorProps> = React.memo(({ props, updateProp }) => {
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
  return (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Select
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
                className="w-full text-xs bg-white/3 9.5 border border-white/10 text-white"
              />
            </div>

            {/* Shiki Transformation Tools Top Bar & Code Editor */}
            <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-accent/60 transition-colors bg-neutral-950/80">
              <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 bg-white/3 border-b border-white/10 text-xs select-none">
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
                className="w-full text-xs bg-transparent border-0 font-mono text-emerald-400 p-3 min-h-65 leading-relaxed resize-y focus:outline-none placeholder:text-neutral-600 block"
                spellCheck={false}
              />
            </div>
          </div>
  );
});
CodeSnippetBlockEditor.displayName = "CodeSnippetBlockEditor";
