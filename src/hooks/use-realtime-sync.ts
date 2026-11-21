"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";

export interface RealtimeSyncOptions {
  /**
   * The content / draft type to monitor (e.g. "education", "blog", "project", "experience").
   * Pass "*" or omit to listen to all draft types.
   */
  type?: string;

  /**
   * Polling interval in milliseconds while tab is active. Defaults to 3000 (3 seconds).
   */
  intervalMs?: number;

  /**
   * Whether to automatically call `router.refresh()` when a new or modified draft is detected.
   * Defaults to `true`.
   */
  autoRefresh?: boolean;

  /**
   * Custom toast message or function to trigger when an update is detected.
   * If a string is provided, `toast.info(message)` is displayed.
   * Set to `false` to disable toasts completely.
   */
  toastMessage?: string | boolean | ((info: { type: string; id: string; count: number }) => void);

  /**
   * Callback fired whenever a change is detected.
   */
  onSync?: (info: { type: string; id: string; count: number; timestamp: string }) => void;

  /**
   * Set to `false` to pause polling.
   */
  enabled?: boolean;
}

export interface RealtimeSyncReturn {
  isPolling: boolean;
  lastSyncedAt: string | null;
  draftCount: number;
  triggerManualCheck: () => Promise<void>;
}

/**
 * Universal, Hosting-Agnostic Realtime Polling Engine Hook.
 *
 * Uses fingerprint state tracking (draft count + entity count + latest microsecond timestamp)
 * to deterministically detect when drafts or records are created, updated, or deleted
 * via AI MCP tools or external operations without requiring WebSocket servers or SaaS lock-in.
 */
export function useRealtimeSync(options: RealtimeSyncOptions = {}): RealtimeSyncReturn {
  const {
    type = "*",
    intervalMs = 3000,
    autoRefresh = true,
    toastMessage = false,
    onSync,
    enabled = true,
  } = options;

  const router = useRouter();

  // Baseline fingerprint tracking
  const prevFingerprintRef = useRef<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState<number>(0);

  const checkForUpdates = useCallback(async () => {
    // Avoid overlapping calls or disabled state
    if (isFetchingRef.current || !enabled) return;

    // Pause when tab is not visible
    if (typeof document !== "undefined" && document.hidden) {
      setIsPolling(false);
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsPolling(true);

      const params = new URLSearchParams();
      if (type && type !== "*") params.set("type", type);
      if (prevFingerprintRef.current) params.set("since", prevFingerprintRef.current);

      const res = await fetch(`/api/admin/realtime/sync?${params.toString()}`, {
        method: "GET",
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });

      if (!res.ok) return;

      const data = await res.json();
      const currentFingerprint = data.fingerprint;

      if (typeof data.count === "number") {
        setDraftCount(data.count);
      }
      if (data.latestTimestamp) {
        setLastSyncedAt(data.latestTimestamp);
      }

      // Step 1: Prime baseline on initial response
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        prevFingerprintRef.current = currentFingerprint;
        return;
      }

      // Step 2: Change detection on subsequent checks
      if (
        currentFingerprint &&
        prevFingerprintRef.current !== null &&
        prevFingerprintRef.current !== currentFingerprint
      ) {
        prevFingerprintRef.current = currentFingerprint;

        const info = {
          type: data.latestType || type,
          id: data.latestId || "",
          count: data.count ?? data.draftCount ?? 0,
          timestamp: data.latestTimestamp || new Date().toISOString(),
        };

        if (process.env.NODE_ENV === "development") {
          console.log(`[RealtimeSync] Detected update (${type}):`, info);
        }

        // Trigger toast notification
        if (toastMessage) {
          if (typeof toastMessage === "function") {
            toastMessage(info);
          } else if (typeof toastMessage === "string") {
            toast.info(toastMessage);
          } else {
            const label = data.latestType
              ? data.latestType.charAt(0).toUpperCase() + data.latestType.slice(1)
              : "Content";
            toast.info(`New update received for ${label}.`);
          }
        }

        // Trigger custom callback
        onSync?.(info);

        // Auto refresh Next.js server components
        if (autoRefresh) {
          router.refresh();
        }
      }
    } catch (err) {
      console.warn("[RealtimeSync] Poll check skipped:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [type, enabled, toastMessage, onSync, autoRefresh, router]);

  useEffect(() => {
    if (!enabled) return;

    // Reset baseline when type or enabled changes
    isInitializedRef.current = false;
    prevFingerprintRef.current = null;

    // Initial check to prime baseline
    checkForUpdates();

    // Polling interval
    const timer = setInterval(() => {
      checkForUpdates();
    }, intervalMs);

    // Focus & visibility change listeners
    const handleVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        checkForUpdates();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [enabled, intervalMs, checkForUpdates]);

  return {
    isPolling,
    lastSyncedAt,
    draftCount,
    triggerManualCheck: checkForUpdates,
  };
}
