"use client";

import React, { useState } from "react";
import {
  LuFile,
  LuFileImage,
  LuFolder,
  LuTrash2,
  LuEye,
  LuEllipsisVertical,
  LuDownload,
  LuLink,
  LuVideo,
  LuFileAudio,
  LuUpload,
} from "react-icons/lu";
import type { ContentItem } from "../types";
import { Dropdown, Header, Label, Skeleton, cn, toast } from "@heroui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useConfirm } from "@/providers/confirm-provider";
import { useContent } from "../hooks/use-content-manager";
import {
  formatItemTypeLabel,
  isAudioMime,
  isImageMime,
  isVideoMime,
} from "@/lib/file-type";
import { storageClient } from "@/lib/storage";
import { ContentUploadDropzone } from "./content-upload-dropzone";

type Props = {
  onPreview?: (item: ContentItem) => void;
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

function formatItemType(item: ContentItem) {
  if (item.kind === "folder") return "Folder";
  return formatItemTypeLabel(item.mimeType, item.name);
}

function FileIcon({ item }: { item: ContentItem }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = storageClient.getThumbUrl(item);
  const showThumb =
    Boolean(thumb) &&
    !thumbFailed &&
    (isImageMime(item.mimeType, item.name) ||
      isVideoMime(item.mimeType, item.name));

  if (showThumb) {
    return (
      <img
        src={thumb!}
        alt={item.name}
        loading="lazy"
        decoding="async"
        onError={() => setThumbFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (item.kind === "folder") {
    return <LuFolder className="w-4 h-4" />;
  }
  if (isImageMime(item.mimeType, item.name)) {
    return <LuFileImage className="w-4 h-4" />;
  }
  if (isVideoMime(item.mimeType, item.name)) {
    return <LuVideo className="w-4 h-4" />;
  }
  if (isAudioMime(item.mimeType, item.name)) {
    return <LuFileAudio className="w-4 h-4" />;
  }
  return <LuFile className="w-4 h-4" />;
}

type RowActionsMenuProps = {
  item: ContentItem;
  onPreview: (item: ContentItem) => void;
  onDeleteItem: (path: string) => void;
  confirm: ReturnType<typeof useConfirm>["confirm"];
};

function RowActionsMenu({
  item,
  onPreview,
  onDeleteItem,
  confirm,
}: RowActionsMenuProps) {
  const handlePreview = () => onPreview(item);

  const handleDownload = async () => {
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(item.url, "_blank");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(item.url);
    toast.success("URL copied to clipboard");
  };

  const handleDelete = async () => {
    const isFolder = item.kind === "folder";
    confirm({
      title: isFolder ? "Delete Folder" : "Delete File",
      description: `Are you sure you want to permanently delete "${item.name}"${
        isFolder ? " folder and all its contents" : ""
      }?`,
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        await onDeleteItem(item.path);
      },
    });
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Actions"
      >
        <LuEllipsisVertical className="w-4 h-4" />
      </Dropdown.Trigger>
      <Dropdown.Popover
        placement="bottom end"
        className="min-w-44 rounded-2xl border border-white/[0.06] bg-neutral-900/90 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] p-1 text-neutral-200"
      >
        <Dropdown.Menu className="gap-0.5">
          <Dropdown.Section className="mb-1">
            <Header className="text-[10px] uppercase font-semibold text-neutral-500 px-2 py-1">
              Actions
            </Header>
            <Dropdown.Item
              textValue="Preview"
              isDisabled={!storageClient.isMediaItem(item)}
              onAction={handlePreview}
              className={cn(
                "rounded-lg transition-colors py-1.5 px-2",
                storageClient.isMediaItem(item)
                  ? "hover:bg-accent/15 hover:text-accent cursor-pointer"
                  : "opacity-40 cursor-not-allowed",
              )}
            >
              <Label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <LuEye className="w-3.5 h-3.5 text-accent" />
                <span>Preview</span>
              </Label>
            </Dropdown.Item>
            <Dropdown.Item
              textValue="Download"
              isDisabled={item.kind === "folder"}
              onAction={handleDownload}
              className={cn(
                "rounded-lg transition-colors py-1.5 px-2",
                item.kind === "folder"
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-emerald-500/15 hover:text-emerald-400 cursor-pointer",
              )}
            >
              <Label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <LuDownload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download</span>
              </Label>
            </Dropdown.Item>
            <Dropdown.Item
              textValue="Copy URL"
              isDisabled={item.kind === "folder"}
              onAction={handleCopyUrl}
              className={cn(
                "rounded-lg transition-colors py-1.5 px-2",
                item.kind === "folder"
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-white/[0.08] cursor-pointer",
              )}
            >
              <Label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <LuLink className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy URL</span>
              </Label>
            </Dropdown.Item>
          </Dropdown.Section>

          <Dropdown.Section className="pt-1 border-t border-white/[0.05]">
            <Dropdown.Item
              textValue="Delete"
              onAction={handleDelete}
              className="rounded-lg hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-colors py-1.5 px-2 cursor-pointer"
            >
              <Label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <LuTrash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Label>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function ContentGridSkeleton() {
  return (
    <div className="flex-1 overflow-x-auto p-4">
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse"
          >
            <Skeleton className="w-4 h-4 rounded bg-white/10 shrink-0" />
            <Skeleton className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
            <Skeleton
              className="h-4 rounded bg-white/10"
              style={{ width: `${140 + (idx % 4) * 35}px` }}
            />
            <div className="ml-auto flex items-center gap-6">
              <Skeleton className="h-4 w-16 rounded bg-white/10 hidden sm:block" />
              <Skeleton className="h-4 w-14 rounded bg-white/10 hidden md:block" />
              <Skeleton className="h-4 w-28 rounded bg-white/10 hidden lg:block" />
              <Skeleton className="w-6 h-6 rounded-lg bg-white/10 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContentGrid({ onPreview: onPreviewProp }: Props = {}) {
  const { confirm } = useConfirm();
  const {
    selectedPaths,
    items,
    isFetching,
    openFolder: onOpenFolder,
    toggleSelect: onToggleSelect,
    deletePaths: onDeleteItem,
    selectAllVisible: onSelectAll,
    clearSelection: onClearSelection,
    openPreview,
    uploadFiles,
    isUploading,
  } = useContent();

  const [isDragOver, setIsDragOver] = useState(false);
  const handlePreview = onPreviewProp || openPreview;

  const allSelected =
    items.length > 0 && items.every((item) => selectedPaths.has(item.path));
  const someSelected = items.some((item) => selectedPaths.has(item.path));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      if (onClearSelection) {
        onClearSelection();
      } else {
        items.forEach((item) => {
          if (selectedPaths.has(item.path)) {
            onToggleSelect(item.path);
          }
        });
      }
    } else {
      onSelectAll();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  if (isFetching && items.length === 0) {
    return <ContentGridSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 flex flex-col items-center justify-center p-8 min-h-80"
      >
        <div className="w-full max-w-md">
          <ContentUploadDropzone
            onUpload={uploadFiles}
            disabled={isUploading}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex-1 overflow-x-auto relative flex flex-col min-w-0 transition-colors",
        isDragOver && "bg-accent/[0.03]",
      )}
    >
      {/* Drag overlay indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs border-2 border-dashed border-accent flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent animate-bounce">
            <LuUpload className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-white">
            Drop files here to upload to this folder
          </p>
        </div>
      )}

      <table className="w-full min-w-150 border-collapse">
        <thead>
          <tr className="border-b border-white/[0.05] bg-white/[0.02]">
            <th className="w-10 px-4 py-2.5 text-left">
              <Checkbox
                isSelected={allSelected}
                isIndeterminate={someSelected && !allSelected}
                onChange={handleToggleSelectAll}
                aria-label="Select All"
                className="cursor-pointer"
              />
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-28">
              Type
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-24">
              Size
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-36">
              Modified
            </th>
            <th className="w-10 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {items.map((item) => {
            const selected = selectedPaths.has(item.path);

            return (
              <tr
                key={item.path}
                onClick={() => {
                  if (item.kind === "folder") {
                    return onOpenFolder(item);
                  }
                  if (storageClient.isMediaItem(item)) {
                    handlePreview(item);
                  }
                }}
                className={cn(
                  "group transition-colors cursor-pointer",
                  selected
                    ? "bg-accent/10 hover:bg-accent/15"
                    : "hover:bg-white/[0.03]",
                )}
              >
                <td
                  className="px-4 py-2.5 w-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    isSelected={selected}
                    onChange={() => onToggleSelect(item.path)}
                    aria-label={`Select ${item.name}`}
                    className="cursor-pointer"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden",
                        item.kind === "folder"
                          ? "bg-accent/15 text-accent"
                          : isImageMime(item.mimeType, item.name)
                            ? "text-sky-400"
                            : isVideoMime(item.mimeType, item.name)
                              ? "text-rose-400"
                              : isAudioMime(item.mimeType, item.name)
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-neutral-800 text-neutral-400",
                      )}
                    >
                      <FileIcon item={item} />
                      {isVideoMime(item.mimeType, item.name) && (
                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm">
                          <span className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-white ml-0.5" />
                        </span>
                      )}
                    </div>
                    <span
                      className="max-w-md truncate text-xs font-medium text-neutral-200 group-hover:text-white"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-400">
                  {formatItemType(item)}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-400">
                  {item.kind === "folder" ? "—" : formatSize(item.sizeBytes)}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-400">
                  {formatDate(item.updatedAt || item.createdAt)}
                </td>
                <td
                  className="px-4 py-2.5 w-10 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RowActionsMenu
                    item={item}
                    onPreview={handlePreview}
                    onDeleteItem={(path) => onDeleteItem([path])}
                    confirm={confirm}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
