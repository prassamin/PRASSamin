"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { LuX, LuCheck, LuCircleAlert } from "react-icons/lu";
import type { UploadFileItem } from "@/lib/storage";

export interface UploadProgressPanelProps {
  queue: UploadFileItem[];
  onClear: () => void;
  portal?: boolean;
}

export function UploadProgressPanel({
  queue,
  onClear,
  portal = true,
}: UploadProgressPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = queue.length;
  const doneCount = queue.filter((q) => q.status === "done").length;
  const errorCount = queue.filter((q) => q.status === "error").length;
  const activeCount = queue.filter(
    (q) => q.status === "uploading" || q.status === "pending",
  ).length;
  const isFinished = totalCount > 0 && doneCount + errorCount === totalCount;

  const content = (
    <AnimatePresence>
      {totalCount > 0 && (
        <motion.div
          key="upload-progress-panel"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.96,
            transition: { duration: 0.18, ease: "easeIn" },
          }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          style={{ zIndex: 999999 }}
          className="fixed bottom-6 right-6 w-84 max-w-[calc(100vw-32px)] rounded-2xl border border-white/8 bg-neutral-900/90 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">
                {isFinished
                  ? errorCount > 0
                    ? `Upload finished with ${errorCount} error${errorCount > 1 ? "s" : ""}`
                    : "Upload complete"
                  : `Uploading ${activeCount} file${activeCount !== 1 ? "s" : ""}`}
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {doneCount} / {totalCount} completed
              </span>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <LuX className="w-4 h-4" />
            </button>
          </div>

          {/* File List */}
          <div className="max-h-60 overflow-y-auto p-3.5 space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-xs font-medium text-neutral-200 truncate max-w-44"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400 tabular-nums shrink-0 ml-2 flex items-center gap-1">
                      {item.status === "done" ? (
                        <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                          <LuCheck className="w-3.5 h-3.5" />
                        </span>
                      ) : item.status === "error" ? (
                        <span className="text-rose-400 flex items-center gap-0.5 font-bold">
                          <LuCircleAlert className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        `${item.percent}%`
                      )}
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        item.status === "done"
                          ? "bg-emerald-400"
                          : item.status === "error"
                            ? "bg-rose-500"
                            : "bg-accent"
                      }`}
                      initial={false}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  </div>

                  {item.status === "error" && item.error && (
                    <span className="text-[11px] text-rose-400 mt-1 block leading-tight font-medium">
                      {item.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  if (portal && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
