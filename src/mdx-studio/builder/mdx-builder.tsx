"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import dynamic from "next/dynamic";
import { MdxBlockType, MdxBlock } from "./types";
import {
  createBlock,
  blocksToMdx,
  mdxToBlocks,
  getUniqueTemplateName,
} from "./compiler";
import { isInlineOnlyBlock } from "./blocks/registry";
import { ComponentTray } from "./components/component-tray";
import { CanvasArea } from "./components/canvas-area";
import { BuilderLivePreview } from "./components/builder-live-preview";
import { BuilderToolbar } from "./components/builder-toolbar";
import { useBlockHistory } from "./hooks/use-block-history";
import { useSmoothScrollSync } from "./hooks/use-smooth-scroll-sync";
import { usePanelResizer } from "./hooks/use-panel-resizer";
import MDXContent from "@/components/mdx/mdx-content";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import { toast } from "@heroui/react";
import { cn } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { parse as parseYaml } from "yaml";

function extractFrontmatter(doc: string): {
  hasFrontmatter: boolean;
  frontmatterBlock: string;
  frontmatterYaml: string;
  body: string;
} {
  const match = doc.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (match) {
    return {
      hasFrontmatter: true,
      frontmatterBlock: match[0].trim(),
      frontmatterYaml: match[1],
      body: doc.slice(match[0].length).replace(/^\r?\n+/, ""),
    };
  }
  return {
    hasFrontmatter: false,
    frontmatterBlock: "",
    frontmatterYaml: "",
    body: doc,
  };
}

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-neutral-950/80 text-neutral-400 text-xs font-mono p-8">
      Loading Monaco Editor...
    </div>
  ),
});

export interface MdxBuilderProps {
  value?: string;
  onChange?: (mdx: string) => void;
  className?: string;
  minHeight?: string;
  title?: string;
  documentName?: string;
  /**
   * Pre-serialized YAML frontmatter block (`---…---`) to display above the
   * MDX code editor and include when copying. Empty string to disable.
   */
  frontmatter?: string;
  onFrontmatterChange?: (newFrontmatter: string) => void;
  onMetadataChange?: (metadata: Record<string, any>) => void;
  onRegisterInsertBlock?: (
    fn: (type: MdxBlockType, props?: Record<string, any>) => void,
  ) => void;
}

export type BuilderMode = "builder" | "code" | "preview";

export const MdxBuilder: React.FC<MdxBuilderProps> = ({
  value = "",
  onChange,
  className,
  minHeight = "520px",
  title = "Mdx Builder",
  documentName,
  frontmatter = "",
  onFrontmatterChange,
  onMetadataChange,
  onRegisterInsertBlock,
}) => {
  const { blocks, setBlocks, resetBlocks, undo, redo, canUndo, canRedo } =
    useBlockHistory(() => mdxToBlocks(value));
  const lastSyncedValueRef = useRef<string>(value);
  const [mode, setMode] = useState<BuilderMode>("builder");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isFloatingTrayOpen, setIsFloatingTrayOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<any>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const {
    trayWidth,
    isTrayExpanded,
    setIsTrayExpanded,
    previewWidth,
    isPreviewExpanded,
    setIsPreviewExpanded,
    dragSide,
    handleMouseDownLeft,
    handleMouseDownRight,
  } = usePanelResizer(containerRef);

  // Detect small screens (< 1024px / lg) and automatically reset preview mode if resizing to large screens
  useEffect(() => {
    const checkScreen = () => {
      const isSmall = window.innerWidth < 1024;
      setIsSmallScreen(isSmall);
      if (!isSmall && mode === "preview") {
        setMode("builder");
      }
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [mode]);

  // Defer block serialization slightly so active input keystrokes render with 0ms frame latency
  const deferredBlocks = useDeferredValue(blocks);

  // Clean compiled MDX for output / export / code editor (O(1) cached per block in compiler.ts)
  const compiledMdx = useMemo(
    () => blocksToMdx(deferredBlocks),
    [deferredBlocks],
  );

  const [codeValue, setCodeValue] = useState(compiledMdx);
  const [monacoContent, setMonacoContent] = useState<string>(() => {
    const hasFm = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(compiledMdx);
    return !hasFm && frontmatter
      ? `${frontmatter}\n\n${compiledMdx}`
      : compiledMdx;
  });

  // Keep Monaco's buffer in sync when actively in "code" mode and frontmatter changes externally
  useEffect(() => {
    if (mode === "code" && frontmatter) {
      const { frontmatterBlock, body } = extractFrontmatter(monacoContent);
      if (frontmatter !== frontmatterBlock) {
        setMonacoContent(`${frontmatter}\n\n${body}`);
      }
    }
  }, [frontmatter, mode, monacoContent]);

  // Synchronize internal blocks and code editor when external value prop changes
  useEffect(() => {
    // Only accept external value replacement when NOT actively in visual builder mode,
    // or when the canvas is empty, to avoid resetting block state and scroll position mid-keystroke.
    if (mode === "builder" && blocks.length > 0) return;
    if (value !== lastSyncedValueRef.current) {
      lastSyncedValueRef.current = value;
      const nextBlocks = mdxToBlocks(value);
      resetBlocks(nextBlocks);
      setCodeValue(value);
    }
  }, [value, resetBlocks, mode, blocks.length]);

  // Synchronize compiled MDX whenever compiledMdx changes (when in visual builder mode).
  // Reuses memoized compiledMdx instead of calling blocksToMdx a 3rd time, and debounces
  // parent context notification so typing does not re-render the entire modal shell per keystroke.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (mode !== "builder") return;
    if (compiledMdx === lastSyncedValueRef.current) return;
    lastSyncedValueRef.current = compiledMdx;

    const timer = setTimeout(() => {
      onChangeRef.current?.(compiledMdx);
    }, 180);

    return () => {
      clearTimeout(timer);
    };
  }, [compiledMdx, mode]);

  // Smooth 120fps two-way scroll sync (Canvas <-> Preview and Monaco <-> Preview)
  const {
    isPointerOverPreviewRef,
    handleCanvasScroll,
    handlePreviewScroll,
    handleMonacoMount,
    captureScrollBeforeModeSwitch,
  } = useSmoothScrollSync({
    mode,
    isPreviewExpanded,
    monacoContent,
    activeBlockId,
    canvasScrollRef,
    previewScrollRef,
    monacoEditorRef,
  });

  // When switching modes, synchronize code <-> blocks and preserve scroll position
  const handleModeChange = (newMode: BuilderMode) => {
    if (newMode === mode) return;
    captureScrollBeforeModeSwitch(newMode);
    if (newMode === "code") {
      // Refresh code editor content with current blocks
      const body = blocksToMdx(blocks);
      setCodeValue(body);
      const hasFm = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(body);
      const full = !hasFm && frontmatter ? `${frontmatter}\n\n${body}` : body;
      setMonacoContent(full);
    } else if (
      mode === "code" &&
      (newMode === "builder" || newMode === "preview")
    ) {
      // Parse any edits made in Monaco back into blocks (codeValue contains clean body)
      try {
        const nextBlocks = mdxToBlocks(codeValue);
        setBlocks(nextBlocks);
      } catch (err) {
        console.error("Failed to parse code to blocks:", err);
      }
    }
    setMode(newMode);
  };

  const handleEditorChange = (val: string | undefined) => {
    const nextVal = val ?? "";
    // Keep Monaco's internal state identical to editor to avoid cursor jumping
    setMonacoContent(nextVal);

    const { hasFrontmatter, frontmatterBlock, frontmatterYaml, body } =
      extractFrontmatter(nextVal);

    setCodeValue(body);
    lastSyncedValueRef.current = body;
    onChange?.(body);

    if (hasFrontmatter) {
      onFrontmatterChange?.(frontmatterBlock);
      try {
        const parsed = parseYaml(frontmatterYaml);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          onMetadataChange?.(parsed);
        }
      } catch {
        // Ignore YAML syntax errors while typing
      }
    }
  };

  // Add block from tray or external controller
  const handleAddBlock = useCallback(
    (
      type: MdxBlockType,
      targetIndex?: number,
      initialProps?: Record<string, any>,
    ) => {
      let createdBlockId = "";
      setBlocks((prev) => {
        let newBlock = createBlock(type, initialProps);
        if (type === "template") {
          newBlock.props.name = getUniqueTemplateName(
            prev,
            newBlock.props.name || "my-template",
          );
        } else if (isInlineOnlyBlock(type)) {
          // Inline components cannot be placed independently on root canvas:
          // automatically wrap inside an Inline Template container!
          const inlineBlock = newBlock;
          const baseName =
            (inlineBlock.props.name || type)
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "-")
              .replace(/^-+|-+$/g, "") || type;
          const tplName = getUniqueTemplateName(prev, baseName);
          newBlock = createBlock("template", {
            name: tplName,
            blocks: [inlineBlock],
          });
        }
        createdBlockId = newBlock.id;
        setActiveBlockId(newBlock.id);

        if (
          targetIndex !== undefined &&
          targetIndex >= 0 &&
          targetIndex <= prev.length
        ) {
          const next = [...prev];
          next.splice(targetIndex, 0, newBlock);
          return next;
        }
        return [...prev, newBlock];
      });

      // Smoothly scroll both the canvas area and preview down to the newly added block
      setTimeout(() => {
        if (!createdBlockId) return;
        const el = document.querySelector(
          `[data-canvas-block-id="${createdBlockId}"]`,
        ) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 80);
    },
    [setBlocks],
  );

  // Register external insertBlock listener if provided by MdxStudio
  useEffect(() => {
    if (onRegisterInsertBlock) {
      onRegisterInsertBlock((type, props) => {
        handleAddBlock(type, undefined, props);
      });
    }
  }, [onRegisterInsertBlock, handleAddBlock]);

  // Update block properties (captured in history as writing/typing sessions)
  const handleUpdateProps = useCallback(
    (id: string, props: Record<string, any>) => {
      setActiveBlockId((prevId) => (prevId === id ? prevId : id));
      setBlocks(
        (prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)),
        true,
      );
    },
    [setBlocks],
  );

  // Move Up
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      setBlocks((prev) => {
        if (index <= 0 || index >= prev.length) return prev;
        const blockId = prev[index]?.id;
        if (blockId) setActiveBlockId(blockId);
        const next = [...prev];
        const temp = next[index - 1];
        next[index - 1] = next[index];
        next[index] = temp;
        return next;
      });
    },
    [setBlocks],
  );

  // Move Down
  const handleMoveDown = useCallback(
    (index: number) => {
      setBlocks((prev) => {
        if (index < 0 || index >= prev.length - 1) return prev;
        const blockId = prev[index]?.id;
        if (blockId) setActiveBlockId(blockId);
        const next = [...prev];
        const temp = next[index + 1];
        next[index + 1] = next[index];
        next[index] = temp;
        return next;
      });
    },
    [setBlocks],
  );

  // Duplicate Block
  const handleDuplicate = useCallback(
    (index: number) => {
      setBlocks((prev) => {
        const original = prev[index];
        if (!original) return prev;
        const clone = createBlock(
          original.type,
          structuredClone(original.props),
        );
        if (clone.type === "template") {
          clone.props.name = getUniqueTemplateName(prev, clone.props.name);
        }
        setActiveBlockId(clone.id);
        const next = [...prev];
        next.splice(index + 1, 0, clone);
        return next;
      });
    },
    [setBlocks],
  );

  // Delete Block
  const handleDelete = useCallback(
    (index: number) => {
      setBlocks((prev) => prev.filter((_, i) => i !== index));
    },
    [setBlocks],
  );

  // Reorder via drag & drop
  const handleReorder = useCallback(
    (srcIdx: number, targetIdx: number) => {
      setBlocks((prev) => {
        const next = [...prev];
        const [moved] = next.splice(srcIdx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
    },
    [setBlocks],
  );

  /**
   * Adopt a top-level block as a new card in a Cards Group.
   *
   * Cards Group semantics: a standalone Card block becomes a new entry in
   * the group's flat list (title/badge/content preserved). Any other block
   * becomes a card whose content is a readable description.
   */
  const handleAdoptBlock = useCallback(
    (rootIndex: number, groupIndex: number, targetCardIndex?: number) => {
      setBlocks((prev) => {
        const group = prev[groupIndex];
        if (!group || group.type !== "cards") return prev;
        const source = prev[rootIndex];
        if (!source) return prev;

        const cards = Array.isArray(group.props.cards)
          ? [...group.props.cards]
          : [];

        let newCard: Record<string, any>;
        if (source.type === "card") {
          newCard = {
            id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: source.props.title || `Card ${cards.length + 1}`,
            badge: source.props.badge || "",
            content:
              typeof source.props.content === "string" &&
              source.props.content.trim()
                ? source.props.content
                : "Card content",
          };
        } else {
          newCard = {
            id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: `Card ${cards.length + 1}`,
            badge: "",
            content: `This card contains a ${source.type} block.`,
          };
        }

        if (
          typeof targetCardIndex === "number" &&
          targetCardIndex >= 0 &&
          targetCardIndex <= cards.length
        ) {
          cards.splice(targetCardIndex, 0, newCard);
        } else {
          cards.push(newCard);
        }

        const nextRoot = [...prev];
        nextRoot[groupIndex] = {
          ...group,
          props: { ...group.props, cards },
        };
        // Remove the adopted block from its original root position.
        return nextRoot.filter((_, i) => i !== rootIndex);
      });
    },
    [setBlocks],
  );

  /**
   * Extract a card from a Cards Group and place it outside on the root canvas.
   */
  const handleExtractCard = useCallback(
    (groupBlockIndex: number, cardIndex: number, targetRootIndex: number) => {
      setBlocks((prev) => {
        const group = prev[groupBlockIndex];
        if (!group || group.type !== "cards") return prev;
        const cards = Array.isArray(group.props.cards)
          ? [...group.props.cards]
          : [];
        if (cardIndex < 0 || cardIndex >= cards.length) return prev;

        // Extract the card
        const [extractedCard] = cards.splice(cardIndex, 1);

        // Create a standalone Card block
        const newBlock: MdxBlock = createBlock("card", {
          title: extractedCard.title || "",
          badge: extractedCard.badge || "",
          content: extractedCard.content || "",
        });

        const next = [...prev];

        if (cards.length === 0) {
          // If the group had only this 1 card, remove the now-empty Cards Group
          next.splice(groupBlockIndex, 1);
          const finalTarget =
            groupBlockIndex < targetRootIndex
              ? targetRootIndex - 1
              : targetRootIndex;
          const boundedTarget = Math.max(0, Math.min(finalTarget, next.length));
          next.splice(boundedTarget, 0, newBlock);
        } else {
          // Keep group with remaining cards
          next[groupBlockIndex] = {
            ...group,
            props: { ...group.props, cards },
          };
          const boundedTarget = Math.max(
            0,
            Math.min(targetRootIndex, next.length),
          );
          next.splice(boundedTarget, 0, newBlock);
        }

        return next;
      });
    },
    [setBlocks],
  );

  /**
   * Move a card from one Cards Group to another Cards Group.
   */
  const handleMoveCardBetweenGroups = useCallback(
    (
      srcGroupIndex: number,
      srcCardIndex: number,
      targetGroupIndex: number,
      targetCardIndex?: number,
    ) => {
      setBlocks((prev) => {
        const srcGroup = prev[srcGroupIndex];
        const tgtGroup = prev[targetGroupIndex];
        if (
          !srcGroup ||
          srcGroup.type !== "cards" ||
          !tgtGroup ||
          tgtGroup.type !== "cards"
        ) {
          return prev;
        }

        const srcCards = Array.isArray(srcGroup.props.cards)
          ? [...srcGroup.props.cards]
          : [];
        const tgtCards = Array.isArray(tgtGroup.props.cards)
          ? [...tgtGroup.props.cards]
          : [];
        if (srcCardIndex < 0 || srcCardIndex >= srcCards.length) return prev;

        const [movedCard] = srcCards.splice(srcCardIndex, 1);
        if (
          typeof targetCardIndex === "number" &&
          targetCardIndex >= 0 &&
          targetCardIndex <= tgtCards.length
        ) {
          tgtCards.splice(targetCardIndex, 0, movedCard);
        } else {
          tgtCards.push(movedCard);
        }

        const next = [...prev];
        if (srcCards.length === 0) {
          next.splice(srcGroupIndex, 1);
          const adjustedTgtIndex =
            srcGroupIndex < targetGroupIndex
              ? targetGroupIndex - 1
              : targetGroupIndex;
          next[adjustedTgtIndex] = {
            ...tgtGroup,
            props: { ...tgtGroup.props, cards: tgtCards },
          };
        } else {
          next[srcGroupIndex] = {
            ...srcGroup,
            props: { ...srcGroup.props, cards: srcCards },
          };
          next[targetGroupIndex] = {
            ...tgtGroup,
            props: { ...tgtGroup.props, cards: tgtCards },
          };
        }

        return next;
      });
    },
    [setBlocks],
  );

  // Copy compiled MDX (includes frontmatter when present)
  const handleCopyCode = async () => {
    try {
      let textToCopy = "";
      if (mode === "code") {
        textToCopy = monacoContent;
      } else {
        const hasFm = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(compiledMdx);
        textToCopy =
          !hasFm && frontmatter
            ? `${frontmatter}\n\n${compiledMdx}`
            : compiledMdx;
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("MDX code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.danger("Failed to copy code");
    }
  };

  return (
    <div
      data-lenis-prevent
      style={{ minHeight }}
      className={cn(
        "rounded-2xl border border-white/8 bg-muted/40 shadow-xl flex flex-col overflow-hidden transition-all",
        className,
      )}
    >
      {/* Builder Top Header Bar */}
      <BuilderToolbar
        title={title}
        documentName={documentName}
        mode={mode}
        isSmallScreen={isSmallScreen}
        canUndo={canUndo}
        canRedo={canRedo}
        copied={copied}
        onModeChange={handleModeChange}
        onOpenFloatingTray={() => setIsFloatingTrayOpen(true)}
        onUndo={undo}
        onRedo={redo}
        onCopyCode={handleCopyCode}
      />

      {/* Main Work Area */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-background/50 relative"
      >
        {/* Left Side: Visual Builder (Tray + Canvas), Monaco Code Editor, OR Mobile Live Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-w-0 relative">
          {mode === "preview" ? (
            /* Mode 3 (Small screens): Full-width Live MDX Preview */
            <div
              ref={previewScrollRef}
              onScroll={handlePreviewScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 lg:hidden bg-background/40"
            >
              <div className="prose prose-invert prose-neutral max-w-none text-sm text-neutral-200">
                <BuilderLivePreview blocks={deferredBlocks} />
              </div>
            </div>
          ) : mode === "builder" ? (
            <>
              {/* Left: Collapsible & Resizable Component Tray (hidden on small devices, docked on desktop) */}
              <div
                style={{
                  width: isTrayExpanded ? `${trayWidth}px` : "0px",
                }}
                className={cn(
                  "bg-muted/40 hidden lg:flex flex-col overflow-hidden shrink-0 border-r border-white/8",
                  dragSide === "left"
                    ? "transition-none"
                    : "transition-[width] duration-300 ease-in-out",
                  !isTrayExpanded && "pointer-events-none border-r-0",
                )}
              >
                <div
                  style={{ width: `${trayWidth}px` }}
                  className="h-full flex flex-col overflow-hidden"
                >
                  <ComponentTray
                    className="w-full border-r-0"
                    onAddBlock={(type) => handleAddBlock(type)}
                  />
                </div>
              </div>

              {/* Left Resizer Divider Bar (With Centered Unclipped Toggle Button) */}
              <div
                onMouseDown={handleMouseDownLeft}
                className={cn(
                  "relative z-40 hidden lg:flex items-center justify-center shrink-0 cursor-col-resize select-none touch-none",
                  "w-1 transition-all duration-150",
                  dragSide === "left"
                    ? "bg-accent/50"
                    : "bg-white/8 hover:bg-white/20",
                )}
                title="Drag to resize block panel • Click arrow to toggle"
              >
                {/* Centered Arrow Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTrayExpanded((prev) => !prev);
                  }}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center",
                    "w-5 h-12 rounded-full",
                    isTrayExpanded
                      ? "left-1/2 -translate-x-1/2"
                      : "left-0 translate-x-0 rounded-r-full rounded-l-none border-l-0",
                    "bg-neutral-900 border border-white/20 text-neutral-300 hover:text-white hover:border-accent hover:bg-neutral-800",
                    "shadow-[0_4px_16px_rgba(0,0,0,0.65)] backdrop-blur-md cursor-pointer transition-all",
                    "focus:outline-none hover:scale-105 active:scale-95",
                  )}
                  aria-label={
                    isTrayExpanded
                      ? "Collapse block panel"
                      : "Expand block panel"
                  }
                >
                  {isTrayExpanded ? (
                    <LuChevronLeft className="w-3.5 h-3.5" />
                  ) : (
                    <LuChevronRight className="w-3.5 h-3.5 text-accent" />
                  )}
                </button>
              </div>

              {/* Center: Canvas Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
                <CanvasArea
                  blocks={blocks}
                  activeBlockId={activeBlockId}
                  onActiveBlockChange={setActiveBlockId}
                  scrollRef={canvasScrollRef}
                  onScroll={handleCanvasScroll}
                  onUpdateProps={handleUpdateProps}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                  onDropNewBlock={(type, targetIdx) =>
                    handleAddBlock(type, targetIdx)
                  }
                  onAdoptBlock={handleAdoptBlock}
                  onExtractCard={handleExtractCard}
                  onMoveCardBetweenGroups={handleMoveCardBetweenGroups}
                />
              </div>
            </>
          ) : (
            /* Mode 2: Full Monaco MDX Code Editor */
            <div
              className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e1e1e]"
              onMouseEnter={() => {
                isPointerOverPreviewRef.current = false;
              }}
              onTouchStart={() => {
                isPointerOverPreviewRef.current = false;
              }}
            >
              {/* Monaco Editor Container */}
              <div className="flex-1 min-h-0 relative">
                <MonacoEditor
                  height="100%"
                  language="markdown"
                  theme="vs-dark"
                  value={monacoContent}
                  onChange={handleEditorChange}
                  onMount={handleMonacoMount}
                  options={{
                    fontSize: 13,
                    fontFamily:
                      "var(--font-mono), ui-monospace, Menlo, Monaco, Consolas, monospace",
                    lineNumbers: "on",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    wrappingIndent: "indent",
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: "all",
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    tabSize: 2,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Resizer Divider Bar (With Centered Unclipped Toggle Button) */}
        <div
          onMouseDown={handleMouseDownRight}
          className={cn(
            "relative z-40 hidden lg:flex items-center justify-center shrink-0 cursor-col-resize select-none touch-none",
            "w-1 transition-all duration-150",
            dragSide === "right"
              ? "bg-accent/50"
              : "bg-white/8 hover:bg-white/20",
          )}
          title="Drag to resize preview • Click arrow to toggle"
        >
          {/* Centered Arrow Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewExpanded((prev) => !prev);
            }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center",
              "w-5 h-12 rounded-full",
              isPreviewExpanded
                ? "left-1/2 -translate-x-1/2"
                : "right-0 translate-x-0 rounded-l-full rounded-r-none border-r-0",
              "bg-neutral-900 border border-white/20 text-neutral-300 hover:text-white hover:border-accent hover:bg-neutral-800",
              "shadow-[0_4px_16px_rgba(0,0,0,0.65)] backdrop-blur-md cursor-pointer transition-all",
              "focus:outline-none hover:scale-105 active:scale-95",
            )}
            aria-label={
              isPreviewExpanded ? "Collapse preview" : "Expand preview"
            }
          >
            {isPreviewExpanded ? (
              <LuChevronRight className="w-3.5 h-3.5" />
            ) : (
              <LuChevronLeft className="w-3.5 h-3.5 text-accent" />
            )}
          </button>
        </div>

        {/* Right: Collapsible & Resizable Live MDX Preview Panel (Desktop only) */}
        <div
          style={{
            width: isPreviewExpanded ? `${previewWidth}px` : "0px",
          }}
          className={cn(
            "bg-white/1 hidden lg:flex flex-col overflow-hidden shrink-0 border-l border-white/8",
            dragSide === "right"
              ? "transition-none"
              : "transition-[width] duration-300 ease-in-out",
            !isPreviewExpanded && "pointer-events-none border-l-0",
          )}
        >
          {/* Panel Content (Fixed inner width to avoid text jumping during collapse/expand) */}
          <div
            style={{ width: `${previewWidth}px` }}
            className="h-full flex flex-col overflow-hidden"
          >
            {/* Preview Content */}
            <div
              ref={previewScrollRef}
              onMouseEnter={() => {
                isPointerOverPreviewRef.current = true;
              }}
              onMouseLeave={() => {
                isPointerOverPreviewRef.current = false;
              }}
              onTouchStart={() => {
                isPointerOverPreviewRef.current = true;
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  isPointerOverPreviewRef.current = false;
                }, 300);
              }}
              onScroll={handlePreviewScroll}
              className="flex-1 overflow-y-auto p-6 sm:p-7"
            >
              <div className="prose prose-invert prose-neutral max-w-none text-sm text-neutral-200">
                {mode === "code" ? (
                  <MDXContent content={codeValue} />
                ) : (
                  <BuilderLivePreview blocks={deferredBlocks} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Block Sidepanel Drawer for Small Devices */}
      {createPortal(
        <AnimatePresence>
          {isFloatingTrayOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsFloatingTrayOpen(false)}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                aria-hidden="true"
              />

              {/* Slide-over floating drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 280 }}
                className="relative z-10 w-77.5 max-w-[85vw] h-full bg-neutral-900 border-r border-white/10 shadow-2xl flex flex-col overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="h-14 px-4 border-b border-white/10 flex items-center justify-end shrink-0 bg-white/2">
                  <button
                    type="button"
                    onClick={() => setIsFloatingTrayOpen(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white bg-white/4 hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close block library"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Content: ComponentTray */}
                <div className="flex-1 overflow-hidden">
                  <ComponentTray
                    className="w-full h-full border-r-0"
                    onAddBlock={(blockType) => {
                      handleAddBlock(blockType);
                      setIsFloatingTrayOpen(false);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default MdxBuilder;
