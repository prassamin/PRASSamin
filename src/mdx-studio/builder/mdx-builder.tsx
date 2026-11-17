"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { MdxBlockType, MdxBlock } from "./types";
import { createBlock, blocksToMdx, mdxToBlocks } from "./compiler";
import { ComponentTray } from "./components/component-tray";
import { CanvasArea } from "./components/canvas-area";
import { useBlockHistory } from "./hooks/use-block-history";
import MDXContent from "@/components/mdx/mdx-content";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  LuLayoutTemplate,
  LuCode,
  LuCopy,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuUndo2,
  LuRedo2,
  LuEye,
  LuMenu,
  LuX,
} from "react-icons/lu";
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
    useBlockHistory(mdxToBlocks(value));
  const lastSyncedValueRef = useRef<string>(value);
  const [mode, setMode] = useState<BuilderMode>("builder");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isFloatingTrayOpen, setIsFloatingTrayOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trayWidth, setTrayWidth] = useState<number>(270);
  const [isTrayExpanded, setIsTrayExpanded] = useState(true);
  const [previewWidth, setPreviewWidth] = useState<number>(460);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [dragSide, setDragSide] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<any>(null);
  const activeScrollInitiatorRef = useRef<
    "canvas" | "preview" | "monaco" | null
  >(null);
  const isPointerOverPreviewRef = useRef(false);
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const scrollRafRef = useRef<number | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

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

  const claimScrollInitiator = (
    source: "canvas" | "preview" | "monaco",
  ): boolean => {
    if (
      activeScrollInitiatorRef.current !== null &&
      activeScrollInitiatorRef.current !== source
    ) {
      return false;
    }

    activeScrollInitiatorRef.current = source;
    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
    }
    scrollEndTimeoutRef.current = setTimeout(() => {
      activeScrollInitiatorRef.current = null;
    }, 120);

    return true;
  };

  useEffect(() => {
    return () => {
      if (scrollEndTimeoutRef.current)
        clearTimeout(scrollEndTimeoutRef.current);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  // Clean compiled MDX for output / export / code editor
  const compiledMdx = useMemo(() => blocksToMdx(blocks), [blocks]);

  // Preview MDX with data-block-id wrapper elements for precise auto-scrolling
  const previewMdx = useMemo(
    () => blocksToMdx(blocks, { forPreview: true }),
    [blocks],
  );

  const [codeValue, setCodeValue] = useState(compiledMdx);
  const [monacoContent, setMonacoContent] = useState<string>(() => {
    const hasFm = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(compiledMdx);
    return !hasFm && frontmatter
      ? `${frontmatter}\n\n${compiledMdx}`
      : compiledMdx;
  });
  const currentPreviewContent = mode === "code" ? codeValue : previewMdx;

  // Keep Monaco's buffer in sync with the latest blocks and frontmatter
  useEffect(() => {
    if (mode === "builder") {
      const hasFm = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(compiledMdx);
      const full =
        !hasFm && frontmatter
          ? `${frontmatter}\n\n${compiledMdx}`
          : compiledMdx;
      setMonacoContent(full);
    } else if (mode === "code" && frontmatter) {
      // If frontmatter changed externally (e.g. from the Information tab),
      // update Monaco while keeping the current code body intact
      const { frontmatterBlock, body } = extractFrontmatter(monacoContent);
      if (frontmatter !== frontmatterBlock) {
        setMonacoContent(`${frontmatter}\n\n${body}`);
      }
    }
  }, [frontmatter, mode, compiledMdx]);

  // Live mouse-drag resizer for both left block panel and right preview panel
  useEffect(() => {
    if (!dragSide) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (dragSide === "left") {
        const newWidth = e.clientX - rect.left;
        const minWidth = 200;
        const currentPreviewW = isPreviewExpanded ? previewWidth : 0;
        const maxWidth = Math.max(minWidth, rect.width - currentPreviewW - 280);
        const clampedWidth = Math.max(
          minWidth,
          Math.min(newWidth, Math.min(maxWidth, 520)),
        );
        setTrayWidth(clampedWidth);
        setIsTrayExpanded(true);
      } else if (dragSide === "right") {
        const newWidth = rect.right - e.clientX;
        const minWidth = 280;
        const currentTrayW = isTrayExpanded ? trayWidth : 0;
        const maxWidth = Math.max(minWidth, rect.width - currentTrayW - 320);
        const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        setPreviewWidth(clampedWidth);
        setIsPreviewExpanded(true);
      }
    };

    const handleMouseUp = () => {
      setDragSide(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragSide, isPreviewExpanded, previewWidth, isTrayExpanded, trayWidth]);

  const handleMouseDownLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragSide("left");
  };

  const handleMouseDownRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragSide("right");
  };

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

  // Synchronize compiled MDX whenever blocks change (when in visual builder mode)
  useEffect(() => {
    if (mode === "builder") {
      const compiled = blocksToMdx(blocks);
      setCodeValue(compiled);
      if (compiled !== lastSyncedValueRef.current) {
        lastSyncedValueRef.current = compiled;
        onChange?.(compiled);
      }
    }
  }, [blocks, mode, onChange]);

  // Auto-scroll the preview to the active block when user explicitly selects or adds a block
  useEffect(() => {
    // If user is currently actively scrolling either pane, do not interrupt them!
    if (
      mode !== "builder" ||
      !activeBlockId ||
      !isPreviewExpanded ||
      activeScrollInitiatorRef.current !== null
    ) {
      return;
    }

    const timer = setTimeout(() => {
      if (activeScrollInitiatorRef.current !== null) return;
      const container = previewScrollRef.current;
      if (!container) return;

      const target = container.querySelector(
        `[data-block-id="${activeBlockId}"]`,
      ) as HTMLElement | null;

      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Check if target is comfortably within view (with 30px buffer)
      const isInView =
        targetRect.top >= containerRect.top + 30 &&
        targetRect.bottom <= containerRect.bottom - 30;

      if (!isInView) {
        // Confine scrolling strictly to the preview container (avoid window / canvas scroll jumping)
        const relativeTop =
          targetRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({
          top: Math.max(0, relativeTop - 30),
          behavior: "smooth",
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeBlockId, isPreviewExpanded, mode]);

  // When switching modes, synchronize code <-> blocks
  const handleModeChange = (newMode: BuilderMode) => {
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

  // Synchronize Monaco Editor scrolling and cursor changes with Live Preview
  const getCodeScrollMarkers = useCallback(
    (
      editor: any,
      preview: HTMLElement,
      rawContent: string,
    ): { monacoTop: number; previewTop: number }[] => {
      const scrollHeight = editor.getScrollHeight();
      const clientHeight = editor.getLayoutInfo().height;
      const monacoMax = Math.max(0, scrollHeight - clientHeight);
      const previewMax = Math.max(
        0,
        preview.scrollHeight - preview.clientHeight,
      );

      const markers: { monacoTop: number; previewTop: number }[] = [];
      markers.push({ monacoTop: 0, previewTop: 0 });

      // 1. Frontmatter offset:
      const fmMatch = rawContent.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
      if (fmMatch) {
        const fmLines = fmMatch[0].split("\n").length;
        const contentStartLine = fmLines + 1;
        const fmEndTop = editor.getTopForLineNumber(contentStartLine);
        if (fmEndTop > 0 && fmEndTop < monacoMax) {
          markers.push({ monacoTop: fmEndTop, previewTop: 0 });
        }
      }

      // 2. Headings in Markdown:
      const lines = rawContent.split("\n");
      const markdownHeadings: { line: number; text: string }[] = [];
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^#{1,6}\s+(.+)$/);
        if (match) {
          const clean = String(match[1] || "")
            .replace(/[*_`]/g, "")
            .replace(/\[(.*?)\]\(.*?\)/g, "$1")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          if (clean) {
            markdownHeadings.push({ line: i + 1, text: clean });
          }
        }
      }

      if (markdownHeadings.length > 0) {
        const previewHeadings = Array.from(
          preview.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
        );
        const pContainerRect = preview.getBoundingClientRect();

        let lastPreviewIdx = 0;
        for (const mh of markdownHeadings) {
          for (let j = lastPreviewIdx; j < previewHeadings.length; j++) {
            const ph = previewHeadings[j];
            const pClean = String(ph.textContent || "")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

            if (
              pClean &&
              (pClean === mh.text ||
                pClean.includes(mh.text) ||
                mh.text.includes(pClean))
            ) {
              const mTop = editor.getTopForLineNumber(mh.line);
              const pRect = ph.getBoundingClientRect();
              const pTop = pRect.top - pContainerRect.top + preview.scrollTop;

              const lastMarker = markers[markers.length - 1];
              if (
                mTop > lastMarker.monacoTop &&
                pTop >= lastMarker.previewTop
              ) {
                markers.push({ monacoTop: mTop, previewTop: pTop });
                lastPreviewIdx = j + 1;
                break;
              }
            }
          }
        }
      }

      const last = markers[markers.length - 1];
      if (monacoMax > last.monacoTop || previewMax > last.previewTop) {
        markers.push({ monacoTop: monacoMax, previewTop: previewMax });
      }

      return markers;
    },
    [],
  );

  const syncMonacoToPreview = useCallback(() => {
    const editor = monacoEditorRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;

    const scrollHeight = editor.getScrollHeight();
    const clientHeight = editor.getLayoutInfo().height;
    const monacoMax = scrollHeight - clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (monacoMax <= 0 || previewMax <= 0) return;

    const monacoTop = editor.getScrollTop();
    if (monacoTop <= 2) {
      preview.scrollTop = 0;
      return;
    }
    if (monacoTop >= monacoMax - 2) {
      preview.scrollTop = previewMax;
      return;
    }

    const markers = getCodeScrollMarkers(editor, preview, monacoContent);
    let lower = markers[0];
    let upper = markers[markers.length - 1];

    for (let i = 0; i < markers.length - 1; i++) {
      if (
        monacoTop >= markers[i].monacoTop &&
        monacoTop <= markers[i + 1].monacoTop
      ) {
        lower = markers[i];
        upper = markers[i + 1];
        break;
      }
    }

    const monacoRange = upper.monacoTop - lower.monacoTop;
    const t = monacoRange > 0 ? (monacoTop - lower.monacoTop) / monacoRange : 0;
    const targetScroll =
      lower.previewTop + t * (upper.previewTop - lower.previewTop);

    preview.scrollTop = Math.max(0, Math.min(previewMax, targetScroll));
  }, [getCodeScrollMarkers, monacoContent]);

  const syncPreviewToMonaco = useCallback(() => {
    const editor = monacoEditorRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;

    const scrollHeight = editor.getScrollHeight();
    const clientHeight = editor.getLayoutInfo().height;
    const monacoMax = scrollHeight - clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (monacoMax <= 0 || previewMax <= 0) return;

    const pTop = preview.scrollTop;
    if (pTop <= 2) {
      editor.setScrollTop(0);
      return;
    }
    if (pTop >= previewMax - 2) {
      editor.setScrollTop(monacoMax);
      return;
    }

    const markers = getCodeScrollMarkers(editor, preview, monacoContent);
    let lower = markers[0];
    let upper = markers[markers.length - 1];

    for (let i = 0; i < markers.length - 1; i++) {
      if (pTop >= markers[i].previewTop && pTop <= markers[i + 1].previewTop) {
        lower = markers[i];
        upper = markers[i + 1];
        break;
      }
    }

    const previewRange = upper.previewTop - lower.previewTop;
    const t = previewRange > 0 ? (pTop - lower.previewTop) / previewRange : 0;
    const targetScroll =
      lower.monacoTop + t * (upper.monacoTop - lower.monacoTop);

    editor.setScrollTop(Math.max(0, Math.min(monacoMax, targetScroll)));
  }, [getCodeScrollMarkers, monacoContent]);

  const syncCanvasToPreview = useCallback(() => {
    const canvas = canvasScrollRef.current;
    const preview = previewScrollRef.current;
    if (!canvas || !preview) return;

    const canvasMax = canvas.scrollHeight - canvas.clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (canvasMax <= 0 || previewMax <= 0) return;

    if (canvas.scrollTop <= 2) {
      preview.scrollTop = 0;
      return;
    }
    if (canvas.scrollTop >= canvasMax - 2) {
      preview.scrollTop = previewMax;
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const canvasItems = canvas.querySelectorAll<HTMLElement>(
      "[data-canvas-block-id]",
    );
    if (canvasItems.length === 0) {
      preview.scrollTop = (canvas.scrollTop / canvasMax) * previewMax;
      return;
    }

    const targetY = canvasRect.top + 40;
    let activeItem: HTMLElement | null = null;
    let progressInBlock = 0;

    for (let i = 0; i < canvasItems.length; i++) {
      const item = canvasItems[i];
      const rect = item.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom >= targetY) {
        activeItem = item;
        const height = rect.height || 1;
        progressInBlock = Math.max(
          0,
          Math.min(1, (targetY - rect.top) / height),
        );
        break;
      }
    }

    if (!activeItem) {
      if (canvasItems[0].getBoundingClientRect().top > targetY) {
        activeItem = canvasItems[0];
        progressInBlock = 0;
      } else {
        activeItem = canvasItems[canvasItems.length - 1];
        progressInBlock = 1;
      }
    }

    const blockId = activeItem.getAttribute("data-canvas-block-id");
    if (!blockId) {
      preview.scrollTop = (canvas.scrollTop / canvasMax) * previewMax;
      return;
    }

    const previewEl = preview.querySelector<HTMLElement>(
      `[data-block-id="${blockId}"]`,
    );
    if (!previewEl) {
      preview.scrollTop = (canvas.scrollTop / canvasMax) * previewMax;
      return;
    }

    const pRect = previewEl.getBoundingClientRect();
    const pContainerRect = preview.getBoundingClientRect();
    const pRelTop = pRect.top - pContainerRect.top + preview.scrollTop;
    const targetScroll = pRelTop + progressInBlock * pRect.height - 40;

    preview.scrollTop = Math.max(0, Math.min(previewMax, targetScroll));
  }, []);

  const syncPreviewToCanvas = useCallback(() => {
    const canvas = canvasScrollRef.current;
    const preview = previewScrollRef.current;
    if (!canvas || !preview) return;

    const canvasMax = canvas.scrollHeight - canvas.clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (canvasMax <= 0 || previewMax <= 0) return;

    if (preview.scrollTop <= 2) {
      canvas.scrollTop = 0;
      return;
    }
    if (preview.scrollTop >= previewMax - 2) {
      canvas.scrollTop = canvasMax;
      return;
    }

    const previewRect = preview.getBoundingClientRect();
    const previewItems =
      preview.querySelectorAll<HTMLElement>("[data-block-id]");
    if (previewItems.length === 0) {
      canvas.scrollTop = (preview.scrollTop / previewMax) * canvasMax;
      return;
    }

    const targetY = previewRect.top + 40;
    let activeItem: HTMLElement | null = null;
    let progressInBlock = 0;

    for (let i = 0; i < previewItems.length; i++) {
      const item = previewItems[i];
      const rect = item.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom >= targetY) {
        activeItem = item;
        const height = rect.height || 1;
        progressInBlock = Math.max(
          0,
          Math.min(1, (targetY - rect.top) / height),
        );
        break;
      }
    }

    if (!activeItem) {
      if (previewItems[0].getBoundingClientRect().top > targetY) {
        activeItem = previewItems[0];
        progressInBlock = 0;
      } else {
        activeItem = previewItems[previewItems.length - 1];
        progressInBlock = 1;
      }
    }

    const blockId = activeItem.getAttribute("data-block-id");
    if (!blockId) {
      canvas.scrollTop = (preview.scrollTop / previewMax) * canvasMax;
      return;
    }

    const canvasEl = canvas.querySelector<HTMLElement>(
      `[data-canvas-block-id="${blockId}"]`,
    );
    if (!canvasEl) {
      canvas.scrollTop = (preview.scrollTop / previewMax) * canvasMax;
      return;
    }

    const cRect = canvasEl.getBoundingClientRect();
    const cContainerRect = canvas.getBoundingClientRect();
    const cRelTop = cRect.top - cContainerRect.top + canvas.scrollTop;
    const targetScroll = cRelTop + progressInBlock * cRect.height - 40;

    canvas.scrollTop = Math.max(0, Math.min(canvasMax, targetScroll));
  }, []);

  const handleMonacoMount = (editor: any) => {
    monacoEditorRef.current = editor;

    editor.onDidScrollChange(() => {
      if (mode !== "code" || !isPreviewExpanded) return;
      if (isPointerOverPreviewRef.current) return;
      if (!claimScrollInitiator("monaco")) return;

      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(syncMonacoToPreview);
    });

    editor.onDidChangeCursorPosition(() => {
      if (mode !== "code" || !isPreviewExpanded) return;
      if (isPointerOverPreviewRef.current) return;
      if (!claimScrollInitiator("monaco")) return;

      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(syncMonacoToPreview);
    });
  };

  // Synchronize scrolling from Canvas to Live Preview in Builder mode (Zero loop/jitter)
  const handleCanvasScroll = (_e: React.UIEvent<HTMLDivElement>) => {
    if (mode !== "builder" || !isPreviewExpanded) return;
    if (isPointerOverPreviewRef.current) return;
    if (!claimScrollInitiator("canvas")) return;

    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(syncCanvasToPreview);
  };

  const handlePreviewScroll = () => {
    if (!isPreviewExpanded) return;
    // Only synchronize scroll from preview back to editor/canvas when the user
    // is explicitly hovering over or interacting with the preview pane.
    // This prevents layout recalculations or programmatic scrolls from echoing back.
    if (!isPointerOverPreviewRef.current) return;

    if (mode === "code") {
      if (!claimScrollInitiator("preview")) return;
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(syncPreviewToMonaco);
    } else if (mode === "builder") {
      if (!claimScrollInitiator("preview")) return;
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(syncPreviewToCanvas);
    }
  };

  // Add block from tray or external controller
  const handleAddBlock = (
    type: MdxBlockType,
    targetIndex?: number,
    initialProps?: Record<string, any>,
  ) => {
    const newBlock = createBlock(type, initialProps);
    setActiveBlockId(newBlock.id);
    setBlocks((prev) => {
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
      const el = document.querySelector(
        `[data-canvas-block-id="${newBlock.id}"]`,
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 80);
  };

  // Register external insertBlock listener if provided by MdxStudio
  useEffect(() => {
    if (onRegisterInsertBlock) {
      onRegisterInsertBlock((type, props) => {
        handleAddBlock(type, undefined, props);
      });
    }
  }, [onRegisterInsertBlock]);

  // Update block properties (captured in history as writing/typing sessions)
  const handleUpdateProps = (id: string, props: Record<string, any>) => {
    setActiveBlockId(id);
    setBlocks(
      (prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)),
      true,
    );
  };

  // Move Up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const blockId = blocks[index]?.id;
    if (blockId) setActiveBlockId(blockId);
    setBlocks((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move Down
  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const blockId = blocks[index]?.id;
    if (blockId) setActiveBlockId(blockId);
    setBlocks((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Duplicate Block
  const handleDuplicate = (index: number) => {
    const original = blocks[index];
    if (!original) return;
    const clone = createBlock(
      original.type,
      JSON.parse(JSON.stringify(original.props)),
    );
    setActiveBlockId(clone.id);
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
  };

  // Delete Block
  const handleDelete = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  // Reorder via drag & drop
  const handleReorder = (srcIdx: number, targetIdx: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(srcIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  /**
   * Adopt a top-level block as a new card in a Cards Group.
   *
   * Cards Group semantics: a standalone Card block becomes a new entry in
   * the group's flat list (title/badge/content preserved). Any other block
   * becomes a card whose content is a readable description.
   */
  const handleAdoptBlock = (
    rootIndex: number,
    groupIndex: number,
    targetCardIndex?: number,
  ) => {
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
  };

  /**
   * Extract a card from a Cards Group and place it outside on the root canvas.
   */
  const handleExtractCard = (
    groupBlockIndex: number,
    cardIndex: number,
    targetRootIndex: number,
  ) => {
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
  };

  /**
   * Move a card from one Cards Group to another Cards Group.
   */
  const handleMoveCardBetweenGroups = (
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
  };

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

  // Clear all
  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all blocks from the canvas?",
      )
    ) {
      setBlocks([]);
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
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white/2 border-b border-white/8 flex-wrap select-none">
        {/* Left branding & Mobile block sidebar trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile floating sidebar trigger button (visible on small screens when in builder mode) */}
          {mode === "builder" && (
            <button
              type="button"
              onClick={() => setIsFloatingTrayOpen(true)}
              className="flex lg:hidden items-center gap-1.5 p-2 rounded-xl bg-white/6 hover:bg-white/12 active:scale-95 border border-white/10 text-xs font-medium text-neutral-200 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Open Block Library"
              aria-label="Open Block Library"
            >
              <LuMenu className="w-3.5 h-3.5 text-accent" />
            </button>
          )}

          <div className="h-4 w-px bg-white/10 hidden sm:block shrink-0" />

          <div className="not-sm:hidden flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-white font-rethink truncate">
              {title}
            </span>
            {documentName && (
              <span className="text-xs text-neutral-400 font-mono truncate hidden md:inline">
                / {documentName}
              </span>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle with SegmentedControl */}
          <SegmentedControl
            value={mode}
            onValueChange={(val) => handleModeChange(val as BuilderMode)}
            options={[
              {
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuLayoutTemplate className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Builder</span>
                  </span>
                ),
                value: "builder",
              },
              {
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuCode className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">MDX Code</span>
                  </span>
                ),
                value: "code",
              },
              ...(isSmallScreen
                ? [
                    {
                      label: (
                        <span className="flex items-center gap-1.5 font-medium">
                          <LuEye className="w-3.5 h-3.5 text-accent" />
                          <span className="hidden sm:inline">Preview</span>
                        </span>
                      ),
                      value: "preview",
                    },
                  ]
                : []),
            ]}
          />

          {/* History Undo / Redo controls */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Undo"
            >
              <LuUndo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
              className="p-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Redo"
            >
              <LuRedo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy MDX button */}
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy compiled MDX"
            className="p-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <LuCheck className="w-3.5 h-3.5 text-accent" />
            ) : (
              <LuCopy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

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
                <MDXContent content={currentPreviewContent} />
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
                <MDXContent content={currentPreviewContent} />
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
