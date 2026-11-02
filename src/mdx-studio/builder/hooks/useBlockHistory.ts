"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MdxBlock } from "../types";

const MAX_HISTORY = 100;

export function useBlockHistory(initialBlocks: MdxBlock[]) {
  const [blocks, setBlocksState] = useState<MdxBlock[]>(initialBlocks);
  const pastRef = useRef<MdxBlock[][]>([]);
  const futureRef = useRef<MdxBlock[][]>([]);
  const currentBlocksRef = useRef<MdxBlock[]>(initialBlocks);

  // Typing session tracking for natural text undo/redo
  const isTypingSessionActiveRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State to force re-render for canUndo/canRedo button states
  const [, setHistoryVersion] = useState(0);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  /**
   * Set blocks and record history.
   * - isTyping: true when user is typing text in inputs/textareas (groups keystrokes into bursts)
   * - isTyping: false for discrete actions (adding/deleting/moving blocks, styling buttons, formatting)
   */
  const setBlocks = useCallback(
    (
      action: MdxBlock[] | ((prev: MdxBlock[]) => MdxBlock[]),
      isTyping = false
    ) => {
      const previousState = currentBlocksRef.current;
      const nextBlocks =
        typeof action === "function" ? action(previousState) : action;

      // Ignore no-op updates
      if (JSON.stringify(previousState) === JSON.stringify(nextBlocks)) {
        return;
      }

      if (!isTyping) {
        // Discrete action (add, delete, reorder, duplicate, clear, toggle style)
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        isTypingSessionActiveRef.current = false;

        // Push baseline to past
        pastRef.current = [
          ...pastRef.current.slice(-(MAX_HISTORY - 1)),
          JSON.parse(JSON.stringify(previousState)),
        ];
        futureRef.current = [];
        currentBlocksRef.current = nextBlocks;
        setBlocksState(nextBlocks);
        setHistoryVersion((v) => v + 1);
      } else {
        // Writing / typing in an input
        if (!isTypingSessionActiveRef.current) {
          isTypingSessionActiveRef.current = true;
          // Immediately save the state BEFORE the user began typing this burst
          pastRef.current = [
            ...pastRef.current.slice(-(MAX_HISTORY - 1)),
            JSON.parse(JSON.stringify(previousState)),
          ];
          futureRef.current = [];
        }

        currentBlocksRef.current = nextBlocks;
        setBlocksState(nextBlocks);
        setHistoryVersion((v) => v + 1);

        // Reset inactivity timer (450ms). When timer fires, typing session closes
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        typingTimerRef.current = setTimeout(() => {
          isTypingSessionActiveRef.current = false;
          typingTimerRef.current = null;
        }, 450);
      }
    },
    []
  );

  const resetBlocks = useCallback((newBlocks: MdxBlock[]) => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    isTypingSessionActiveRef.current = false;
    pastRef.current = [];
    futureRef.current = [];
    currentBlocksRef.current = newBlocks;
    setBlocksState(newBlocks);
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    // End any active typing burst immediately
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    isTypingSessionActiveRef.current = false;

    if (pastRef.current.length === 0) return;

    const previous = pastRef.current[pastRef.current.length - 1];
    const newPast = pastRef.current.slice(0, pastRef.current.length - 1);

    // Push current state into future stack for Redo
    futureRef.current = [
      JSON.parse(JSON.stringify(currentBlocksRef.current)),
      ...futureRef.current,
    ];
    pastRef.current = newPast;
    currentBlocksRef.current = previous;

    setBlocksState(previous);
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    isTypingSessionActiveRef.current = false;

    if (futureRef.current.length === 0) return;

    const next = futureRef.current[0];
    const newFuture = futureRef.current.slice(1);

    // Push current state into past stack
    pastRef.current = [
      ...pastRef.current.slice(-(MAX_HISTORY - 1)),
      JSON.parse(JSON.stringify(currentBlocksRef.current)),
    ];
    futureRef.current = newFuture;
    currentBlocksRef.current = next;

    setBlocksState(next);
    setHistoryVersion((v) => v + 1);
  }, []);

  // Global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      // Redo: Ctrl+Shift+Z or Ctrl+Y (case-insensitive)
      if (
        (e.shiftKey && (e.key === "z" || e.key === "Z")) ||
        e.key === "y" ||
        e.key === "Y"
      ) {
        e.preventDefault();
        e.stopPropagation();
        redo();
        return;
      }

      // Undo: Ctrl+Z (without shift)
      if (!e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        e.stopPropagation();
        undo();
        return;
      }
    };

    // Use capture phase to catch shortcuts even when focused inside an input/textarea
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [undo, redo]);

  return {
    blocks,
    setBlocks,
    resetBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
