"use client";

import React, { useState, useEffect, useCallback } from "react";

export function usePanelResizer(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [trayWidth, setTrayWidth] = useState<number>(270);
  const [isTrayExpanded, setIsTrayExpanded] = useState(true);
  const [previewWidth, setPreviewWidth] = useState<number>(460);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [dragSide, setDragSide] = useState<"left" | "right" | null>(null);

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
  }, [
    containerRef,
    dragSide,
    isPreviewExpanded,
    previewWidth,
    isTrayExpanded,
    trayWidth,
  ]);

  const handleMouseDownLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragSide("left");
  }, []);

  const handleMouseDownRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragSide("right");
  }, []);

  return {
    trayWidth,
    isTrayExpanded,
    setIsTrayExpanded,
    previewWidth,
    isPreviewExpanded,
    setIsPreviewExpanded,
    dragSide,
    handleMouseDownLeft,
    handleMouseDownRight,
  };
}
