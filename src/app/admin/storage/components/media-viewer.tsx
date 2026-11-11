"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuDownload,
  LuLink,
  LuTrash2,
  LuPlay,
  LuPause,
  LuVolume2,
  LuVolumeX,
  LuFileAudio,
  LuCalendar,
  LuClock,
  LuHardDrive,
  LuFileType,
  LuCheck,
  LuX,
} from "react-icons/lu";
import { useConfirm } from "@/providers/confirm-provider";
import type { ContentItem } from "../types";
import { useContent } from "../hooks/use-content-manager";
import {
  formatItemTypeLabel,
  isImageMime,
  isAudioMime,
  isVideoMime,
} from "@/lib/file-type";
import { storageClient } from "@/lib/storage";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  items?: ContentItem[];
  initialIndex?: number;
  onDeleteItem?: (path: string) => void;
};

function formatSize(size?: number | null) {
  if (!size || size <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}

/** Build a Cloudinary URL from a media delivery URL. */
function getMediaUrl(item: ContentItem): string | null {
  if (item.kind !== "file" || !item.url) return null;
  const sep = "/upload/";
  const idx = item.url.indexOf(sep);
  if (idx === -1) return null;

  const transform = isImageMime(item.mimeType)
    ? "c_fill,q_auto,f_auto/"
    : isVideoMime(item.mimeType)
      ? "so_0,c_fill,q_auto,f_jpg/"
      : null;
  if (!transform) return null;

  return (
    item.url.slice(0, idx + sep.length) +
    transform +
    item.url.slice(idx + sep.length)
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function MediaViewer(props: Props = {}) {
  const content = useContent();
  const isOpen = props.isOpen ?? content.isMediaViewerOpen;
  const onClose = props.onClose ?? content.closePreview;
  const items = props.items ?? content.items;
  const initialIndex = props.initialIndex ?? content.mediaViewerIndex;
  const onDeleteItem =
    props.onDeleteItem ?? ((path: string) => content.deletePaths([path]));

  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mediaItems = items.filter((it) => storageClient.isMediaItem(it));
  const currentItem = mediaItems[currentIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(true);
      setCopied(false);
    }
  }, [isOpen, initialIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = async () => {
    if (!currentItem) return;
    try {
      const res = await fetch(currentItem.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentItem.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(currentItem.url, "_blank");
    }
  };

  const handleCopyUrl = () => {
    if (!currentItem) return;
    navigator.clipboard.writeText(currentItem.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const { confirm } = useConfirm();

  const handleDelete = async () => {
    if (!currentItem) return;

    confirm({
      title: "Delete File",
      description: `Are you sure you want to permanently delete "${currentItem.name}"?`,
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        await onDeleteItem(currentItem.path);
        onClose();
      },
    });
  };

  const togglePlay = () => {
    const media = videoRef.current || audioRef.current;
    if (!media) return;
    if (isPlaying) media.pause();
    else media.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const media = videoRef.current || audioRef.current;
    if (!media) return;
    media.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const isImage =
    currentItem && isImageMime(currentItem.mimeType, currentItem.name);
  const isVideo =
    currentItem && isVideoMime(currentItem.mimeType, currentItem.name);
  const isAudio =
    currentItem && isAudioMime(currentItem.mimeType, currentItem.name);

  const drawerContent = (
    <AnimatePresence>
      {isOpen && currentItem && (
        <>
          {/* Backdrop */}
          <motion.div
            key="media-viewer-backdrop"
            className="fixed inset-0 z-1000 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            key="media-viewer-panel"
            role="dialog"
            aria-modal="true"
            aria-label={currentItem.name}
            className="fixed top-0 right-0 z-1001 flex h-full w-full flex-col overflow-hidden border-white/6 bg-neutral-900/85 backdrop-blur-2xl shadow-2xl sm:w-104 sm:max-w-[calc(100vw-2rem)] sm:border-l"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 120 || info.velocity.x > 600) onClose();
            }}
            style={{ touchAction: "pan-y" }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute top-4 right-4 z-10 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LuX className="w-4 h-4" />
            </button>

            {/* Media Preview Box */}
            <div className="shrink-0 flex items-center justify-center rounded-2xl bg-black/30 border border-white/6 overflow-hidden p-2 min-h-64 m-4 mb-0">
              {isImage && (
                <img
                  // currentItem.url will handle all cases, but still we are using getMediaUrl for some edge cases like when it is a pdf file without getMediaUrl function it will cannot render pdf image version
                  src={getMediaUrl(currentItem) || currentItem.url}
                  alt={currentItem.name}
                  className="w-full max-h-80 object-contain rounded-xl"
                />
              )}
              {isVideo && (
                <video
                  ref={videoRef}
                  src={currentItem.url}
                  className="w-full h-auto max-h-80 object-contain rounded-xl"
                  autoPlay
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
              {isAudio && (
                <div className="flex flex-col items-center gap-4 py-8 w-full">
                  <div className="w-20 h-20 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
                    <LuFileAudio className="w-10 h-10" />
                  </div>
                  <audio
                    ref={audioRef}
                    src={currentItem.url}
                    autoPlay
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors cursor-pointer"
                    >
                      {isPlaying ? (
                        <LuPause className="w-4 h-4" />
                      ) : (
                        <LuPlay className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {isMuted ? (
                        <LuVolumeX className="w-4 h-4" />
                      ) : (
                        <LuVolume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 overflow-y-auto space-y-5 px-4 py-5">
              {/* Name & Type Badge */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white break-all leading-snug pr-8">
                  {currentItem.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 border border-white/8 text-neutral-300">
                    <LuFileType className="w-3 h-3 text-accent" />
                    {formatItemTypeLabel(
                      currentItem.mimeType,
                      currentItem.name,
                    )}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="rounded-xl bg-white/3 border border-white/5 divide-y divide-white/5">
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                    <LuCalendar className="w-3.5 h-3.5" />
                    Created
                  </span>
                  <span className="text-xs text-neutral-200 font-medium tabular-nums">
                    {formatDate(currentItem.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                    <LuClock className="w-3.5 h-3.5" />
                    Modified
                  </span>
                  <span className="text-xs text-neutral-200 font-medium tabular-nums">
                    {formatDate(currentItem.updatedAt || currentItem.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                    <LuHardDrive className="w-3.5 h-3.5" />
                    Size
                  </span>
                  <span className="text-xs text-neutral-200 font-medium tabular-nums">
                    {formatSize(currentItem.sizeBytes)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/6 hover:bg-white/10 text-xs font-medium text-white transition-colors cursor-pointer border border-white/6"
                >
                  <LuDownload className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/6 hover:bg-white/10 text-xs font-medium text-white transition-colors cursor-pointer border border-white/6"
                >
                  {copied ? (
                    <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <LuLink className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? "Copied!" : "Copy URL"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer border border-rose-500/20"
                  title="Delete file"
                >
                  <LuTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(drawerContent, document.body);
}
