"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Spinner, toast } from "@heroui/react";
import {
  LuX as X,
  LuUpload as Upload,
  LuRotateCcw as RefreshCw,
  LuLink as LinkIcon,
} from "react-icons/lu";
import { useShortcuts } from "@keybindy/react";
import { CloudinaryFile } from "@/types";
import { cn } from "@heroui/react";
import { formatBytes } from "@/lib/utils";
import {
  getMediaLibraryImages,
  invalidateMediaCache,
} from "@/actions/image-picker";
import {
  storageClient,
  type ClientUploadResult,
  type UploadFileItem,
} from "@/lib/storage";
import { UploadProgressPanel } from "@/components/upload-progress-panel";

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * The folder to upload the image to.
   * @default "pras/portfolio/images"
   */
  uploadLocation?: string;
  onSelectImage: (imageData: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }) => void;
  currentSrc?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_DIMENSION = 1920; // longest edge
const WEBP_QUALITY = 0.82;

/**
 * Since images to optimized WebP: downscale the longest edge to
 * `MAX_IMAGE_DIMENSION` and re-encode with `WEBP_QUALITY`. Returns the
 * original file when conversion isn't possible (unsupported browser, non-
 * image, or encode failure) so uploads never break.
 */
async function fileToOptimizedWebp(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    const longest = Math.max(width, height);
    if (longest > MAX_IMAGE_DIMENSION) {
      const scale = MAX_IMAGE_DIMENSION / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^/.]+$/, "") || "image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Map a direct client upload result to the project's CloudinaryFile shape. */
function mapUploadResultToCloudinaryFile(
  result: ClientUploadResult,
  folder: string,
  displayName: string,
): CloudinaryFile {
  return {
    asset_id: result.assetId || result.publicId,
    public_id: result.publicId,
    format: result.format || "",
    version: result.raw?.version ?? 0,
    resource_type: result.resourceType,
    type: result.raw?.type || "upload",
    created_at: result.createdAt || new Date().toISOString(),
    bytes: result.bytes,
    width: result.width || 0,
    height: result.height || 0,
    asset_folder: result.raw?.asset_folder || folder,
    url: result.url,
    secure_url: result.secureUrl,
    display_name: displayName,
  };
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  uploadLocation = "pras/portfolio/images",
  currentSrc,
}) => {
  const [files, setFiles] = useState<CloudinaryFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadFileItem[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAllFiles = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getMediaLibraryImages(forceRefresh);
      if (!res?.success) {
        throw new Error(res?.error || "Failed to load files");
      }

      setFiles(res.files || []);
      if (forceRefresh) {
        toast.success("Media library synced");
      }
    } catch (err: any) {
      toast.danger("Error loading media", {
        description: err?.message || "Failed to load media files",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllFiles(false);
      setSelectedUrl(currentSrc || "");
      setCustomUrl("");
      setShowUrlInput(false);
      setUploadQueue([]);
      setIsDragging(false);
    }
  }, [isOpen, currentSrc]);

  // Clipboard paste upload support
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        handleUpload(pastedFiles);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  const handleUpload = async (uploadFiles: FileList | File[]) => {
    const filesArray = Array.from(uploadFiles);
    if (filesArray.length === 0) return;
    setUploading(true);

    try {
      const validFiles: { file: File; id: string }[] = [];
      const queue: UploadFileItem[] = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const id = `${Date.now()}-${i}-${file.name}`;
        if (file.size > MAX_FILE_SIZE) {
          queue.push({
            id,
            name: file.name,
            size: file.size,
            status: "error",
            percent: 0,
            error: `Exceeds ${formatBytes(MAX_FILE_SIZE, 0)} limit`,
          });
        } else {
          validFiles.push({ file, id });
          queue.push({
            id,
            name: file.name,
            size: file.size,
            status: "pending",
            percent: 0,
          });
        }
      }

      setUploadQueue([...queue]);

      if (validFiles.length === 0) {
        setTimeout(() => setUploadQueue([]), 6000);
        return;
      }

      let currentQueue = [...queue];
      const updateQueueItem = (id: string, patch: Partial<UploadFileItem>) => {
        currentQueue = currentQueue.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        );
        setUploadQueue([...currentQueue]);
      };

      const uploadedItems: CloudinaryFile[] = [];

      for (const next of validFiles) {
        updateQueueItem(next.id, { status: "uploading", percent: 10 });

        try {
          // Auto-optimize: downscale + WebP encode before upload.
          const uploadFile = await fileToOptimizedWebp(next.file);
          const baseName =
            uploadFile.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9_-]/g, "_") || `img_${Date.now()}`;

          const result = await storageClient.upload.file(uploadFile, {
            folder: uploadLocation,
            resourceType: "image",
            allowedCategories: ["image"],
            maxSizeBytes: MAX_FILE_SIZE,
            publicId: `${baseName}_${Date.now()}`,
            onProgress: (p) => updateQueueItem(next.id, { percent: p.percent }),
          });

          const uploaded = mapUploadResultToCloudinaryFile(
            result,
            uploadLocation,
            baseName,
          );

          updateQueueItem(next.id, { status: "done", percent: 100 });
          uploadedItems.push(uploaded);
        } catch (err: any) {
          updateQueueItem(next.id, {
            status: "error",
            error: err?.message || "Upload failed",
          });
        }
      }

      if (uploadedItems.length > 0) {
        setFiles((prev) => [...uploadedItems, ...prev]);
        // Select the latest uploaded file
        setSelectedUrl(uploadedItems[0].secure_url);
        // Invalidate server cache so other views see it on next fetch
        void invalidateMediaCache();
      }

      setTimeout(() => {
        setUploadQueue((current) => {
          const isFinished = current.every(
            (q) => q.status === "done" || q.status === "error",
          );
          return isFinished ? [] : current;
        });
      }, 6000);
    } catch (err: any) {
      toast.danger("Upload Failed", {
        description: err?.message || "Failed to upload files",
      });
    } finally {
      setUploading(false);
    }
  };

  const selectedFile = useMemo(() => {
    return files.find((f) => f.secure_url === selectedUrl) || null;
  }, [files, selectedUrl]);

  const toggleSelection = (file: CloudinaryFile) => {
    setCustomUrl("");
    setSelectedUrl((prev) => (prev === file.secure_url ? "" : file.secure_url));
  };

  const handleDone = () => {
    if (!selectedUrl) return;
    const altName =
      selectedFile?.display_name ||
      selectedFile?.public_id.split("/").pop() ||
      undefined;

    onSelectImage({
      src: selectedUrl,
      alt: altName,
      width: selectedFile?.width,
      height: selectedFile?.height,
    });
    onClose();
  };

  useShortcuts(
    [
      {
        keys: ["Enter"],
        handler: () => {
          if (selectedUrl) {
            handleDone();
          }
        },
      },
    ],
    {
      disabled: !isOpen,
    },
  );

  return (
    <>
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={(open) => !open && onClose()}
          data-lenis-prevent
        >
          <Modal.Container data-lenis-prevent>
            <Modal.Dialog
              data-lenis-prevent
              className="max-w-4xl w-[calc(100vw-32px)] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-muted border border-border rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">
                  Select file
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fetchAllFiles(true);
                    }}
                    disabled={loading || isRefreshing}
                    title="Sync media library"
                    className="p-2 hover:bg-secondary/60 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      size={18}
                      className={cn(
                        "text-muted-foreground",
                        isRefreshing && "animate-spin text-accent",
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-secondary/60 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto p-6 bg-background/40 overscroll-contain"
              >
                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (
                      e.dataTransfer.files &&
                      e.dataTransfer.files.length > 0
                    ) {
                      handleUpload(e.dataTransfer.files);
                    }
                  }}
                  className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center mb-8 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 group overflow-hidden ${
                    isDragging
                      ? "bg-accent/10 border-accent scale-[0.99]"
                      : "bg-accent/5 border-accent/30"
                  }`}
                >
                  <div className="absolute inset-0 bg-linear-to-b from-transparent to-accent/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex flex-col items-center gap-1.5 mb-6 relative z-10 text-center">
                    <h3 className="text-[16px] font-semibold text-foreground">
                      {isDragging ? "Drop files here" : "Upload new media"}
                    </h3>
                    <p className="text-[14px] text-muted-foreground font-medium max-w-62.5">
                      Drag and drop, click to browse, or paste an image from
                      clipboard.
                    </p>
                    <p className="text-[12px] font-semibold text-muted-foreground/70 mt-1">
                      Max file size: {formatBytes(MAX_FILE_SIZE, 0)} ·
                      auto-optimized to WebP
                    </p>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleUpload(e.target.files);
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-background/35 border border-border rounded-xl text-[14px] font-semibold text-foreground hover:border-border shadow-sm transition-all duration-200"
                    >
                      {uploading ? (
                        <Spinner
                          size="sm"
                          color="current"
                          className="text-muted-foreground"
                        />
                      ) : (
                        "Browse files"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput((prev) => !prev)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 border rounded-xl text-[14px] font-semibold shadow-sm transition-all duration-200",
                        showUrlInput
                          ? "bg-accent/15 border-accent/50 text-accent"
                          : "bg-background/35 border-border text-foreground hover:border-border",
                      )}
                    >
                      <LinkIcon size={16} />
                      <span>Add from URL</span>
                    </button>
                  </div>

                  {showUrlInput && (
                    <div className="w-full max-w-md mt-4 flex items-center gap-2 relative z-10">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomUrl(val);
                          setSelectedUrl(val.trim());
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customUrl.trim()) {
                            e.preventDefault();
                            onSelectImage({ src: customUrl.trim() });
                            onClose();
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
                        autoFocus
                        className="flex-1 px-3.5 py-2 rounded-xl bg-background/60 border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                      />
                      <button
                        type="button"
                        disabled={!customUrl.trim()}
                        onClick={() => {
                          if (!customUrl.trim()) return;
                          onSelectImage({ src: customUrl.trim() });
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl text-[13px] font-bold text-accent-foreground bg-accent hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        Use URL
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Spinner
                      size="lg"
                      color="current"
                      className="text-accent mb-4"
                    />
                    <p className="text-muted-foreground text-sm font-medium">
                      Loading media...
                    </p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-card/50 rounded-2xl border border-dashed border-border/60">
                    <div className="w-16 h-16 bg-secondary/40 rounded-2xl border border-border flex items-center justify-center mb-5 shadow-sm">
                      <Upload size={24} className="text-muted-foreground/60" />
                    </div>
                    <h3 className="text-[17px] font-semibold text-foreground mb-1.5">
                      Your library is empty
                    </h3>
                    <p className="text-[14px] text-muted-foreground max-w-65">
                      Upload files to your media library to use them across your
                      content.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((file) => {
                      const isSelected = selectedUrl === file.secure_url;
                      const displayName =
                        file.display_name ||
                        file.public_id.split("/").pop() ||
                        "image";
                      const ext = (
                        file.format ||
                        displayName.split(".").pop() ||
                        "FILE"
                      ).toUpperCase();

                      return (
                        <div
                          key={file.asset_id || file.public_id}
                          onClick={() => toggleSelection(file)}
                          style={{
                            contentVisibility: "auto",
                            containIntrinsicSize: "200px",
                          }}
                          className={`group relative flex flex-col bg-muted rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border border-border/80 hover:border-border ${
                            isSelected ? "scale-[0.98]" : " hover:shadow-sm"
                          }`}
                        >
                          <div className="aspect-square bg-secondary/40 relative overflow-hidden">
                            <img
                              src={file.secure_url}
                              alt={displayName}
                              loading="lazy"
                              className={`w-full h-full object-cover transition-transform duration-500 ${
                                isSelected
                                  ? "scale-105"
                                  : "group-hover:scale-105"
                              }`}
                            />

                            {/* File extension badge */}
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white/90 uppercase tracking-wider">
                              {ext}
                            </div>

                            {/* Selection Checkbox overlay */}
                            <div
                              className={`absolute top-2 left-2 p-1.5 rounded-lg bg-background/50 transition-all duration-200 ${
                                isSelected
                                  ? "opacity-100 shadow-sm scale-100"
                                  : "opacity-0 group-hover:opacity-100 scale-95"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-xl border-[1.5px] flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-accent border-accent"
                                    : "border-white/90"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    className="w-3.5 h-3.5 text-accent-foreground"
                                  >
                                    <path
                                      d="M3 8L6 11L11 3.5"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="p-3 z-10 relative">
                            <p
                              className="text-[12px] font-semibold text-foreground truncate"
                              title={displayName}
                            >
                              {displayName}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 flex items-center justify-end">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl text-[14px] font-semibold text-foreground border border-border bg-background/35 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDone}
                    disabled={!selectedUrl}
                    className="px-5 py-2 rounded-xl text-[14px] font-bold text-accent-foreground bg-accent hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Dedicated Upload Progress Panel (shared) */}
      <UploadProgressPanel
        queue={uploadQueue}
        onClear={() => setUploadQueue([])}
      />
    </>
  );
};
