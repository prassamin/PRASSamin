"use client";

import React, { useRef, useEffect, useCallback } from "react";

type ScrollSource = "canvas" | "preview" | "monaco";

interface AnchorPair {
  sourceTop: number;
  targetTop: number;
}

interface UseSmoothScrollSyncOptions {
  mode: "builder" | "code" | "preview";
  isPreviewExpanded: boolean;
  monacoContent: string;
  activeBlockId: string | null;
  canvasScrollRef: React.RefObject<HTMLDivElement | null>;
  previewScrollRef: React.RefObject<HTMLDivElement | null>;
  monacoEditorRef: React.MutableRefObject<any>;
}

/**
 * O(log N) binary-search interpolation across a strictly monotonic anchor table.
 */
function interpolateAnchors(scrollTop: number, anchors: AnchorPair[]): number {
  const len = anchors.length;
  if (len === 0) return 0;
  if (scrollTop <= anchors[0].sourceTop) return anchors[0].targetTop;
  const last = anchors[len - 1];
  if (scrollTop >= last.sourceTop) return last.targetTop;

  let lo = 0;
  let hi = len - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (anchors[mid].sourceTop <= scrollTop) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const lower = anchors[lo];
  const upper = anchors[hi];
  const span = upper.sourceTop - lower.sourceTop;
  if (span <= 0.5) return upper.targetTop;
  const t = (scrollTop - lower.sourceTop) / span;
  return lower.targetTop + t * (upper.targetTop - lower.targetTop);
}

export function useSmoothScrollSync({
  mode,
  isPreviewExpanded,
  monacoContent,
  activeBlockId,
  canvasScrollRef,
  previewScrollRef,
  monacoEditorRef,
}: UseSmoothScrollSyncOptions) {
  const leaderRef = useRef<ScrollSource | null>(null);
  const leaderExpiryRef = useRef<number>(0);
  const isPointerOverPreviewRef = useRef(false);
  const syncRafRef = useRef<number | null>(null);
  const isProgrammaticWriteRef = useRef(false);

  // Persistent mode-transition scroll progress so switching Builder <-> Code
  // restores the exact vertical scroll position on both the editor/canvas and preview.
  const pendingTransitionRef = useRef<{
    ratio: number;
    previewScrollTop: number;
    targetMode: "builder" | "code" | "preview";
  } | null>(null);

  // Cached anchor tables — valid for 800ms as long as scrollHeight hasn't changed,
  // so 0 DOM queries and 0 layout reflows happen during active scrolling!
  const anchorCacheRef = useRef<{
    timestamp: number;
    canvasScrollHeight: number;
    previewScrollHeight: number;
    canvasToPreview: AnchorPair[];
    previewToCanvas: AnchorPair[];
  } | null>(null);

  const monacoAnchorCacheRef = useRef<{
    timestamp: number;
    monacoScrollHeight: number;
    previewScrollHeight: number;
    content: string;
    monacoToPreview: AnchorPair[];
    previewToMonaco: AnchorPair[];
  } | null>(null);

  const getCanvasPreviewAnchors = useCallback(() => {
    const canvas = canvasScrollRef.current;
    const preview = previewScrollRef.current;
    if (!canvas || !preview) return null;

    const now = performance.now();
    const cScrollH = canvas.scrollHeight;
    const pScrollH = preview.scrollHeight;

    if (
      anchorCacheRef.current &&
      now - anchorCacheRef.current.timestamp < 800 &&
      anchorCacheRef.current.canvasScrollHeight === cScrollH &&
      anchorCacheRef.current.previewScrollHeight === pScrollH
    ) {
      return anchorCacheRef.current;
    }

    const canvasMax = Math.max(0, cScrollH - canvas.clientHeight);
    const previewMax = Math.max(0, pScrollH - preview.clientHeight);

    const c2p: AnchorPair[] = [{ sourceTop: 0, targetTop: 0 }];
    const p2c: AnchorPair[] = [{ sourceTop: 0, targetTop: 0 }];

    if (canvasMax > 0 && previewMax > 0) {
      const cContainerRect = canvas.getBoundingClientRect();
      const pContainerRect = preview.getBoundingClientRect();
      const cScrollTop = canvas.scrollTop;
      const pScrollTop = preview.scrollTop;
      const readingOffset = 32;

      const previewBlockMap = new Map<string, HTMLElement>();
      const previewNodes =
        preview.querySelectorAll<HTMLElement>("[data-block-id]");
      for (let i = 0; i < previewNodes.length; i++) {
        const el = previewNodes[i];
        const id = el.getAttribute("data-block-id");
        if (id) previewBlockMap.set(id, el);
      }

      const canvasNodes = canvas.querySelectorAll<HTMLElement>(
        "[data-canvas-block-id]",
      );

      const pushPair = (cPos: number, pPos: number) => {
        const clampedC = Math.max(0, Math.min(canvasMax, cPos));
        const clampedP = Math.max(0, Math.min(previewMax, pPos));
        const prevC2P = c2p[c2p.length - 1];
        if (clampedC >= prevC2P.sourceTop && clampedP >= prevC2P.targetTop) {
          if (
            clampedC > prevC2P.sourceTop + 0.5 ||
            clampedP > prevC2P.targetTop + 0.5
          ) {
            c2p.push({ sourceTop: clampedC, targetTop: clampedP });
          }
        }
        const prevP2C = p2c[p2c.length - 1];
        if (clampedP >= prevP2C.sourceTop && clampedC >= prevP2C.targetTop) {
          if (
            clampedP > prevP2C.sourceTop + 0.5 ||
            clampedC > prevP2C.targetTop + 0.5
          ) {
            p2c.push({ sourceTop: clampedP, targetTop: clampedC });
          }
        }
      };

      for (let i = 0; i < canvasNodes.length; i++) {
        const cEl = canvasNodes[i];
        const blockId = cEl.getAttribute("data-canvas-block-id");
        if (!blockId) continue;
        const pEl = previewBlockMap.get(blockId);
        if (!pEl) continue;

        const cRect = cEl.getBoundingClientRect();
        const pRect = pEl.getBoundingClientRect();

        const cTop = cRect.top - cContainerRect.top + cScrollTop - readingOffset;
        const pTop = pRect.top - pContainerRect.top + pScrollTop - readingOffset;
        pushPair(cTop, pTop);

        const cBottom = cTop + cRect.height;
        const pBottom = pTop + pRect.height;
        pushPair(cBottom, pBottom);
      }

      pushPair(canvasMax, previewMax);
    }

    const lastC2P = c2p[c2p.length - 1];
    if (lastC2P.sourceTop < canvasMax || lastC2P.targetTop < previewMax) {
      c2p.push({ sourceTop: canvasMax, targetTop: previewMax });
    }
    const lastP2C = p2c[p2c.length - 1];
    if (lastP2C.sourceTop < previewMax || lastP2C.targetTop < canvasMax) {
      p2c.push({ sourceTop: previewMax, targetTop: canvasMax });
    }

    const entry = {
      timestamp: now,
      canvasScrollHeight: cScrollH,
      previewScrollHeight: pScrollH,
      canvasToPreview: c2p,
      previewToCanvas: p2c,
    };
    anchorCacheRef.current = entry;
    return entry;
  }, [canvasScrollRef, previewScrollRef]);

  const getMonacoPreviewAnchors = useCallback(() => {
    const editor = monacoEditorRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return null;

    const now = performance.now();
    const mScrollH = editor.getScrollHeight();
    const pScrollH = preview.scrollHeight;

    if (
      monacoAnchorCacheRef.current &&
      now - monacoAnchorCacheRef.current.timestamp < 800 &&
      monacoAnchorCacheRef.current.monacoScrollHeight === mScrollH &&
      monacoAnchorCacheRef.current.previewScrollHeight === pScrollH &&
      monacoAnchorCacheRef.current.content === monacoContent
    ) {
      return monacoAnchorCacheRef.current;
    }

    const clientHeight = editor.getLayoutInfo().height;
    const monacoMax = Math.max(0, mScrollH - clientHeight);
    const previewMax = Math.max(0, pScrollH - preview.clientHeight);

    const m2p: AnchorPair[] = [{ sourceTop: 0, targetTop: 0 }];
    const p2m: AnchorPair[] = [{ sourceTop: 0, targetTop: 0 }];

    const pushPair = (mPos: number, pPos: number) => {
      const clampedM = Math.max(0, Math.min(monacoMax, mPos));
      const clampedP = Math.max(0, Math.min(previewMax, pPos));
      const prevM2P = m2p[m2p.length - 1];
      if (clampedM >= prevM2P.sourceTop && clampedP >= prevM2P.targetTop) {
        if (
          clampedM > prevM2P.sourceTop + 0.5 ||
          clampedP > prevM2P.targetTop + 0.5
        ) {
          m2p.push({ sourceTop: clampedM, targetTop: clampedP });
        }
      }
      const prevP2M = p2m[p2m.length - 1];
      if (clampedP >= prevP2M.sourceTop && clampedM >= prevP2M.targetTop) {
        if (
          clampedP > prevP2M.sourceTop + 0.5 ||
          clampedM > prevP2M.targetTop + 0.5
        ) {
          p2m.push({ sourceTop: clampedP, targetTop: clampedM });
        }
      }
    };

    const fmMatch = monacoContent.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
    if (fmMatch) {
      const fmLines = fmMatch[0].split("\n").length;
      const fmEndTop = editor.getTopForLineNumber(fmLines + 1);
      if (fmEndTop > 0 && fmEndTop < monacoMax) {
        pushPair(fmEndTop, 0);
      }
    }

    const lines = monacoContent.split("\n");
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
            pushPair(mTop, pTop);
            lastPreviewIdx = j + 1;
            break;
          }
        }
      }
    }

    pushPair(monacoMax, previewMax);

    const entry = {
      timestamp: now,
      monacoScrollHeight: mScrollH,
      previewScrollHeight: pScrollH,
      content: monacoContent,
      monacoToPreview: m2p,
      previewToMonaco: p2m,
    };
    monacoAnchorCacheRef.current = entry;
    return entry;
  }, [monacoContent, monacoEditorRef, previewScrollRef]);

  // Passive listeners to assign scroll leadership without disabling native GPU compositor scrolling!
  useEffect(() => {
    const canvas = canvasScrollRef.current;
    const preview = previewScrollRef.current;

    const markCanvasLeader = () => {
      isPointerOverPreviewRef.current = false;
      leaderRef.current = "canvas";
      leaderExpiryRef.current = performance.now() + 250;
    };

    const markPreviewLeader = () => {
      isPointerOverPreviewRef.current = true;
      leaderRef.current = "preview";
      leaderExpiryRef.current = performance.now() + 250;
    };

    if (canvas) {
      canvas.addEventListener("wheel", markCanvasLeader, { passive: true });
      canvas.addEventListener("touchstart", markCanvasLeader, { passive: true });
      canvas.addEventListener("pointerdown", markCanvasLeader, {
        passive: true,
      });
    }
    if (preview) {
      preview.addEventListener("wheel", markPreviewLeader, { passive: true });
      preview.addEventListener("touchstart", markPreviewLeader, {
        passive: true,
      });
      preview.addEventListener("pointerdown", markPreviewLeader, {
        passive: true,
      });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", markCanvasLeader);
        canvas.removeEventListener("touchstart", markCanvasLeader);
        canvas.removeEventListener("pointerdown", markCanvasLeader);
      }
      if (preview) {
        preview.removeEventListener("wheel", markPreviewLeader);
        preview.removeEventListener("touchstart", markPreviewLeader);
        preview.removeEventListener("pointerdown", markPreviewLeader);
      }
    };
  }, [canvasScrollRef, previewScrollRef, mode]);

  useEffect(() => {
    return () => {
      if (syncRafRef.current !== null) {
        cancelAnimationFrame(syncRafRef.current);
      }
    };
  }, []);

  const handleCanvasScroll = useCallback(() => {
    if (isProgrammaticWriteRef.current) return;
    if (mode !== "builder" || !isPreviewExpanded) return;

    const now = performance.now();
    if (leaderRef.current === "preview" && now < leaderExpiryRef.current) {
      return;
    }
    leaderRef.current = "canvas";
    leaderExpiryRef.current = now + 180;

    if (syncRafRef.current !== null) {
      cancelAnimationFrame(syncRafRef.current);
    }

    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = null;
      const canvas = canvasScrollRef.current;
      const preview = previewScrollRef.current;
      const anchors = getCanvasPreviewAnchors();
      if (!canvas || !preview || !anchors) return;

      const targetTop = interpolateAnchors(
        canvas.scrollTop,
        anchors.canvasToPreview,
      );
      isProgrammaticWriteRef.current = true;
      preview.scrollTop = targetTop;
      queueMicrotask(() => {
        isProgrammaticWriteRef.current = false;
      });
    });
  }, [mode, isPreviewExpanded, canvasScrollRef, previewScrollRef, getCanvasPreviewAnchors]);

  const handlePreviewScroll = useCallback(() => {
    if (isProgrammaticWriteRef.current) return;
    if (!isPreviewExpanded) return;

    const now = performance.now();
    if (
      (leaderRef.current === "canvas" || leaderRef.current === "monaco") &&
      now < leaderExpiryRef.current
    ) {
      return;
    }
    if (!isPointerOverPreviewRef.current && leaderRef.current !== "preview") {
      return;
    }
    leaderRef.current = "preview";
    leaderExpiryRef.current = now + 180;

    if (syncRafRef.current !== null) {
      cancelAnimationFrame(syncRafRef.current);
    }

    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = null;
      const preview = previewScrollRef.current;
      if (!preview) return;

      if (mode === "builder") {
        const canvas = canvasScrollRef.current;
        const anchors = getCanvasPreviewAnchors();
        if (!canvas || !anchors) return;
        const targetTop = interpolateAnchors(
          preview.scrollTop,
          anchors.previewToCanvas,
        );
        isProgrammaticWriteRef.current = true;
        canvas.scrollTop = targetTop;
        queueMicrotask(() => {
          isProgrammaticWriteRef.current = false;
        });
      } else if (mode === "code") {
        const editor = monacoEditorRef.current;
        const anchors = getMonacoPreviewAnchors();
        if (!editor || !anchors) return;
        const targetTop = interpolateAnchors(
          preview.scrollTop,
          anchors.previewToMonaco,
        );
        isProgrammaticWriteRef.current = true;
        editor.setScrollTop(targetTop);
        queueMicrotask(() => {
          isProgrammaticWriteRef.current = false;
        });
      }
    });
  }, [
    isPreviewExpanded,
    previewScrollRef,
    mode,
    canvasScrollRef,
    getCanvasPreviewAnchors,
    monacoEditorRef,
    getMonacoPreviewAnchors,
  ]);

  const syncMonacoToPreview = useCallback(() => {
    if (isProgrammaticWriteRef.current) return;
    if (mode !== "code" || !isPreviewExpanded) return;

    const now = performance.now();
    if (leaderRef.current === "preview" && now < leaderExpiryRef.current) {
      return;
    }
    leaderRef.current = "monaco";
    leaderExpiryRef.current = now + 180;

    if (syncRafRef.current !== null) {
      cancelAnimationFrame(syncRafRef.current);
    }

    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = null;
      const editor = monacoEditorRef.current;
      const preview = previewScrollRef.current;
      const anchors = getMonacoPreviewAnchors();
      if (!editor || !preview || !anchors) return;

      const targetTop = interpolateAnchors(
        editor.getScrollTop(),
        anchors.monacoToPreview,
      );
      isProgrammaticWriteRef.current = true;
      preview.scrollTop = targetTop;
      queueMicrotask(() => {
        isProgrammaticWriteRef.current = false;
      });
    });
  }, [
    mode,
    isPreviewExpanded,
    monacoEditorRef,
    previewScrollRef,
    getMonacoPreviewAnchors,
  ]);

  const handleMonacoMount = useCallback(
    (editor: any) => {
      monacoEditorRef.current = editor;

      editor.onDidScrollChange((e: any) => {
        if (!e.scrollTopChanged) return;
        syncMonacoToPreview();
      });

      editor.onDidChangeCursorPosition(() => {
        isPointerOverPreviewRef.current = false;
        leaderRef.current = "monaco";
        leaderExpiryRef.current = performance.now() + 220;
        syncMonacoToPreview();
      });

      // If we just transitioned into Code mode and Monaco mounted asynchronously,
      // apply the captured scroll position immediately.
      const pending = pendingTransitionRef.current;
      if (pending && pending.targetMode === "code") {
        const applyMonacoScroll = () => {
          const preview = previewScrollRef.current;
          isProgrammaticWriteRef.current = true;
          if (preview && pending.previewScrollTop > 0) {
            preview.scrollTop = pending.previewScrollTop;
          }
          const anchors = getMonacoPreviewAnchors();
          if (anchors && preview) {
            const targetTop = interpolateAnchors(
              preview.scrollTop,
              anchors.previewToMonaco,
            );
            editor.setScrollTop(targetTop);
          } else {
            const mMax = Math.max(
              0,
              editor.getScrollHeight() - editor.getLayoutInfo().height,
            );
            editor.setScrollTop(pending.ratio * mMax);
          }
          queueMicrotask(() => {
            isProgrammaticWriteRef.current = false;
          });
        };
        requestAnimationFrame(applyMonacoScroll);
        setTimeout(applyMonacoScroll, 60);
      }
    },
    [monacoEditorRef, syncMonacoToPreview, previewScrollRef, getMonacoPreviewAnchors],
  );

  /**
   * Call right BEFORE switching modes (`builder` <-> `code` <-> `preview`)
   * to snapshot the active scroll progress and preview scroll offset.
   */
  const captureScrollBeforeModeSwitch = useCallback(
    (nextMode: "builder" | "code" | "preview") => {
      const canvas = canvasScrollRef.current;
      const preview = previewScrollRef.current;
      const editor = monacoEditorRef.current;

      let ratio = 0;
      const previewScrollTop = preview ? preview.scrollTop : 0;

      if (mode === "builder" && canvas) {
        const cMax = Math.max(0, canvas.scrollHeight - canvas.clientHeight);
        ratio = cMax > 0 ? canvas.scrollTop / cMax : 0;
      } else if (mode === "code" && editor) {
        const mMax = Math.max(
          0,
          editor.getScrollHeight() - editor.getLayoutInfo().height,
        );
        ratio = mMax > 0 ? editor.getScrollTop() / mMax : 0;
      } else if (preview) {
        const pMax = Math.max(0, preview.scrollHeight - preview.clientHeight);
        ratio = pMax > 0 ? preview.scrollTop / pMax : 0;
      }

      // If preview is open and has valid scroll progress, use it if ratio was 0
      if (ratio === 0 && preview) {
        const pMax = Math.max(0, preview.scrollHeight - preview.clientHeight);
        if (pMax > 0) {
          ratio = preview.scrollTop / pMax;
        }
      }

      pendingTransitionRef.current = {
        ratio: Math.max(0, Math.min(1, ratio)),
        previewScrollTop,
        targetMode: nextMode,
      };
    },
    [mode, canvasScrollRef, previewScrollRef, monacoEditorRef],
  );

  // Restore scroll position seamlessly after `mode` finishes switching
  useEffect(() => {
    const pending = pendingTransitionRef.current;
    if (!pending || pending.targetMode !== mode) return;

    // Invalidate stale anchor caches so fresh anchors are computed for the new mode
    anchorCacheRef.current = null;
    monacoAnchorCacheRef.current = null;

    const restore = () => {
      const preview = previewScrollRef.current;
      const canvas = canvasScrollRef.current;
      const editor = monacoEditorRef.current;

      isProgrammaticWriteRef.current = true;

      if (preview && pending.previewScrollTop > 0) {
        preview.scrollTop = pending.previewScrollTop;
      }

      if (mode === "builder" && canvas) {
        const anchors = getCanvasPreviewAnchors();
        if (anchors && preview && preview.scrollHeight > preview.clientHeight) {
          canvas.scrollTop = interpolateAnchors(
            preview.scrollTop,
            anchors.previewToCanvas,
          );
        } else {
          const cMax = Math.max(0, canvas.scrollHeight - canvas.clientHeight);
          canvas.scrollTop = pending.ratio * cMax;
        }
      } else if (mode === "code" && editor) {
        const anchors = getMonacoPreviewAnchors();
        if (anchors && preview && preview.scrollHeight > preview.clientHeight) {
          editor.setScrollTop(
            interpolateAnchors(preview.scrollTop, anchors.previewToMonaco),
          );
        } else {
          const mMax = Math.max(
            0,
            editor.getScrollHeight() - editor.getLayoutInfo().height,
          );
          editor.setScrollTop(pending.ratio * mMax);
        }
      } else if (mode === "preview" && preview) {
        if (pending.previewScrollTop > 0) {
          preview.scrollTop = pending.previewScrollTop;
        } else {
          const pMax = Math.max(0, preview.scrollHeight - preview.clientHeight);
          preview.scrollTop = pending.ratio * pMax;
        }
      }

      queueMicrotask(() => {
        isProgrammaticWriteRef.current = false;
      });
    };

    const raf1 = requestAnimationFrame(() => {
      restore();
    });
    const timer = setTimeout(() => {
      restore();
      pendingTransitionRef.current = null;
    }, 80);

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(timer);
    };
  }, [
    mode,
    canvasScrollRef,
    previewScrollRef,
    monacoEditorRef,
    getCanvasPreviewAnchors,
    getMonacoPreviewAnchors,
  ]);

  // Auto-scroll preview to active block when user clicks/focuses or adds a block
  useEffect(() => {
    if (
      mode !== "builder" ||
      !activeBlockId ||
      !isPreviewExpanded ||
      (leaderRef.current !== null && performance.now() < leaderExpiryRef.current)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      if (
        leaderRef.current !== null &&
        performance.now() < leaderExpiryRef.current
      ) {
        return;
      }
      const container = previewScrollRef.current;
      if (!container) return;

      const target = container.querySelector<HTMLElement>(
        `[data-block-id="${activeBlockId}"]`,
      );
      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const isInView =
        targetRect.top >= containerRect.top + 30 &&
        targetRect.bottom <= containerRect.bottom - 30;

      if (!isInView) {
        const relativeTop =
          targetRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({
          top: Math.max(0, relativeTop - 32),
          behavior: "smooth",
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeBlockId, isPreviewExpanded, mode, previewScrollRef]);

  return {
    isPointerOverPreviewRef,
    handleCanvasScroll,
    handlePreviewScroll,
    handleMonacoMount,
    captureScrollBeforeModeSwitch,
  };
}
